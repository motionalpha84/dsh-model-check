import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { ModelMonitor } from './monitor.mjs';
import { evaluationOptions } from './evaluations.mjs';

export const name = 'model-check';
export const inject = ['webServer', 'llm'];
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff' };

export function apply(ctx, config = {}) {
  const bank = JSON.parse(readFileSync(join(root, 'assets/unified_bank.json'), 'utf8'));
  const probes = JSON.parse(readFileSync(join(root, 'assets/fingerprint_probes.json'), 'utf8'));
  const baselines = JSON.parse(readFileSync(join(root, 'assets/fingerprint_baselines.json'), 'utf8'));
  const dataDir = config.dataDir || process.env.MODEL_CHECK_DATA || join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'model-check');
  const monitor = new ModelMonitor({ bank, probes, baselines, llm: ctx.llm, dataDir, autoCheck: config.autoCheck !== false });
  const token = randomBytes(32).toString('hex');
  const disposers = [];
  const add = disposer => { if (typeof disposer === 'function') disposers.push(disposer); };
  const respond = (res, status, data) => { res.writeHead(status, jsonHeaders); res.end(JSON.stringify(data)); };
  const sessionId = req => new URL(req.url, 'http://localhost').searchParams.get('sessionId')?.slice(0, 240) || '';

  add(ctx.on('llm/stream', (options, next) => {
    const stream = next();
    if (!options?.sessionId) return stream;
    return monitor.wrap(options, stream);
  }));
  add(ctx.on('session/event', (session, event) => {
    try { monitor.onSessionEvent(session, event); } catch { /* Observe-only. */ }
  }));
  add(ctx.on('session/disposed', session => monitor.disposeSession(session?.id)));

  add(ctx.webServer.register({ kind: 'exact', path: '/model-check/state', handler(req, res) {
    if (req.method !== 'GET') return respond(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
    respond(res, 200, { ...monitor.state(sessionId(req)), actionToken: token });
  } }));
  add(ctx.webServer.register({ kind:'exact', path:'/model-check/evaluation', handler(req, res) {
    if (req.method !== 'GET') return respond(res, 405, { ok:false, error:'METHOD_NOT_ALLOWED' });
    const url = new URL(req.url, 'http://localhost');
    try { respond(res, 200, monitor.evaluationDetails(sessionId(req), (url.searchParams.get('recordId') || '').slice(0, 240), url.searchParams.get('kind'))); }
    catch { respond(res, 404, { ok:false, error:'EVALUATION_NOT_FOUND' }); }
  } }));
  add(ctx.webServer.register({ kind: 'exact', path: '/model-check/action', async handler(req, res) {
    if (req.method !== 'POST') return respond(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
    const origin = req.headers.origin;
    if (origin) {
      try { if (new URL(origin).host !== req.headers.host) return respond(res, 403, { ok: false, error: 'ORIGIN_REJECTED' }); }
      catch { return respond(res, 403, { ok: false, error: 'ORIGIN_REJECTED' }); }
    }
    const supplied = Buffer.from(String(req.headers['x-model-check-token'] || ''));
    const expected = Buffer.from(token);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return respond(res, 403, { ok: false, error: 'ACTION_TOKEN_REQUIRED' });
    try {
      let body = '';
      for await (const chunk of req) { body += chunk; if (body.length > 4096) throw new Error('BODY_TOO_LARGE'); }
      const data = JSON.parse(body); const id = sessionId(req);
      if (data.action === 'check' || data.action === 'evaluate') {
        const record = monitor.state(id).record;
        if (!record || record.outcome !== 'complete' || !record.provider || !record.requestModel || monitor.disposedSessions.has(id)) return respond(res, 409, { ok:false, error:'NO_COMPLETED_REQUEST' });
        if (data.recordId && data.recordId !== record.id || data.action === 'evaluate' && data.recordId !== record.id) return respond(res, 409, { ok:false, error:'REQUEST_CHANGED' });
        const requestedKind = data.action === 'check' ? 'candy' : data.kind;
        evaluationOptions(requestedKind, data);
        if (requestedKind === 'behavior' && record.behaviorUnavailableReason) return respond(res, 409, { ok:false, error:record.behaviorUnavailableReason });
        const kind = requestedKind === 'candy' ? 'trace' : requestedKind;
        if (monitor.jobs.has(id) && monitor.jobs.get(id).kind !== kind) return respond(res, 409, { ok:false, error:'EVALUATION_BUSY' });
        if (!monitor.jobs.has(id) && monitor.queue.length >= 12) return respond(res, 409, { ok:false, error:'QUEUE_FULL' });
        (kind === 'trace' ? monitor.startCheck(id, { runs:data.runs }) : monitor.startEvaluation(id, kind, data)).catch(() => {});
      } else if (data.action === 'cancel') {
        if (data.recordId && data.recordId !== monitor.state(id).record?.id) return respond(res, 409, { ok:false, error:'REQUEST_CHANGED' });
        monitor.cancel(id);
      }
      else if (data.action === 'frequency') monitor.setFrequency(id, data.frequency);
      else throw new Error('INVALID_ACTION');
      respond(res, 200, monitor.state(id));
    } catch { respond(res, 400, { ok: false, error: 'INVALID_ACTION' }); }
  } }));
  ctx.effect(() => () => { for (const dispose of disposers.reverse()) dispose(); monitor.dispose(); });
  return monitor;
}
