import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ModelMonitor } from '../src/monitor.mjs';
import { CANDY_PROMPT } from '../src/evaluations.mjs';
import { probabilitySummary } from '../src/core.mjs';

const bank = JSON.parse(readFileSync(new URL('../assets/unified_bank.json', import.meta.url)));
const finish = { type:'finish', reason:{ kind:'stop' } };
const prompt = options => options.messages.at(-1).content[0].text;
const numbers = count => JSON.stringify(Array.from({ length:count }, (_, i) => i % 355 + 1));
const numericAnswer = options => numbers(Number(prompt(options).match(/\d+/)[0]));
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
function llmStub(reply = () => '21') {
  return { calls:[], stream(options) {
    this.calls.push(options); const n = this.calls.length;
    return (async function* () {
      const text = await reply(options, n);
      yield { type:'text-delta', text };
      yield { type:'usage', usage:{ inputTokens:10, outputTokens:20, reasoningTokens:5 } };
      yield finish;
    })();
  } };
}
async function request(monitor, sessionId = 'one', model = 'gpt-5.5') {
  for await (const _ of monitor.wrap({ sessionId, provider:'test-provider', model, reasoningEffort:'high', messages:[] },
    (async function* () { yield finish; })())) {}
}

test('one combined job publishes both results, four isolated calls and their total usage', async () => {
  const llm = llmStub(options => prompt(options) === CANDY_PROMPT ? '答案 21' : numericAnswer(options));
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); await monitor.startCheck('one');
    const record = monitor.state('one').record;
    assert.equal(llm.calls.length,4); assert.equal(prompt(llm.calls[3]),CANDY_PROMPT);
    assert.deepEqual([record.check.state,record.check.completed,record.check.total,record.check.valid,record.check.traceCompleted],['complete',4,4,3,3]);
    assert.equal(record.fingerprint.usedOutputs,3); assert.equal(record.evaluations.candy.hits,1);
    assert.equal(new Set(llm.calls.map(call => call.sessionId)).size,4);
    assert.deepEqual(record.check.usage,{ inputTokens:40,outputTokens:80,reasoningTokens:20 });
    assert.deepEqual(record.evaluations.candy.usage,{ inputTokens:10,outputTokens:20,reasoningTokens:5 });
    const expected = probabilitySummary(llm.calls.slice(0,3).map(options => ({ text:numericAnswer(options), expected_count:Number(prompt(options).match(/\d+/)[0]) })), bank, record.requestModel);
    assert.deepEqual(record.fingerprint.candidates,expected.candidates);
    for (const call of llm.calls) {
      assert.equal(call.messages.length,1); assert.equal(call.provider,'test-provider'); assert.equal(call.model,'gpt-5.5');
      assert.equal(call.reasoningEffort,'high'); assert.equal(call.tools,undefined);
    }
    assert.equal(monitor.state('one').history.length,1); assert.equal(monitor.state('one').activeEvaluation,null);
  } finally { monitor.dispose(); }
});

test('custom candy repetitions keep three numeric samples and count misses as valid results', async () => {
  const llm = llmStub(options => prompt(options) === CANDY_PROMPT ? '29' : numericAnswer(options));
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); await monitor.startCheck('one',{ runs:3 });
    const record = monitor.state('one').record;
    assert.equal(llm.calls.length,6); assert.equal(record.check.completed,6); assert.equal(record.check.total,6);
    assert.equal(record.check.state,'complete'); assert.equal(record.evaluations.candy.hits,0); assert.equal(record.evaluations.candy.graded,3);
  } finally { monitor.dispose(); }
});

test('candy transport failure preserves numeric probabilities and reports partial completion', async () => {
  const llm = llmStub(options => { if (prompt(options) === CANDY_PROMPT) throw new Error('secret transport details'); return numericAnswer(options); });
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); await monitor.startCheck('one');
    const record = monitor.state('one').record;
    assert.equal(record.check.state,'partial'); assert.equal(record.check.completed,4);
    assert.equal(record.check.traceState,'complete'); assert.equal(record.fingerprint.usedOutputs,3);
    assert.equal(record.evaluations.candy.state,'failed'); assert.equal(record.evaluations.candy.graded,0);
    assert.equal(record.check.error,'PROBE_FAILED'); assert.ok(!JSON.stringify(record).includes('secret transport'));
  } finally { monitor.dispose(); }
});

test('invalid numeric samples still allow candy results without fabricating model probabilities', async () => {
  const llm = llmStub(options => prompt(options) === CANDY_PROMPT ? '21' : 'not a numeric array');
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); await monitor.startCheck('one');
    const record = monitor.state('one').record;
    assert.equal(record.check.state,'partial'); assert.equal(record.check.traceState,'failed'); assert.equal(record.fingerprint,null);
    assert.equal(record.evaluations.candy.state,'complete'); assert.equal(record.evaluations.candy.hits,1);
    assert.equal(record.check.usage.inputTokens,40); assert.equal(record.check.error,'INVALID_SAMPLE');
  } finally { monitor.dispose(); }
});

test('cancelling combined sampling aborts all four in-flight probes and prevents further requests', async () => {
  const gate = deferred(), started = deferred();
  const llm = llmStub(async options => { started.resolve(); await gate.promise; return numericAnswer(options); });
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); const job = monitor.startCheck('one'); await started.promise;
    assert.equal(monitor.state('one').record.evaluations.candy.state,'running');
    assert.equal(llm.calls.length,4);
    monitor.cancel('one'); gate.resolve(); await job;
    assert.equal(monitor.state('one').record.check.state,'cancelled');
    assert.equal(monitor.state('one').record.evaluations.candy.state,'cancelled'); assert.equal(llm.calls.length,4);
    assert.ok(llm.calls.every(call => call.signal.aborted));
  } finally { gate.resolve(); monitor.dispose(); }
});

test('new chat during candy cancels the combined job, retains its fingerprint and ignores late replies', async () => {
  const gate = deferred(), started = deferred();
  const llm = llmStub(async options => { if (prompt(options) !== CANDY_PROMPT) return numericAnswer(options); started.resolve(); return gate.promise; });
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); const job = monitor.startCheck('one'); await started.promise;
    await new Promise(resolve => setImmediate(resolve));
    const pending = monitor.state('one').record;
    assert.equal(pending.check.phase,'candy'); assert.equal(pending.check.state,'running'); assert.equal(pending.check.completed,3);
    assert.equal(pending.fingerprint.usedOutputs,3);
    await request(monitor,'one','claude-opus-4-8'); gate.resolve('21'); await job;
    await new Promise(resolve => setImmediate(resolve));
    const state = monitor.state('one');
    assert.equal(state.record.requestModel,'claude-opus-4-8'); assert.equal(state.record.fingerprint,null); assert.deepEqual(state.record.evaluations,{});
    assert.equal(state.history[1].check.state,'cancelled'); assert.equal(state.history[1].check.traceState,'complete');
    assert.equal(state.history[1].fingerprint.usedOutputs,3); assert.equal(state.history[1].evaluations.candy.state,'cancelled');
    assert.equal(monitor.evaluationDetails('one',pending.id,'candy').payload,null); assert.equal(llm.calls.length,4);
  } finally { gate.resolve('21'); monitor.dispose(); }
});

test('legacy candy and main entry deduplicate one job; other modes cannot replace it', async () => {
  const gate = deferred(); const llm = llmStub(async options => { await gate.promise; return prompt(options) === CANDY_PROMPT ? '21' : numericAnswer(options); });
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); const job = monitor.startCheck('one');
    assert.equal(monitor.startEvaluation('one','candy'),job);
    monitor.probes = JSON.parse(readFileSync(new URL('../assets/fingerprint_probes.json', import.meta.url)));
    monitor.baselines = JSON.parse(readFileSync(new URL('../assets/fingerprint_baselines.json', import.meta.url)));
    await assert.rejects(monitor.startEvaluation('one','behavior'),/EVALUATION_BUSY/);
    gate.resolve(); await job; assert.equal(llm.calls.length,4);
    for (const runs of [0,11,1.5,'1',null]) await assert.rejects(monitor.startCheck('one',{ runs }),/INVALID_RUNS/);
    assert.equal(llm.calls.length,4);
  } finally { gate.resolve(); monitor.dispose(); }
});

test('restart during candy preserves numeric evidence, cancels pending work and never reruns it', async () => {
  const dataDir = mkdtempSync(join(tmpdir(),'model-check-combined-'));
  const gate = deferred(), started = deferred();
  const llm = llmStub(async options => { if (prompt(options) !== CANDY_PROMPT) return numericAnswer(options); started.resolve(); return gate.promise; });
  const monitor = new ModelMonitor({ bank, llm, dataDir, autoCheck:false }); let restored;
  try {
    await request(monitor); const job = monitor.startCheck('one'); await started.promise;
    await new Promise(resolve => setImmediate(resolve)); monitor.persist();
    const restoredLlm = llmStub(); restored = new ModelMonitor({ bank, llm:restoredLlm, dataDir });
    const record = restored.state('one').record;
    assert.equal(record.check.state,'cancelled'); assert.equal(record.check.total,4); assert.equal(record.check.traceState,'complete');
    assert.equal(record.fingerprint.usedOutputs,3); assert.equal(record.evaluations.candy.state,'cancelled');
    restored.onSessionEvent({ id:'one' },{ type:'turn/end' }); assert.equal(restoredLlm.calls.length,0);
    monitor.cancel('one'); gate.resolve('21'); await job;
    // Original 0.2.0 records still load without inventing candy outcomes.
    const legacy = { ...record, check:{ state:'complete',completed:3,total:3,valid:3 }, evaluations:{} };
    writeFileSync(join(dataDir,'state.json'),JSON.stringify({ version:2,sessions:[{ id:'legacy',records:[legacy],frequency:{ mode:'manual' } }] }));
    const old = new ModelMonitor({ bank,llm:restoredLlm,dataDir });
    assert.equal(old.state('legacy').record.fingerprint.usedOutputs,3); assert.deepEqual(old.state('legacy').record.evaluations,{}); old.dispose();
  } finally { monitor.cancel('one'); gate.resolve('21'); monitor.dispose(); restored?.dispose(); rmSync(dataDir,{ recursive:true,force:true }); }
});
