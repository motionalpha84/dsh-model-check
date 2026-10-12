import { randomUUID, randomInt } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { challenges, cleanLabel, normalizeModel, responseRoute, probabilitySummary, parseProbe } from './core.mjs';
import { WireCapture } from './wire.mjs';
import { CANDY_PROMPT, BEHAVIOR_MODES, candyHit,
  evaluationOptions, behaviorUnavailableReason, safeError, addUsage, boundedPayload } from './evaluations.mjs';
import { normalizeAnswer, attributeBehavior } from './behavior.mjs';

function frequency(value) {
  if (!value || !['start', 'interval', 'manual'].includes(value.mode)
    || value.mode === 'interval' && (!Number.isSafeInteger(value.every) || value.every < 1 || value.every > 1000)) {
    throw new Error('INVALID_FREQUENCY');
  }
  return value.mode === 'interval' ? { mode: 'interval', every: value.every } : { mode: value.mode };
}

export class ModelMonitor {
  constructor({ bank, llm, dataDir, probes = [], baselines = [], autoCheck = true, timeoutMs = 180000, clock = Date.now }) {
    this.bank = bank; this.llm = llm; this.dataDir = dataDir; this.timeoutMs = timeoutMs; this.clock = clock;
    this.defaultFrequency = { mode: autoCheck ? 'start' : 'manual' };
    this.sessions = new Map(); this.jobs = new Map();
    this.probes = probes; this.baselines = baselines; this.payloads = new Map();
    this.probeOptions = new WeakSet(); this.queue = []; this.activeJobs = 0; this.live = true;
    this.activeProbes = 0; this.probeQueue = [];
    this.revision = 0; this.disposedSessions = new Set(); this.persistError = false;
    this.wire = new WireCapture((record, route) => {
      if (!this.live || !this.sessions.get(record.sessionId)?.records.includes(record)) return;
      record.responseModel = route.model; record.responseField = route.field; this.changed();
    });
    this.load();
  }
  load() {
    if (!this.dataDir) return;
    try {
      const data = JSON.parse(readFileSync(join(this.dataDir, 'state.json'), 'utf8'));
      // Accept only the exported, content-free record schema from disk.
      for (const entry of (Array.isArray(data.sessions) ? data.sessions : []).slice(0, 100)) {
        if (typeof entry.id !== 'string' || !Array.isArray(entry.records)) continue;
        const records = entry.records.slice(-20).filter(record => typeof record?.id === 'string'
          && typeof record.requestModel === 'string' && Number.isFinite(record.startedAt));
        for (const record of records) {
          if (record.check?.state === 'running' || record.check?.state === 'queued') {
            record.check = { ...record.check, state: 'cancelled', error: 'HOST_RESTARTED' };
            if (['queued','running'].includes(record.check.traceState)) record.check.traceState = 'cancelled';
          }
          if (record.outcome === 'running') record.outcome = 'aborted';
          record.isHistory = true;
          for (const kind of ['candy', 'behavior']) {
            const evaluation = record.evaluations?.[kind];
            if (['queued', 'running', 'comparing'].includes(evaluation?.state)) {
              evaluation.state = 'cancelled'; evaluation.error = 'HOST_RESTARTED';
            }
          }
        }
        // Migrate the old every-request switch to the new first-turn default.
        // Existing conversations have already started; upgrading must not resample them.
        let savedFrequency = this.defaultFrequency;
        if (data.version === 2 && entry.frequency) {
          try { savedFrequency = frequency(entry.frequency); } catch { /* Use the default. */ }
        } else if (data.settings?.autoCheck === false) savedFrequency = { mode: 'manual' };
        const completed = records.filter(record => record.outcome === 'complete');
        const oldTurns = new Set(completed.map(record => Number.isSafeInteger(record.turn) ? `turn:${record.turn}` : record.id));
        this.sessions.set(entry.id, { id: entry.id, records, frequency: { ...savedFrequency },
          completedTurns: data.version === 2 && Number.isSafeInteger(entry.completedTurns) && entry.completedTurns >= 0
            ? entry.completedTurns : oldTurns.size,
          startEligible: data.version === 2 && typeof entry.startEligible === 'boolean' ? entry.startEligible : !completed.length,
          lastTurnNumber: Number.isSafeInteger(entry.lastTurnNumber) && entry.lastTurnNumber >= 0 ? entry.lastTurnNumber : null,
          lastTurnRecord: null, currentTurn: null });
      }
      for (const entry of (Array.isArray(data.evaluationPayloads) ? data.evaluationPayloads : []).slice(-20)) {
        if (typeof entry.recordId !== 'string' || !['candy', 'behavior'].includes(entry.kind)) continue;
        const payload = boundedPayload(entry.kind, entry.payload);
        if (payload) this.payloads.set(entry.recordId + ':' + entry.kind, { recordId:entry.recordId, kind:entry.kind, payload });
      }
    } catch { /* First installation, malformed data, or read-only data store. */ }
  }
  changed() {
    this.revision++;
    clearTimeout(this.persistTimer);
    if (this.dataDir && this.live) this.persistTimer = setTimeout(() => this.persist(), 400);
    this.persistTimer?.unref?.();
  }
  persist() {
    if (!this.dataDir) return;
    try {
      mkdirSync(this.dataDir, { recursive: true });
      const file = join(this.dataDir, 'state.json');
      const value = { version: 2, evaluationPayloads: [...this.payloads.values()], sessions: [...this.sessions.values()].slice(-100).map(session => ({
        id: session.id, records: session.records.slice(-20).map(record => this.publicRecord(record)),
        frequency: session.frequency, completedTurns: session.completedTurns, lastTurnNumber: session.lastTurnNumber, startEligible: session.startEligible,
      })) };
      writeFileSync(file + '.tmp', JSON.stringify(value));
      renameSync(file + '.tmp', file);
      this.persistError = false;
    } catch { this.persistError = true; }
  }
  publicRecord(record) {
    if (!record) return null;
    const { id, sessionId, requestModel, provider, reasoningEffort, responseModel, responseField,
      startedAt, endedAt, latencyMs, outcome, requestId, fingerprint, check, usage, isHistory, turn } = record;
    const evaluations = Object.fromEntries(['candy', 'behavior'].filter(kind => record.evaluations?.[kind]).map(kind => {
      const value = record.evaluations[kind];
      // Explicit summary schema excludes replies, code, transport failures and credentials.
      return [kind, { state:value.state, mode:value.mode, completed:value.completed, total:value.total, valid:value.valid,
        errors:value.errors, hits:value.hits, graded:value.graded, startedAt:value.startedAt, endedAt:value.endedAt,
        durationMs:value.durationMs, reasoningEffort:value.reasoningEffort, usage:value.usage, error:value.error,
        attribution:value.attribution ? { status:value.attribution.status, message:value.attribution.message, nearest:value.attribution.nearest,
          alpha:value.attribution.alpha, selfJSD:value.attribution.selfJSD } : undefined,
        artifactAvailable:this.payloads.has(record.id + ':' + kind) }];
    }));
    return { id, sessionId, requestModel, provider, reasoningEffort, responseModel, responseField,
      startedAt, endedAt, latencyMs, outcome, requestId, fingerprint, check, usage, isHistory, turn, evaluations,
      behaviorUnavailableReason:behaviorUnavailableReason(requestModel) };
  }
  state(sessionId) {
    const session = this.sessions.get(sessionId);
    return { ok: true, revision: this.revision,
      settings: { frequency: { ...(session?.frequency ?? this.defaultFrequency) }, completedTurns: session?.completedTurns ?? 0,
        startEligible: session?.startEligible ?? true }, sessionId,
      record: this.publicRecord(session?.records.at(-1)),
      history: (session?.records ?? []).slice(-20).reverse().map(record => this.publicRecord(record)),
      bank: { source: 'ModelTrace', models: this.bank.models.map(model => model.id), count: this.bank.models.length },
      behaviorBank: { source:'Candy Eval', models:this.baselines.map(baseline => baseline.model), count:this.baselines.length, probes:this.probes.length },
      activeEvaluation: this.jobs.get(sessionId)?.kind ?? null,
      storageWarning: this.persistError,
    };
  }
  session(id) {
    let session = this.sessions.get(id);
    if (!session) {
      session = { id, records: [], frequency: { ...this.defaultFrequency }, completedTurns: 0,
        startEligible: true,
        lastTurnNumber: null, lastTurnRecord: null, currentTurn: null };
      this.sessions.set(id, session);
      if (this.sessions.size > 100) {
        const oldest = this.sessions.keys().next().value;
        this.cancel(oldest); this.sessions.delete(oldest);
      }
    }
    return session;
  }
  begin(options) {
    if (!this.live || !cleanLabel(options.sessionId) || this.probeOptions.has(options) || options.purpose === 'session-title') return null;
    const sessionId = cleanLabel(options.sessionId);
    this.disposedSessions.delete(sessionId);
    const session = this.session(sessionId);
    // A new real request invalidates pending sampling for the preceding request.
    this.cancel(sessionId);
    const record = { id: randomUUID(), sessionId, requestModel: cleanLabel(options.model),
      provider: cleanLabel(options.provider), reasoningEffort: cleanLabel(options.reasoningEffort) || null,
      startedAt: this.clock(), endedAt: null, responseModel: null, responseField: null,
      outcome: 'running', fingerprint: null, check: { state: 'idle' },
      ...(Number.isSafeInteger(session.currentTurn) ? { turn: session.currentTurn } : {}) };
    session.records.push(record);
    if (session.records.length > 20) session.records.shift();
    this.changed();
    return record;
  }
  observe(record, chunk) {
    if (!record || !this.live) return;
    const route = responseRoute(chunk);
    if (route.model) { record.responseModel = route.model; record.responseField = route.field; }
    if (chunk.type === 'usage') {
      const usage = chunk.usage || {};
      record.usage = Object.fromEntries(['inputTokens', 'outputTokens', 'cacheReadTokens', 'reasoningTokens']
        .filter(key => Number.isFinite(usage[key])).map(key => [key, usage[key]]));
    }
    if (chunk.type === 'finish') {
      const reason = chunk.reason?.kind ?? 'stop';
      record.outcome = reason === 'error' ? 'error' : reason === 'aborted' ? 'aborted' : 'complete';
      record.endedAt = this.clock(); record.latencyMs = record.endedAt - record.startedAt;
      record.requestId = cleanLabel(chunk.replayState?.response?.responseId) || null;
      this.changed();
    } else if (route.model) this.changed();
  }
  async *wrap(options, source) {
    const record = this.begin(options);
    try {
      for await (const chunk of this.wire.scoped(source, record)) {
        // An observer failure must never alter the model stream or its chunks.
        try { this.observe(record, chunk); } catch { /* Contained. */ }
        yield chunk;
      }
    } catch (error) {
      if (record) { record.outcome = 'error'; record.endedAt = this.clock(); this.changed(); }
      throw error;
    } finally {
      if (record?.outcome === 'running') { record.outcome = 'aborted'; record.endedAt = this.clock(); this.changed(); }
    }
  }
  onSessionEvent(session, event) {
    if (!this.live || !session?.id || !event) return;
    if (event.type === 'turn/start') {
      if (Number.isSafeInteger(event.data?.turn) && event.data.turn >= 0) {
        const state = this.session(session.id);
        // A previously unobserved, already-started conversation is not a new conversation.
        // Harness uses one-based turn numbers; accept zero for older adapters as well.
        if (state.currentTurn === null && state.completedTurns === 0 && !state.records.length) state.startEligible = event.data.turn <= 1;
        state.currentTurn = event.data.turn;
      }
      return;
    }
    const state = this.sessions.get(session.id);
    const record = state?.records.at(-1);
    if (!record) return;
    if (event.type === 'assistant/message') {
      const source = event.data?.message?.source;
      const route = responseRoute({ source });
      if (route.model) { record.responseModel = route.model; record.responseField = route.field; }
      if (Number.isFinite(event.data?.turn)) record.turn = event.data.turn;
      this.changed();
    }
    if (event.type === 'turn/end' && record.outcome === 'complete' && !record.isHistory
      && !['error', 'aborted'].includes(event.data?.reason?.kind)) {
      const turn = Number.isSafeInteger(event.data?.turn) ? event.data.turn : record.turn;
      if (Number.isSafeInteger(turn)) {
        if (Number.isSafeInteger(record.turn) && record.turn !== turn) return;
        if (state.lastTurnNumber !== null && turn <= state.lastTurnNumber) return;
        state.lastTurnNumber = turn; record.turn = turn;
      }
      if (state.lastTurnRecord === record.id) return;
      state.lastTurnRecord = record.id; state.completedTurns++; this.changed();
      const schedule = state.frequency;
      const due = schedule.mode === 'start' && state.startEligible && state.completedTurns === 1
        || schedule.mode === 'interval' && state.completedTurns % schedule.every === 0;
      if (due && record.check?.state === 'idle') this.startCheck(session.id, { automatic: true }).catch(() => {});
    }
  }
  setFrequency(sessionId, value) {
    const id = cleanLabel(sessionId);
    if (!this.live || !id || this.disposedSessions.has(id)) throw new Error('SESSION_UNAVAILABLE');
    const next = frequency(value);
    const session = this.session(id);
    if (JSON.stringify(session.frequency) === JSON.stringify(next)) return;
    session.frequency = next;
    // Only an automatic job follows frequency changes; a manual check remains manual.
    if (this.jobs.get(id)?.automatic) this.cancel(id);
    this.changed();
  }
  startCheck(sessionId, { automatic = false, runs = 1 } = {}) {
    try { evaluationOptions('candy', { runs }); } catch (error) { return Promise.reject(error); }
    return this.enqueue(sessionId, { kind:'trace', runs, total:3 + runs }, automatic);
  }
  startEvaluation(sessionId, kind, options = {}) {
    let settings;
    try {
      settings = evaluationOptions(kind, options);
      // Older candy clients now enter the same combined workflow as the main button.
      if (kind === 'candy') return this.startCheck(sessionId, { runs:settings.runs });
      if (kind === 'behavior' && (!this.probes.length || !this.baselines.length)) throw new Error('NO_BEHAVIOR_BANK');
    } catch (error) { return Promise.reject(error); }
    return this.enqueue(sessionId, settings, false);
  }
  enqueue(sessionId, settings, automatic) {
    if (!this.live || this.disposedSessions.has(sessionId)) return Promise.reject(new Error('SESSION_UNAVAILABLE'));
    if (this.jobs.has(sessionId)) return this.jobs.get(sessionId).kind === settings.kind
      ? this.jobs.get(sessionId).promise : Promise.reject(new Error('EVALUATION_BUSY'));
    const record = this.sessions.get(sessionId)?.records.at(-1);
    if (!record || !record.provider || !record.requestModel || record.outcome !== 'complete') return Promise.reject(new Error('NO_COMPLETED_REQUEST'));
    const blocked = settings.kind === 'behavior' && behaviorUnavailableReason(record.requestModel);
    if (blocked) return Promise.reject(new Error(blocked));
    if (this.queue.length >= 12) return Promise.reject(new Error('QUEUE_FULL'));
    const controller = new AbortController();
    let finish;
    const promise = new Promise(resolve => { finish = resolve; });
    const job = { record, sessionId, controller, promise, finish, automatic, ...settings };
    if (job.kind === 'trace') {
      record.fingerprint = null;
      record.check = { state:'queued', completed:0, total:job.total, valid:0, phase:'parallel', traceCompleted:0,
        traceState:'queued', startedAt:this.clock(), usage:{} };
    }
    {
      const kind = job.kind === 'trace' ? 'candy' : job.kind;
      record.evaluations ??= {};
      record.evaluations[kind] = { state:'queued', mode:settings.mode, completed:0, total:job.kind === 'trace' ? job.runs : settings.total, valid:0, errors:0,
        hits:0, graded:0, usage:{}, reasoningEffort:kind === 'behavior' ? 'low' : record.reasoningEffort };
      this.payloads.delete(record.id + ':' + kind);
    }
    this.jobs.set(sessionId, job); this.queue.push(job); this.changed(); this.drain();
    return promise;
  }
  drain() {
    while (this.live && this.activeJobs < 2 && this.queue.length) {
      const job = this.queue.shift();
      if (job.controller.signal.aborted) { job.finish(null); continue; }
      this.activeJobs++;
      (job.kind === 'trace' ? this.runCheck(job) : this.runEvaluation(job)).catch(error => {
        if (!this.current(job)) return;
        job.controller.abort();
        const result = job.kind === 'trace' ? job.record.check : job.record.evaluations[job.kind];
        result.state = 'failed'; result.error = safeError(error);
        result.endedAt = this.clock();
        if (job.kind === 'trace') {
          const candy = job.record.evaluations.candy;
          if (['queued', 'running'].includes(candy.state)) { candy.state = 'failed'; candy.error = result.error; }
        }
        this.changed();
      }).finally(() => {
        this.activeJobs--;
        if (this.jobs.get(job.sessionId) === job) { this.jobs.delete(job.sessionId); this.changed(); }
        job.finish(this.publicRecord(job.record)); this.drain();
      });
    }
  }
  current(job) {
    return this.live && !job.controller.signal.aborted && this.jobs.get(job.sessionId) === job
      && this.sessions.get(job.sessionId)?.records.at(-1) === job.record;
  }
  async sample(job, challenge) {
    const output = await this.collect(job, challenge.prompt);
    if (this.current(job)) addUsage(job.record.check.usage, output.usage);
    return { text:parseProbe(output.text, challenge.expected_count), expected_count:challenge.expected_count };
  }
  acquireProbe(job, signal) {
    if (!this.current(job) || signal.aborted) return Promise.reject(new Error('PROBE_CANCELLED'));
    return new Promise((resolve, reject) => {
      const entry = { job, signal, resolve, reject, abort:() => {
        this.probeQueue = this.probeQueue.filter(item => item !== entry);
        reject(new Error('PROBE_CANCELLED'));
      } };
      signal.addEventListener('abort', entry.abort, { once:true });
      this.probeQueue.push(entry); this.drainProbes();
    });
  }
  drainProbes() {
    // Share four request slots across sessions and both evaluation modes.
    while (this.live && this.activeProbes < 4 && this.probeQueue.length) {
      const entry = this.probeQueue.shift(); entry.signal.removeEventListener('abort', entry.abort);
      if (!this.current(entry.job) || entry.signal.aborted) { entry.reject(new Error('PROBE_CANCELLED')); continue; }
      this.activeProbes++;
      let released = false;
      entry.resolve(() => {
        if (released) return;
        released = true; this.activeProbes--; this.drainProbes();
      });
    }
  }
  async collect(job, prompt, { instructions, reasoningEffort = job.record.reasoningEffort, temperature, collectionSignal } = {}) {
    const pendingSignal = AbortSignal.any([job.controller.signal, ...(collectionSignal ? [collectionSignal] : [])]);
    const release = await this.acquireProbe(job, pendingSignal);
    // Waiting for a slot must not use up the provider's response timeout.
    const signal = AbortSignal.any([pendingSignal, AbortSignal.timeout(this.timeoutMs)]);
    const messages = [{ id:randomUUID(), role:'user', source:{ kind:'user' }, content:[{ type:'text', text:prompt }] }];
    if (instructions) messages.unshift({ id:randomUUID(), role:'system', source:{ kind:'system-prompt' }, content:[{ type:'text', text:instructions }] });
    const options = { provider: job.record.provider, model: job.record.requestModel,
      ...(reasoningEffort ? { reasoningEffort } : {}), ...(temperature === undefined ? {} : { temperature }),
      sessionId: `model-check-${job.record.id}-${randomUUID()}`,
      messages, signal };
    this.probeOptions.add(options);
    const blocks = new Map(), usage = {}; let terminal = false, iterator;
    const startedAt = this.clock(); let bytes = 0;
    const put = (index, value) => {
      const old = blocks.get(index) || '';
      bytes += Buffer.byteLength(value) - Buffer.byteLength(old);
      if (bytes > 512 * 1024 || blocks.size >= 32 && !blocks.has(index)) throw new Error('ANSWER_TOO_LARGE');
      blocks.set(index, value);
    };
    try {
      if (!this.current(job) || signal.aborted) throw new Error('PROBE_CANCELLED');
      iterator = this.llm.stream(options)[Symbol.asyncIterator]();
      while (true) {
        // Bound a provider that ignores GenerateOptions.signal as well.
        const next = await abortable(iterator.next(), signal);
        if (next.done) break;
        const chunk = next.value;
        if (chunk.type === 'text-delta') put(chunk.index ?? 0, (blocks.get(chunk.index ?? 0) || '') + (chunk.text || ''));
        if (chunk.type === 'block-end' && chunk.block?.type === 'text') put(chunk.index ?? 0, chunk.block.text);
        if (chunk.type === 'usage') for (const key of ['inputTokens', 'outputTokens', 'reasoningTokens']) {
          if (Number.isFinite(chunk.usage?.[key]) && chunk.usage[key] >= 0) usage[key] = chunk.usage[key];
        }
        if (chunk.type === 'block-start' && chunk.blockType === 'tool-call' || chunk.type === 'tool-call-delta') throw new Error('TOOLS_NOT_ALLOWED');
        if (chunk.type === 'finish') {
          terminal = true;
          if (chunk.reason?.kind === 'error' || chunk.reason?.kind === 'aborted') throw new Error(cleanLabel(chunk.reason.failure?.code) || 'PROBE_FAILED');
          if (chunk.reason?.kind === 'max-tokens') throw new Error('TRUNCATED_SAMPLE');
        }
      }
      if (!terminal) throw new Error('INCOMPLETE_STREAM');
      return { text:[...blocks.values()].join('\n'), usage, durationMs:this.clock() - startedAt };
    } catch (error) {
      // Keep reported token counts on failed/truncated samples without exposing transport details.
      const failure = new Error(safeError(error)); failure.usage = usage; failure.durationMs = this.clock() - startedAt; throw failure;
    } finally {
      release();
      this.probeOptions.delete(options);
      // Avoid blocking cancellation on a transport that does not settle return().
      Promise.resolve(iterator?.return?.()).catch(() => {});
    }
  }
  setPayload(record, kind, payload) {
    const value = boundedPayload(kind, payload);
    if (!value) return;
    const key = record.id + ':' + kind;
    this.payloads.delete(key); this.payloads.set(key, { recordId:record.id, kind, payload:value });
    while (this.payloads.size > 20) this.payloads.delete(this.payloads.keys().next().value);
  }
  evaluationDetails(sessionId, recordId, kind) {
    if (!['candy', 'behavior'].includes(kind)) throw new Error('INVALID_EVALUATION');
    const record = this.sessions.get(sessionId)?.records.find(item => item.id === recordId);
    if (!record) throw new Error('RECORD_NOT_FOUND');
    return { ok:true, recordId, kind, result:this.publicRecord(record).evaluations[kind] ?? null,
      payload:this.payloads.get(recordId + ':' + kind)?.payload ?? null };
  }
  async runEvaluation(job, kind = job.kind) {
    if (!this.current(job)) return;
    const result = job.record.evaluations[kind]; result.state = 'running'; result.startedAt = this.clock(); this.changed();
    if (kind === 'behavior') await this.runBehavior(job, result);
    else {
      const answers = [];
      for (let i = 0; i < result.total && this.current(job); i++) {
        let answer;
        try {
          const output = await this.collect(job, CANDY_PROMPT);
          if (!this.current(job)) return;
          addUsage(result.usage, output.usage);
          if (job.kind === 'trace') addUsage(job.record.check.usage, output.usage);
          const hit = candyHit(output.text); result.graded++; if (hit) result.hits++; result.valid++;
          answer = { answer:output.text.slice(0, 4000), hit, durationMs:output.durationMs };
        } catch (error) {
          if (!this.current(job)) return;
          addUsage(result.usage, error.usage);
          if (job.kind === 'trace') addUsage(job.record.check.usage, error.usage);
          result.errors++; result.error = safeError(error); answer = { hit:null, error:result.error };
        }
        if (!this.current(job)) return;
        result.completed++; answers.push(answer); this.setPayload(job.record, kind, { answers });
        if (job.kind === 'trace') this.updateCheckProgress(job);
        this.changed();
      }
    }
    if (!this.current(job)) return;
    result.state = result.valid ? result.errors || result.completed < result.total || kind === 'behavior' && result.valid < result.total ? 'partial' : 'complete' : 'failed';
    result.endedAt = this.clock(); result.durationMs = result.endedAt - result.startedAt;
    if (job.kind === 'trace') this.updateCheckProgress(job);
    this.changed();
  }
  async runBehavior(job, result) {
    const mode = BEHAVIOR_MODES[job.mode], tasks = [];
    for (const probe of this.probes.slice(0, mode.cells)) for (let n = 0; n < mode.samples; n++) tasks.push(probe);
    for (let n = tasks.length - 1; n > 0; n--) { const k = randomInt(n + 1); [tasks[n], tasks[k]] = [tasks[k], tasks[n]]; }
    const valid = {}, collection = new AbortController(); let cursor = 0, consecutiveErrors = 0;
    const worker = async () => {
      while (this.current(job) && !collection.signal.aborted && cursor < tasks.length) {
        const probe = tasks[cursor++];
        try {
          const output = await this.collect(job, probe.prompts[randomInt(probe.prompts.length)], {
            instructions:probe.instructions, reasoningEffort:'low', temperature:1, collectionSignal:collection.signal });
          if (!this.current(job) || collection.signal.aborted) return;
          addUsage(result.usage, output.usage); consecutiveErrors = 0;
          const answer = normalizeAnswer(output.text, probe);
          if (answer.category === 'valid') { result.valid++; (valid[probe.id] ??= []).push(answer.answer); }
        } catch (error) {
          if (!this.current(job) || collection.signal.aborted) return;
          addUsage(result.usage, error.usage);
          result.errors++; consecutiveErrors++; result.error = safeError(error);
          if (consecutiveErrors >= 8) { result.error = 'CONSECUTIVE_ERRORS'; collection.abort(); }
        }
        result.completed++; this.changed();
      }
    };
    // Behavior keeps two workers; all modes share the global four-request cap.
    await Promise.all([worker(), worker()]);
    if (!this.current(job)) return;
    result.state = 'comparing'; this.changed();
    const attribution = await attributeBehavior(normalizeModel(job.record.requestModel), valid, this.probes, this.baselines, { signal:job.controller.signal });
    if (!this.current(job)) return;
    result.attribution = attribution; this.setPayload(job.record, job.kind, { attribution });
  }
  async runCheck(job) {
    if (!this.current(job)) return;
    const { record } = job;
    record.check.state = 'running'; record.check.traceState = 'running'; this.changed();
    const outputs = [], errors = [];
    const trace = Promise.all(challenges().map(async (challenge, index) => {
      try {
        const output = await this.sample(job, challenge);
        if (!this.current(job)) return;
        outputs[index] = output;
      } catch (error) {
        if (!this.current(job)) return;
        errors[index] = safeError(error); addUsage(record.check.usage, error.usage);
      }
      if (!this.current(job)) return;
      const valid = outputs.filter(Boolean);
      record.check.traceCompleted++; record.check.valid = valid.length;
      if (valid.length) record.fingerprint = { ...probabilitySummary(valid, this.bank, record.requestModel),
        sampledAt:this.clock(), sampleMode:'independent', requestRecordId:record.id };
      if (record.check.traceCompleted === 3) {
        record.check.traceState = valid.length === 3 ? 'complete' : valid.length ? 'partial' : 'failed';
        record.check.traceError = errors.filter(Boolean).at(-1) || (valid.length ? null : 'NO_VALID_SAMPLES');
      }
      this.updateCheckProgress(job); this.changed();
    }));
    await Promise.all([trace, this.runEvaluation(job, 'candy')]);
    if (!this.current(job)) return;
    const candy = record.evaluations.candy;
    record.check.state = record.check.valid === 3 && candy.state === 'complete' ? 'complete'
      : record.check.valid || candy.valid ? 'partial' : 'failed';
    record.check.error = record.check.traceError || candy.error || null;
    record.check.phase = null; record.check.endedAt = this.clock();
    record.check.durationMs = record.check.endedAt - record.check.startedAt;
    this.changed();
  }
  updateCheckProgress(job) {
    const check = job.record.check, candy = job.record.evaluations.candy;
    check.completed = check.traceCompleted + candy.completed;
    check.phase = check.traceCompleted < 3 ? candy.completed < candy.total ? 'parallel' : 'trace'
      : candy.completed < candy.total ? 'candy' : null;
  }
  cancel(sessionId) {
    const job = this.jobs.get(sessionId);
    if (!job) return;
    job.controller.abort(); this.jobs.delete(sessionId);
    if (job.kind === 'trace') {
      job.record.check = { ...job.record.check, state:'cancelled', endedAt:this.clock() };
      job.record.check.durationMs = job.record.check.endedAt - job.record.check.startedAt;
      if (['queued','running'].includes(job.record.check.traceState)) job.record.check.traceState = 'cancelled';
    }
    const result = job.record.evaluations[job.kind === 'trace' ? 'candy' : job.kind];
    if (result && ['queued','running','comparing'].includes(result.state)) {
      result.state = 'cancelled'; result.endedAt = this.clock();
      if (result.startedAt) result.durationMs = result.endedAt - result.startedAt;
    }
    this.queue = this.queue.filter(item => item !== job);
    job.finish(null); this.changed();
  }
  disposeSession(sessionId) { this.cancel(sessionId); this.disposedSessions.add(sessionId); }
  dispose() {
    this.live = false;
    this.wire.dispose();
    for (const sessionId of [...this.jobs.keys()]) this.cancel(sessionId);
    clearTimeout(this.persistTimer); this.persist();
  }
}

function abortable(promise, signal) {
  const failure = () => new Error(signal.reason?.name === 'TimeoutError' ? 'PROBE_TIMEOUT' : 'PROBE_CANCELLED');
  if (signal.aborted) return Promise.reject(failure());
  return new Promise((resolve, reject) => {
    const abort = () => { cleanup(); reject(failure()); };
    const cleanup = () => signal.removeEventListener('abort', abort);
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(promise).then(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(error); });
  });
}
