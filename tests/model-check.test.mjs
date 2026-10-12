import { CANDY_PROMPT } from '../src/evaluations.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { responseRoute, parseProbe, probabilitySummary, recordStatus } from '../src/core.mjs';
import { ModelMonitor } from '../src/monitor.mjs';
import { apply } from '../src/index.mjs';

const bank = JSON.parse(readFileSync(new URL('../assets/unified_bank.json', import.meta.url)));
const samples = count => JSON.stringify(Array.from({ length: count }, (_, i) => ((i * 73 + i * i * 19) % 355) + 1));
const options = (sessionId = 'one', model = 'gpt-6-sol') => ({ sessionId, model, provider: 'openai', reasoningEffort: 'high',
  messages: [{ role: 'user', content: [{ type: 'text', text: 'A normal user request' }] }], apiKey: 'never-persist-this' });
const finish = (model = 'gpt-6-sol') => ({ type: 'finish', reason: { kind: 'stop' }, replayState: { response: {
  kind: 'pi-ai', model: 'gpt-6-sol', responseModel: model, responseId: 'response-123',
} } });
async function* mainStream(model) { yield { type: 'text-delta', index: 0, text: 'normal response' }; yield finish(model); }
function fakeLlm() {
  const calls = [];
  return { calls, stream(value) {
    calls.push(value);
    return (async function* () {
      if (value.messages[0].content[0].text === CANDY_PROMPT) { yield { type:'text-delta', text:'21' }; yield finish(); return; }
      const count = Number(value.messages[0].content[0].text.match(/\d+/)[0]);
      yield { type: 'text-delta', index: 0, text: samples(count) };
      yield finish();
    })();
  } };
}
async function request(monitor, opts = options(), model = opts.model) {
  const out = [];
  for await (const chunk of monitor.wrap(opts, mainStream(model))) out.push(chunk);
  return out;
}

test('requested identities never masquerade as provider-returned routing evidence', () => {
  assert.equal(responseRoute({ model: 'gpt-6-sol', source: { model: 'gpt-6-sol' }, replayState: { response: { model: 'gpt-6-sol' } } }).model, null);
  assert.deepEqual(responseRoute(finish('claude-opus-4-8')), {
    model: 'claude-opus-4-8', field: 'replayState.response.responseModel', evidence: 'provider-declared',
  });
  assert.equal(responseRoute({ source: { replayState: finish('gpt-5.5').replayState } }).model, 'gpt-5.5');
});
test('reject prose, reasoning, invalid numbers, tool outputs and severely truncated samples', () => {
  assert.equal(JSON.parse(parseProbe('```json\n' + samples(300) + '\n```', 300)).length, 300);
  const invalid = JSON.parse(samples(300)); invalid[0] = 355.5;
  for (const text of ['Here is my answer: ' + samples(300), '[1,2,3]', JSON.stringify(invalid), '[0,' + samples(300).slice(1)]) {
    assert.throws(() => parseProbe(text, 300), /INVALID_SAMPLE/);
  }
});
test('bank fusion preserves normalized candidate/family probabilities and marks unknowns', () => {
  const outputs = [{ text: samples(300), expected_count: 300 }];
  const result = probabilitySummary(outputs, bank, 'deepseek-v4-pro');
  assert.equal(result.requestedInBank, false); assert.equal(result.requestedProbability, null);
  assert.equal(result.calibration, 'bank-fusion-unrecalibrated');
  assert.equal(result.candidates.length, bank.models.length);
  assert.ok(Math.abs(result.candidates.reduce((n, candidate) => n + candidate.probability, 0) - 1) < 1e-12);
  assert.ok(Math.abs(result.families.reduce((n, family) => n + family.probability, 0) - 1) < 1e-12);
  const known = probabilitySummary(outputs, bank, bank.models[0].id);
  assert.equal(known.requestedInBank, true); assert.ok(Number.isFinite(known.requestedProbability));
});
test('observing streams preserves object identity, ordering, options and errors', async () => {
  const monitor = new ModelMonitor({ bank, llm: fakeLlm(), autoCheck: false });
  const opts = options(); const before = structuredClone(opts);
  const chunks = [{ type: 'text-delta', index: 0, text: 'hello' }, finish('gpt-5.5')];
  const source = (async function* () { yield* chunks; })();
  let index = 0;
  for await (const chunk of monitor.wrap(opts, source)) assert.equal(chunk, chunks[index++]);
  assert.deepEqual(opts, before); assert.equal(monitor.state('one').record.responseModel, 'gpt-5.5');
  const error = new Error('original transport failure');
  await assert.rejects(async () => { for await (const _ of monitor.wrap(options('failure'), (async function* () { throw error; })())) {} }, value => value === error);
  assert.equal(monitor.state('failure').record.outcome, 'error'); monitor.dispose();
});
test('passive mode does not spend requests; explicit checks issue three numeric samples and one isolated candy question', async () => {
  const llm = fakeLlm(); const monitor = new ModelMonitor({ bank, llm, autoCheck: false });
  await request(monitor);
  monitor.onSessionEvent({ id: 'one' }, { type: 'turn/end' });
  assert.equal(llm.calls.length, 0);
  await monitor.startCheck('one');
  assert.equal(llm.calls.length, 4);
  for (const call of llm.calls) {
    assert.equal(call.provider, 'openai'); assert.equal(call.model, 'gpt-6-sol'); assert.equal(call.reasoningEffort, 'high');
    assert.equal(call.tools, undefined); assert.equal(call.messages.length, 1);
    assert.ok(!JSON.stringify(call.messages).includes('normal user request'));
  }
  assert.equal(monitor.state('one').record.fingerprint.usedOutputs, 3); monitor.dispose();
});
test('automatic completion is non-blocking, deduplicated and ignores its own probe streams', async () => {
  const llm = fakeLlm(); const monitor = new ModelMonitor({ bank, llm });
  const original = llm.stream; llm.stream = opts => monitor.wrap(opts, original(opts));
  await request(monitor);
  monitor.onSessionEvent({ id: 'one' }, { type: 'turn/end' });
  monitor.onSessionEvent({ id: 'one' }, { type: 'turn/end' });
  await monitor.jobs.get('one').promise;
  assert.equal(llm.calls.length, 4); assert.equal(monitor.sessions.size, 1);
  assert.equal(monitor.state('one').history.length, 1); monitor.dispose();
});
test('a new model request cancels the preceding check and late samples cannot overwrite it', async () => {
  let release;
  const llm = { stream() { return (async function* () { await new Promise(resolve => { release = resolve; }); yield { type: 'text-delta', text: samples(310) }; yield finish(); })(); } };
  const monitor = new ModelMonitor({ bank, llm });
  await request(monitor);
  const pending = monitor.startCheck('one');
  await new Promise(resolve => setTimeout(resolve, 1));
  await request(monitor, options('one', 'claude-opus-4-8'), 'claude-opus-4-8');
  release(); await pending;
  await new Promise(resolve => setTimeout(resolve, 5));
  const current = monitor.state('one');
  assert.equal(current.record.requestModel, 'claude-opus-4-8'); assert.equal(current.record.fingerprint, null);
  assert.equal(current.history[1].check.state, 'cancelled'); monitor.dispose();
});
test('concurrent sessions keep request labels and probability records separate', async () => {
  const monitor = new ModelMonitor({ bank, llm: fakeLlm() });
  await Promise.all([request(monitor, options('parent', 'gpt-6-sol')), request(monitor, options('child', 'claude-opus-4-8'))]);
  await Promise.all([monitor.startCheck('parent'), monitor.startCheck('child')]);
  assert.equal(monitor.state('parent').record.requestModel, 'gpt-6-sol');
  assert.equal(monitor.state('child').record.requestModel, 'claude-opus-4-8');
  assert.notEqual(monitor.state('child').record.id, monitor.state('parent').record.id); monitor.dispose();
});
test('timeout bounds uncooperative transports, marks gaps, and never fabricates probabilities', async () => {
  const keepAlive = setInterval(() => {}, 100);
  const llm = { stream() { return { [Symbol.asyncIterator]() { return { next: () => new Promise(() => {}), return: () => Promise.resolve({ done: true }) }; } }; } };
  const monitor = new ModelMonitor({ bank, llm, timeoutMs: 15 });
  try {
    await request(monitor); await monitor.startCheck('one');
    assert.equal(monitor.state('one').record.check.state, 'failed');
    assert.equal(monitor.state('one').record.fingerprint, null);
  } finally { clearInterval(keepAlive); monitor.dispose(); }
});
test('persisted history excludes prompts, secrets and raw samples; restoring history never starts inference', async () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'model-check-test-'));
  try {
    const monitor = new ModelMonitor({ bank, llm: fakeLlm(), dataDir });
    await request(monitor); await monitor.startCheck('one'); monitor.dispose();
    const saved = readFileSync(join(dataDir, 'state.json'), 'utf8');
    assert.ok(!saved.includes('never-persist-this')); assert.ok(!saved.includes('normal user request')); assert.ok(!saved.includes('expected_count'));
    const llm = fakeLlm(); const restored = new ModelMonitor({ bank, llm, dataDir });
    restored.onSessionEvent({ id: 'one' }, { type: 'turn/end' });
    assert.equal(restored.state('one').record.isHistory, true); assert.equal(llm.calls.length, 0); restored.dispose();
  } finally { rmSync(dataDir, { recursive: true, force: true }); }
});
test('bounded history survives session disposal without continuing background checks', async () => {
  const monitor = new ModelMonitor({ bank, llm: fakeLlm() });
  for (let i = 0; i < 26; i++) await request(monitor);
  assert.equal(monitor.state('one').history.length, 20);
  monitor.disposeSession('one'); await assert.rejects(monitor.startCheck('one'), /SESSION_UNAVAILABLE/);
  assert.equal(recordStatus(monitor.state('one').record).label, '路由标签一致'); monitor.dispose();
});
test('real HTTP routes require same-origin action capability and close on disposal', async () => {
  const routes = new Map(), listeners = new Map(), cleanups = [];
  const ctx = { llm: fakeLlm(),
    on(name, listener) { listeners.set(name, listener); return () => listeners.delete(name); },
    webServer: { register(route) { routes.set(route.path, route.handler); return () => routes.delete(route.path); } },
    effect(fn) { cleanups.push(fn()); } };
  const dataDir = mkdtempSync(join(tmpdir(), 'model-check-http-'));
  const monitor = apply(ctx, { dataDir, autoCheck: false });
  const server = createServer((req, res) => {
    const route = routes.get(new URL(req.url, 'http://localhost').pathname);
    if (route) Promise.resolve(route(req, res)).catch(error => { res.statusCode = 500; res.end(error.message); });
    else { res.statusCode = 404; res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const state = await (await fetch(base + '/model-check/state?sessionId=one')).json();
    assert.equal(state.record, null); assert.ok(state.actionToken);
    const denied = await fetch(base + '/model-check/action?sessionId=one', { method: 'POST', body: '{"action":"check"}' });
    assert.equal(denied.status, 403);
    const otherOrigin = await fetch(base + '/model-check/action', { method: 'POST', headers: { Origin: 'https://evil.example', 'X-Model-Check-Token': state.actionToken }, body: '{"action":"settings","autoCheck":true}' });
    assert.equal(otherOrigin.status, 403);
    await request(monitor);
    const valid = await fetch(base + '/model-check/action?sessionId=one', { method: 'POST', headers: { 'X-Model-Check-Token': state.actionToken }, body: '{"action":"frequency","frequency":{"mode":"interval","every":5}}' });
    assert.equal(valid.status, 200); assert.deepEqual((await valid.json()).settings.frequency, { mode: 'interval', every: 5 });
    for (const payload of [{ mode: 'interval', every: 0 }, { mode: 'interval', every: 2.5 }, { mode: 'interval', every: 1001 }, { mode: 'other' }]) {
      const invalid = await fetch(base + '/model-check/action?sessionId=one', { method: 'POST', headers: { 'X-Model-Check-Token': state.actionToken }, body: JSON.stringify({ action: 'frequency', frequency: payload }) });
      assert.equal(invalid.status, 400);
    }
    const noSession = await fetch(base + '/model-check/action', { method: 'POST', headers: { 'X-Model-Check-Token': state.actionToken }, body: '{"action":"frequency","frequency":{"mode":"start"}}' });
    assert.equal(noSession.status, 400); assert.equal(ctx.llm.calls.length, 0);
    assert.ok(listeners.has('llm/stream')); cleanups.forEach(fn => fn()); assert.equal(routes.size, 0);
  } finally {
    monitor.dispose(); await new Promise(resolve => server.close(resolve)); rmSync(dataDir, { recursive: true, force: true });
  }
});
