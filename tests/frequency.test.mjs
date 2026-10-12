import { CANDY_PROMPT } from '../src/evaluations.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ModelMonitor } from '../src/monitor.mjs';

const bank = JSON.parse(readFileSync(new URL('../assets/unified_bank.json', import.meta.url)));
const opts = id => ({ sessionId: id, provider: 'test-provider', model: 'gpt-5.5', messages: [] });
const finish = { type: 'finish', reason: { kind: 'stop' }, replayState: { response: { responseModel: 'gpt-5.5' } } };
const llmStub = () => ({ calls: [], stream(options) {
  this.calls.push(options);
  return (async function* () {
    if (options.messages[0].content[0].text === CANDY_PROMPT) { yield { type:'text-delta', text:'21' }; yield finish; return; }
    const count = Number(options.messages[0].content[0].text.match(/\d+/)[0]);
    yield { type: 'text-delta', text: JSON.stringify(Array.from({ length: count }, (_, i) => i % 355 + 1)) };
    yield finish;
  })();
} });
async function request(monitor, id = 'one', extra = {}) {
  for await (const _ of monitor.wrap({ ...opts(id), ...extra }, (async function* () { yield finish; })())) {}
}
// Harness session format numbers the first chat turn as 1.
function event(monitor, id, type, turn) { monitor.onSessionEvent({ id }, { type, data: { turn: turn + 1, reason: { kind: 'stop' } } }); }
async function turn(monitor, id, number, steps = 1) {
  event(monitor, id, 'turn/start', number);
  for (let i = 0; i < steps; i++) await request(monitor, id);
  event(monitor, id, 'turn/end', number);
  await monitor.jobs.get(id)?.promise;
}

test('new conversations default to exactly one automatic check at first completed turn', async () => {
  const llm = llmStub(), monitor = new ModelMonitor({ bank, llm });
  assert.deepEqual(monitor.state('one').settings.frequency, { mode: 'start' });
  await turn(monitor, 'one', 0);
  assert.equal(llm.calls.length, 4);
  await turn(monitor, 'one', 1); await turn(monitor, 'one', 2);
  assert.equal(llm.calls.length, 4); assert.equal(monitor.state('one').settings.completedTurns, 3);
  assert.equal(monitor.state('one').record.fingerprint, null);
  assert.equal(monitor.state('one').history.filter(row => row.fingerprint).length, 1);
  monitor.dispose();
});
test('interval counts completed conversation turns, not tool steps, and deduplicates turn endings', async () => {
  const llm = llmStub(), monitor = new ModelMonitor({ bank, llm });
  monitor.setFrequency('one', { mode: 'interval', every: 2 });
  await turn(monitor, 'one', 0, 4); assert.equal(llm.calls.length, 0);
  await turn(monitor, 'one', 1, 3); assert.equal(llm.calls.length, 4);
  event(monitor, 'one', 'turn/end', 1); event(monitor, 'one', 'turn/end', 0);
  assert.equal(monitor.state('one').settings.completedTurns, 2);
  await turn(monitor, 'one', 2, 3); assert.equal(llm.calls.length, 4);
  await turn(monitor, 'one', 3, 2); assert.equal(llm.calls.length, 8);
  monitor.dispose();
});
test('each conversation has an independent frequency, default and counter', async () => {
  const llm = llmStub(), monitor = new ModelMonitor({ bank, llm });
  monitor.setFrequency('one', { mode: 'interval', every: 3 });
  monitor.setFrequency('two', { mode: 'manual' });
  await turn(monitor, 'one', 0); await turn(monitor, 'two', 0); await turn(monitor, 'new', 0);
  assert.equal(llm.calls.length, 4); assert.equal(llm.calls[0].sessionId.startsWith('model-check-'), true);
  assert.deepEqual(monitor.state('new').settings.frequency, { mode: 'start' });
  await turn(monitor, 'one', 1); await turn(monitor, 'one', 2);
  assert.equal(llm.calls.length, 8); assert.equal(monitor.state('two').settings.completedTurns, 1);
  monitor.dispose();
});
test('manual detection and changing frequency never reset or immediately execute the schedule', async () => {
  const llm = llmStub(), monitor = new ModelMonitor({ bank, llm });
  monitor.setFrequency('one', { mode: 'manual' });
  await turn(monitor, 'one', 0); await monitor.startCheck('one');
  assert.equal(llm.calls.length, 4);
  monitor.setFrequency('one', { mode: 'start' });
  assert.equal(llm.calls.length, 4); await turn(monitor, 'one', 1); assert.equal(llm.calls.length, 4);
  monitor.setFrequency('one', { mode: 'interval', every: 3 });
  assert.equal(llm.calls.length, 4); await turn(monitor, 'one', 2); assert.equal(llm.calls.length, 8);
  assert.equal(monitor.state('one').settings.completedTurns, 3); monitor.dispose();
});
test('a manual check on the first reply is not repeated automatically at that turn end', async () => {
  const llm = llmStub(), monitor = new ModelMonitor({ bank, llm });
  event(monitor, 'one', 'turn/start', 0); await request(monitor); await monitor.startCheck('one');
  event(monitor, 'one', 'turn/end', 0);
  assert.equal(llm.calls.length, 4); assert.equal(monitor.jobs.size, 0);
  await turn(monitor, 'one', 1); assert.equal(llm.calls.length, 4); monitor.dispose();
});
test('title-generation requests are transparent and cannot replace chat records or consume the first-turn check', async () => {
  const llm = llmStub(), monitor = new ModelMonitor({ bank, llm });
  await request(monitor, 'one', { purpose: 'session-title' });
  event(monitor, 'one', 'turn/end', 0);
  assert.equal(monitor.state('one').history.length, 0); assert.equal(llm.calls.length, 0);
  event(monitor, 'one', 'turn/start', 0); await request(monitor);
  const id = monitor.state('one').record.id;
  await request(monitor, 'one', { purpose: 'session-title', model: 'title-only' });
  assert.equal(monitor.state('one').record.id, id);
  event(monitor, 'one', 'turn/end', 0); await monitor.jobs.get('one')?.promise;
  assert.equal(llm.calls.length, 4); assert.equal(monitor.state('one').record.requestModel, 'gpt-5.5'); monitor.dispose();
});
test('failed or aborted turns do not spend requests or advance the successful-turn counter', async () => {
  const llm = llmStub(), monitor = new ModelMonitor({ bank, llm });
  event(monitor, 'one', 'turn/start', 0); await request(monitor);
  monitor.onSessionEvent({ id: 'one' }, { type: 'turn/end', data: { turn: 1, reason: { kind: 'error' } } });
  assert.equal(llm.calls.length, 0); assert.equal(monitor.state('one').settings.completedTurns, 0);
  await turn(monitor, 'one', 1); assert.equal(llm.calls.length, 4); monitor.dispose();
});
test('frequency survives restart and trimming old records without re-running the first-turn check', async () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'model-check-frequency-'));
  try {
    const llm = llmStub(), monitor = new ModelMonitor({ bank, llm, dataDir });
    for (let i = 0; i < 24; i++) await turn(monitor, 'one', i);
    monitor.setFrequency('two', { mode: 'interval', every: 3 }); await turn(monitor, 'two', 0); monitor.dispose();
    const saved = JSON.parse(readFileSync(join(dataDir, 'state.json')));
    assert.equal(saved.version, 2); assert.equal(saved.sessions.find(s => s.id === 'one').records.length, 20);
    const restoredLlm = llmStub(), restored = new ModelMonitor({ bank, llm: restoredLlm, dataDir });
    assert.deepEqual(restored.state('two').settings.frequency, { mode: 'interval', every: 3 });
    assert.equal(restored.state('one').settings.completedTurns, 24);
    await turn(restored, 'one', 24); await turn(restored, 'two', 1); assert.equal(restoredLlm.calls.length, 0);
    await turn(restored, 'two', 2); assert.equal(restoredLlm.calls.length, 4); restored.dispose();
  } finally { rmSync(dataDir, { recursive: true, force: true }); }
});
test('v1 migration preserves route and fingerprint history and does not turn old conversations into new ones', async () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'model-check-migrate-'));
  try {
    const monitor = new ModelMonitor({ bank, llm: llmStub() }); await request(monitor); await monitor.startCheck('one');
    const record = monitor.state('one').record; monitor.dispose();
    writeFileSync(join(dataDir, 'state.json'), JSON.stringify({ version: 1, settings: { autoCheck: true }, sessions: [{ id: 'one', records: [record] }] }));
    const llm = llmStub(), migrated = new ModelMonitor({ bank, llm, dataDir });
    assert.deepEqual(migrated.state('one').record.fingerprint, record.fingerprint);
    assert.deepEqual(migrated.state('one').settings.frequency, { mode: 'start' });
    await turn(migrated, 'one', 1); assert.equal(llm.calls.length, 0);
    await turn(migrated, 'fresh', 0); assert.equal(llm.calls.length, 4); migrated.dispose();
  } finally { rmSync(dataDir, { recursive: true, force: true }); }
});
test('invalid or missing-session frequencies leave the existing schedule intact', () => {
  const monitor = new ModelMonitor({ bank, llm: llmStub() });
  monitor.setFrequency('one', { mode: 'interval', every: 5 });
  for (const value of [null, {}, { mode: 'other' }, { mode: 'interval', every: 0 }, { mode: 'interval', every: 1001 }, { mode: 'interval', every: '5' }, { mode: 'interval', every: 2.5 }]) {
    assert.throws(() => monitor.setFrequency('one', value), /INVALID_FREQUENCY/);
    assert.deepEqual(monitor.state('one').settings.frequency, { mode: 'interval', every: 5 });
  }
  assert.throws(() => monitor.setFrequency('', { mode: 'start' }), /SESSION_UNAVAILABLE/); monitor.dispose();
});
test('resuming a previously unobserved older conversation does not spend a new first-turn check', async () => {
  const llm = llmStub(), monitor = new ModelMonitor({ bank, llm });
  await turn(monitor, 'older', 9);
  assert.equal(llm.calls.length, 0); assert.equal(monitor.state('older').settings.startEligible, false);
  await turn(monitor, 'fresh', 0); assert.equal(llm.calls.length, 4);
  monitor.dispose();
});
test('changing frequency cancels only that conversation automatic job and preserves a manual job', async () => {
  const llm = { stream() { return (async function* () { await new Promise(() => {}); })(); } };
  const monitor = new ModelMonitor({ bank, llm });
  event(monitor, 'auto', 'turn/start', 0); await request(monitor, 'auto'); event(monitor, 'auto', 'turn/end', 0);
  const automatic = monitor.jobs.get('auto').promise;
  await request(monitor, 'manual'); const manual = monitor.startCheck('manual');
  monitor.setFrequency('auto', { mode: 'manual' }); await automatic;
  assert.equal(monitor.state('auto').record.check.state, 'cancelled');
  monitor.setFrequency('manual', { mode: 'interval', every: 5 });
  assert.equal(monitor.jobs.has('manual'), true);
  monitor.cancel('manual'); await manual; monitor.dispose();
});
