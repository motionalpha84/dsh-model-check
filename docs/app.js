import { DemoState, PROVIDERS } from './demo-state.js';
import version from './assets/version.js';

const demo = new DemoState();
const sessionListeners = new Set(), themeListeners = new Set(), cleanups = [];
let currentTheme = 'dark', themeRevision = 0, plugin;
const preferenceKey = 'dsh-model-check.ui.v2';
const $ = id => document.getElementById(id);
document.querySelectorAll('[data-version]').forEach(node => { node.textContent = 'v' + version; });

let copyReset;
document.querySelectorAll('[data-install-profile]').forEach(button => {
  button.addEventListener('click', () => {
    const profile = button.dataset.installProfile;
    if (!['desktop', 'web'].includes(profile)) return;
    $('install-profile').textContent = '--profile ' + profile;
    document.querySelectorAll('[data-install-profile]').forEach(option => {
      option.setAttribute('aria-pressed', String(option === button));
    });
    clearTimeout(copyReset);
    $('copy-install').textContent = '复制命令';
    $('copy-status').textContent = '';
  });
});
$('copy-install').addEventListener('click', async () => {
  const button = $('copy-install'), command = $('install-command'), status = $('copy-status');
  clearTimeout(copyReset);
  status.textContent = '';
  button.disabled = true;
  try {
    await navigator.clipboard.writeText(command.textContent.trim());
    button.textContent = '已复制';
    status.textContent = '安装命令已复制';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(command);
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    button.textContent = '复制命令';
    status.textContent = '请手动复制已选中的命令';
  } finally {
    button.disabled = false;
    copyReset = setTimeout(() => { button.textContent = '复制命令'; status.textContent = ''; }, 4000);
  }
});

// All plugin endpoints terminate here. CSP connect-src 'none' adds a second
// boundary: this static showcase cannot make a network model request.
window.fetch = async (input, options = {}) => {
  if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith('/model-check/')) throw Error('DEMO_NETWORK_DISABLED');
  try {
    const sessionId = url.searchParams.get('sessionId'); let data;
    if (url.pathname === '/model-check/state') data = demo.state(sessionId);
    else if (url.pathname === '/model-check/evaluation') data = demo.details(sessionId, url.searchParams.get('recordId'), url.searchParams.get('kind'));
    else if (url.pathname === '/model-check/action' && options.method === 'POST') {
      data = demo.action(sessionId, JSON.parse(options.body)); updateStatus();
    } else throw Error('UNKNOWN_DEMO_ENDPOINT');
    return new Response(JSON.stringify(data), { headers:{ 'Content-Type':'application/json' } });
  } catch (error) { return new Response(JSON.stringify({ ok:false, error:error.message }), { status:409, headers:{ 'Content-Type':'application/json' } }); }
};
window.__ModuleLoader__ = { load(entry) { plugin = entry.factory(); } };
await import('./assets/plugin.js');
const ctx = {
  effect(fn) { const dispose = fn(); if (typeof dispose === 'function') cleanups.push(dispose); },
  theme:{ getTheme() { return { preference:currentTheme, active:{ id:currentTheme === 'original' ? 'dsh-theme-firefly' : currentTheme,
    colorScheme:currentTheme === 'light' ? 'light' : 'dark', tokens:{} }, revision:themeRevision }; } },
  on(event, fn) { if (event !== 'theme/change') throw Error('Unexpected demo event'); themeListeners.add(fn); return () => themeListeners.delete(fn); },
  sessions:{ list:{ getSnapshot() { return { byId:Object.fromEntries(PROVIDERS.map(provider => {
    const id = 'demo-' + provider; return [id, { id, retainedBy:{ mainView:provider === demo.provider ? 1 : 0 } }];
  })) }; }, subscribe(fn) { sessionListeners.add(fn); return () => sessionListeners.delete(fn); } } },
};
function writePreferences() {
  try { localStorage.setItem(preferenceKey, JSON.stringify({ layoutVersion:2, skin:'follow', hidden:false,
    minimized:false, expanded:false, dockSide:'left', dockOffset:6 })); } catch { /* Optional storage. */ }
}
function mount() {
  cleanups.splice(0).forEach(fn => fn());
  writePreferences(); plugin.apply(ctx);
  const host = document.querySelector('dsh-model-check');
  $('loading')?.remove(); $('plugin-stage').append(host);
  const style = document.createElement('style');
  // Keep the real plugin inside its showcase column. The DSH build retains docking.
  style.textContent = ':host{position:relative!important;inset:auto!important;z-index:3;max-width:100%!important;--mc-available-width:278px!important}.panel{max-height:560px!important}.header{cursor:default!important;touch-action:auto}.launcher{cursor:pointer!important}';
  host.shadowRoot.append(style);
  host.shadowRoot.querySelector('.header').addEventListener('pointerdown', event => {
    if (!event.target.closest('button')) event.stopImmediatePropagation();
  }, true);
  host.shadowRoot.getElementById('launcher').addEventListener('pointerdown', event => event.stopImmediatePropagation(), true);
  const follow = host.shadowRoot.querySelector('input[name="skin"][value="follow"]');
  follow.click();
  const observer = new MutationObserver(() => {
    $('hidden-note').hidden = !host.hasAttribute('data-hidden');
    for (const button of document.querySelectorAll('[data-theme]')) button.setAttribute('aria-pressed', String(button.dataset.theme === host.dataset.skin));
  });
  observer.observe(host, { attributes:true, attributeFilter:['data-hidden', 'data-skin'] });
  cleanups.push(() => observer.disconnect()); $('hidden-note').hidden = true;
}
function refresh() {
  sessionListeners.forEach(fn => fn());
  document.querySelector('dsh-model-check')?.shadowRoot.getElementById('refresh').click();
  updateStatus();
}
function updateStatus() {
  const active = demo.state().activeEvaluation;
  $('run-demo').disabled = Boolean(active);
  $('demo-status').textContent = active ? '模拟检测中 · 零额度消耗' : demo.simulatedRequests ? `已模拟 ${demo.simulatedRequests} 次 · 真实请求 0` : '不消耗接口额度';
}
mount();
for (const button of document.querySelectorAll('[data-theme]')) button.addEventListener('click', () => {
  currentTheme = button.dataset.theme; themeRevision++;
  document.querySelector('dsh-model-check').shadowRoot.querySelector('input[name="skin"][value="follow"]').click();
  themeListeners.forEach(fn => fn());
});
for (const button of document.querySelectorAll('[data-provider]')) button.addEventListener('click', () => {
  demo.select(button.dataset.provider);
  document.querySelectorAll('[data-provider]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
  refresh();
});
$('scenario').addEventListener('change', event => { demo.setScenario(event.target.value); refresh(); });
$('run-demo').addEventListener('click', () => { demo.action(demo.state().sessionId, { action:'check' }); refresh(); });
$('reset').addEventListener('click', () => {
  demo.reset(); currentTheme = 'dark'; themeRevision++; $('scenario').value = 'match';
  document.querySelectorAll('[data-provider]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.provider === demo.provider)));
  mount(); refresh();
});
setInterval(() => { if (demo.jobs.size) { demo.tick(); updateStatus(); } }, 750);
