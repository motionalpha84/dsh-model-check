// In-memory showcase only. No network client, credentials or model backend.
import fixtures from './assets/fixtures.js';
export const PROVIDERS = Object.freeze(['test-gpt', 'test-Claude']);
const clone = value => structuredClone(value);

export class DemoState {
  constructor() { this.reset(); }
  reset() {
    this.revision = (this.revision || 0) + 1;
    this.data = clone(fixtures); this.jobs = new Map(); this.simulatedRequests = 0;
    this.provider = 'test-gpt'; this.scenario = 'match';
  }
  select(provider) {
    if (!PROVIDERS.includes(provider)) throw Error('UNKNOWN_PROVIDER');
    this.provider = provider; this.setScenario(this.scenario);
  }
  setScenario(value) {
    if (!['match', 'mismatch', 'unknown'].includes(value)) throw Error('UNKNOWN_SCENARIO');
    this.scenario = value;
    for (const provider of PROVIDERS) {
      const record = this.data[provider].state.record;
      record.responseModel = value === 'unknown' ? null : value === 'match' ? record.requestModel
        : provider === 'test-gpt' ? 'gpt-6-sol' : 'claude-sonnet-4-6';
      record.responseField = value === 'unknown' ? null : 'wire.responses.model';
      this.sync(provider);
    }
  }
  sync(provider) {
    const state = this.data[provider].state;
    state.history[0] = clone(state.record); this.revision++;
  }
  providerFor(sessionId) {
    const provider = PROVIDERS.find(key => this.data[key].state.sessionId === sessionId);
    if (!provider) throw Error('UNKNOWN_SESSION');
    return provider;
  }
  state(sessionId = this.data[this.provider].state.sessionId) {
    const value = clone(this.data[this.providerFor(sessionId)].state);
    return { ...value, revision:this.revision, actionToken:'static-demo-only' };
  }
  details(sessionId, recordId, kind) {
    const provider = this.providerFor(sessionId);
    if (!['candy', 'behavior'].includes(kind)) throw Error('INVALID_EVALUATION');
    const record = this.data[provider].state.history.find(value => value.id === recordId);
    if (!record) throw Error('RECORD_NOT_FOUND');
    return clone(this.data[provider].details[recordId]?.[kind]
      || { ok:true, recordId, kind, result:record.evaluations[kind] || null, payload:null });
  }
  action(sessionId, input) {
    const provider = this.providerFor(sessionId), state = this.data[provider].state, record = state.record;
    if (input.recordId && input.recordId !== record.id) throw Error('REQUEST_CHANGED');
    if (input.action === 'frequency') {
      const f = input.frequency;
      if (!f || !['start', 'interval', 'manual'].includes(f.mode)
        || f.mode === 'interval' && (!Number.isInteger(f.every) || f.every < 1 || f.every > 1000)) throw Error('INVALID_FREQUENCY');
      state.settings.frequency = f.mode === 'interval' ? { mode:f.mode, every:f.every } : { mode:f.mode };
    } else if (input.action === 'cancel') {
      const job = this.jobs.get(provider);
      if (job) {
        record.evaluations[job.kind].state = 'cancelled';
        if (job.kind === 'candy') record.check.state = 'cancelled';
        state.activeEvaluation = null; this.jobs.delete(provider);
      }
    } else if (input.action === 'check' || input.action === 'evaluate') {
      if (this.jobs.has(provider)) throw Error('EVALUATION_BUSY');
      const kind = input.action === 'check' ? 'candy' : input.kind;
      if (!['candy', 'behavior'].includes(kind)) throw Error('INVALID_EVALUATION');
      const runs = Number(input.runs ?? 1), mode = input.mode || 'quick';
      if (kind === 'candy' && (!Number.isInteger(runs) || runs < 1 || runs > 10)) throw Error('INVALID_RUNS');
      if (kind === 'behavior' && !['quick', 'standard', 'strict'].includes(mode)) throw Error('INVALID_MODE');
      const total = kind === 'candy' ? runs : { quick:60, standard:200, strict:400 }[mode];
      record.evaluations[kind] = { state:'running', mode, completed:0, total, valid:0, errors:0,
        hits:0, graded:0, reasoningEffort:kind === 'candy' ? 'high' : 'low', artifactAvailable:false };
      if (kind === 'candy') {
        record.check = { state:'running', phase:'parallel', completed:0, total:3 + total, valid:0, traceCompleted:0, traceState:'running' };
        record.fingerprint = null;
      }
      state.activeEvaluation = kind === 'candy' ? 'trace' : kind;
      this.jobs.set(provider, { kind, total, step:0 });
      this.simulatedRequests += total + (kind === 'candy' ? 3 : 0);
    } else throw Error('UNKNOWN_ACTION');
    this.sync(provider); return this.state(sessionId);
  }
  tick() {
    for (const [provider, job] of this.jobs) {
      job.step++;
      const state = this.data[provider].state, record = state.record, result = record.evaluations[job.kind];
      result.completed = Math.floor(job.total * job.step / 4); result.valid = result.completed;
      if (job.kind === 'candy') {
        const trace = Math.min(3, job.step);
        record.check.completed = trace + result.completed;
        record.check.valid = trace; record.check.traceCompleted = trace;
        if (trace > 0) { record.fingerprint = clone(fixtures[provider].state.record.fingerprint); record.fingerprint.usedOutputs = trace; }
      }
      if (job.step === 4) {
        result.state = 'complete'; result.endedAt = Date.now(); result.durationMs = 3000;
        result.artifactAvailable = true;
        let payload;
        if (job.kind === 'candy') {
          result.hits = job.total; result.graded = job.total;
          record.check = { ...record.check, state:'complete', traceState:'complete' };
          payload = { answers:Array.from({ length:job.total }, () => ({ answer:'演示回答：21 个糖果。未调用真实模型。', hit:true, durationMs:3000 })) };
        } else {
          const models = state.behaviorBank.models;
          const nearest = models.includes(record.requestModel) ? record.requestModel : models[0];
          const inBank = models.includes(record.requestModel);
          const attribution = { status:inBank ? 'consistent' : 'unknown', nearest,
            message:inBank ? '演示结果：与同名基准未发现显著差异。' : '演示结果：请求模型未收录于行为基准，以下仅展示候选距离。',
            alpha:.003125, selfJSD:inBank ? .16 : null,
            comparisons:models.map((model, i) => ({ model, meanJSD:model === nearest ? .16 : .32 + i * .03, pValue:model === nearest ? .64 : .001 })),
            warnings:['此处为虚构演示数据，不代表任何模型的真实测评结果。'] };
          result.attribution = attribution; payload = { attribution };
        }
        this.data[provider].details[record.id][job.kind] = { ok:true, recordId:record.id, kind:job.kind, result:clone(result), payload };
        this.jobs.delete(provider); state.activeEvaluation = null;
      }
      this.sync(provider);
    }
  }
}
