import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoState, PROVIDERS } from '../docs/demo-state.js';

test('demo exposes only the two fictional providers and normalized probabilities', () => {
  const demo = new DemoState();
  assert.deepEqual(PROVIDERS, ['test-gpt', 'test-Claude']);
  for (const provider of PROVIDERS) {
    demo.select(provider); const state = demo.state();
    assert.equal(state.record.provider, provider);
    assert(state.history.every(record => record.provider === provider));
    assert(Math.abs(state.record.fingerprint.candidates.reduce((sum, item) => sum + item.probability, 0) - 1) < 1e-9);
    assert.equal(state.bank.count, 19); assert.equal(state.behaviorBank.count, 8);
  }
  assert.throws(() => demo.select('unlisted'), /UNKNOWN_PROVIDER/);
});
test('changing response scenarios does not conflate route labels and candidate probabilities', () => {
  const demo = new DemoState(), fingerprint = demo.state().record.fingerprint;
  demo.setScenario('mismatch'); assert.notEqual(demo.state().record.requestModel, demo.state().record.responseModel);
  assert.deepEqual(demo.state().record.fingerprint, fingerprint);
  demo.setScenario('unknown'); assert.equal(demo.state().record.responseModel, null);
  demo.setScenario('match'); assert.equal(demo.state().record.requestModel, demo.state().record.responseModel);
});
test('simulated check progresses, completes and exposes matching detail payloads', () => {
  const demo = new DemoState(), sessionId = demo.state().sessionId;
  demo.action(sessionId, { action:'check', runs:3 });
  assert.equal(demo.state().activeEvaluation, 'trace'); assert.equal(demo.simulatedRequests, 6);
  demo.tick(); assert.equal(demo.state().record.fingerprint.usedOutputs, 1);
  for (let i = 0; i < 3; i++) demo.tick();
  const state = demo.state(); assert.equal(state.activeEvaluation, null);
  assert.equal(state.record.check.completed, 6); assert.equal(state.record.evaluations.candy.hits, 3);
  assert.equal(demo.details(sessionId, state.record.id, 'candy').payload.answers.length, 3);
  assert.deepEqual(state.record, state.history[0]);
});
test('cancelled work does not complete after more ticks; provider sessions remain isolated', () => {
  const demo = new DemoState(), gpt = demo.state().sessionId;
  demo.action(gpt, { action:'check' }); demo.tick(); demo.action(gpt, { action:'cancel' });
  demo.select('test-Claude'); const other = demo.state();
  for (let i = 0; i < 5; i++) demo.tick();
  assert.equal(demo.state(gpt).record.check.state, 'cancelled');
  assert.equal(other.record.provider, 'test-Claude'); assert.equal(other.record.check.state, 'complete');
  demo.action(gpt, { action:'frequency', frequency:{ mode:'manual' } });
  assert.equal(demo.state().settings.frequency.mode, 'start');
  assert.equal(demo.state(gpt).settings.frequency.mode, 'manual');
});
test('behavior demo completes with explicit illustrative attribution, reset cancels jobs', () => {
  const demo = new DemoState(), id = demo.state().sessionId;
  demo.action(id, { action:'evaluate', kind:'behavior', mode:'standard' });
  for (let i = 0; i < 4; i++) demo.tick();
  assert.equal(demo.state().record.evaluations.behavior.completed, 200);
  assert.match(demo.details(id, demo.state().record.id, 'behavior').payload.attribution.warnings[0], /虚构演示数据/);
  demo.action(id, { action:'check' }); demo.reset(); demo.tick();
  assert.equal(demo.jobs.size, 0); assert.equal(demo.simulatedRequests, 0); assert.equal(demo.state().activeEvaluation, null);
});
test('invalid or stale actions do not start jobs', () => {
  const demo = new DemoState(), id = demo.state().sessionId;
  for (const input of [{ action:'check', runs:100 }, { action:'check', recordId:'stale' }, { action:'evaluate', kind:'unknown' },
    { action:'evaluate', kind:'behavior', mode:'unknown' }, { action:'frequency', frequency:{ mode:'interval', every:0 } }]) {
    assert.throws(() => demo.action(id, input));
    assert.equal(demo.jobs.size, 0);
  }
  assert.throws(() => demo.state('another-session'), /UNKNOWN_SESSION/);
});
