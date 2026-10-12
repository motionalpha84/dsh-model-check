window.__ModuleLoader__.load({
  id: 'dsh-model-check',
  factory: () => {
    const CSS = /*__MODEL_CHECK_CSS__*/;
    const ICONS = /*__MODEL_CHECK_ICONS__*/;
    const ART = /*__MODEL_CHECK_ART__*/;
    const STORAGE = 'dsh-model-check.ui.v2';
    const LEGACY_STORAGE = 'dsh-model-check.ui.v1';
    const SKINS = { follow:'跟随当前主题', original:'流萤', light:'浅色 · 银灰', dark:'深色 · 黑青' };
    const resolveSkin = /*__MODEL_CHECK_RESOLVE_SKIN__*/;
    const validSkin = value => Object.hasOwn(SKINS, value) ? value : 'original';
    const icon = (name) => {
      if (name === 'firefly' || name === 'check') return `<img class="wing-mark" src="${ART['wing-mark']}" alt="" draggable="false">`;
      const names = { close: 'x', expand: 'maximize-2', refresh: 'refresh-cw', arrow: 'arrow-right' };
      if (ICONS[names[name] || name]) return ICONS[names[name] || name];
      return '';
    };
    const label = value => typeof value === 'string' ? value : '—';
    const MODEL_NAMES = {
      'claude-haiku-4-5-20251001': 'claude-haiku-4.5',
      'claude-haiku-5-5': 'claude-haiku-5.5',
      'claude-sonnet-4-6': 'claude-sonnet-4.6',
      'claude-sonnet-5': 'claude-sonnet-5',
      'claude-sonnet-5-5': 'claude-sonnet-5.5',
      'claude-opus-4-6': 'claude-opus-4.6',
      'claude-opus-4-7': 'claude-opus-4.7',
      'claude-opus-4-8': 'claude-opus-4.8',
      'claude-opus-5': 'claude-opus-5',
      'claude-opus-5-5': 'claude-opus-5.5',
    };
    // Format UI labels only; comparisons and requests keep their original model IDs.
    const displayModel = value => {
      const name = label(value), start = name.lastIndexOf('/') + 1, id = name.slice(start);
      return Object.hasOwn(MODEL_NAMES, id) ? name.slice(0, start) + MODEL_NAMES[id] : name;
    };
    const normalize = value => String(value || '').toLowerCase().replace(/^(openai|anthropic|models)\//, '');
    const percent = value => Number.isFinite(value) ? (value * 100).toFixed(1) : '—';
    const behaviorBlockedMessage = 'Gemini 系列已禁用行为指纹，仍可使用联合检测。';
    const time = value => value ? new Date(value).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '—';
    const routeState = record => !record?.requestModel || !record?.responseModel ? 'unknown'
      : normalize(record.responseModel) === normalize(record.requestModel) ? 'match' : 'mismatch';

    function fingerprintStatus(record) {
      const check = record.check || {}, fp = record.fingerprint;
      if (['queued', 'running'].includes(check.state)) return { key: 'checking', text: check.phase === 'parallel' ? '联合检测中' : check.phase === 'candy' ? '糖果题检测中' : '数字指纹检测中', sample: `${check.completed || 0}/${check.total || 3} 已完成 · 数字 ${check.valid || 0}/3 有效` };
      if (check.total > 3 && ['cancelled','failed','partial'].includes(check.state)) return { key: check.state === 'failed' ? 'error' : 'warn',
        text: { cancelled:'联合检测已取消', failed:'联合检测失败', partial:'联合检测部分完成' }[check.state], sample: `数字 ${fp?.usedOutputs || 0}/3 有效样本` };
      if (fp) {
        const notes = [`${fp.usedOutputs}/3 有效样本`];
        if (fp.usedOutputs < 3) notes.push('样本不足');
        if (!fp.requestedInBank) notes.push('请求模型未收录');
        const text = fp.usedOutputs < 3 ? '样本不足' : !fp.requestedInBank ? '请求模型未收录'
          : normalize(fp.prediction) === normalize(record.requestModel) ? '候选与请求相同' : '候选与请求不同';
        return { key: text === '候选与请求相同' ? 'match' : 'warn', text, sample: notes.join(' · ') };
      }
      if (check.state === 'failed') return { key: 'error', text: '指纹检测失败', sample: `${check.valid || 0}/3 有效 · ${check.error || '无有效样本'}` };
      if (check.state === 'cancelled') return { key: 'muted', text: '指纹检测已取消', sample: '未产生指纹结果' };
      return { key: 'muted', text: '指纹尚未检测', sample: '尚未采样' };
    }
    function candySummary(record) {
      const candy = record?.evaluations?.candy;
      if (!candy) return '尚未测评';
      if (candy.state === 'queued') return '等待开始';
      if (candy.state === 'running') return `检测中 · ${candy.completed || 0}/${candy.total} 次`;
      const state = { failed:'失败', cancelled:'已取消', partial:'部分完成' }[candy.state];
      return [state, `命中 ${candy.hits || 0}/${candy.graded || 0}`, candy.errors ? `${candy.errors} 次失败` : ''].filter(Boolean).join(' · ');
    }

    function apply(ctx) {
      ctx.effect(() => {
        const old = document.querySelector('dsh-model-check');
        if (old) return () => {};
        const host = document.createElement('dsh-model-check');
        const shadow = host.attachShadow({ mode: 'open' });
        shadow.innerHTML = `<style>${CSS}</style><style>:host{--mc-frame:url("${ART['panel-frame']}");--mc-frame-light:url("${ART['frame-light']}");--mc-frame-dark:url("${ART['frame-dark']}");--mc-divider:url("${ART.divider}");--mc-ribbons:url("${ART['header-ribbons']}")}</style>
          <div class="panel-shell"><section class="panel" aria-label="Model Check 模型路由面板">
            <header class="header"><div class="character-crop" aria-hidden="true"><img src="${ART['character-original']}" alt="" draggable="false"></div><div class="header-ribbons" aria-hidden="true"></div><div class="emblem">${icon('firefly')}</div><div class="brand"><strong>Model Check</strong><small>模型检测</small></div>
              <div class="header-actions"><button class="icon-button" id="compact" aria-label="最小化面板" title="最小化">${icon('minus')}</button><button class="icon-button" id="hide" aria-label="隐藏浮窗" title="隐藏浮窗">${icon('close')}</button></div></header>
            <section class="compact-summary" id="compact-summary" aria-label="独立指纹候选摘要" aria-live="polite"><div class="compact-candidate"><strong id="compact-model">等待请求</strong><span id="compact-probability">—</span></div><div class="bar compact-bar" aria-hidden="true"><i id="compact-fill"></i></div></section>
            <nav class="main-tabs" aria-label="测评导航"><button id="main-check-tab" aria-pressed="true">联合检测</button><button id="open-behavior" aria-expanded="false" aria-controls="evaluation-drawer">行为指纹</button></nav>
            <div class="sr-only" aria-live="polite" role="status"><span id="status" data-key="idle"><span id="status-text">等待请求</span></span><span id="time">—</span></div>
            <div class="body"><div id="live-view">
              <div class="record-context" id="record-context" hidden><button class="text-button" id="back-history">${icon('arrow-left')}历史列表</button><span>历史记录</span></div>
              <section class="probability" aria-label="独立指纹候选"><div class="section-label"><span>独立指纹候选</span><span class="help-label">候选库内概率<button class="help-button" id="fingerprint-help" aria-label="指纹候选说明" aria-describedby="help-popover" aria-expanded="false">${icon('help-circle')}</button></span></div>
                <div id="probability-result" hidden><div class="candidate-head"><strong class="candidate-name" id="candidate"></strong><strong class="percent"><span id="probability" aria-hidden="true">—</span><small aria-hidden="true">%</small><span id="probability-accessible" class="sr-only"></span></strong></div><div class="bar primary-bar" id="primary-bar" role="img"><i id="primary-fill"><canvas id="primary-particles" aria-hidden="true"></canvas></i></div><div class="candidate-bars" id="bars"></div></div>
                <div id="probability-empty"><span class="progress" id="progress" hidden></span><p class="empty-copy" id="empty-copy">完成指纹检测后显示候选概率。</p><div class="track" id="track" hidden><i id="track-fill"></i></div></div>
              </section>
              <section class="combined-result" aria-label="联合检测结果"><img class="candy-mark" src="${ART['candy-mark']}" alt="" draggable="false"><div class="candy-copy"><h2>糖果测评</h2><button class="text-button" id="open-candy">查看详情${icon('arrow')}</button></div>
                <strong id="candy-result">尚未测评</strong><p id="combined-status" class="combined-status" hidden></p>
                <div class="track" id="combined-track" hidden><i id="combined-track-fill"></i></div>
              </section>
              <div class="ornament-divider" aria-hidden="true"></div>
              <div class="route"><div class="route-row"><span class="route-symbol">${icon('server')}</span><span class="route-label">供应商</span><strong class="model" id="provider">—</strong></div><div class="route-row"><span class="route-symbol">${icon('box')}</span><button class="route-label" id="request-help" aria-label="请求模型说明" aria-describedby="help-popover" aria-expanded="false">请求模型</button><strong class="model" id="request">等待请求</strong></div><div class="route-row"><span class="route-symbol">${icon('repeat')}</span><button class="route-label" id="route-help" aria-label="响应路由说明" aria-describedby="help-popover" aria-expanded="false">路由响应</button><strong class="model" id="response" data-route-state="unknown">等待响应</strong></div></div>
              <button class="details-toggle" id="details-toggle" aria-expanded="false" aria-controls="expanded-details" title="展开检测详情">${icon('chevron-down')}<span class="sr-only" id="details-label">展开详情</span></button>
              <div class="expanded-details" id="expanded-details" hidden>
                <section class="evaluation-entry" aria-label="模型基准库"><div class="details-heading"><strong>模型基准库</strong><span id="bank-counts"></span></div></section>
                <div class="details-heading"><strong>检测详情</strong><button class="text-button" id="refresh">${icon('refresh')}刷新路由</button></div>
                <dl class="details"><dt>提供商</dt><dd id="detail-provider">—</dd><dt>思考强度</dt><dd id="effort">—</dd><dt>响应来源</dt><dd id="source" class="route-source">等待响应</dd><dt>采样状态</dt><dd id="sample-state">尚未采样</dd><dt>请求概率</dt><dd id="requested-probability">尚未采样</dd></dl>
                <div class="distribution"><strong>完整候选分布</strong><div id="distribution-bars"></div><p id="distribution-empty" class="empty-copy">暂无指纹结果。</p></div>
              </div>
            </div><div id="history-view" hidden><p class="history-title">当前会话 · 最近 20 次请求</p><div class="history" id="history"></div></div><p class="feedback" id="feedback" role="status" aria-live="polite" hidden></p></div>
            <footer class="controls"><div class="control-actions"><button class="history-button" id="history-tab" aria-label="会话历史" aria-pressed="false" title="当前会话历史">${icon('clock')}<span>历史</span></button><div class="primary-actions"><button class="action primary" id="check" disabled>${icon('check')}<span id="check-label">联合检测</span></button><button class="action cancel" id="cancel" hidden>取消检测</button><button class="action primary" id="live-tab" hidden>${icon('arrow-left')}返回当前</button></div></div>
              <div class="control-settings"><button class="frequency-trigger" id="frequency" aria-label="联合检测频率" aria-expanded="false" aria-controls="frequency-drawer">${icon('settings')}<span>自动：<span id="frequency-summary">仅会话首轮</span></span>${icon('chevron-down')}</button><button class="skin-trigger" id="skin" aria-label="选择皮肤" aria-expanded="false" aria-controls="skin-drawer">${icon('droplet')}<span>皮肤</span></button></div></footer>
          </section></div><aside class="skin-drawer" id="skin-drawer" role="dialog" aria-labelledby="skin-title" hidden>
            <div class="drawer-heading"><strong id="skin-title">选择皮肤</strong><button class="icon-button" id="skin-close" aria-label="关闭皮肤选择">${icon('close')}</button></div><p class="drawer-subtitle">即时预览 · 自动记住你的选择</p>
            <fieldset class="skin-options"><legend class="sr-only">面板皮肤</legend>
              <label class="skin-option" data-skin="follow"><input type="radio" name="skin" value="follow"><span class="skin-symbol">${icon('repeat')}</span><span class="skin-copy"><strong>${SKINS.follow}</strong><small id="follow-skin-description">随 DSH 的主题自动切换</small></span></label>
              <label class="skin-option" data-skin="original"><input type="radio" name="skin" value="original"><span class="skin-symbol">${icon('firefly')}</span><span class="skin-copy"><strong>流萤</strong><small>角色与青金边框</small></span></label>
              <label class="skin-option" data-skin="light"><input type="radio" name="skin" value="light"><span class="skin-symbol">${icon('sun')}</span><span class="skin-copy"><strong>${SKINS.light}</strong><small>银灰装甲与青色微光</small></span></label>
              <label class="skin-option" data-skin="dark"><input type="radio" name="skin" value="dark"><span class="skin-symbol">${icon('moon')}</span><span class="skin-copy"><strong>${SKINS.dark}</strong><small>黑色装甲与青色微光</small></span></label>
            </fieldset>
          </aside><aside class="frequency-drawer" id="frequency-drawer" role="dialog" aria-labelledby="frequency-title" hidden>
            <div class="drawer-heading"><strong id="frequency-title">联合检测频率</strong><button class="icon-button" id="frequency-close" aria-label="关闭频率设置">${icon('close')}</button></div><p class="drawer-subtitle">仅应用于当前会话 · 每轮 4 次请求</p>
            <form id="frequency-form" novalidate><fieldset><legend class="sr-only">自动检测方式</legend>
              <label class="frequency-option"><input type="radio" name="frequency-mode" value="start" checked><span>只在会话开始时检测</span></label>
              <label class="frequency-option"><input type="radio" name="frequency-mode" value="interval"><span>按轮次检测</span></label>
              <div class="interval-field"><label for="frequency-every">每</label><input id="frequency-every" type="number" min="1" max="1000" step="1" value="5" inputmode="numeric" aria-label="检测间隔轮数" disabled><span>轮检测一次</span></div>
              <label class="frequency-option"><input type="radio" name="frequency-mode" value="manual"><span>仅手动检测</span></label>
            </fieldset><p class="schedule-note" id="schedule-note"></p><p class="drawer-cost">修改频率不会立即发起检测。</p><p class="drawer-error" id="frequency-error" role="alert" hidden></p><button class="action primary" id="frequency-save" type="submit">保存频率</button></form>
          </aside><aside class="evaluation-drawer" id="evaluation-drawer" role="dialog" aria-labelledby="evaluation-title" hidden>
            <div class="drawer-heading"><strong id="evaluation-title">测评详情</strong><button class="icon-button" id="evaluation-close" aria-label="关闭测评详情">${icon('close')}</button></div>
            <p class="drawer-subtitle" id="evaluation-model">使用当前请求模型</p>
            <div class="evaluation-tabs" role="tablist" aria-label="测评类型"><button id="candy-tab" role="tab" aria-selected="true" aria-controls="evaluation-content">联合检测</button><button id="behavior-tab" role="tab" aria-selected="false" aria-controls="evaluation-content">行为指纹</button></div>
            <div id="evaluation-content" role="tabpanel" aria-labelledby="candy-tab">
              <div class="evaluation-setup" id="candy-setup"><label for="candy-runs">本次糖果次数<input id="candy-runs" type="number" min="1" max="10" step="1" value="1"></label><p class="evaluation-copy" id="combined-cost">3 次数字指纹＋1 次糖果题，共 4 次请求。</p><p class="evaluation-copy">糖果回答出现独立数字 21 记为命中。命中只作为辅助结果，不计入模型概率。</p></div>
              <p id="behavior-unavailable" class="evaluation-warning" role="status" hidden></p>
              <div class="evaluation-setup" id="behavior-setup" hidden><label for="behavior-mode">采样模式<select id="behavior-mode" aria-describedby="behavior-cost"><option value="quick">快速 · 60 次请求</option><option value="standard">标准 · 200 次请求</option><option value="strict">严格 · 400 次请求</option></select></label><p class="evaluation-warning" id="behavior-cost" role="status"></p><p class="evaluation-copy" id="behavior-bank-note"></p></div>
              <div class="evaluation-actions"><button id="evaluation-start" class="action primary">开始测评</button><button id="evaluation-cancel" class="action cancel" hidden>取消检测</button></div>
              <p id="evaluation-error" class="drawer-error" role="status" hidden></p><p id="evaluation-note" class="evaluation-copy" hidden></p>
              <p id="evaluation-trace" class="evaluation-copy"></p><div id="evaluation-summary" class="evaluation-summary" aria-live="polite"></div><div class="track" id="evaluation-track" hidden><i id="evaluation-track-fill"></i></div>
              <p id="evaluation-usage" class="evaluation-copy" hidden></p><div id="evaluation-result" class="evaluation-result"></div>
            </div><p class="evaluation-source">测评来源：<a href="https://github.com/haowang02/cpa-plugin-codex-candy-eval" target="_blank" rel="noopener noreferrer">Candy Eval</a></p>
          </aside><div class="help-popover" id="help-popover" role="tooltip" hidden><strong id="help-title"></strong><p id="help-copy"></p></div>
          <button class="launcher" id="launcher" aria-label="展开 Model Check" title="单击展开 Model Check；拖动调整位置">${icon('chevron-down')}</button>`;
        document.body.appendChild(host);
        const $ = id => shadow.getElementById(id);
        const panel = shadow.querySelector('.panel');
        const readPrefs = () => {
          try {
            const current = JSON.parse(localStorage.getItem(STORAGE));
            if (current && typeof current === 'object') {
              const saved = { hidden:current.hidden, expanded:current.expanded, minimized:current.minimized, skin:validSkin(current.skin), layoutVersion:2 };
              if (current.layoutVersion === 2) return { ...saved, dockSide:current.dockSide === 'right' ? 'right' : 'left',
                dockOffset:Number.isFinite(current.dockOffset) ? Math.max(6, current.dockOffset) : 6 };
              if (current.layoutVersion === 1) return { ...saved, previousPosition:current };
              return { ...saved, dockSide:'left', dockOffset:6 };
            }
            const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE)) || {};
            return { hidden:legacy.hidden, expanded:false, minimized:false, dockSide:'left', dockOffset:6, layoutVersion:2 };
          } catch { return { dockSide:'left', dockOffset:6, layoutVersion:2 }; }
        };
        let prefs = readPrefs(), state = null, activeId = '', actionToken = '', live = true, busy = false;
        let tab = 'live', selectedRecordId = null, pollTimer, requestController, drag = null, seenRevision = -1;
        let helpAnchor = null, helpPinned = false, helpTimer, savingFrequency = false, detailsExpanded = false;
        let evaluationKind = 'candy', evaluationAnchor = null, detailKey = '', detailController = null, detailGeneration = 0, renderedDetailKey = '';
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let probabilityKey = '', probabilityTarget = null, probabilityFrame = 0, probabilityAnimation = null;
        const particleCanvas = $('primary-particles'), particleContext = particleCanvas.getContext('2d');
        const particleSeeds = [
          [.075,.32,.45,.14], [.138,.71,.50,.71], [.184,.19,.36,.32], [.202,.34,.58,.89],
          [.270,.61,.40,.52], [.332,.83,.65,.03], [.378,.18,.40,.41], [.443,.52,.35,.66],
          [.465,.24,.43,.83], [.526,.72,.75,.19], [.644,.25,.41,.57], [.708,.68,.52,.97],
          [.736,.89,.73,.36], [.880,.22,.40,.78],
        ];
        const particlePeriod = 3000, tau = Math.PI * 2, wrap = value => ((value % 1) + 1) % 1;
        let particleFrame = 0, particleLast = 0, particleElapsed = 340;
        let positionFrame = 0, layoutNodes = [];
        let suppressLauncherClick = false;
        const savePrefs = () => { try { localStorage.setItem(STORAGE, JSON.stringify(prefs)); } catch { /* Optional. */ } };
        const setText = (id, value) => { $(id).textContent = value; };
        const feedback = value => { setText('feedback', value); $('feedback').hidden = !value; };
        const setHidden = value => {
          closeFrequency(false); closeSkin(false); closeHelp(); closeEvaluation(false);
          if (value) {
            stopProbabilityMotion();
            if (!prefs.hidden) prefs.dockOffset = Math.max(6, panel.getBoundingClientRect().top - conversationBounds().top);
          }
          prefs.hidden = value; host.toggleAttribute('data-hidden', value); clampPosition(); savePrefs(); syncParticles();
        };
        const setCompact = value => {
          closeFrequency(false); closeSkin(false); closeHelp(); closeEvaluation(false); prefs.minimized = value; panel.classList.toggle('minimized', value);
          host.toggleAttribute('data-minimized', value);
          if (value) stopProbabilityMotion();
          $('compact').innerHTML = icon(value ? 'expand' : 'minus');
          $('compact').setAttribute('aria-label', value ? '恢复面板' : '最小化面板');
          $('compact').title = value ? '恢复面板' : '最小化';
          savePrefs(); clampPosition(); syncParticles();
        };
        function setDetailsExpanded(value, persist = true) {
          detailsExpanded = Boolean(value); panel.classList.toggle('expanded', detailsExpanded);
          $('expanded-details').hidden = !detailsExpanded;
          $('details-toggle').setAttribute('aria-expanded', String(detailsExpanded));
          $('details-toggle').innerHTML = `${icon(detailsExpanded ? 'chevron-up' : 'chevron-down')}<span class="sr-only" id="details-label">${detailsExpanded ? '收起详情' : '展开详情'}</span>`;
          $('details-toggle').title = detailsExpanded ? '收起检测详情' : '展开检测详情';
          if (persist && !selectedRecordId) { prefs.expanded = detailsExpanded; savePrefs(); }
          clampPosition();
        }
        function showTab(value) {
          closeHelp(); closeSkin(false); closeFrequency(false); closeEvaluation(false);
          tab = value; panel.classList.toggle('history-mode', value === 'history');
          $('live-view').hidden = value !== 'live'; $('history-view').hidden = value !== 'history';
          if (value === 'live') setDetailsExpanded(selectedRecordId ? true : Boolean(prefs.expanded), false);
          render(); clampPosition();
        }
        function selected() { return selectedRecordId ? state?.history?.find(record => record.id === selectedRecordId) : state?.record; }
        function stopProbabilityMotion() {
          if (probabilityFrame) cancelAnimationFrame(probabilityFrame);
          probabilityFrame = 0; probabilityAnimation?.cancel(); probabilityAnimation = null;
          setText('probability', percent(probabilityTarget));
        }
        function stopParticles() {
          if (particleFrame) cancelAnimationFrame(particleFrame);
          particleFrame = 0; particleLast = 0;
        }
        function particlesVisible() {
          return live && particleContext && !document.hidden && !prefs.hidden && (prefs.minimized || tab === 'live')
            && Number.isFinite(probabilityTarget) && probabilityTarget > 0 && !$('probability-result').hidden
            && particleCanvas.clientWidth > 0 && particleCanvas.clientHeight > 0;
        }
        function drawParticles() {
          const width = particleCanvas.clientWidth, height = particleCanvas.clientHeight;
          if (!particleContext || !width || !height) return;
          const dpr = Math.min(3, window.devicePixelRatio || 1), ctx = particleContext;
          const bitmapWidth = Math.round(width * dpr), bitmapHeight = Math.round(height * dpr);
          if (particleCanvas.width !== bitmapWidth || particleCanvas.height !== bitmapHeight) {
            particleCanvas.width = bitmapWidth; particleCanvas.height = bitmapHeight;
          }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
          const phase = wrap(particleElapsed / particlePeriod), lightX = width * wrap(.52 - phase);
          // Repeat the soft light across the seam so the right-to-left loop has no jump.
          for (const shift of [-width, 0, width]) {
            const bloom = ctx.createRadialGradient(lightX + shift, height * .7, 0, lightX + shift, height * .7, width * .27);
            bloom.addColorStop(0, 'rgba(211,255,237,.28)');
            bloom.addColorStop(.4, 'rgba(125,255,210,.10)');
            bloom.addColorStop(1, 'rgba(100,255,221,0)');
            ctx.fillStyle = bloom; ctx.fillRect(0, 0, width, height);
          }
          for (const [px, py, radius, offset] of particleSeeds) {
            const pulse = .26 + .74 * Math.pow(Math.sin(wrap(phase + offset) * Math.PI), 2);
            const x = -4 + wrap(px - phase) * (width + 8);
            const y = height * py + Math.cos((phase + offset * .73) * tau) * .22;
            const alpha = Math.max(0, Math.min(1, (x + 4) / 8, (width + 4 - x) / 8)) * pulse * .85;
            const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.8);
            glow.addColorStop(0, `rgba(231,255,248,${alpha * .45})`);
            glow.addColorStop(.22, `rgba(165,255,228,${alpha * .45 * .42})`);
            glow.addColorStop(1, 'rgba(100,255,221,0)');
            ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, radius * 3.8, 0, tau); ctx.fill();
            ctx.globalAlpha = alpha; ctx.fillStyle = '#effff9';
            ctx.beginPath(); ctx.arc(x, y, radius, 0, tau); ctx.fill(); ctx.globalAlpha = 1;
          }
        }
        function syncParticles() {
          const fill = $(prefs.minimized ? 'compact-fill' : 'primary-fill');
          if (particleCanvas.parentElement !== fill) fill.appendChild(particleCanvas);
          if (!particlesVisible()) { stopParticles(); return; }
          if (motionQuery.matches) { stopParticles(); drawParticles(); return; }
          if (particleFrame) return;
          drawParticles();
          const step = now => {
            particleFrame = 0;
            if (!particlesVisible()) { stopParticles(); return; }
            if (motionQuery.matches) { stopParticles(); drawParticles(); return; }
            if (particleLast) particleElapsed = (particleElapsed + Math.min(100, now - particleLast)) % particlePeriod;
            particleLast = now; drawParticles(); particleFrame = requestAnimationFrame(step);
          };
          particleFrame = requestAnimationFrame(step);
        }
        function renderProbability(record) {
          const fp = record.fingerprint;
          const key = JSON.stringify([activeId, record.id, fp.sampledAt, fp.prediction, fp.probability, fp.usedOutputs]);
          $('primary-fill').style.width = `${Math.min(100, Math.max(0, fp.probability * 100))}%`;
          $('primary-bar').setAttribute('aria-label', `${displayModel(fp.prediction)}，候选库内概率 ${percent(fp.probability)}%`);
          setText('probability-accessible', `候选库内概率 ${percent(fp.probability)}%`);
          if (probabilityKey === key) return;
          stopProbabilityMotion(); probabilityKey = key; probabilityTarget = fp.probability;
          setText('probability', percent(probabilityTarget));
          if (motionQuery.matches || document.hidden || prefs.hidden || prefs.minimized || tab !== 'live' || !Number.isFinite(probabilityTarget)) return;
          probabilityAnimation = $('primary-fill').animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
          const startedAt = performance.now(), target = probabilityTarget;
          setText('probability', '0.0');
          const step = now => {
            if (!live) return;
            const progress = Math.min(1, Math.max(0, (now - startedAt) / 650));
            setText('probability', percent(target * (1 - Math.pow(1 - progress, 3))));
            probabilityFrame = progress < 1 ? requestAnimationFrame(step) : 0;
          };
          probabilityFrame = requestAnimationFrame(step);
        }
        function statusFor(record) {
          if (!record) return ['idle', '等待请求'];
          if (record.outcome === 'error') return ['error', '请求失败'];
          if (record.outcome === 'aborted') return ['muted', '请求已中断'];
          if (record.fingerprint || ['queued', 'running', 'failed', 'cancelled'].includes(record.check?.state)) {
            const status = fingerprintStatus(record);
            return [status.key, status.text + (record.fingerprint ? ` · ${record.fingerprint.usedOutputs}/3 有效样本` : '')];
          }
          if (record.responseModel) return normalize(record.responseModel) === normalize(record.requestModel) ? ['match', '路由标签一致'] : ['warn', '路由标签不同'];
          return ['muted', record.outcome === 'running' ? '接收响应中' : '响应标签未提供'];
        }
        function render() {
          if (!live) return;
          const record = selected(); const [key, status] = statusFor(record);
          const compactFp = record?.fingerprint;
          const compactName = displayModel(compactFp?.prediction || (!record ? '等待请求' : ['queued','running'].includes(record.check?.state) ? '指纹检测中' : record.check?.state === 'failed' ? '指纹检测失败' : '尚未检测指纹'));
          setText('compact-model', compactName); $('compact-model').title = compactName;
          setText('compact-probability', compactFp ? `${percent(compactFp.probability)}%` : '—');
          $('compact-summary').dataset.samples = String(compactFp?.usedOutputs || 0);
          $('compact-summary').setAttribute('aria-label', compactFp ? `独立指纹候选 ${compactName}，候选库内概率 ${percent(compactFp.probability)}%` : compactName);
          $('compact-fill').style.width = `${compactFp ? Math.min(100, Math.max(0, compactFp.probability * 100)) : 0}%`;
          $('status').dataset.key = tab === 'history' ? 'muted' : key;
          setText('status-text', tab === 'history' ? '会话历史' : status); setText('time', time(record?.startedAt));
          $('history-tab').setAttribute('aria-pressed', String(tab === 'history' || Boolean(selectedRecordId)));
          $('record-context').hidden = !selectedRecordId;
          setText('request', displayModel(record?.requestModel || '等待请求')); $('request').title = displayModel(record?.requestModel || '');
          setText('response', displayModel(record?.responseModel || (record?.outcome === 'running' ? '接收响应中' : record ? '未提供标签' : '等待响应')));
          $('response').dataset.routeState = routeState(record);
          $('response').setAttribute('aria-label', `${$('response').textContent}，${{ match:'与请求模型一致', mismatch:'与请求模型不同', unknown:'响应路由未知' }[routeState(record)]}`);
          $('response').title = record?.responseModel ? displayModel(record.responseModel) : '适配器未暴露服务端响应标签，无法确认响应路由。';
          setText('provider', record?.provider || '未提供'); $('provider').title = record?.provider || '';
          setText('detail-provider', label(record?.provider)); setText('effort', record?.reasoningEffort || '适配器默认');
          setText('source', record?.responseField || '未暴露服务端模型标签');
          const schedule = state?.settings?.frequency ?? { mode: 'start' };
          setText('frequency-summary', schedule.mode === 'interval' ? `每 ${schedule.every} 轮` : schedule.mode === 'manual' ? '仅手动' : '仅会话首轮');
          $('frequency').disabled = !activeId || !state;
          const checking = ['queued', 'running'].includes(record?.check?.state);
          const evaluationBusy = Boolean(state?.activeEvaluation);
          const count = record?.check?.completed || 0;
          const total = record?.check?.total || 4;
          setText('candy-result', candySummary(record)); $('candy-result').dataset.state = record?.evaluations?.candy?.state || 'idle';
          const combinedState = { failed:'联合检测失败', cancelled:'联合检测已取消' }[record?.check?.state];
          const combinedNote = checking ? `${record.check.phase === 'parallel' ? '联合检测' : record.check.phase === 'candy' ? '糖果题' : '数字指纹'} · ${count}/${total} 已完成`
            : combinedState || '';
          setText('combined-status', combinedNote); $('combined-status').hidden = !combinedNote;
          $('combined-track').hidden = !checking; $('combined-track-fill').style.width = `${count / total * 100}%`;
          setText('sample-state', record?.fingerprint ? `${record.fingerprint.usedOutputs}/3 有效 · ${time(record.fingerprint.sampledAt)}`
            : checking ? `${record.check.traceCompleted ?? count}/3 数字采样已完成` : record?.check?.traceState === 'failed' || record?.check?.state === 'failed' ? `数字检测失败 · ${record.check.traceError || record.check.error || '无有效样本'}`
              : record?.check?.state === 'cancelled' ? '检测已取消' : '尚未采样');
          const fp = record?.fingerprint;
          setText('requested-probability', fp ? fp.requestedInBank ? `${percent(fp.requestedProbability)}% · 候选库内概率` : '请求模型未收录' : '尚未采样');
          $('probability-result').hidden = !fp; $('probability-empty').hidden = Boolean(fp);
          $('progress').hidden = !checking; $('track').hidden = !checking;
          setText('progress', record?.check?.state === 'queued' ? '等待后台采样' : `联合检测 · ${count}/${total} 已完成`);
          $('track-fill').style.width = `${count / total * 100}%`;
          $('probability-result').dataset.key = key;
          $('probability-result').dataset.samples = String(fp?.usedOutputs || 0);
          $('bars').replaceChildren(); $('distribution-bars').replaceChildren(); $('distribution-empty').hidden = Boolean(fp);
          if (fp) {
            setText('candidate', displayModel(fp.prediction)); renderProbability(record);
            const candidates = fp.candidates || [];
            for (const [container, items] of [[$('bars'), candidates.filter(item => normalize(item.model) !== normalize(fp.prediction)).slice(0, 2)], [$('distribution-bars'), candidates]]) {
              for (const item of items) {
              const row = document.createElement('div'); row.className = 'candidate-row';
              const name = document.createElement('span'); name.textContent = displayModel(item.model); name.title = displayModel(item.model);
              const value = document.createElement('b'); value.textContent = percent(item.probability) + '%';
              const bar = document.createElement('div'); bar.className = 'bar'; const fill = document.createElement('i');
              fill.style.width = `${Math.min(100, Math.max(0, item.probability * 100))}%`; bar.append(fill); row.append(name, bar, value); container.append(row);
              }
            }
          } else {
            stopProbabilityMotion(); probabilityKey = ''; probabilityTarget = null;
            setText('empty-copy', checking ? '聊天可继续，完成后更新概率。' : record?.check?.state === 'failed' ? '无有效数字样本，可重新检测。' : record?.check?.state === 'cancelled' ? '检测已取消，未产生新的概率。' : '完成指纹检测后显示模型概率。');
          }
          setText('check-label', fp || ['failed', 'partial', 'cancelled'].includes(record?.check?.state) ? '重新检测' : '联合检测');
          $('check').disabled = !record || record.outcome !== 'complete' || checking || evaluationBusy || Boolean(selectedRecordId);
          const currentView = tab === 'live' && !selectedRecordId;
          $('cancel').hidden = !(checking || evaluationBusy) || !currentView; $('check').hidden = !currentView || checking || evaluationBusy;
          $('details-toggle').hidden = tab === 'history'; $('details-toggle').disabled = !record;
          $('live-tab').hidden = currentView;
          $('refresh').disabled = Boolean(selectedRecordId);
          $('refresh').title = selectedRecordId ? '历史记录只读，请返回当前请求后刷新。' : '重新读取已有路由状态，不发起模型请求。';
          if (tab === 'history') renderHistory();
          setText('bank-counts', `数字 ${state?.bank?.count ?? 0} · 行为 ${state?.behaviorBank?.count ?? 0}`);
          $('bank-counts').title = '数字指纹模型数 / 行为指纹基准模型数';
          for (const kind of ['candy', 'behavior']) $('open-' + kind).disabled = !record;
          const behaviorBlocked = Boolean(record?.behaviorUnavailableReason);
          $('open-behavior').disabled = !record || behaviorBlocked;
          $('open-behavior').title = behaviorBlocked ? behaviorBlockedMessage : '查看行为指纹及采样额度说明';
          $('open-behavior').setAttribute('aria-label', behaviorBlocked ? `行为指纹：${behaviorBlockedMessage}` : '行为指纹');
          renderEvaluation();
          if (state?.storageWarning) feedback('历史保存暂不可用，当前检测仍可运行。');
          positionOverlays(); syncParticles();
        }
        function renderHistory() {
          const container = $('history'); container.replaceChildren();
          if (!state?.history?.length) { const empty = document.createElement('p'); empty.className = 'empty-history'; empty.textContent = '发送一条消息后，这里会记录请求历史。'; container.append(empty); return; }
          for (const record of state.history) {
            const row = document.createElement('button'); row.type = 'button'; row.className = 'history-row';
            row.dataset.recordId = record.id;
            const fp = record.fingerprint, status = fingerprintStatus(record); row.dataset.key = status.key;
            row.dataset.samples = String(fp?.usedOutputs || 0);
            const meta = document.createElement('div'); meta.className = 'history-meta';
            const stamp = document.createElement('span'); stamp.textContent = time(record.startedAt);
            const badge = document.createElement('span'); badge.className = 'history-status'; badge.textContent = status.text; meta.append(stamp, badge);
            const fingerprint = document.createElement('div'); fingerprint.className = 'history-fingerprint';
            const candidate = document.createElement('strong'); candidate.className = 'history-name'; candidate.textContent = fp?.prediction ? displayModel(fp.prediction) : '暂无指纹结果';
            fingerprint.append(candidate);
            if (fp) {
              const chance = document.createElement('strong'); chance.className = 'history-prob'; chance.textContent = percent(fp.probability) + '%';
              chance.title = '候选库内概率 · 独立采样'; fingerprint.append(chance);
            }
            const sample = document.createElement('p'); sample.className = 'history-sample'; sample.textContent = status.sample + ' · 糖果 ' + candySummary(record);
            if (status.key === 'warn' || status.key === 'error') sample.classList.add('warn');
            const route = document.createElement('dl'); route.className = 'history-route';
            for (const [title, value] of [['供应商', record.provider || '未提供'], ['请求模型', displayModel(record.requestModel)], ['路由响应', displayModel(record.responseModel || '未提供标签')]]) {
              const term = document.createElement('dt'); term.textContent = title;
              const detail = document.createElement('dd'); detail.textContent = value;
              if (title === '路由响应') detail.dataset.routeState = routeState(record);
              route.append(term, detail);
            }
            const routeNote = document.createElement('p'); routeNote.className = 'history-route-note';
            routeNote.textContent = !record.responseModel ? '服务端未提供路由标签' : normalize(record.responseModel) === normalize(record.requestModel) ? '路由标签一致' : '路由标签不同';
            row.append(meta, fingerprint, sample, route, routeNote);
            row.setAttribute('aria-label', `${time(record.startedAt)}，${status.text}，指纹候选 ${fp ? displayModel(fp.prediction) + '，库内概率 ' + percent(fp.probability) + '%' : '暂无'}，${sample.textContent}，请求模型 ${displayModel(record.requestModel)}，响应路由 ${displayModel(record.responseModel || '未提供标签')}，查看详情`);
            row.onclick = () => { selectedRecordId = record.id; showTab('live'); }; container.append(row);
          }
        }
        function sessionFromStore() {
          try {
            const rows = Object.values(ctx.sessions.list.getSnapshot().byId || {});
            return rows.find(row => row.retainedBy?.mainView > 0)?.id || '';
          } catch { return ''; }
        }
        async function refresh() {
          if (!live || busy) return;
          busy = true;
          const id = activeId;
          requestController = new AbortController();
          const timeout = setTimeout(() => requestController?.abort(), 7000);
          try {
            const response = await fetch('/model-check/state?sessionId=' + encodeURIComponent(id), { credentials: 'same-origin', cache: 'no-store', signal: requestController.signal });
            if (!response.ok) throw new Error('HTTP_' + response.status);
            const value = await response.json();
            if (!live || id !== activeId) return;
            const hostChanged = actionToken !== value.actionToken;
            if (!hostChanged && value.revision < seenRevision) return;
            actionToken = value.actionToken; state = value;
            if (hostChanged || seenRevision !== value.revision) { seenRevision = value.revision; feedback(''); render(); }
          } catch {
            if (live && id === activeId) feedback('Model Check 尚未连接到宿主。安装后请重新启动 Harness。');
          } finally { clearTimeout(timeout); busy = false; }
        }
        async function action(value) {
          if (!actionToken) return feedback('正在连接宿主，请稍后再试。');
          const id = activeId;
          try {
            const response = await fetch('/model-check/action?sessionId=' + encodeURIComponent(id), { method: 'POST', credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json', 'X-Model-Check-Token': actionToken }, body: JSON.stringify(value), signal: AbortSignal.timeout(7000) });
            const next = await response.json();
            if (!response.ok || !next.ok) throw new Error(next.error || 'FAILED');
            if (id === activeId && live) { state = next; seenRevision = next.revision; feedback(''); render(); return true; }
          } catch (error) { if (live && id === activeId) {
            const messages = { REQUEST_CHANGED:'当前请求已变化，请确认模型后重新启动。', EVALUATION_BUSY:'已有检测正在进行，请等待或取消。', QUEUE_FULL:'检测队列已满，请稍后重试。', GEMINI_BEHAVIOR_DISABLED:behaviorBlockedMessage };
            feedback(messages[error.message] || '操作未完成，请刷新路由后重试。'); render();
          } }
          return false;
        }
        function closeFrequency(restoreFocus = true) {
          const wasOpen = !$('frequency-drawer').hidden;
          $('frequency-drawer').hidden = true; $('frequency').setAttribute('aria-expanded', 'false');
          if (wasOpen && restoreFocus) frequencyAnchor.focus();
        }
        function applySkin(value, persist = true) {
          prefs.skin = validSkin(value);
          const snapshot = ctx.theme.getTheme(), followed = resolveSkin('follow', snapshot);
          host.dataset.skin = resolveSkin(prefs.skin, snapshot);
          $('skin').title = `皮肤：${SKINS[prefs.skin]}${prefs.skin === 'follow' ? `（${SKINS[followed]}）` : ''}`;
          setText('follow-skin-description', `随 DSH 切换，当前：${SKINS[followed]}`);
          for (const input of shadow.querySelectorAll('input[name="skin"]')) input.checked = input.value === prefs.skin;
          if (persist) savePrefs();
          positionOverlays();
        }
        function closeSkin(restoreFocus = true) {
          const wasOpen = !$('skin-drawer').hidden;
          $('skin-drawer').hidden = true; $('skin').setAttribute('aria-expanded', 'false');
          if (wasOpen && restoreFocus) $('skin').focus();
        }
        function openSkin() {
          if (!$('skin-drawer').hidden) return closeSkin();
          closeHelp(); closeFrequency(false); closeEvaluation(false);
          $('skin-drawer').hidden = false; $('skin').setAttribute('aria-expanded', 'true');
          positionOverlays(); shadow.querySelector('input[name="skin"]:checked').focus();
        }
        function draftSchedule() {
          const mode = shadow.querySelector('input[name="frequency-mode"]:checked').value;
          const every = $('frequency-every').valueAsNumber;
          $('frequency-every').disabled = mode !== 'interval';
          $('frequency-error').hidden = true;
          const turns = state?.settings?.completedTurns ?? 0;
          setText('schedule-note', `本会话已完成 ${turns} 轮。` + (mode === 'interval'
            ? Number.isInteger(every) && every >= 1 && every <= 1000 ? `在第 ${every}、${every * 2}、${every * 3}…轮结束后检测。` : '请输入 1–1000 的整数轮数。'
            : mode === 'manual' ? '通过“联合检测”按钮发起检测。' : turns || state?.settings?.startEligible === false ? '会话已开始，后续轮次不再自动检测。' : '首轮回复完成后检测一次，后续轮次不再自动检测。'));
          return mode === 'interval' ? { mode, every } : { mode };
        }
        let frequencyAnchor = $('frequency');
        const evaluationNames = { candy:'联合检测', behavior:'行为指纹', trace:'联合检测' };
        function closeEvaluation(restoreFocus = true) {
          const open = !$('evaluation-drawer').hidden;
          $('evaluation-drawer').hidden = true; detailController?.abort(); detailGeneration++; detailKey = '';
          $('open-behavior').setAttribute('aria-expanded', 'false'); $('main-check-tab').setAttribute('aria-pressed', 'true');
          $('evaluation-result').replaceChildren(); renderedDetailKey = '';
          if (open && restoreFocus) evaluationAnchor?.focus();
        }
        function openEvaluation(kind, anchor = $('open-' + kind)) {
          if (kind === 'behavior' && selected()?.behaviorUnavailableReason) return feedback(behaviorBlockedMessage);
          const wasOpen = !$('evaluation-drawer').hidden;
          closeHelp(); closeSkin(false); closeFrequency(false); evaluationAnchor = anchor;
          evaluationKind = kind; detailKey = ''; renderedDetailKey = ''; detailController?.abort(); detailGeneration++;
          $('evaluation-drawer').hidden = false; $('evaluation-result').replaceChildren(); $('evaluation-error').hidden = true;
          $('open-behavior').setAttribute('aria-expanded', String(kind === 'behavior')); $('main-check-tab').setAttribute('aria-pressed', String(kind !== 'behavior'));
          $('evaluation-drawer').scrollTop = 0;
          renderEvaluation(); positionOverlays(); if (!wasOpen) $('evaluation-close').focus();
        }
        function renderEvaluation() {
          if ($('evaluation-drawer').hidden) return;
          if (evaluationKind === 'behavior' && selected()?.behaviorUnavailableReason) return openEvaluation('candy', evaluationAnchor);
          const record = selected(), summary = record?.evaluations?.[evaluationKind], active = state?.activeEvaluation;
          const behaviorBlocked = Boolean(record?.behaviorUnavailableReason);
          setText('evaluation-model', `${displayModel(record?.requestModel || '等待请求')} · ${evaluationKind === 'behavior' ? 'low' : record?.reasoningEffort || '默认'}${selectedRecordId ? ' · 历史记录' : ''}`);
          for (const kind of ['candy', 'behavior']) {
            $(kind + '-setup').hidden = evaluationKind !== kind;
            $(kind + '-tab').setAttribute('aria-selected', String(evaluationKind === kind));
            $(kind + '-tab').tabIndex = evaluationKind === kind ? 0 : -1;
          }
          $('evaluation-content').setAttribute('aria-labelledby', evaluationKind + '-tab');
          $('behavior-tab').disabled = behaviorBlocked;
          $('behavior-tab').title = behaviorBlocked ? behaviorBlockedMessage : '';
          $('behavior-tab').setAttribute('aria-describedby', 'behavior-unavailable');
          setText('behavior-unavailable', behaviorBlockedMessage); $('behavior-unavailable').hidden = !behaviorBlocked;
          const behaviorRequests = { quick:60, standard:200, strict:400 }[$('behavior-mode').value] ?? 60;
          setText('behavior-cost', `额度提醒：本次将额外发送 ${behaviorRequests} 次模型请求，消耗接口额度，费用按供应商规则计算。密集采样可能触发限流或耗尽额度。`);
          $('behavior-cost').hidden = behaviorBlocked;
          setText('behavior-bank-note', `${state?.behaviorBank?.count ?? 0} 个模型基准。仅测试请求使用低思考强度、温度 1.0，不修改聊天设置。JSD 越小越接近，p 值不是模型概率。`);
          const canStart = record?.outcome === 'complete' && !selectedRecordId && !active && !(evaluationKind === 'behavior' && behaviorBlocked);
          $('evaluation-start').disabled = !canStart; $('candy-runs').disabled = !canStart; $('behavior-mode').disabled = !canStart;
          setText('evaluation-start', `开始${evaluationNames[evaluationKind]}`);
          $('evaluation-trace').hidden = evaluationKind !== 'candy';
          const fp = record?.fingerprint;
          setText('evaluation-trace', fp ? `ModelTrace：${displayModel(fp.prediction)} · ${percent(fp.probability)}% · ${fp.usedOutputs}/3 有效样本`
            : record?.check?.traceState === 'failed' ? `ModelTrace：无有效样本 · ${record.check.traceError || '采样失败'}` : 'ModelTrace：尚无候选结果');
          const runs = $('candy-runs').valueAsNumber;
          setText('combined-cost', Number.isInteger(runs) && runs >= 1 && runs <= 10 ? `3 次数字指纹＋${runs} 次糖果题，共 ${3 + runs} 次请求。` : '请输入 1–10 次糖果题；每次联合检测固定包含 3 次数字指纹。');
          $('evaluation-cancel').hidden = !active || Boolean(selectedRecordId);
          setText('evaluation-cancel', active ? `取消${evaluationNames[active]}` : '取消检测');
          const sameJob = active === evaluationKind || active === 'trace' && evaluationKind === 'candy';
          const note = selectedRecordId ? '历史记录只读，返回当前请求可重新测评。' : active && !sameJob ? `${evaluationNames[active]}正在进行，完成后可启动本项测评。` : '';
          setText('evaluation-note', note); $('evaluation-note').hidden = !note;
          const progress = evaluationKind === 'candy' && record?.check?.total > 3 ? record.check : summary;
          const running = ['queued', 'running', 'comparing'].includes(progress?.state), count = progress?.completed ?? 0;
          const status = { queued:'排队中', running:'采集中', comparing:'正在比较基准', complete:'测评完成', partial:'部分完成', failed:'测评失败', cancelled:'已取消' }[summary?.state];
          setText('evaluation-summary', evaluationKind === 'candy' ? `${record?.check?.total > 3 ? `${fingerprintStatus(record).text} · ${count}/${progress.total} 已完成 · ` : ''}糖果：${candySummary(record)}`
            : summary ? `${status || '测评结果'} · ${count}/${summary.total} 次` + (evaluationKind === 'behavior' ? ` · ${summary.valid || 0} 有效` : '') : '尚未测评');
          $('evaluation-summary').dataset.state = summary?.state || 'idle';
          $('evaluation-track').hidden = !running; $('evaluation-track-fill').style.width = `${progress?.total ? count / progress.total * 100 : 0}%`;
          const usage = progress?.usage || {}, usageParts = [['输入',usage.inputTokens],['输出',usage.outputTokens],['思考',usage.reasoningTokens]].filter(([, value]) => Number.isFinite(value)).map(([name, value]) => name + ' ' + value);
          if (Number.isFinite(progress?.durationMs)) usageParts.unshift((progress.durationMs / 1000).toFixed(1) + ' 秒');
          setText('evaluation-usage', usageParts.join(' · ')); $('evaluation-usage').hidden = !usageParts.length;
          if (summary?.error) { setText('evaluation-error', `${summary.errors || 0} 次失败 · ${summary.error}`); $('evaluation-error').hidden = false; }
          else $('evaluation-error').hidden = true;
          const key = JSON.stringify([activeId, record?.id, evaluationKind, summary]);
          if (detailKey === key) return;
          detailKey = key; const generation = ++detailGeneration; detailController?.abort();
          if (!summary?.artifactAvailable) {
            $('evaluation-result').replaceChildren(); renderedDetailKey = '';
            if (summary && ['complete','partial'].includes(summary.state)) {
              const copy = document.createElement('p'); copy.className = 'evaluation-copy'; copy.textContent = '原始结果已超出保留范围，摘要仍可查看。'; $('evaluation-result').append(copy);
            }
            return;
          }
          detailController = new AbortController(); const controller = detailController, id = activeId, kind = evaluationKind;
          const timer = setTimeout(() => controller.abort(), 7000);
          fetch('/model-check/evaluation?sessionId=' + encodeURIComponent(id) + '&recordId=' + encodeURIComponent(record.id) + '&kind=' + kind,
            { credentials:'same-origin', cache:'no-store', signal:controller.signal }).then(async response => {
              if (!response.ok) throw new Error('DETAIL_FAILED');
              const value = await response.json();
              if (!live || generation !== detailGeneration || id !== activeId || $('evaluation-drawer').hidden) return;
              if (value.recordId !== record.id || value.kind !== kind) throw new Error('STALE_DETAIL');
              renderEvaluationPayload(kind, value.payload, key);
            }).catch(() => { if (live && generation === detailGeneration && !controller.signal.aborted) {
              detailKey = ''; setText('evaluation-error','结果读取失败，请重试。'); $('evaluation-error').hidden = false;
            } }).finally(() => clearTimeout(timer));
        }
        function renderEvaluationPayload(kind, payload, key) {
          if (renderedDetailKey === key) return;
          renderedDetailKey = key; const container = $('evaluation-result'); container.replaceChildren();
          if (!payload) return;
          if (kind === 'candy') for (const [index, answer] of (payload.answers || []).entries()) {
            const row = document.createElement('details'), heading = document.createElement('summary'), text = document.createElement('pre');
            heading.textContent = `第 ${index + 1} 次 · ${answer.hit === null ? '请求失败' : answer.hit ? '命中 21' : '未命中 21'}`;
            text.textContent = answer.answer || answer.error || '没有回答'; row.append(heading, text); container.append(row);
          }
          if (kind === 'behavior' && payload.attribution) {
            const result = payload.attribution, message = document.createElement('p'); message.className = 'attribution-message'; message.textContent = result.message; container.append(message);
            const header = document.createElement('div'); header.className = 'behavior-row behavior-heading';
            for (const title of ['基准模型','JSD','p 值']) { const cell = document.createElement('span'); cell.textContent = title; header.append(cell); } container.append(header);
            for (const item of result.comparisons || []) {
              const row = document.createElement('div'); row.className = 'behavior-row'; row.dataset.nearest = String(item.model === result.nearest);
              for (const value of [displayModel(item.model), Number.isFinite(item.meanJSD) ? item.meanJSD.toFixed(3) : '—', Number.isFinite(item.pValue) ? item.pValue.toFixed(4) : '—']) {
                const cell = document.createElement('span'); cell.textContent = value; row.append(cell);
              } container.append(row);
            }
            const threshold = document.createElement('p'); threshold.className = 'evaluation-copy'; threshold.textContent = `显著性阈值 α = ${result.alpha?.toFixed(6) ?? '—'}`; container.append(threshold);
            for (const warning of result.warnings || []) { const note = document.createElement('p'); note.className = 'evaluation-copy'; note.textContent = warning; container.append(note); }
          }
          positionOverlays();
        }
        function openFrequency(anchor = $('frequency')) {
          if (!$('frequency-drawer').hidden) return closeFrequency();
          frequencyAnchor = anchor;
          closeHelp(); closeSkin(false); closeEvaluation(false); const schedule = state?.settings?.frequency ?? { mode: 'start' };
          shadow.querySelector(`input[name="frequency-mode"][value="${schedule.mode}"]`).checked = true;
          $('frequency-every').value = schedule.every ?? 5;
          $('frequency-drawer').hidden = false; $('frequency').setAttribute('aria-expanded', 'true');
          draftSchedule(); positionOverlays(); $('frequency-close').focus();
        }
        function closeHelp() {
          clearTimeout(helpTimer);
          if (helpAnchor) helpAnchor.setAttribute('aria-expanded', 'false');
          $('help-popover').hidden = true; helpAnchor = null; helpPinned = false;
        }
        function openHelp(anchor, pinned = false) {
          if (helpAnchor === anchor && pinned && helpPinned) return closeHelp();
          if (helpAnchor && helpAnchor !== anchor) helpAnchor.setAttribute('aria-expanded', 'false');
          clearTimeout(helpTimer); helpAnchor = anchor; helpPinned = pinned;
          setText('help-title', anchor.id === 'route-help' ? '响应路由说明' : anchor.id === 'request-help' ? '请求模型说明' : '指纹候选说明');
          setText('help-copy', anchor.id === 'request-help' ? '请求模型是本轮发送给提供商的模型名称，不代表服务端实际模型身份。'
            : anchor.id === 'route-help' ? '响应路由来自服务端明确返回的模型标签。未提供标签表示路由未知；刷新只重新读取已有状态，不会发起模型请求。'
            : `候选库内概率来自独立数字采样，不能认证本轮聊天的模型身份。当前数字库 ${state?.bank?.count ?? 0} 个模型，两库合并的相对概率尚未重新校准。少于 3 个有效样本或请求模型未收录时，结果存在局限。`);
          anchor.setAttribute('aria-expanded', 'true'); $('help-popover').hidden = false; positionOverlays();
        }
        function positionOverlays() {
          const box = panel.getBoundingClientRect(), drawer = $('frequency-drawer');
          const conversation = conversationBounds();
          for (const overlay of [drawer, $('evaluation-drawer'), $('skin-drawer')]) if (!overlay.hidden) {
            const width = overlay.getBoundingClientRect().width;
            const height = Math.min(overlay.scrollHeight, innerHeight - 60);
            const left = box.left - width - 8;
            const beside = left >= conversation.left + 8 ? left : box.right + width + 20 <= innerWidth ? box.right + 8 : box.left;
            overlay.style.left = Math.max(12, Math.min(innerWidth - width - 12, beside)) + 'px';
            overlay.style.top = Math.max(48, Math.min(innerHeight - height - 12, box.bottom - height)) + 'px';
          }
          if (helpAnchor && !$('help-popover').hidden) {
            const anchor = helpAnchor.getBoundingClientRect(), popup = $('help-popover');
            const bounds = popup.getBoundingClientRect();
            popup.style.left = Math.max(12, Math.min(innerWidth - bounds.width - 12, anchor.left - 6)) + 'px';
            popup.style.top = Math.max(12, anchor.bottom + bounds.height + 12 > innerHeight ? anchor.top - bounds.height - 6 : anchor.bottom + 6) + 'px';
          }
        }
        const outsidePointer = event => {
          const path = event.composedPath();
          if (!path.includes($('frequency-drawer')) && !path.includes($('frequency'))) closeFrequency(false);
          if (!path.includes($('skin-drawer')) && !path.includes($('skin'))) closeSkin(false);
          if (!path.includes($('help-popover')) && !path.includes(helpAnchor)) closeHelp();
        };
        const escape = event => {
          if (event.key !== 'Escape' || $('frequency-drawer').hidden && $('evaluation-drawer').hidden && $('skin-drawer').hidden && !helpAnchor) return;
          const anchor = helpAnchor; closeHelp(); closeFrequency(); closeSkin(); closeEvaluation(); anchor?.focus();
          event.preventDefault(); event.stopPropagation();
        };
        function updateSession() {
          const id = sessionFromStore();
          if (id === activeId) return;
          closeFrequency(false); closeSkin(false); closeHelp(); closeEvaluation(false); activeId = id; selectedRecordId = null; seenRevision = -1; state = null; showTab('live'); refresh();
        }
        function conversationBounds() {
          const visible = node => {
            const box = node.getBoundingClientRect();
            return box.width > 40 && box.height > 40 && box.right > 0 && box.bottom > 0
              && box.left < innerWidth && box.top < innerHeight && getComputedStyle(node).visibility !== 'hidden';
          };
          const find = selector => [...document.querySelectorAll(selector)].find(visible);
          const content = find('[data-content-phase]') || find('[data-conversation-scroll]');
          const column = content?.closest('[data-pane="conversation"], [class*="_centerCol"]')
            || find('[data-pane="conversation"], [class*="_centerCol"]');
          const sidebar = find('[data-pane="sidebar"], [class*="_sidebarCol"]');
          const header = !content && column ? [...column.querySelectorAll('header')].find(visible) : null;
          const nodes = [content, column, sidebar, header].filter(Boolean);
          if (nodes.length !== layoutNodes.length || nodes.some((node, index) => node !== layoutNodes[index])) {
            for (const node of layoutNodes) sizeObserver.unobserve(node);
            layoutNodes = nodes;
            for (const node of layoutNodes) sizeObserver.observe(node);
          }
          const box = (content || column)?.getBoundingClientRect();
          return {
            left: Math.max(0, box?.left ?? sidebar?.getBoundingClientRect().right ?? 6),
            top: Math.max(0, content ? box.top : header?.getBoundingClientRect().bottom ?? box?.top ?? 90),
            right: Math.min(innerWidth, box?.right ?? innerWidth),
            bottom: Math.min(innerHeight, box?.bottom ?? innerHeight),
          };
        }
        function position(x, y, bounds = conversationBounds()) {
          const width = host.getBoundingClientRect().width;
          const height = host.getBoundingClientRect().height;
          const gap = prefs.hidden ? 0 : 6;
          const nextX = Math.max(bounds.left + gap, Math.min(bounds.right - width - gap, x));
          const nextY = Math.max(bounds.top + 6, Math.min(bounds.bottom - height - 6, y));
          host.style.left = nextX + 'px'; host.style.top = nextY + 'px'; host.style.right = 'auto';
          positionOverlays();
        }
        const nearestSide = (left, width, bounds) => left + width / 2 > (bounds.left + bounds.right) / 2 ? 'right' : 'left';
        function clampPosition() {
          if (!live) return;
          const bounds = conversationBounds();
          host.style.setProperty('--mc-available-width', Math.max(0, bounds.right - bounds.left - 12) + 'px');
          host.style.setProperty('--mc-available-height', Math.max(0, bounds.bottom - bounds.top - 12) + 'px');
          if (prefs.previousPosition) {
            const previous = prefs.previousPosition;
            prefs.dockSide = previous.docked === false && Number.isFinite(previous.x)
              ? nearestSide(previous.x, prefs.minimized ? 186 : 278, bounds) : 'left';
            prefs.dockOffset = previous.hidden && Number.isFinite(previous.launcherOffset) ? Math.max(6, previous.launcherOffset)
              : previous.docked === false && Number.isFinite(previous.y) ? Math.max(6, previous.y - bounds.top) : 6;
            delete prefs.previousPosition;
          }
          const box = host.getBoundingClientRect();
          if (drag?.moved) { position(box.left, box.top, bounds); return; }
          host.dataset.dockSide = prefs.dockSide;
          const gap = prefs.hidden ? 0 : 6;
          position(prefs.dockSide === 'right' ? bounds.right - box.width - gap : bounds.left + gap,
            bounds.top + prefs.dockOffset, bounds);
        }
        function schedulePosition() {
          if (!live || positionFrame) return;
          positionFrame = requestAnimationFrame(() => { positionFrame = 0; clampPosition(); });
        }
        const header = shadow.querySelector('.header');
        const launcher = $('launcher');
        const pointerDown = event => {
          const handle = event.currentTarget;
          if (!live || event.button !== 0 || !event.isPrimary || handle === header && event.target.closest('button')) return;
          if (handle === launcher) suppressLauncherClick = false;
          const box = host.getBoundingClientRect();
          drag = { handle, pointerId:event.pointerId, dx:event.clientX - box.left, dy:event.clientY - box.top,
            x:event.clientX, y:event.clientY, moved:false, dockSide:prefs.dockSide, dockOffset:prefs.dockOffset };
          handle.setPointerCapture(event.pointerId);
        };
        const pointerMove = event => {
          if (!drag || event.pointerId !== drag.pointerId || !drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
          drag.moved = true; host.toggleAttribute('data-dragging', true);
          const bounds = conversationBounds();
          position(event.clientX - drag.dx, event.clientY - drag.dy, bounds);
          const box = host.getBoundingClientRect(); host.dataset.dockSide = nearestSide(box.left, box.width, bounds);
          event.preventDefault();
        };
        const pointerUp = event => {
          if (!drag || event.pointerId !== drag.pointerId) return;
          const finished = drag; drag = null; host.removeAttribute('data-dragging');
          if (finished.moved) {
            if (finished.handle === launcher) suppressLauncherClick = true;
            if (event.type === 'pointercancel') { prefs.dockSide = finished.dockSide; prefs.dockOffset = finished.dockOffset; }
            else {
              const bounds = conversationBounds(), box = host.getBoundingClientRect();
              prefs.dockSide = nearestSide(box.left, box.width, bounds);
              prefs.dockOffset = Math.max(6, box.top - bounds.top);
            }
            clampPosition(); savePrefs();
          }
          if (finished.handle.hasPointerCapture(finished.pointerId)) finished.handle.releasePointerCapture(finished.pointerId);
        };
        const visibility = () => { if (document.hidden) stopProbabilityMotion(); else { updateSession(); refresh(); } syncParticles(); };
        const resize = () => schedulePosition();
        const motionPreference = () => { if (motionQuery.matches) stopProbabilityMotion(); syncParticles(); };
        motionQuery.addEventListener('change', motionPreference);
        const sizeObserver = new ResizeObserver(() => { schedulePosition(); syncParticles(); });
        sizeObserver.observe(panel);
        const layoutObserver = new MutationObserver(records => {
          // Follow shell layout changes without measuring again for every streamed text token.
          if (records.some(({ target }) => target !== host && !host.contains(target)
            && (!layoutNodes.length || layoutNodes.some(node => !node.isConnected || target === node || target.contains(node))))) schedulePosition();
        });
        layoutObserver.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class','style','hidden','data-sidebar-collapsed'] });
        for (const handle of [header, launcher]) {
          handle.addEventListener('pointerdown', pointerDown); handle.addEventListener('pointermove', pointerMove);
          handle.addEventListener('pointerup', pointerUp); handle.addEventListener('pointercancel', pointerUp);
          handle.addEventListener('lostpointercapture', pointerUp);
        }
        window.addEventListener('resize', resize); document.addEventListener('visibilitychange', visibility);
        $('hide').onclick = () => { setHidden(true); $('launcher').focus(); };
        launcher.onclick = event => {
          if (suppressLauncherClick && event.detail > 0) { suppressLauncherClick = false; event.preventDefault(); return; }
          suppressLauncherClick = false; setCompact(false); setHidden(false); refresh(); $('compact').focus();
        };
        $('compact').onclick = () => setCompact(!prefs.minimized);
        $('main-check-tab').onclick = () => { selectedRecordId = null; showTab('live'); };
        $('details-toggle').onclick = () => { closeHelp(); setDetailsExpanded(!detailsExpanded); };
        $('live-tab').onclick = () => { selectedRecordId = null; showTab('live'); };
        $('history-tab').onclick = () => { setCompact(false); selectedRecordId = null; showTab(tab === 'history' ? 'live' : 'history'); };
        $('back-history').onclick = () => { selectedRecordId = null; showTab('history'); };
        $('check').onclick = () => action({ action:'check', recordId:state?.record?.id }); $('cancel').onclick = () => action({ action:'cancel', recordId:state?.record?.id });
        for (const kind of ['candy','behavior']) {
          $('open-' + kind).onclick = () => openEvaluation(kind);
          $(kind + '-tab').onclick = () => openEvaluation(kind, evaluationAnchor);
          $(kind + '-tab').onkeydown = event => {
            const kinds = ['candy','behavior'].filter(item => !$(item + '-tab').disabled), index = kinds.indexOf(kind);
            const next = event.key === 'ArrowRight' ? (index + 1) % kinds.length : event.key === 'ArrowLeft' ? (index + kinds.length - 1) % kinds.length : event.key === 'Home' ? 0 : event.key === 'End' ? kinds.length - 1 : -1;
            if (next < 0) return; event.preventDefault(); openEvaluation(kinds[next], evaluationAnchor); $(kinds[next] + '-tab').focus();
          };
        }
        $('evaluation-close').onclick = () => closeEvaluation();
        $('candy-runs').oninput = renderEvaluation;
        $('behavior-mode').onchange = renderEvaluation;
        $('evaluation-cancel').onclick = () => action({ action:'cancel', recordId:state?.record?.id });
        $('evaluation-start').onclick = async () => {
          if (evaluationKind === 'behavior' && selected()?.behaviorUnavailableReason) return feedback(behaviorBlockedMessage);
          const runs = $('candy-runs').valueAsNumber;
          if (evaluationKind === 'candy' && (!Number.isInteger(runs) || runs < 1 || runs > 10)) {
            setText('evaluation-error','请输入 1–10 的整数次数。'); $('evaluation-error').hidden = false; return;
          }
          $('evaluation-start').disabled = true;
          await action({ action:evaluationKind === 'candy' ? 'check' : 'evaluate', recordId:state?.record?.id, kind:evaluationKind, runs, mode:$('behavior-mode').value }); renderEvaluation();
        };
        $('refresh').onclick = () => { seenRevision = -1; refresh(); };
        $('frequency').onclick = () => openFrequency($('frequency')); $('frequency-close').onclick = () => closeFrequency();
        $('skin').onclick = openSkin; $('skin-close').onclick = () => closeSkin();
        for (const input of shadow.querySelectorAll('input[name="skin"]')) input.onchange = () => applySkin(input.value);
        $('frequency-every').oninput = draftSchedule;
        for (const input of shadow.querySelectorAll('input[name="frequency-mode"]')) input.onchange = draftSchedule;
        $('frequency-form').onsubmit = async event => {
          event.preventDefault(); if (savingFrequency) return;
          const schedule = draftSchedule();
          if (schedule.mode === 'interval' && (!Number.isInteger(schedule.every) || schedule.every < 1 || schedule.every > 1000)) {
            setText('frequency-error', '请输入 1–1000 的整数轮数。'); $('frequency-error').hidden = false; return;
          }
          const id = activeId; savingFrequency = true; $('frequency-save').disabled = true;
          try {
            const saved = await action({ action: 'frequency', frequency: schedule });
            if (id === activeId && live) {
              if (saved) closeFrequency();
              else { setText('frequency-error', '保存失败，请重试。'); $('frequency-error').hidden = false; }
            }
          } finally { savingFrequency = false; if (live) $('frequency-save').disabled = false; }
        };
        for (const id of ['request-help', 'route-help', 'fingerprint-help']) {
          const anchor = $(id);
          anchor.onmouseenter = () => openHelp(anchor);
          anchor.onfocus = () => { if (helpAnchor !== anchor) openHelp(anchor); };
          anchor.onmouseleave = anchor.onblur = () => { if (!helpPinned) helpTimer = setTimeout(closeHelp, 140); };
          anchor.onclick = () => openHelp(anchor, true);
        }
        $('help-popover').onmouseenter = () => clearTimeout(helpTimer);
        $('help-popover').onmouseleave = () => { if (!helpPinned) helpTimer = setTimeout(closeHelp, 140); };
        shadow.querySelector('.body').addEventListener('scroll', positionOverlays);
        document.addEventListener('pointerdown', outsidePointer, true); document.addEventListener('keydown', escape, true);
        const unsubscribe = ctx.sessions.list.subscribe(updateSession);
        const unsubscribeTheme = ctx.on('theme/change', () => { if (live) applySkin(prefs.skin, false); });
        applySkin(prefs.skin, false); setHidden(Boolean(prefs.hidden)); setDetailsExpanded(Boolean(prefs.expanded), false); setCompact(Boolean(prefs.minimized)); clampPosition();
        activeId = sessionFromStore(); refresh();
        pollTimer = setInterval(() => { if (!document.hidden) { updateSession(); refresh(); } }, 1200);
        return () => {
          live = false; drag = null; clearInterval(pollTimer); clearTimeout(helpTimer); stopProbabilityMotion(); stopParticles(); requestController?.abort(); closeEvaluation(false);
          motionQuery.removeEventListener('change', motionPreference);
          sizeObserver.disconnect(); layoutObserver.disconnect(); cancelAnimationFrame(positionFrame);
          if (typeof unsubscribe === 'function') unsubscribe();
          if (typeof unsubscribeTheme === 'function') unsubscribeTheme();
          window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility);
          document.removeEventListener('pointerdown', outsidePointer, true); document.removeEventListener('keydown', escape, true); host.remove();
        };
      });
    }
    return { inject: ['sessions', 'theme'], apply };
  },
});
