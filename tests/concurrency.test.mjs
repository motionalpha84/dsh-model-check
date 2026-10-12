import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ModelMonitor } from '../src/monitor.mjs';
import { CANDY_PROMPT } from '../src/evaluations.mjs';
import { probabilitySummary } from '../src/core.mjs';

const bank = JSON.parse(readFileSync(new URL('../assets/unified_bank.json', import.meta.url)));
const finish = { type:'finish', reason:{ kind:'stop' } };
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const prompt = options => options.messages.at(-1).content[0].text;
const count = options => Number(prompt(options).match(/\d+/)[0]);
const reply = options => prompt(options) === CANDY_PROMPT ? '21' : JSON.stringify(Array.from({ length:count(options) }, (_, i) => (i * 7) % 355 + 1));
function llmStub(answer) {
  return { calls:[], active:0, maxActive:0, stream(options) {
    this.calls.push(options); const index = this.calls.length - 1, llm = this;
    return (async function* () {
      llm.active++; llm.maxActive = Math.max(llm.maxActive, llm.active);
      try {
        const text = await answer(options, index);
        yield { type:'text-delta', text };
        yield { type:'usage', usage:{ inputTokens:10, outputTokens:20 } };
        yield finish;
      } finally { llm.active--; }
    })();
  } };
}
async function request(monitor, sessionId = 'one', model = 'gpt-5.5') {
  for await (const _ of monitor.wrap({ sessionId, provider:'test', model, reasoningEffort:'high', messages:[] },
    (async function* () { yield finish; })())) {}
}

test('all four default probes start before any reply and keep separate request contexts', async () => {
  const gate = deferred(), llm = llmStub(async options => { await gate.promise; return reply(options); });
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); const job = monitor.startCheck('one'); await tick();
    assert.equal(llm.calls.length,4); assert.equal(llm.active,4);
    assert.equal(new Set(llm.calls.map(call => call.sessionId)).size,4);
    assert.equal(new Set(llm.calls.map(call => call.messages[0].id)).size,4);
    assert.equal(llm.calls.filter(call => prompt(call) === CANDY_PROMPT).length,1);
    assert.equal(monitor.state('one').record.check.phase,'parallel');
    assert.equal(monitor.state('one').record.check.completed,0);
    gate.resolve(); await job;
    assert.equal(monitor.state('one').record.check.state,'complete');
    assert.deepEqual(monitor.state('one').record.check.usage,{ inputTokens:40, outputTokens:80 });
  } finally { gate.resolve(); monitor.dispose(); }
});

test('out-of-order replies publish partial evidence, keep sample pairing and isolate one failure', async () => {
  const gates = Array.from({ length:4 }, deferred);
  const llm = llmStub((options, index) => gates[index].promise);
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); const job = monitor.startCheck('one'); await tick();
    gates[3].resolve('21'); await tick();
    let record = monitor.state('one').record;
    assert.equal(record.check.completed,1); assert.equal(record.check.phase,'trace');
    assert.equal(record.evaluations.candy.hits,1); assert.equal(record.fingerprint,null);
    gates[2].resolve(reply(llm.calls[2])); await tick();
    record = monitor.state('one').record;
    assert.equal(record.check.completed,2); assert.equal(record.fingerprint.usedOutputs,1);
    gates[0].resolve('invalid array'); await tick();
    assert.equal(monitor.state('one').record.check.completed,3);
    gates[1].resolve(reply(llm.calls[1])); await job;
    record = monitor.state('one').record;
    assert.equal(record.check.state,'partial'); assert.equal(record.check.completed,4);
    assert.equal(record.check.traceCompleted,3); assert.equal(record.check.valid,2);
    assert.equal(record.check.error,'INVALID_SAMPLE');
    const expected = probabilitySummary([1,2].map(index => ({ text:reply(llm.calls[index]), expected_count:count(llm.calls[index]) })), bank, 'gpt-5.5');
    assert.deepEqual(record.fingerprint.candidates,expected.candidates);
    assert.deepEqual(record.check.usage,{ inputTokens:40, outputTokens:80 });
  } finally { gates.forEach(gate => gate.resolve('21')); monitor.dispose(); }
});

test('different sessions share four request slots, including a queued third job', async () => {
  const gates = [], llm = llmStub(async options => { const gate = deferred(); gates.push(gate); await gate.promise; return reply(options); });
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    for (const id of ['one','two','three']) await request(monitor,id);
    const jobs = ['one','two','three'].map(id => monitor.startCheck(id));
    for (let batch = 0; batch < 3; batch++) {
      await tick(); assert.equal(llm.calls.length,(batch + 1) * 4); assert.equal(llm.active,4);
      gates.slice(batch * 4, batch * 4 + 4).forEach(gate => gate.resolve());
    }
    await Promise.all(jobs);
    assert.equal(llm.maxActive,4); assert.equal(llm.active,0);
    for (const id of ['one','two','three']) assert.equal(monitor.state(id).record.check.completed,4);
  } finally { gates.forEach(gate => gate.resolve()); monitor.dispose(); }
});

test('cancelling a job waiting for slots sends no requests and frees the queue for the next job', async () => {
  const gate = deferred(), llm = llmStub(async options => { await gate.promise; return reply(options); });
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor,'first','gpt-5.5'); await request(monitor,'waiting','gpt-6-sol');
    const first = monitor.startCheck('first'), waiting = monitor.startCheck('waiting'); await tick();
    assert.equal(llm.calls.length,4); monitor.cancel('waiting'); await waiting;
    gate.resolve(); await first; await tick();
    assert.equal(llm.calls.length,4); assert.equal(monitor.state('waiting').record.check.state,'cancelled');
    await request(monitor,'next'); await monitor.startCheck('next');
    assert.equal(llm.calls.length,8); assert.ok(llm.calls.every(call => call.model !== 'gpt-6-sol'));
    assert.equal(monitor.state('next').record.check.state,'complete');
  } finally { gate.resolve(); monitor.dispose(); }
});

test('one timed-out probe does not cancel successful siblings or retain a request slot', async () => {
  const gate = deferred(), llm = llmStub((options, index) => index === 0 ? gate.promise : reply(options));
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false, timeoutMs:25 });
  const keepAlive = setInterval(() => {},100);
  try {
    await request(monitor); await monitor.startCheck('one');
    const record = monitor.state('one').record;
    assert.equal(record.check.state,'partial'); assert.equal(record.check.completed,4);
    assert.equal(record.check.error,'PROBE_TIMEOUT'); assert.equal(record.fingerprint.usedOutputs,2);
    assert.equal(record.evaluations.candy.hits,1);
    gate.resolve(reply(llm.calls[0])); await tick();
    await request(monitor,'next'); await monitor.startCheck('next');
    assert.equal(llm.calls.length,8); assert.equal(monitor.state('next').record.check.state,'complete');
  } finally { clearInterval(keepAlive); gate.resolve('21'); monitor.dispose(); }
});

test('cancelling before dispatch sends nothing and releases all reserved slots', async () => {
  const llm = llmStub(reply), monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); const job = monitor.startCheck('one'); monitor.cancel('one'); await job; await tick();
    assert.equal(llm.calls.length,0); assert.equal(monitor.state('one').record.check.state,'cancelled');
    await request(monitor,'next'); await monitor.startCheck('next');
    assert.equal(llm.calls.length,4); assert.equal(monitor.state('next').record.check.state,'complete');
  } finally { monitor.dispose(); }
});

test('new chat cancels parallel probes while preserving only the samples already completed', async () => {
  const gates = Array.from({ length:4 }, deferred), llm = llmStub((options, index) => gates[index].promise);
  const monitor = new ModelMonitor({ bank, llm, autoCheck:false });
  try {
    await request(monitor); const job = monitor.startCheck('one'); await tick();
    gates[0].resolve(reply(llm.calls[0])); await tick();
    assert.equal(monitor.state('one').record.fingerprint.usedOutputs,1);
    await request(monitor,'one','claude-opus-4-8'); await job;
    gates.forEach((gate, index) => gate.resolve(reply(llm.calls[index]))); await tick();
    const state = monitor.state('one');
    assert.equal(state.record.requestModel,'claude-opus-4-8'); assert.equal(state.record.fingerprint,null);
    assert.deepEqual(state.record.evaluations,{}); assert.equal(state.history[1].check.state,'cancelled');
    assert.equal(state.history[1].check.completed,1); assert.equal(state.history[1].fingerprint.usedOutputs,1);
    assert.equal(llm.calls.length,4); assert.ok(llm.calls.every(call => call.signal.aborted));
  } finally { gates.forEach(gate => gate.resolve('21')); monitor.dispose(); }
});

test('behavior workers and combined checks share the same global request budget', async () => {
  const gates = [], llm = llmStub(async options => {
    const gate = deferred(); gates.push(gate);
    const abort = () => gate.resolve();
    options.signal.addEventListener('abort',abort,{ once:true });
    try { await gate.promise; if (options.signal.aborted) throw new Error('PROBE_CANCELLED'); return reply(options); }
    finally { options.signal.removeEventListener('abort',abort); }
  });
  const probes = JSON.parse(readFileSync(new URL('../assets/fingerprint_probes.json', import.meta.url)));
  const baselines = JSON.parse(readFileSync(new URL('../assets/fingerprint_baselines.json', import.meta.url)));
  const monitor = new ModelMonitor({ bank, llm, probes, baselines, autoCheck:false });
  try {
    await request(monitor,'behavior'); await request(monitor,'combined');
    const behavior = monitor.startEvaluation('behavior','behavior'), combined = monitor.startCheck('combined');
    await tick(); assert.equal(llm.active,4); assert.equal(llm.calls.filter(call => call.reasoningEffort === 'low').length,2);
    monitor.cancel('behavior'); gates.slice(0,2).forEach(gate => gate.resolve('a')); await behavior; await tick();
    assert.equal(llm.calls.length,6); assert.equal(llm.active,4);
    gates.slice(2).forEach(gate => gate.resolve()); await combined;
    assert.equal(llm.maxActive,4); assert.equal(monitor.state('combined').record.check.state,'complete');
  } finally { gates.forEach(gate => gate.resolve('a')); monitor.dispose(); }
});
