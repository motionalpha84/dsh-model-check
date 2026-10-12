import { mkdirSync, copyFileSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { resolveSkin } from '../src/skin-theme.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const upstreamBlobs = {
  'vendor/fingerprint-core.mjs': '5dbaa1d2d9cc7e3721524ac4937c97f826e88d1e',
  'vendor/prompts.mjs': '5e4dc7350f29720b6dbaf1451497dec249d64b2a',
  'vendor/challenge-browser.js': '411ef706a8439aa07fbbc3a4e4648b3cd9e4500a',
  'assets/modeltrace-original-bank.json': '24cc43f171bf1f374cf7e6da3915b35c99d6e60d',
  'LICENSE.ModelTrace': 'ce5be481b5259e4df7a182d6df0b2f21661f21a6',
};
const candyBlobs = {
  'assets/modeltrace-candy-bank.json': '6271c09e1a6b183dc00b67f23cbede942f1147cf',
  'assets/fingerprint_probes.json': 'abc97e41154c168493b2567b63ac65bc3f02f9c8',
  'assets/fingerprint_baselines.json': '51e154cd9367e8088a80a8467b00159e40e13167',
  'LICENSE.CandyEval': '1f239dd2b83d32a32ca95e2f4b9ca77072914ca5',
  'tests/fixtures/modeltrace-golden.json': 'ca2a9beab57526603dd852ba56f1243dbe25ba24',
};
for (const [file, expected] of Object.entries({ ...upstreamBlobs, ...candyBlobs })) {
  const bytes = readFileSync(join(root, file));
  const actual = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (actual !== expected) throw new Error(`Upstream snapshot changed: ${file}`);
}
const banks = ['assets/modeltrace-original-bank.json', 'assets/modeltrace-candy-bank.json'].map(file => JSON.parse(readFileSync(join(root, file))));
const models = [...new Map(banks.flatMap(bank => bank.models.map(model => [model.id, model]))).values()];
const union = { schema:'model-check-bank-union', recommended_queries:3, minimum_valid_numbers:80,
  method:'shared-reference-anchored calibrated log-odds fusion', fusion_recalibrated:false, models, banks };
writeFileSync(join(root, 'assets/unified_bank.json'), JSON.stringify(union, null, 2) + '\n');
mkdirSync(join(root, 'lib'), { recursive: true });
for (const name of ['index', 'monitor', 'core', 'wire', 'evaluations', 'behavior', 'model-banks']) copyFileSync(join(root, `src/${name}.mjs`), join(root, `lib/${name}.mjs`));
writeFileSync(join(root, 'lib/index.js'), "export { name, inject, apply } from './index.mjs';\n");
const client = readFileSync(join(root, 'src/client.js'), 'utf8');
const styles = readFileSync(join(root, 'src/panel.css'), 'utf8');
if (!client.includes('/*__MODEL_CHECK_CSS__*/')) throw new Error('Missing stylesheet placeholder');
if (!client.includes('/*__MODEL_CHECK_RESOLVE_SKIN__*/')) throw new Error('Missing theme resolver placeholder');
const icons = Object.fromEntries(readdirSync(join(root, 'assets/ui-icons')).filter(name => name.endsWith('.svg')).map(name => [
  name.slice(0, -4), readFileSync(join(root, 'assets/ui-icons', name), 'utf8').trim()
    .replace('<svg', '<svg aria-hidden="true" focusable="false"'),
]));
if (!client.includes('/*__MODEL_CHECK_ICONS__*/')) throw new Error('Missing icon placeholder');
const artwork = Object.fromEntries(['character-original', 'header-ribbons', 'panel-frame', 'frame-light', 'frame-dark', 'wing-mark', 'candy-mark', 'divider'].map(name => [
  name, 'data:image/png;base64,' + readFileSync(join(root, 'assets/firefly-ui', name + '.png')).toString('base64'),
]));
if (!client.includes('/*__MODEL_CHECK_ART__*/')) throw new Error('Missing artwork placeholder');
writeFileSync(join(root, 'lib/client.js'), client.replace('/*__MODEL_CHECK_CSS__*/', JSON.stringify(styles))
  .replace('/*__MODEL_CHECK_RESOLVE_SKIN__*/', resolveSkin.toString())
  .replace('/*__MODEL_CHECK_ICONS__*/', JSON.stringify(icons))
  .replace('/*__MODEL_CHECK_ART__*/', JSON.stringify(artwork)));
const sha256 = file => createHash('sha256').update(readFileSync(join(root, file))).digest('hex');
const provenance = {
  source: 'https://github.com/xqy2006/ModelTrace', commit: '6cd4a8ff0f3f4e49d6d6969dd2fbadfa1569fde2',
  license: 'MIT', author: 'xqy2006', files: Object.fromEntries(Object.keys(upstreamBlobs).map(file => [file, sha256(file)])),
  candyEval: { source:'https://github.com/haowang02/cpa-plugin-codex-candy-eval', commit:'cdd4fb908b03de0659664af3aff363d75a9642b3',
    latestCheckedCommit:'0de3802c70cf8ca99b8427f7fd0ee4d0fb292b80', dataUnchanged:true,
    author:'Hao Wang', license:'MIT', files:Object.fromEntries(Object.keys(candyBlobs).map(file => [file, sha256(file)])),
    adaptedModules:['src/evaluations.mjs','src/behavior.mjs'], permutationRng:'CRC32-seeded xorshift32; Go RNG not reused' },
  bankUnion: { file:'assets/unified_bank.json', sha256:sha256('assets/unified_bank.json'), models:models.length,
    method:union.method, recalibrated:false, commonModels:banks[0].models.filter(model => banks[1].models.some(item => item.id === model.id)).length },
  upstreamCheckedOn:'2026-10-12',
};
writeFileSync(join(root, 'assets/provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
console.log(`Built Model Check ${version}: ModelTrace ${JSON.parse(readFileSync(join(root, 'assets/unified_bank.json'))).models.length} models`);
