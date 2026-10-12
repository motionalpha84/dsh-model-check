import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { ModelMonitor } from '../src/monitor.mjs';
import { WireCapture } from '../src/wire.mjs';

const bank = JSON.parse(readFileSync(new URL('../assets/unified_bank.json', import.meta.url)));
const opts = id => ({ sessionId: id, provider: 'deepseek', model: 'requested-deepseek', messages: [] });
const terminal = { type: 'finish', reason: { kind: 'stop' }, replayState: { response: { model: 'requested-deepseek' } } };
const frame = model => 'event: message_start\r\ndata: ' + JSON.stringify({ type: 'message_start', message: { model, usage: {} } }) + '\r\n\r\n';
const waitUntil = async predicate => {
  for (let i = 0; !predicate() && i < 100; i++) await new Promise(resolve => setTimeout(resolve, 2));
  assert.ok(predicate(), 'Metadata observation must settle within a bounded time');
};

async function localServer(handler, run) {
  const server = createServer(handler); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('native DeepSeek SSE exposes returned model without extra fetches or changing bytes', async () => {
  const originalFetch = globalThis.fetch;
  const monitor = new ModelMonitor({ bank, llm: {}, autoCheck: false });
  let calls = 0; const body = frame('deepseek-returned-萤') + 'data: {"type":"content_block_delta","text":"private-text"}\r\n\r\n';
  try {
    await localServer(async (req, res) => {
      calls++; assert.equal(req.headers['x-test-key'], 'keep-this-header');
      let requestBody = ''; for await (const value of req) requestBody += value;
      assert.equal(requestBody, 'unchanged-request');
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'X-Original': 'keep' });
      const bytes = Buffer.from(body);
      for (let i = 0; i < bytes.length; i += 3) res.write(bytes.subarray(i, i + 3));
      res.end();
    }, async base => {
      const source = (async function* () {
        const response = await fetch(base + '/v1/messages', { method: 'POST', headers: { 'X-Test-Key': 'keep-this-header' }, body: 'unchanged-request' });
        assert.equal(response.headers.get('x-original'), 'keep'); assert.equal(await response.text(), body);
        yield terminal;
      })();
      for await (const chunk of monitor.wrap(opts('native'), source)) assert.equal(chunk, terminal);
      await waitUntil(() => monitor.state('native').record.responseModel === 'deepseek-returned-萤');
      const record = monitor.state('native').record;
      assert.equal(record.responseField, 'wire.message_start.message.model');
      assert.ok(!JSON.stringify(record).includes('private-text')); assert.equal(calls, 1);
    });
  } finally { monitor.dispose(); }
  assert.equal(globalThis.fetch, originalFetch, 'Unloading restores the previous fetch owner');
});

test('interleaved wire responses remain bound to their original session', async () => {
  const monitor = new ModelMonitor({ bank, llm: {}, autoCheck: false });
  try {
    await localServer((req, res) => {
      const id = new URL(req.url, 'http://localhost').searchParams.get('id');
      res.writeHead(200, { 'Content-Type': 'text/event-stream' }); res.flushHeaders();
      setTimeout(() => res.end(frame('returned-' + id)), id === 'a' ? 20 : 2);
    }, async base => {
      const run = async id => {
        const source = (async function* () { const response = await fetch(`${base}/messages?id=${id}`); await response.text(); yield terminal; })();
        for await (const _ of monitor.wrap(opts(id), source)) {}
      };
      await Promise.all([run('a'), run('b')]);
      await waitUntil(() => monitor.state('a').record.responseModel && monitor.state('b').record.responseModel);
      assert.equal(monitor.state('a').record.responseModel, 'returned-a');
      assert.equal(monitor.state('b').record.responseModel, 'returned-b');
    });
  } finally { monitor.dispose(); }
});

test('missing or out-of-bound labels stay unknown; unrelated endpoints are ignored', async () => {
  const monitor = new ModelMonitor({ bank, llm: {}, autoCheck: false });
  try {
    await localServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      const body = req.url === '/messages' ? 'data: {"type":"ping"}\n\n' : req.url === '/chat/completions'
        ? ': ' + 'x'.repeat(40000) + '\n\n' + frame('late-label') : frame('unrelated-label');
      res.end(body);
    }, async base => {
      for (const path of ['/messages', '/chat/completions', '/files']) {
        const source = (async function* () { const response = await fetch(base + path); await response.text(); yield terminal; })();
        for await (const _ of monitor.wrap(opts(path), source)) {}
      }
      await waitUntil(() => monitor.wire.pending.size === 0);
      for (const path of ['/messages', '/chat/completions', '/files']) assert.equal(monitor.state(path).record.responseModel, null);
    });
  } finally { monitor.dispose(); }
});

test('wire observation returns the exact Response and respects decorators installed after it', async () => {
  const nativeFetch = globalThis.fetch;
  const response = new Response('data: {"type":"response.created","response":{"model":"returned-gpt"}}\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
  globalThis.fetch = async () => response;
  const observed = []; const first = new WireCapture((record, route) => observed.push([record, route]));
  const observerFetch = globalThis.fetch;
  const decorator = (...args) => observerFetch(...args); globalThis.fetch = decorator;
  first.dispose();
  assert.equal(globalThis.fetch, decorator, 'Unload never removes another plugin decorator');
  const second = new WireCapture((record, route) => observed.push([record, route]));
  try {
    const record = {};
    const source = (async function* () {
      assert.equal(await fetch('https://local.example/v1/responses'), response);
      await response.text(); yield 1;
    })();
    for await (const _ of second.scoped(source, record)) {}
    await waitUntil(() => observed.length === 1);
    assert.equal(observed[0][0], record); assert.equal(observed[0][1].model, 'returned-gpt');
  } finally {
    second.dispose(); globalThis.fetch = nativeFetch; delete globalThis[Symbol.for('dsh-model-check.wire-observer.v1')];
  }
});

test('timeouts and disposal cancel only observation, leaving the caller body usable', async () => {
  let sourceCancelled = false;
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('data: {"type":"ping"}\n\n')); }, cancel() { sourceCancelled = true; } });
  const response = new Response(stream);
  const capture = new WireCapture(() => assert.fail('There is no route metadata'), { timeoutMs: 15 });
  const keepAlive = setInterval(() => {}, 100);
  try {
    await capture.observe(response, {});
    assert.equal(capture.pending.size, 0); assert.equal(sourceCancelled, false);
    const reader = response.body.getReader(); const first = await reader.read(); assert.equal(first.done, false);
    await reader.cancel();
    assert.equal(sourceCancelled, true);
  } finally { clearInterval(keepAlive); capture.dispose(); }
});

test('probe streams clear inherited wire context and cannot replace main-route evidence', async () => {
  const monitor = new ModelMonitor({ bank, llm: {}, autoCheck: false });
  try {
    await localServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' }); res.end(frame('probe-only-label'));
    }, async base => {
      const probeOptions = opts('probe'); monitor.probeOptions.add(probeOptions);
      const main = (async function* () {
        const probe = (async function* () { await (await fetch(base + '/messages')).text(); yield terminal; })();
        for await (const _ of monitor.wrap(probeOptions, probe)) {}
        yield terminal;
      })();
      for await (const _ of monitor.wrap(opts('main'), main)) {}
      await waitUntil(() => monitor.wire.pending.size === 0);
      assert.equal(monitor.state('main').record.responseModel, null); assert.equal(monitor.state('probe').record, null);
    });
  } finally { monitor.dispose(); }
});
