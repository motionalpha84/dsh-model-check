import { randomUUID, randomInt } from 'node:crypto';
import { analyzeModelBank } from './model-banks.mjs';
import { forkPrompt } from '../vendor/prompts.mjs';

export const cleanLabel = value => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 240) : '';

// source.model and replayState.response.model are Harness's requested identity.
// Only fields explicitly representing provider-returned identity qualify here.
export function responseRoute(value) {
  const candidates = [
    [value?.replayState?.response?.responseModel, 'replayState.response.responseModel'],
    [value?.source?.replayState?.response?.responseModel, 'assistant.source.replayState.response.responseModel'],
    [value?.responseModel, 'responseModel'],
    [value?.metadata?.resolved_model_slug, 'metadata.resolved_model_slug'],
    [value?.metadata?.model_slug, 'metadata.model_slug'],
  ];
  for (const [raw, field] of candidates) {
    const model = cleanLabel(raw);
    if (model) return { model, field, evidence: 'provider-declared' };
  }
  return { model: null, field: null, evidence: 'unavailable' };
}

export function normalizeModel(value) {
  return cleanLabel(value).toLowerCase().replace(/^(?:openai|anthropic|models)\//, '');
}

export function probabilitySummary(outputs, bank, requestedModel) {
  const result = analyzeModelBank(outputs, bank);
  const expected = bank.models.find(item => normalizeModel(item.id) === normalizeModel(requestedModel));
  return {
    scope: 'closed-set',
    source: 'ModelTrace',
    prediction: result.prediction,
    probability: result.probability,
    requestedInBank: Boolean(expected),
    requestedProbability: expected ? result.results.find(item => item.model === expected.id)?.probability ?? null : null,
    usedOutputs: result.used_outputs,
    candidates: result.results.map(item => ({ model: item.model, probability: item.probability, family: item.family })),
    families: result.family_probabilities,
    calibrationQueries: result.calibration.queries,
    calibration: result.calibration.fused ? 'bank-fusion-unrecalibrated' : 'upstream',
  };
}

export function parseProbe(text, expectedCount) {
  const raw = String(text).trim().replace(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i, '$1').trim();
  let numbers;
  try { numbers = JSON.parse(raw); } catch { throw new Error('INVALID_SAMPLE'); }
  if (!Array.isArray(numbers) || numbers.length < Math.max(80, Math.ceil(expectedCount * .55))
    || numbers.length > expectedCount * 2 || numbers.some(n => !Number.isInteger(n) || n < 1 || n > 355)) {
    throw new Error('INVALID_SAMPLE');
  }
  return JSON.stringify(numbers);
}

// Reuse the upstream sampling task and JSON-only rules. The first two lines
// are Codex-specific disposable-fork instructions and do not apply to Harness.
export function challenges() {
  const counts = new Set();
  while (counts.size < 3) counts.add(randomInt(292, 333));
  return [...counts].map((count, index) => ({
    id: randomUUID(), expected_count: count,
    prompt: forkPrompt(index % 2 === 0 ? 'zh' : 'en', count).split('\n').slice(2).join('\n'),
  }));
}

export function recordStatus(record) {
  if (!record) return { key: 'idle', label: '等待请求' };
  if (record.outcome === 'error') return { key: 'error', label: '请求失败' };
  if (record.outcome === 'aborted') return { key: 'muted', label: '请求已中断' };
  if (record.check?.state === 'running' || record.check?.state === 'queued') return { key: 'checking', label: '联合检测中' };
  if (record.fingerprint) {
    if (!record.fingerprint.requestedInBank) return { key: 'warn', label: '请求模型未收录' };
    if (normalizeModel(record.fingerprint.prediction) !== normalizeModel(record.requestModel)) return { key: 'warn', label: '指纹候选有差异' };
    return { key: 'match', label: '指纹候选一致' };
  }
  if (record.responseModel) {
    return normalizeModel(record.responseModel) === normalizeModel(record.requestModel)
      ? { key: 'match', label: '路由标签一致' } : { key: 'warn', label: '路由标签不同' };
  }
  return { key: 'muted', label: record.outcome === 'running' ? '接收响应中' : '响应标签未提供' };
}
