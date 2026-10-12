import { analyzeGlobalOutputs } from '../vendor/fingerprint-core.mjs';

// Each upstream artifact keeps its own feature space, class order and calibration.
// Center calibrated log-odds on the same 16 reference classes before averaging.
// The resulting union is deliberately marked as not independently recalibrated.
export function analyzeModelBank(outputs, bank) {
  if (bank.schema !== 'model-check-bank-union') return analyzeGlobalOutputs(outputs, bank);
  const runs = bank.banks.map(artifact => ({ artifact, result:analyzeGlobalOutputs(outputs, artifact) }));
  const common = bank.models.map(model => model.id).filter(id => runs.every(run => run.artifact.models.some(model => model.id === id)));
  if (common.length < 4) throw new Error('INCOMPATIBLE_BANKS');
  const odds = runs.map(({ artifact, result }) => {
    const beta = artifact.calibration[result.calibration.queries].beta;
    const anchor = result.results.filter(item => common.includes(item.model)).reduce((sum, item) => sum + item.score * beta, 0) / common.length;
    return new Map(result.results.map(item => [item.model, item.score * beta - anchor]));
  });
  const scores = bank.models.map(model => {
    const values = odds.filter(run => run.has(model.id)).map(run => run.get(model.id));
    return values.reduce((a, b) => a + b, 0) / values.length;
  });
  const maximum = Math.max(...scores), weights = scores.map(score => Math.exp(score - maximum)), total = weights.reduce((a, b) => a + b, 0);
  const results = bank.models.map((model, i) => ({ model:model.id, display_name:model.display_name, family:model.family,
    family_name:model.family_name, score:scores[i], probability:weights[i] / total })).sort((a, b) => b.probability - a.probability);
  const families = [...new Set(bank.models.map(model => model.family))].map(family => ({ family,
    display_name:bank.models.find(model => model.family === family).family_name,
    probability:results.filter(item => item.family === family).reduce((sum, item) => sum + item.probability, 0) }));
  return { prediction:results[0].model, probability:results[0].probability, results, family_probabilities:families,
    used_outputs:runs[0].result.used_outputs, calibration:{ queries:runs[0].result.calibration.queries, fused:true, recalibrated:false } };
}
