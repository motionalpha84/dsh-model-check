import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModelMonitor } from '../src/monitor.mjs';
import { resolveSkin } from '../src/skin-theme.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(join(root, file), 'utf8');
const bank = JSON.parse(read('assets/unified_bank.json'));
const baselines = JSON.parse(read('assets/fingerprint_baselines.json'));
const probes = JSON.parse(read('assets/fingerprint_probes.json'));
const monitor = new ModelMonitor({ bank, baselines, probes,
  llm:{ stream:() => { throw new Error('The demo build must never call a model'); } } });
const timestamp = Date.UTC(2026, 9, 13, 4, 0);
const fixtures = {};
for (const [provider, model, candidates] of [
  ['test-gpt', 'gpt-6.1-sol', [['gpt-6.1-sol', .963], ['gpt-6-sol', .029], ['gpt-6-astra', .008]]],
  ['test-Claude', 'claude-sonnet-5-5', [['claude-sonnet-5-5', .809], ['claude-sonnet-5', .131], ['claude-opus-5-5', .06]]],
]) {
  const sessionId = 'demo-' + provider;
  const record = {
    id:sessionId + '-current', sessionId, provider, requestModel:model,
    responseModel:model, responseField:'wire.responses.model', reasoningEffort:'high',
    startedAt:timestamp, endedAt:timestamp + 3600, latencyMs:3600, outcome:'complete', turn:2,
    fingerprint:{ prediction:model, probability:candidates[0][1], usedOutputs:3, sampledAt:timestamp + 3600,
      requestedInBank:true, requestedProbability:candidates[0][1], sampleMode:'independent',
      requestRecordId:sessionId + '-current', candidates:candidates.map(([model, probability]) => ({ model, probability })) },
    check:{ state:'complete', completed:4, total:4, valid:3, traceCompleted:3, traceState:'complete',
      durationMs:3400, usage:{ inputTokens:450, outputTokens:1250 } },
    evaluations:{ candy:{ state:'complete', completed:1, total:1, valid:1, errors:0, hits:1, graded:1,
      endedAt:timestamp + 3600, durationMs:3200, reasoningEffort:'high' } },
  };
  const previous = structuredClone(record);
  previous.id = sessionId + '-previous'; previous.turn = 1;
  previous.startedAt -= 120000; previous.endedAt -= 120000;
  previous.responseModel = null; previous.responseField = null;
  previous.fingerprint.requestRecordId = previous.id;
  previous.evaluations.candy.hits = 0;
  const session = monitor.session(sessionId);
  session.records.push(previous, record); session.completedTurns = 2; session.startEligible = false;
  const candy = { answers:[{ answer:'演示回答：21 个糖果。此文本仅用于展示命中与回答详情。', hit:true, durationMs:3200 }] };
  monitor.setPayload(record, 'candy', candy);
  monitor.setPayload(previous, 'candy', { answers:[{ answer:'演示回答：20 个糖果。', hit:false, durationMs:3100 }] });
  fixtures[provider] = {
    state:monitor.state(sessionId),
    details:{ [record.id]:{ candy:monitor.evaluationDetails(sessionId, record.id, 'candy') },
      [previous.id]:{ candy:monitor.evaluationDetails(sessionId, previous.id, 'candy') } },
  };
}
const output = join(root, 'docs/assets'); mkdirSync(join(output, 'ui'), { recursive:true });
const artwork = Object.fromEntries(readdirSync(join(root, 'assets/firefly-ui')).filter(name => name.endsWith('.png')).map(name => {
  copyFileSync(join(root, 'assets/firefly-ui', name), join(output, 'ui', name));
  return [name.slice(0, -4), './assets/ui/' + name];
}));
const icons = Object.fromEntries(readdirSync(join(root, 'assets/ui-icons')).filter(name => name.endsWith('.svg')).map(name => [
  name.slice(0, -4), read('assets/ui-icons/' + name).trim().replace('<svg', '<svg aria-hidden="true" focusable="false"'),
]));
// Same component source as the installable plugin; only artwork URLs are externalized.
const client = read('src/client.js').replace('/*__MODEL_CHECK_CSS__*/', JSON.stringify(read('src/panel.css')))
  .replace('/*__MODEL_CHECK_ICONS__*/', JSON.stringify(icons))
  .replace('/*__MODEL_CHECK_ART__*/', JSON.stringify(artwork))
  .replace('/*__MODEL_CHECK_RESOLVE_SKIN__*/', resolveSkin.toString());
writeFileSync(join(output, 'plugin.js'), client);
writeFileSync(join(output, 'fixtures.js'), 'export default ' + JSON.stringify(fixtures, null, 2) + ';\n');
const version = JSON.parse(read('package.json')).version;
writeFileSync(join(output, 'version.js'), `export default ${JSON.stringify(version)};\n`);
writeFileSync(join(root, 'docs/.nojekyll'), '');
console.log(`Built interactive demo ${version}: two fictional providers, zero model calls`);
