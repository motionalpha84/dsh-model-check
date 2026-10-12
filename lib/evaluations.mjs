// Adapted from haowang02/cpa-plugin-codex-candy-eval, MIT (see LICENSE.CandyEval).
export const CANDY_PROMPT = `不使用任何外部工具回答以下问题：

在一个黑色的袋子里放有三种口味的糖果，每种糖果有两种不同的形状（圆形和五角星形，不同的形状靠手感可以分辨）。现已知不同口味的糖和不同形状的数量统计如下表。参赛者需要在活动前决定摸出的糖果数目，那么，最少取出多少个糖果才能保证手中同时拥有不同形状的苹果味和桃子味的糖？（同时手中有圆形苹果味匹配五角星桃子味糖果，或者有圆形桃子味匹配五角星苹果味糖果都满足要求）

        苹果味  桃子味  西瓜味
圆形       7      9      8
五角星形   7      6      4
`;
export const BEHAVIOR_MODES = Object.freeze({ quick: { cells: 4, samples: 15 }, standard: { cells: 8, samples: 25 }, strict: { cells: 16, samples: 25 } });
// Match requested IDs, including Google/Vertex and gateway namespaces.
// Provider names, response labels and fingerprint candidates do not affect this rule.
export function behaviorUnavailableReason(requestModel) {
  return typeof requestModel === 'string' && /(?:^|[/:.\s])gemini(?=$|[-_.:\s\d])/i.test(requestModel.trim())
    ? 'GEMINI_BEHAVIOR_DISABLED' : null;
}
export function candyHit(text) { return /(^|[^0-9])21(?![0-9])/.test(text); }
export function evaluationOptions(kind, value = {}) {
  if (kind === 'candy') {
    const runs = value.runs === undefined ? 1 : value.runs;
    if (!Number.isSafeInteger(runs) || runs < 1 || runs > 10) throw new Error('INVALID_RUNS');
    return { kind, runs, total: runs };
  }
  if (kind === 'behavior') {
    const mode = value.mode ?? 'quick';
    if (!Object.hasOwn(BEHAVIOR_MODES, mode)) throw new Error('INVALID_MODE');
    return { kind, mode, total: BEHAVIOR_MODES[mode].cells * BEHAVIOR_MODES[mode].samples };
  }
  throw new Error('INVALID_EVALUATION');
}
export function safeError(error) {
  const code = error?.code || error?.message;
  return /^[A-Z_0-9-]{1,60}$/.test(code) ? code : 'PROBE_FAILED';
}
export function addUsage(total, usage) {
  for (const key of ['inputTokens', 'outputTokens', 'reasoningTokens']) {
    if (Number.isFinite(usage?.[key]) && usage[key] >= 0) total[key] = (total[key] ?? 0) + usage[key];
  }
}
// State polling carries summaries only; test replies have a separate, bounded detail store.
export function boundedPayload(kind, payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (kind === 'candy') return { answers: (Array.isArray(payload.answers) ? payload.answers : []).slice(0, 10).map(answer => ({
    hit: typeof answer.hit === 'boolean' ? answer.hit : null, answer: typeof answer.answer === 'string' ? answer.answer.slice(0, 4000) : '',
    error: typeof answer.error === 'string' ? safeError({ message: answer.error }) : null,
    durationMs: Number.isFinite(answer.durationMs) ? Math.max(0, answer.durationMs) : null,
  })) };
  if (kind === 'behavior') {
    const attribution = payload.attribution;
    if (!attribution || !Array.isArray(attribution.comparisons) || attribution.comparisons.length > 32) return null;
    // This is generated statistical data, never original conversation content.
    const encoded = JSON.stringify(attribution);
    return Buffer.byteLength(encoded) <= 65536 ? { attribution: JSON.parse(encoded) } : null;
  }
  return null;
}
