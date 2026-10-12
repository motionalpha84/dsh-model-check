// Statistical/normalization port of fingerprint_algorithm.go, MIT (LICENSE.CandyEval).
// Permutations use CRC32-seeded xorshift32, rather than Go's runtime RNG.
import { setImmediate as yieldToHost } from 'node:timers/promises';
const REFUSAL = /\bas an ai\b|\bi (?:cannot|can't|can not|won't|will not)\b|\bi'?m (?:unable|not able|sorry)\b|\bsorry,? (?:i|but)\b|\bcannot (?:comply|assist|help)\b|我不能|我无法|无法回答|不能回答|抱歉|对不起|作为(?:一个)?(?:AI|人工智能)/i;
const LETTERS = { bee:'b', cee:'c', dee:'d', gee:'g', jay:'j', kay:'k', el:'l', ell:'l', em:'m', en:'n', oh:'o', pee:'p', cue:'q', queue:'q', ar:'r', es:'s', ess:'s', tee:'t', vee:'v', ex:'x', why:'y', zee:'z', zed:'z' };
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const TENS = 'twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
const CHINESE_DIGITS = { 零:0, 〇:0, 一:1, 二:2, 两:2, 三:3, 四:4, 五:5, 六:6, 七:7, 八:8, 九:9 };
const han = (s, limit) => /^[\u4e00-\u9fff]+$/u.test(s) && [...s].length <= limit;
function number(s) {
  if (/^[0-9]+$/.test(s)) return Number.isSafeInteger(Number(s)) ? Number(s) : null;
  let total = 0, current = 0, chinese = Boolean(s);
  for (const ch of s) {
    if (Object.hasOwn(CHINESE_DIGITS, ch)) current = CHINESE_DIGITS[ch];
    else if ('十百千'.includes(ch)) { total += Math.max(current, 1) * ({ 十:10, 百:100, 千:1000 }[ch]); current = 0; }
    else chinese = false;
  }
  if (chinese) return total + current;
  if (ONES.includes(s)) return ONES.indexOf(s);
  if (s === 'hundred' || s === 'onehundred') return 100;
  for (let i = 0; i < TENS.length; i++) {
    if (s === TENS[i]) return (i + 2) * 10;
    for (let n = 1; n <= 9; n++) if (s === TENS[i] + ONES[n]) return (i + 2) * 10 + n;
  }
  return null;
}
export function normalizeAnswer(raw, probe) {
  raw = String(raw).normalize('NFC').trim();
  if (!raw) return { answer:'', category:'empty' };
  if (REFUSAL.test(raw)) return { answer:'', category:'refusal' };
  const clean = [...raw].map(ch => {
    const code = ch.codePointAt(0);
    for (const start of [0xff10, 0x660, 0x6f0]) if (code >= start && code <= start + 9) return String(code - start);
    return /[\p{L}\p{N}\s]/u.test(ch) ? ch.toLowerCase() : '';
  }).join('');
  const first = clean.trim().split(/\s+/u)[0];
  if (!first) return { answer:'', category:'empty' };
  let answer = first, valid = false;
  if (probe.kind === 'int') {
    const n = number(first);
    if (n !== null) { answer = String(n); valid = n >= probe.lo && n <= probe.hi; }
  } else if (probe.kind === 'letter') { answer = LETTERS[first] || first; valid = /^[a-z]$/.test(answer); }
  else if (probe.kind === 'color') {
    answer = first === 'grey' ? 'gray' : first === 'aqua' ? 'cyan' : han(first, 1000) && first.length >= 2 && first.endsWith('色') ? first.slice(0, -1) : first;
    valid = /^[a-z]+$/.test(answer) || han(answer, 4);
  } else if (probe.kind === 'coin') {
    if (['heads','head','字'].includes(first) || first.startsWith('正')) { answer = 'heads'; valid = true; }
    if (['tails','tail','花'].includes(first) || first.startsWith('反')) { answer = 'tails'; valid = true; }
  } else valid = /^[a-z]+$/.test(first) || han(first, 6);
  return { answer: valid || probe.kind === 'int' ? answer : first, category:valid ? 'valid' : 'invalid' };
}
export function jsd(a, b) {
  if (!a.length || !b.length) return 0;
  const counts = new Map();
  for (const [index, values] of [a, b].entries()) for (const value of values) {
    if (!counts.has(value)) counts.set(value, [0, 0]); counts.get(value)[index]++;
  }
  let distance = 0;
  for (const key of [...counts.keys()].sort()) {
    const [x, y] = counts.get(key), p = x / a.length, q = y / b.length, m = (p + q) / 2;
    if (p) distance += p * Math.log2(p / m) / 2;
    if (q) distance += q * Math.log2(q / m) / 2;
  }
  return Math.min(1, Math.max(0, distance));
}
export function compareCells(a, b, probes) {
  const cells = [];
  for (const { id } of probes) {
    const x = a[id] || [], y = b[id] || [];
    if (x.length >= 10 && y.length >= 10) cells.push({ cell:id, jsd:jsd(x, y), validA:x.length, validB:y.length });
  }
  return { cells, meanJSD:cells.length >= 4 ? cells.reduce((sum, cell) => sum + cell.jsd, 0) / cells.length : null };
}
export function splitHalf(cells, probes) {
  const values = probes.map(({ id }) => cells[id] || []).filter(answers => answers.length >= 10)
    .map(answers => jsd(answers.filter((_, i) => i % 2 === 0), answers.filter((_, i) => i % 2 === 1)));
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}
function rng(seed) {
  let crc = 0xffffffff;
  for (const byte of Buffer.from(seed)) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
  let state = (crc ^ 0xffffffff) >>> 0 || 0x9e3779b9;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}
function ensureActive(signal) { if (signal?.aborted) throw new Error('PROBE_CANCELLED'); }
export async function permutation(a, b, probes, seed, { signal, iterations = 1000 } = {}) {
  const { cells, meanJSD } = compareCells(a, b, probes);
  if (meanJSD === null) return null;
  const random = rng(seed), pools = cells.map(cell => [...a[cell.cell], ...b[cell.cell]]);
  let hits = 0;
  for (let i = 0; i < iterations; i++) {
    if (i % 50 === 0) { ensureActive(signal); await yieldToHost(); ensureActive(signal); }
    let total = 0;
    for (const [n, cell] of cells.entries()) {
      const pool = pools[n];
      for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(random() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
      total += jsd(pool.slice(0, cell.validA), pool.slice(cell.validA));
    }
    if (total / cells.length >= meanJSD - 1e-12) hits++;
  }
  return (hits + 1) / (iterations + 1);
}
export async function attributeBehavior(model, valid, probes, baselines, options = {}) {
  const result = { status:'insufficient', message:'有效样本不足', alpha:0.05 / Math.max(1, 2 * baselines.length),
    selfJSD:splitHalf(valid, probes), warnings:[], comparisons:[], nearest:null, referencePValue:null };
  for (const baseline of baselines) {
    ensureActive(options.signal);
    const comparison = compareCells(valid, baseline.cells, probes);
    result.comparisons.push({ model:baseline.model, ...comparison,
      pValue:await permutation(valid, baseline.cells, probes, model + '|' + baseline.model, options),
      verdict:comparison.meanJSD === null ? 'insufficient' : comparison.meanJSD <= 0.25 ? 'match' : comparison.meanJSD <= 0.35 ? 'uncertain' : 'mismatch',
      selfJSD:splitHalf(baseline.cells, probes) });
  }
  result.comparisons.sort((a, b) => (a.meanJSD ?? Infinity) - (b.meanJSD ?? Infinity));
  const best = result.comparisons[0];
  if (!best || best.meanJSD === null) return result;
  result.nearest = best.model;
  if (result.selfJSD > 0.25) result.warnings.push('本次样本自一致性较低，建议使用严格模式复测');
  for (const item of result.comparisons) if (item.selfJSD > 0.25) result.warnings.push(item.model + ' 基准自一致性较低');
  const same = result.comparisons.find(item => item.model === model);
  const significant = p => p !== null && p < result.alpha;
  if (!same) return { ...result, status:'no_baseline', message:'所选模型没有同名基准，仅展示相似模型' };
  if (same.meanJSD === null) return result;
  if (best.model === model) {
    [result.status, result.message] = significant(same.pValue) ? ['different','与同名基准存在显著差异，无法归因到其他模型'] : ['consistent','与同名基准未发现显著差异'];
  } else {
    const a = {}, b = {}, sameCells = baselines.find(item => item.model === model).cells, bestCells = baselines.find(item => item.model === best.model).cells;
    for (const [cell, answers] of Object.entries(valid)) if (answers.length >= 10) { a[cell] = sameCells[cell]; b[cell] = bestCells[cell]; }
    result.referencePValue = await permutation(a, b, probes, 'reference|' + model + '|' + best.model, options);
    if (!significant(result.referencePValue)) [result.status, result.message] = ['ambiguous','同名基准与最近基准本身无法区分'];
    else if (significant(same.pValue) && !significant(best.pValue)) {
      [result.status, result.message] = ['substitution','回答分布更接近 ' + best.model + '，疑似被替换为该模型'];
      if (result.comparisons.slice(1).some(item => item.model !== model && item.pValue !== null && !significant(item.pValue)))
        [result.status, result.message] = ['ambiguous','与同名基准不同，但多个替代模型均无法排除'];
    } else if (!significant(same.pValue) && significant(best.pValue)) [result.status, result.message] = ['consistent','与同名基准未发现显著差异'];
    else if (significant(same.pValue) && significant(best.pValue)) [result.status, result.message] = ['different','与同名及最近基准均存在显著差异'];
    else [result.status, result.message] = ['ambiguous','多个模型均无法排除，样本不足以区分'];
  }
  if (result.selfJSD > 0.25 && ['consistent','substitution'].includes(result.status)) [result.status, result.message] = ['unstable','样本波动较大，结论不稳定，建议复测'];
  return result;
}
