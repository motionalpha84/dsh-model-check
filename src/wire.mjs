import { AsyncLocalStorage } from 'node:async_hooks';
import { cleanLabel } from './core.mjs';

const KEY = Symbol.for('dsh-model-check.wire-observer.v1');

// One shared wrapper coexists with the other Harness fetch decorators. It only
// looks at a bounded clone of model SSE, within this plugin's request context.
function acquire(capture) {
  let hub = globalThis[KEY];
  if (!hub) {
    hub = { storage: new AsyncLocalStorage(), members: new Set(), previous: globalThis.fetch };
    hub.fetch = function (...args) {
      const context = hub.storage.getStore();
      const result = Reflect.apply(hub.previous, this, args);
      if (!context?.capture.live || !isModelEndpoint(args[0])) return result;
      return Promise.resolve(result).then(response => {
        // Preserve the original Response, headers, status, and consuming stream.
        if (context.capture.live && response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          context.capture.observe(response, context.record).catch(() => {});
        }
        return response;
      });
    };
    globalThis[KEY] = hub;
    globalThis.fetch = hub.fetch;
  }
  hub.members.add(capture);
  return hub;
}

function isModelEndpoint(input) {
  try {
    const value = typeof input === 'string' || input instanceof URL ? input : input.url;
    return /\/(?:messages|chat\/completions|responses)\/?$/.test(new URL(value).pathname);
  } catch { return false; }
}

function routeInFrame(frame) {
  const data = frame.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
  try {
    const event = JSON.parse(data);
    const candidates = [
      [event.type === 'message_start' ? event.message?.model : null, 'wire.message_start.message.model'],
      [/^response\.(created|in_progress|completed)$/.test(event.type) ? event.response?.model : null, 'wire.response.model'],
      [Array.isArray(event.choices) ? event.model : null, 'wire.chat.completion.model'],
    ];
    for (const [value, field] of candidates) { const model = cleanLabel(value); if (model) return { model, field }; }
  } catch { /* Partial, unrelated, or non-JSON SSE. */ }
  return null;
}

export class WireCapture {
  constructor(onRoute, { limit = 32768, timeoutMs = 8000 } = {}) {
    this.onRoute = onRoute; this.limit = limit; this.timeoutMs = timeoutMs;
    this.live = true; this.pending = new Set(); this.hub = acquire(this);
  }
  scoped(source, record) {
    const capture = this;
    return { [Symbol.asyncIterator]() {
      const context = record ? { capture, record } : null;
      const run = callback => capture.hub.storage.run(context, callback);
      const iterator = run(() => source[Symbol.asyncIterator]());
      return {
        next: (...args) => run(() => iterator.next(...args)),
        ...(iterator.return ? { return: (...args) => run(() => iterator.return(...args)) } : {}),
        ...(iterator.throw ? { throw: (...args) => run(() => iterator.throw(...args)) } : {}),
      };
    } };
  }
  async observe(response, record) {
    let reader;
    try { reader = response.clone().body?.getReader(); } catch { return; }
    if (!reader) return;
    const controller = new AbortController(); this.pending.add(controller);
    let interrupt;
    const interrupted = new Promise(resolve => { interrupt = () => resolve(null); });
    controller.signal.addEventListener('abort', interrupt, { once: true });
    const timer = setTimeout(() => controller.abort(), this.timeoutMs); timer.unref?.();
    const decoder = new TextDecoder(); let buffer = '', bytes = 0;
    try {
      while (this.live && !controller.signal.aborted && bytes < this.limit) {
        const step = await Promise.race([reader.read(), interrupted]);
        if (!step || step.done) break;
        const part = step.value.subarray(0, this.limit - bytes); bytes += part.length;
        buffer += decoder.decode(part, { stream: true });
        const frames = buffer.replace(/\r\n/g, '\n').split('\n\n'); buffer = frames.pop();
        for (const frame of frames) {
          const route = routeInFrame(frame);
          if (route) { if (this.live) this.onRoute(record, route); return; }
        }
      }
      const route = routeInFrame(buffer);
      if (route && this.live && !controller.signal.aborted) this.onRoute(record, route);
    } finally {
      clearTimeout(timer); controller.signal.removeEventListener('abort', interrupt); this.pending.delete(controller);
      // Cancelling one tee branch must not cancel or wait for the live response.
      Promise.resolve(reader.cancel()).catch(() => {});
    }
  }
  dispose() {
    this.live = false;
    for (const controller of this.pending) controller.abort();
    this.hub.members.delete(this);
    if (!this.hub.members.size && globalThis.fetch === this.hub.fetch) {
      globalThis.fetch = this.hub.previous; delete globalThis[KEY];
    }
    // If another decorator owns fetch, leave a dormant pass-through in its
    // chain. Reinstallation reuses it instead of stacking observers.
  }
}
