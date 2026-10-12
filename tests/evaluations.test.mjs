import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { ModelMonitor } from '../src/monitor.mjs';
import { apply } from '../src/index.mjs';
import { analyzeModelBank } from '../src/model-banks.mjs';
import { analyzeGlobalOutputs } from '../vendor/fingerprint-core.mjs';
import { probabilitySummary } from '../src/core.mjs';
import { CANDY_PROMPT, candyHit, evaluationOptions, behaviorUnavailableReason, boundedPayload } from '../src/evaluations.mjs';
import { normalizeAnswer, jsd, compareCells, splitHalf, permutation, attributeBehavior } from '../src/behavior.mjs';

const json = name => JSON.parse(readFileSync(new URL('../assets/' + name, import.meta.url)));
const bank = json('unified_bank.json'), probes = json('fingerprint_probes.json'), baselines = json('fingerprint_baselines.json');
const complete = { type:'finish', reason:{ kind:'stop' } };
const opts = (sessionId = 'one', model = 'gpt-5.5') => ({ sessionId, model, provider:'local-provider', reasoningEffort:'high',
  apiKey:'SECRET-NEVER-FORWARDED', messages:[{ role:'user', content:[{ type:'text', text:'PRIVATE-CONVERSATION' }] }] });
const factory = llm => new ModelMonitor({ bank, probes, baselines, llm, autoCheck:false });
async function request(monitor, options = opts()) {
  for await (const _ of monitor.wrap(options, (async function* () { yield complete; })())) {}
}
function fakeLlm(reply) {
  const calls = [];
  return { calls, stream(options) { calls.push(options); return (async function* () {
    const text = await reply(options, calls.length);
    yield { type:'text-delta', index:0, text };
    yield { type:'usage', usage:{ inputTokens:10, outputTokens:20, reasoningTokens:5 } }; yield complete;
  })(); } };
}
function answerFor(options) {
  const question = options.messages.at(-1).content[0].text;
  const probe = probes.find(item => item.prompts.includes(question));
  return probe?.kind === 'int' ? String(Math.max(1, probe.lo)) : probe?.kind === 'letter' ? 'A' : probe?.kind === 'color' ? 'blue' : probe?.kind === 'coin' ? 'heads' : 'apple';
}
test('updated union includes Haiku 5.5, GPT 6.1 and Sonnet 5.5 without mismatching centroids', () => {
  assert.equal(bank.models.length, 19); assert.equal(new Set(bank.models.map(item => item.id)).size, 19);
  assert.ok(bank.models.some(item => item.id === 'claude-haiku-5-5'));
  assert.ok(bank.models.some(item => item.id === 'gpt-6.1-sol')); assert.ok(bank.models.some(item => item.id === 'claude-sonnet-5-5'));
  assert.deepEqual(bank.banks, [json('modeltrace-original-bank.json'), json('modeltrace-candy-bank.json')]);
  for (const artifact of bank.banks) {
    assert.deepEqual(artifact.robust.model_order, artifact.models.map(item => item.id));
    assert.equal(artifact.robust.hellinger.centroids.length, artifact.models.length);
    for (const environment of artifact.robust.ordered_blocks.environment_centroids) assert.equal(environment.length, artifact.models.length);
  }
});
test('a duplicated bank fuses to its original calibrated probabilities, not extra certainty', () => {
  const artifact = bank.banks[0], outputs = [{ text:JSON.stringify(Array.from({ length:300 }, (_, i) => i % 355 + 1)), expected_count:300 }];
  const original = analyzeGlobalOutputs(outputs, artifact), fused = analyzeModelBank(outputs, { ...bank, models:artifact.models, banks:[artifact, artifact] });
  for (const item of original.results) assert.ok(Math.abs(item.probability - fused.results.find(row => row.model === item.model).probability) < 1e-12);
  for (const name of ['gpt-6.1-sol','claude-sonnet-5-5']) assert.equal(probabilitySummary(outputs, bank, name).requestedInBank, true);
});
test('unchanged ModelTrace scorer matches CPA upstream golden answers for 1, 2 and 3 samples', () => {
  const fixtures = JSON.parse(readFileSync(new URL('./fixtures/modeltrace-golden.json', import.meta.url)));
  for (const fixture of fixtures) {
    const actual = analyzeGlobalOutputs(fixture.outputs, bank.banks[1]), expected = fixture.expected;
    assert.equal(actual.prediction, expected.prediction); assert.equal(actual.used_outputs, expected.used_outputs);
    for (const row of actual.results) {
      const reference = expected.results.find(item => item.model === row.model);
      assert.ok(Math.abs(row.probability - reference.probability) < 1e-10); assert.ok(Math.abs(row.score - reference.score) < 1e-10);
    }
  }
});
test('all pooled model profiles produce finite 19-model probabilities, without changing the original scorer', () => {
  for (const model of bank.models) {
    const numbers = model.counts.flatMap((count, i) => Array(Math.min(4, count)).fill(i + 1)).slice(0, 300);
    const result = probabilitySummary([{ text:JSON.stringify(numbers), expected_count:numbers.length }], bank, model.id);
    assert.equal(result.candidates.length, 19); assert.ok(result.candidates.every(item => Number.isFinite(item.probability)));
    assert.ok(Math.abs(result.candidates.reduce((total, item) => total + item.probability, 0) - 1) < 1e-12);
  }
});
test('behavior data has 8 distinct baselines and 16 probes with enough real reference samples', () => {
  assert.equal(probes.length, 16); assert.equal(baselines.length, 8); assert.equal(new Set(baselines.map(item => item.model)).size, 8);
  assert.ok(baselines.some(item => item.model === 'gpt-6.1-sol'));
  for (const baseline of baselines) for (const probe of probes) assert.ok(baseline.cells[probe.id].length >= 10);
});
test('candy rule faithfully matches standalone ASCII 21; it does not claim mathematical correctness', () => {
  for (const text of ['21', '答案：21 个', 'not 21 but 29', 'x21x']) assert.equal(candyHit(text), true);
  for (const text of ['121', '210', '２１', '二十一', '29']) assert.equal(candyHit(text), false);
  for (const value of [0, 11, 2.5, '3']) assert.throws(() => evaluationOptions('candy', { runs:value }));
  for (const [mode, total] of [['quick',60],['standard',200],['strict',400]]) assert.equal(evaluationOptions('behavior', { mode }).total, total);
  assert.throws(() => evaluationOptions('behavior', { mode:'__proto__' }));
});
test('normalization matches upstream multilingual, refusal and first-token cases', () => {
  const int = { kind:'int', lo:1, hi:100 };
  for (const text of ['**４７**','٤٧','۴۷','四十七。','forty-seven']) assert.deepEqual(normalizeAnswer(text, int), { answer:'47', category:'valid' });
  for (const [text, value] of [['一百',100],['十',10],['one hundred',1]]) assert.equal(normalizeAnswer(text, int).answer, String(value));
  for (const text of ['101','0','A number: 47']) assert.equal(normalizeAnswer(text, int).category, 'invalid');
  for (const [kind, text, answer] of [['letter','Zed!','z'],['letter','QUEUE','q'],['color','Grey','gray'],['color','蓝色','蓝'],['color','Aqua','cyan'],['coin','正面','heads'],['coin','花','tails'],['word','Snow leopard','snow'],['word','“上海”','上海']])
    assert.deepEqual(normalizeAnswer(text, { kind }), { answer, category:'valid' });
  assert.equal(normalizeAnswer('abc', { kind:'letter' }).category, 'invalid');
  assert.equal(normalizeAnswer('e\u0301', { kind:'word' }).answer, 'é');
  assert.equal(normalizeAnswer('🙂', int).category, 'empty');
  for (const text of ['As an AI, I cannot help','抱歉，我无法回答']) assert.equal(normalizeAnswer(text, int).category, 'refusal');
});
const four = probes.slice(0, 4), cells = (letter, count = 25) => Object.fromEntries(four.map(probe => [probe.id, Array(count).fill(letter)]));
test('JSD, sample eligibility, split-half and permutation tests match upstream statistical properties', async () => {
  assert.equal(jsd(['a'],['b']), 1); assert.equal(jsd(['a','b'],['b','a']), 0);
  assert.ok(Math.abs(jsd(['a'],['a','b']) - 0.31127812445913283) < 1e-12);
  assert.equal(compareCells(cells('a'), cells('b'), four).meanJSD, 1);
  assert.equal(compareCells(cells('a',9), cells('b'), four).meanJSD, null);
  assert.equal(compareCells(cells('a'), cells('b'), four.slice(0,3)).meanJSD, null);
  assert.equal(splitHalf(cells('a'), four), 0);
  assert.equal(await permutation(cells('a'), cells('a'), four, 'same'), 1);
  assert.ok(await permutation(cells('a'), cells('b'), four, 'disjoint') <= 0.004);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(permutation(cells('a'), cells('b'), four, 'cancelled', { signal:controller.signal }), /PROBE_CANCELLED/);
});
test('attribution separates consistency, substitution, unknown and insufficient evidence', async () => {
  const references = [{ model:'original', cells:cells('a') }, { model:'substitute', cells:cells('b') }];
  for (const [model, letter, count, status] of [['original','a',25,'consistent'],['original','b',25,'substitution'],['original','c',25,'different'],['unknown','a',25,'no_baseline'],['original','a',9,'insufficient']]) {
    const result = await attributeBehavior(model, cells(letter,count), four, references);
    assert.equal(result.status, status); assert.equal(result.alpha, .0125);
  }
  const ambiguous = await attributeBehavior('original', cells('b'), four, references.map(item => ({ ...item, cells:cells('a') })));
  assert.equal(ambiguous.status, 'different'); // The nearest same-model reference also differs significantly.
});
test('legacy candy entry includes three numeric samples and counts candy failures separately from misses', async () => {
  const llm = fakeLlm((options, n) => { if (n <= 3) { const count = Number(options.messages[0].content[0].text.match(/\d+/)[0]); return JSON.stringify(Array.from({ length:count }, (_, i) => i % 355 + 1)); } n -= 3; if (n === 3) throw new Error('transport failed: secret-token'); return n === 1 ? '21 个' : '29 个'; });
  const monitor = factory(llm); await request(monitor);
  assert.equal(llm.calls.length, 0); await monitor.startEvaluation('one','candy',{ runs:3 });
  const result = monitor.state('one').record.evaluations.candy;
  assert.equal(result.state,'partial'); assert.equal(result.hits,1); assert.equal(result.graded,2); assert.equal(result.errors,1);
  assert.deepEqual(result.usage, { inputTokens:20, outputTokens:40, reasoningTokens:10 });
  const detail = monitor.evaluationDetails('one',monitor.state('one').record.id,'candy'); assert.equal(detail.payload.answers.length,3);
  assert.equal(llm.calls.length,6); assert.equal(monitor.state('one').record.check.total,6);
  assert.equal(monitor.state('one').record.fingerprint.usedOutputs,3);
  for (const call of llm.calls.slice(3)) {
    assert.equal(call.provider,'local-provider'); assert.equal(call.model,'gpt-5.5'); assert.equal(call.reasoningEffort,'high');
    assert.equal(call.messages.length,1); assert.equal(call.messages[0].content[0].text,CANDY_PROMPT);
    assert.equal(call.apiKey,undefined); assert.equal(call.tools,undefined);
  }
  assert.ok(!JSON.stringify(detail).includes('secret-token')); assert.equal(monitor.state('one').history.length,1); monitor.dispose();
});
test('behavior quick mode samples exactly 60 isolated prompts, limits concurrency and uses low/temperature 1', async () => {
  let active = 0, maxActive = 0;
  const llm = fakeLlm(async options => { active++; maxActive = Math.max(maxActive,active); await new Promise(resolve => setTimeout(resolve,1)); active--; return answerFor(options); });
  const chatOptions = opts(); chatOptions.temperature = 0.4;
  const originalChat = structuredClone(chatOptions);
  const monitor = factory(llm); await request(monitor, chatOptions);
  const original = llm.stream; llm.stream = options => monitor.wrap(options, original(options));
  await monitor.startEvaluation('one','behavior',{ mode:'quick' });
  assert.equal(llm.calls.length,60); assert.ok(maxActive <= 2);
  assert.equal(monitor.state('one').record.evaluations.behavior.valid,60);
  assert.equal(monitor.state('one').history.length,1); assert.equal(monitor.state('one').record.fingerprint,null);
  assert.deepEqual(chatOptions, originalChat);
  assert.equal(monitor.state('one').record.reasoningEffort,'high');
  assert.equal(new Set(llm.calls.map(call => call.sessionId)).size,60);
  assert.ok(llm.calls.every(call => call.sessionId !== chatOptions.sessionId));
  for (const call of llm.calls) {
    assert.equal(call.reasoningEffort,'low'); assert.equal(call.temperature,1); assert.equal(call.messages.length,2);
    assert.equal(call.messages[0].role,'system'); assert.equal(call.tools,undefined); assert.ok(!JSON.stringify(call).includes('PRIVATE-CONVERSATION'));
  }
  assert.equal(monitor.evaluationDetails('one',monitor.state('one').record.id,'behavior').payload.attribution.comparisons.length,8);
  for await (const _ of llm.stream(chatOptions)) {}
  assert.equal(llm.calls.at(-1).reasoningEffort,'high'); assert.equal(llm.calls.at(-1).temperature,0.4);
  assert.deepEqual(chatOptions, originalChat); assert.equal(monitor.state('one').record.reasoningEffort,'high'); monitor.dispose();
});

test('Gemini family matching handles namespaces and casing without blocking unrelated IDs', () => {
  for (const model of ['gemini','gemini-3.8-flash','GEMINI-2.5-PRO',' models/gemini-1.5-pro ',
    'google/gemini-3-pro-preview','publishers/google/models/gemini-2.5-flash','gateway:gemini-3-flash',
    'google.gemini-3.8-flash','Gemini 3.8 Flash','gemini2.5-pro']) assert.equal(behaviorUnavailableReason(model),'GEMINI_BEHAVIOR_DISABLED',model);
  for (const model of [null,undefined,'','gpt-6.1-sol','claude-sonnet-5-5','geminis','notgemini-3',
    'not-gemini-model','google/gpt-5.5']) assert.equal(behaviorUnavailableReason(model),null,model);
});

test('all behavior modes reject Gemini before queueing or altering existing results', async () => {
  const llm = fakeLlm(answerFor), monitor = factory(llm);
  try {
    await request(monitor,opts('one','models/gemini-3.8-flash'));
    const record = monitor.sessions.get('one').records.at(-1);
    record.responseModel = 'gpt-5.5';
    record.evaluations = { behavior:{ state:'complete',total:60,completed:60,valid:60 } };
    monitor.setPayload(record,'behavior',{ attribution:{ status:'uncertain', comparisons:[] } });
    const before = JSON.stringify(record), details = monitor.evaluationDetails('one',record.id,'behavior');
    for (const mode of ['quick','standard','strict']) await assert.rejects(monitor.startEvaluation('one','behavior',{ mode }),/GEMINI_BEHAVIOR_DISABLED/);
    assert.equal(JSON.stringify(record),before); assert.equal(monitor.jobs.size,0); assert.equal(monitor.queue.length,0);
    assert.equal(llm.calls.length,0); assert.equal(monitor.state('one').record.behaviorUnavailableReason,'GEMINI_BEHAVIOR_DISABLED');
    assert.deepEqual(monitor.evaluationDetails('one',record.id,'behavior'),details);
  } finally { monitor.dispose(); }
});

test('behavior eligibility follows the requested model, not provider, response or candidate', async () => {
  const llm = fakeLlm(answerFor), monitor = factory(llm);
  try {
    await request(monitor,{ ...opts(),provider:'Gemini gateway' });
    const record = monitor.sessions.get('one').records.at(-1);
    record.responseModel = 'gemini-3.8-flash'; record.fingerprint = { prediction:'gemini-3.8-flash' };
    assert.equal(monitor.state('one').record.behaviorUnavailableReason,null);
    await monitor.startEvaluation('one','behavior'); assert.equal(llm.calls.length,60);
    await request(monitor,opts('one','GEMINI-3.8-FLASH'));
    assert.equal(monitor.state('one').record.behaviorUnavailableReason,'GEMINI_BEHAVIOR_DISABLED');
    assert.equal(monitor.state('one').history[1].behaviorUnavailableReason,null);
    await request(monitor,opts('one','gpt-6.1-sol'));
    assert.equal(monitor.state('one').record.behaviorUnavailableReason,null);
    assert.equal(monitor.state('one').history[1].behaviorUnavailableReason,'GEMINI_BEHAVIOR_DISABLED');
  } finally { monitor.dispose(); }
});

test('Gemini HTTP requests cannot bypass the guard; combined detection remains available', async () => {
  const routes = new Map(), dataDir = mkdtempSync(join(tmpdir(),'model-check-gemini-http-'));
  const llm = fakeLlm(options => options.messages.at(-1).content[0].text === CANDY_PROMPT ? '21' : JSON.stringify(Array.from({ length:300 }, (_, i) => i % 100 + 1)));
  const monitor = apply({ llm, on:() => () => {}, effect() {}, webServer:{ register(route) { routes.set(route.path,route.handler); return () => {}; } } }, { autoCheck:false,dataDir });
  const server = createServer((req,res) => routes.get(new URL(req.url,'http://localhost').pathname)(req,res));
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve)); const base = 'http://127.0.0.1:' + server.address().port;
  try {
    await request(monitor,opts('one','google/gemini-3.8-flash'));
    const state = await (await fetch(base + '/model-check/state?sessionId=one')).json();
    const post = value => fetch(base + '/model-check/action?sessionId=one', { method:'POST',headers:{ 'X-Model-Check-Token':state.actionToken },body:JSON.stringify(value) });
    for (const mode of ['quick','standard','strict']) {
      const response = await post({ action:'evaluate',recordId:state.record.id,kind:'behavior',mode,requestModel:'gpt-5.5',behaviorUnavailableReason:null });
      assert.equal(response.status,409); assert.equal((await response.json()).error,'GEMINI_BEHAVIOR_DISABLED');
    }
    assert.equal(llm.calls.length,0); assert.equal(monitor.jobs.size,0);
    assert.deepEqual(monitor.state('one').record.evaluations,{});
    for (const value of [{ action:'check' },{ action:'evaluate',kind:'candy' }]) {
      const response = await post({ ...value,recordId:state.record.id,runs:1 }); assert.equal(response.status,200);
      if (monitor.jobs.get('one')) await monitor.jobs.get('one').promise;
      assert.equal(monitor.state('one').record.check.completed,4);
    }
    assert.equal(llm.calls.length,8); assert.ok(llm.calls.every(call => call.model === 'google/gemini-3.8-flash' && call.reasoningEffort === 'high'));
  } finally { monitor.dispose(); await new Promise(resolve => server.close(resolve)); rmSync(dataDir,{ recursive:true,force:true }); }
});
test('eight consecutive behavior request failures stop collection before spending 60 calls', async () => {
  const llm = fakeLlm(() => { throw new Error('UNSUPPORTED_OPTION'); }); const monitor = factory(llm); await request(monitor);
  await monitor.startEvaluation('one','behavior'); const result = monitor.state('one').record.evaluations.behavior;
  assert.equal(result.state,'failed'); assert.equal(result.errors,8); assert.equal(result.error,'CONSECUTIVE_ERRORS'); assert.ok(llm.calls.length <= 9); monitor.dispose();
});
test('different evaluation modes cannot overlap; cancel bounds a provider ignoring abort', async () => {
  const llm = { stream() { return { [Symbol.asyncIterator]() { return { next:() => new Promise(() => {}), return:() => new Promise(() => {}) }; } }; } };
  const monitor = factory(llm); await request(monitor); const pending = monitor.startEvaluation('one','candy');
  await assert.rejects(monitor.startEvaluation('one','behavior'), /EVALUATION_BUSY/); monitor.cancel('one'); await pending;
  assert.equal(monitor.state('one').record.evaluations.candy.state,'cancelled'); assert.equal(monitor.state('one').activeEvaluation,null); monitor.dispose();
});
test('new chat requests cancel old evaluations and exclude late content from the new record', async () => {
  let release; const llm = fakeLlm(() => new Promise(resolve => { release = resolve; })); const monitor = factory(llm); await request(monitor);
  const pending = monitor.startEvaluation('one','candy'); await new Promise(resolve => setImmediate(resolve));
  await request(monitor,opts('one','gpt-6.1-sol'));
  release('21'); await pending; await new Promise(resolve => setTimeout(resolve,10));
  const state = monitor.state('one'); assert.equal(state.record.requestModel,'gpt-6.1-sol'); assert.deepEqual(state.record.evaluations,{});
  assert.equal(state.history[1].evaluations.candy.state,'cancelled'); monitor.dispose();
});
test('evaluation history/payloads survive restart without credentials, original chats or automatic reruns', async () => {
  const dataDir = mkdtempSync(join(tmpdir(),'model-check-evals-'));
  try {
    const llm = fakeLlm(() => '21'); const monitor = new ModelMonitor({ bank, probes, baselines, llm, dataDir, autoCheck:false }); await request(monitor);
    await monitor.startEvaluation('one','candy'); const id = monitor.state('one').record.id; monitor.dispose();
    const saved = readFileSync(join(dataDir,'state.json'),'utf8'); assert.ok(!saved.includes('SECRET-NEVER-FORWARDED')); assert.ok(!saved.includes('PRIVATE-CONVERSATION'));
    const restored = new ModelMonitor({ bank, probes, baselines, llm:fakeLlm(() => 'unexpected'), dataDir, autoCheck:false });
    assert.equal(restored.state('one').record.evaluations.candy.hits,1); assert.equal(restored.evaluationDetails('one',id,'candy').payload.answers[0].answer,'21');
    assert.throws(() => restored.evaluationDetails('other',id,'candy'), /RECORD_NOT_FOUND/); restored.dispose();
  } finally { rmSync(dataDir,{ recursive:true, force:true }); }
});
test('full evaluation payload store is bounded and state polling contains summaries only', async () => {
  const monitor = factory(fakeLlm(() => '21'));
  for (let i = 0; i < 22; i++) { await request(monitor,opts('session-' + i)); await monitor.startEvaluation('session-' + i,'candy'); }
  assert.equal(monitor.payloads.size,20); assert.equal(monitor.state('session-0').record.evaluations.candy.artifactAvailable,false);
  assert.equal(monitor.state('session-21').record.evaluations.candy.artifactAvailable,true); assert.ok(!JSON.stringify(monitor.state('session-21')).includes('"answers"')); monitor.dispose();
});

test('removed drawing evaluations cannot run or restore payloads; supported history remains readable', async () => {
  const dataDir = mkdtempSync(join(tmpdir(),'model-check-removed-eval-'));
  const llm = fakeLlm(() => 'unexpected'); const monitor = factory(llm); let restored;
  try {
    await request(monitor);
    const record = monitor.sessions.get('one').records.at(-1);
    record.evaluations = {
      candy:{ state:'complete',total:1,completed:1,valid:1,hits:1,graded:1 },
      behavior:{ state:'complete',total:60,completed:60,valid:60,attribution:{ status:'consistent',nearest:'gpt-5.5' } },
      pelican:{ state:'complete',total:1,completed:1,valid:1 },
    };
    writeFileSync(join(dataDir,'state.json'),JSON.stringify({ version:2,sessions:[{ id:'one',records:[record],frequency:{ mode:'manual' } }],evaluationPayloads:[
      { recordId:record.id,kind:'candy',payload:{ answers:[{ answer:'21',hit:true }] } },
      { recordId:record.id,kind:'behavior',payload:{ attribution:{ status:'consistent',comparisons:[] } } },
      { recordId:record.id,kind:'pelican',payload:{ html:'<html>obsolete drawing</html>' } },
    ] }));
    restored = new ModelMonitor({ bank,probes,baselines,llm,dataDir,autoCheck:false });
    assert.deepEqual(Object.keys(restored.state('one').record.evaluations),['candy','behavior']);
    assert.equal(restored.evaluationDetails('one',record.id,'candy').payload.answers[0].answer,'21');
    assert.equal(restored.evaluationDetails('one',record.id,'behavior').payload.attribution.status,'consistent');
    assert.equal(restored.payloads.size,2);
    assert.throws(() => evaluationOptions('pelican'),/INVALID_EVALUATION/);
    await assert.rejects(restored.startEvaluation('one','pelican'),/INVALID_EVALUATION/);
    assert.throws(() => restored.evaluationDetails('one',record.id,'pelican'),/INVALID_EVALUATION/);
    assert.equal(boundedPayload('pelican',{ html:'<html>obsolete drawing</html>' }),null);
    assert.equal(llm.calls.length,0);
  } finally { monitor.dispose(); restored?.dispose(); rmSync(dataDir,{ recursive:true,force:true }); }
});
test('evaluation HTTP API requires capability, current record binding, valid modes and session-scoped detail access', async () => {
  const routes = new Map(), dataDir = mkdtempSync(join(tmpdir(),'model-check-eval-http-'));
  const monitor = apply({ llm:fakeLlm(() => '21'), on:() => () => {}, effect() {}, webServer:{ register(route) { routes.set(route.path,route.handler); return () => {}; } } }, { autoCheck:false, dataDir });
  const server = createServer((req,res) => routes.get(new URL(req.url,'http://localhost').pathname)(req,res));
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve)); const base = 'http://127.0.0.1:' + server.address().port;
  try {
    await request(monitor); const state = await (await fetch(base + '/model-check/state?sessionId=one')).json();
    const post = (value, token = state.actionToken) => fetch(base + '/model-check/action?sessionId=one', { method:'POST', headers:{ 'X-Model-Check-Token':token }, body:JSON.stringify(value) });
    assert.equal((await post({ action:'evaluate', recordId:state.record.id, kind:'candy' },'invalid')).status,403);
    assert.equal((await post({ action:'evaluate', recordId:'old', kind:'candy' })).status,409);
    assert.equal((await post({ action:'cancel', recordId:'old' })).status,409);
    assert.equal((await post({ action:'evaluate', recordId:state.record.id, kind:'behavior', mode:'bad' })).status,400);
    assert.equal((await post({ action:'evaluate', recordId:state.record.id, kind:'pelican' })).status,400);
    assert.equal(monitor.llm.calls.length,0);
    assert.equal((await post({ action:'evaluate', recordId:state.record.id, kind:'candy', runs:1 })).status,200);
    if (monitor.jobs.get('one')) await monitor.jobs.get('one').promise;
    const detail = base + '/model-check/evaluation?recordId=' + state.record.id + '&kind=candy';
    assert.equal((await fetch(detail + '&sessionId=other')).status,404);
    assert.equal((await (await fetch(detail + '&sessionId=one')).json()).payload.answers[0].hit,true);
  } finally { monitor.dispose(); await new Promise(resolve => server.close(resolve)); rmSync(dataDir,{ recursive:true, force:true }); }
});
