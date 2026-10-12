window.__ModuleLoader__.load({
  id: 'dsh-model-check',
  factory: () => {
    const CSS = ":host {\n  --mc-bg:#eff8f4; --mc-surface:#e5f1ed; --mc-ink:#163849; --mc-muted:#536c7e;\n  --mc-mint:#76ffce; --mc-teal:#087f73; --mc-silver:#c4c5d4; --mc-gold:#956035;\n  --mc-line:#bddbd7; --mc-match:#087f73; --mc-mismatch:#b74c2a;\n  --mc-header-edge:#bcc7ad; --mc-header:#eaf7f8;\n  position:fixed; top:96px; left:12px; z-index:10020; display:block; width:278px;\n  max-width:min(calc(100vw - 24px),var(--mc-available-width,100vw)); font:12px/1.5 'Segoe UI','Microsoft YaHei',sans-serif;\n  color:var(--mc-ink); color-scheme:light; pointer-events:none;\n}\n*{box-sizing:border-box}\nbutton,input,select{font:inherit}\nbutton{cursor:pointer;color:inherit;touch-action:manipulation}\nbutton:disabled{cursor:default;opacity:.48}\nbutton:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #159c90;outline-offset:3px}\nbutton,section,h2{margin:0}\nsvg{display:block;width:18px;height:18px;stroke-width:1.7;flex:none}\nbutton svg{width:16px;height:16px}\n[hidden]{display:none!important}\n.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}\n.panel-shell{filter:drop-shadow(0 12px 18px #051e3147)}\n.panel{--mc-corner:12px;position:relative;isolation:isolate;pointer-events:auto;overflow:hidden;border:1px solid #a9ccc5;border-radius:0;background:#a9ccc5;clip-path:polygon(var(--mc-corner) 0,calc(100% - var(--mc-corner)) 0,100% var(--mc-corner),100% calc(100% - var(--mc-corner)),calc(100% - var(--mc-corner)) 100%,var(--mc-corner) 100%,0 calc(100% - var(--mc-corner)),0 var(--mc-corner));max-height:calc(100vh - 60px);max-height:calc(100dvh - 60px);display:flex;flex-direction:column}\n.panel::before{content:\"\";position:absolute;inset:0;z-index:-3;background:var(--mc-bg);clip-path:polygon(calc(var(--mc-corner) - 1px) 0,calc(100% - var(--mc-corner) + 1px) 0,100% calc(var(--mc-corner) - 1px),100% calc(100% - var(--mc-corner) + 1px),calc(100% - var(--mc-corner) + 1px) 100%,calc(var(--mc-corner) - 1px) 100%,0 calc(100% - var(--mc-corner) + 1px),0 calc(var(--mc-corner) - 1px))}\n.panel::after{content:\"\";position:absolute;inset:0;z-index:8;pointer-events:none;border:18px solid transparent;border-image-source:var(--mc-frame);border-image-slice:100;border-image-width:18px;border-image-repeat:stretch}\n.header{position:relative;display:flex;align-items:center;gap:5px;height:70px;padding:14px 12px 8px;flex:none;cursor:grab;touch-action:none;user-select:none}\n.header:active{cursor:grabbing}\n.character-crop{position:absolute;right:2px;top:0;width:34%;height:72px;overflow:hidden;pointer-events:none;z-index:-2;mask-image:linear-gradient(to right,transparent,#000 25%),linear-gradient(to bottom,#000 65%,transparent);mask-composite:intersect}\n.character-crop img{position:absolute;width:900px;max-width:none;height:auto;left:-374px;top:-374px}\n.header-ribbons{position:absolute;inset:0 0 auto;height:70px;background-image:var(--mc-ribbons);background-size:100% 100%;pointer-events:none;z-index:-1;opacity:.75}\n.emblem{width:20px;height:32px;flex:none;display:grid;place-items:center}\n.wing-mark{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none}\n.brand{min-width:0;position:relative;padding-right:4px}\n.brand strong{display:block;font:700 19px/1.15 'Segoe UI',Arial,sans-serif;letter-spacing:-.025em;white-space:nowrap}\n.brand small{display:block;font-size:10px;line-height:1.4;color:var(--mc-muted);margin-top:3px;letter-spacing:.08em}\n.header-actions{--mc-controls-height:30px;position:absolute;right:0;top:0;z-index:7;isolation:isolate;display:flex;gap:0;align-items:center;justify-content:center;width:60px;height:var(--mc-controls-height);padding:1px 6px;background:var(--mc-header-edge);border-radius:0;overflow:hidden;clip-path:polygon(0 0,calc(100% - var(--mc-corner)) 0,100% var(--mc-corner),100% 100%,var(--mc-corner) 100%,0 calc(100% - var(--mc-corner)))}\n.header-actions::before{content:\"\";position:absolute;inset:1px;z-index:-1;background:var(--mc-header);clip-path:polygon(0 0,calc(100% - var(--mc-corner) + .6px) 0,100% calc(var(--mc-corner) - .6px),100% 100%,calc(var(--mc-corner) - .6px) 100%,0 calc(100% - var(--mc-corner) + .6px))}\n.icon-button{width:26px;height:26px;padding:4px;border:1px solid transparent;background:transparent;border-radius:5px;display:grid;place-items:center}\n.icon-button:hover{background:#d4eeE7;border-color:#a7d4cb}\n.header-actions .icon-button{width:24px;height:28px;padding:5px;border:0;border-radius:0;color:var(--mc-muted);flex:none}\n.header-actions .icon-button svg{width:13px;height:13px;stroke-width:1.8}\n.header-actions .icon-button:hover{color:#123f51;background:#d6edec}\n.header-actions #hide:hover{color:#a94327;background:#f9e4dc}\n.header-actions .icon-button:focus-visible{outline:2px solid var(--mc-teal);outline-offset:-3px}\n.main-tabs{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;height:32px;flex:none;margin:0 10px 3px;padding:3px;border:1px solid transparent;border-radius:4px;background:transparent;gap:3px}\n.main-tabs>button{position:relative;min-width:0;border:0;border-radius:0;background:transparent;padding:1px 4px 2px;color:var(--mc-muted);font-size:12px;line-height:1.5;white-space:nowrap}\n.main-tabs>button[aria-pressed=true],.main-tabs>button[aria-expanded=true]{font-weight:700;color:var(--mc-ink);box-shadow:inset 0 -3px #37bda5}\n.main-tabs>button:hover:not(:disabled){color:var(--mc-teal)}\n.main-tabs>button:focus-visible{outline-offset:0}\n.details-toggle{position:relative;isolation:isolate;display:grid;place-items:center;width:225px;max-width:100%;height:18px;margin:2px auto 5px;padding:0;border:0;border-radius:0;color:var(--mc-teal);background:var(--mc-line);clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,10px 100%)}\n.details-toggle::before{content:\"\";position:absolute;inset:1px;z-index:-1;background:var(--mc-bg);clip-path:polygon(0 0,100% 0,calc(100% - 9px) 100%,9px 100%)}\n.details-toggle:hover::before{background:var(--mc-surface)}\n.details-toggle svg{width:16px;height:16px;stroke-width:2}\n.details-toggle:focus-visible{outline-offset:-3px}\n.body{position:relative;padding:7px 10px 0;overflow-y:auto;overflow-x:hidden;min-height:0;flex:1 1 auto;scrollbar-width:none}\n.body::-webkit-scrollbar{display:none;width:0;height:0}\n.probability{padding:7px 9px 8px;border:1px solid #426d7a;border-radius:7px;background:#0b1d2a;color:#f0faf7}\n.section-label{display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:10.5px;line-height:1.3;color:#afc6ca;margin-bottom:3px;white-space:nowrap}\n.help-label{display:inline-flex;align-items:center;gap:3px}\n.help-button{display:inline-grid;place-items:center;width:14px;height:14px;border:0;background:transparent;color:#78bdc5;padding:0;flex:none;border-radius:3px}\n.help-button svg{width:14px;height:14px}\n.help-button:hover,.help-button[aria-expanded=true]{background:#70dedb24}\n.candidate-head{display:flex;gap:6px;justify-content:space-between;align-items:baseline;margin-bottom:4px}\n.candidate-name{font:700 19px/1.2 Arial,'Microsoft YaHei',sans-serif;letter-spacing:-.02em;overflow-wrap:anywhere;min-width:0}\n.percent{font:700 27px/1.05 Arial,sans-serif;font-variant-numeric:tabular-nums;color:var(--mc-prob-color,#a5b9b9);white-space:nowrap;letter-spacing:-.02em;flex:none;transition:color .2s ease}\n.percent small{font-size:15px;letter-spacing:0;margin-left:1px}\n#probability-result[data-samples=\"1\"],.history-row[data-samples=\"1\"],.compact-summary[data-samples=\"1\"]{--mc-prob-color:#ffa66b}\n#probability-result[data-samples=\"2\"],.history-row[data-samples=\"2\"],.compact-summary[data-samples=\"2\"]{--mc-prob-color:#ffd16d}\n#probability-result[data-samples=\"3\"],.history-row[data-samples=\"3\"],.compact-summary[data-samples=\"3\"]{--mc-prob-color:#76ffce}\n.bar{height:5px;border-radius:6px;background:#263d4d;overflow:hidden;min-width:0}\n.bar i{display:block;height:100%;border-radius:inherit;background:#70dedb}\n.primary-bar{height:9px}\n.primary-bar i,.compact-bar i{background:linear-gradient(90deg,#079e9c 0%,#22c1aa 28%,#5ce0bb 54%,#20bca6 78%,#078e90 100%);position:relative;overflow:hidden;transform-origin:left center}\n#primary-particles{position:absolute;inset:0;width:100%;height:100%;border-radius:inherit;pointer-events:none}\n.candidate-bars{margin-top:7px;display:grid;gap:5px}\n.candidate-row{display:grid;grid-template-columns:minmax(0,86px) minmax(18px,1fr) 47px;gap:2px;align-items:center;font:14px/1.3 Arial,'Microsoft YaHei',sans-serif;color:#c4cdda}\n.candidate-row span{overflow-wrap:anywhere;min-width:0}\n.candidate-row b{font:600 16px/1.1 Arial,sans-serif;font-variant-numeric:tabular-nums;text-align:right;color:#c4cdda;white-space:nowrap}\n.candidate-row .bar{height:5px}\n.candidate-bars .bar{width:90%;justify-self:end}\n.empty-copy{font-size:10px;line-height:1.7;color:var(--mc-muted);margin:8px 0}\n.probability .empty-copy{color:#afc6ca;min-height:55px}\n.progress{color:#70dedb;font-size:10px}\n.track{height:4px;background:#c7dfd9;border-radius:3px;margin-top:8px;overflow:hidden}\n.track i{height:100%;display:block;background:#26b9a3;transition:width .2s ease}\n.probability .track{background:#263d4d}\n.combined-result{position:relative;display:grid;grid-template-columns:30px minmax(0,1fr) auto;column-gap:6px;align-items:start;padding:9px 3px 2px;min-height:41px}\n.candy-mark{width:30px;height:30px;object-fit:contain;margin-top:0;pointer-events:none}\n.candy-copy h2{font-size:12px;font-weight:700;line-height:1.3;white-space:nowrap}\n.text-button{border:0;background:transparent;color:var(--mc-teal);display:inline-flex;align-items:center;gap:4px;padding:0;font-size:10px;text-align:left}\n.text-button:hover{color:#075e59;text-decoration:underline}\n.candy-copy .text-button{display:flex;font-size:10px;font-weight:600;margin-top:1px;line-height:1.4;gap:3px;min-height:14px}\n.candy-copy .text-button svg{width:10px;height:10px}\n.combined-result strong{font-size:16px;line-height:1.35;color:var(--mc-ink);text-align:right;max-width:125px;overflow-wrap:anywhere}\n.combined-result strong[data-state=failed],.combined-result strong[data-state=partial],.combined-result strong[data-state=cancelled]{font-size:11px;color:var(--mc-mismatch)}\n.combined-result strong[data-state=idle],.combined-result strong[data-state=running],.combined-result strong[data-state=queued]{font-size:11px;color:var(--mc-muted)}\n.combined-status{grid-column:2 / -1;margin:6px 0 0;font-size:9px;color:var(--mc-muted);overflow-wrap:anywhere}\n.combined-result .track{grid-column:1 / -1}\n.ornament-divider{height:9px;background-image:var(--mc-divider);background-size:100% auto;background-position:center;pointer-events:none}\n.route{padding:0 2px;display:grid}\n.route-row{display:grid;grid-template-columns:18px 58px minmax(0,1fr);gap:6px;align-items:center;padding:5px 1px;min-height:30px;border-bottom:1px solid #bddbd780}\n.route-row:last-child{border-bottom:0}\n.route-symbol{color:var(--mc-muted);display:grid;place-items:start}\n.route-symbol svg{width:18px;height:18px}\n.route-label{border:0;background:transparent;padding:0;color:var(--mc-muted);font-size:12px;line-height:1.35;text-align:left;white-space:nowrap}\nbutton.route-label:hover,button.route-label[aria-expanded=true]{color:var(--mc-teal);text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}\n.model{font:500 14px/1.35 'Segoe UI',Arial,'Microsoft YaHei',sans-serif;display:block;overflow-wrap:anywhere;min-width:0}\n[data-route-state=match]{color:var(--mc-match)!important}\n[data-route-state=mismatch]{color:var(--mc-mismatch)!important}\n[data-route-state=unknown]{color:var(--mc-muted)!important}\n.controls{position:relative;margin:0 10px;padding:5px 5px 14px;flex:none;display:grid;gap:5px;border:1px solid #bfdcd6;border-radius:7px 7px 0 0;border-bottom:0}\n.control-actions{display:grid;grid-template-columns:78px minmax(0,1fr);gap:6px;min-width:0}\n.primary-actions{display:flex;min-width:0}\n.primary-actions .action{width:100%}\n.action,.history-button{min-width:0;border:1px solid #a9c9c4;background:#e9f3f0;border-radius:6px;padding:8px 12px;font-size:12px;line-height:1.3;display:flex;align-items:center;justify-content:center;gap:9px}\n.control-actions .action,.history-button{min-height:34px;font-size:14px;padding:3px 6px;gap:5px}\n.history-button{color:var(--mc-muted);gap:7px}\n.history-button svg{width:20px;height:20px}\n.history-button:hover,.history-button[aria-pressed=true]{background:#d4ece5;border-color:#61ad9e;color:#175348}\n.action.primary{color:#f4fffb;border-color:#51808a;background:#16434e;box-shadow:inset 0 0 0 1px #b1e1dc24;font-weight:600}\n.action.primary:hover:not(:disabled){background:#205a61;border-color:#268f84}\n.action .wing-mark{width:20px;height:25px;flex:none}\n.action.cancel{color:#a7482d;border-color:#d19a81;background:#fff0e5}\n.control-settings{display:grid;grid-template-columns:minmax(0,1fr) 60px;gap:5px}\n.frequency-trigger,.skin-trigger{display:flex;align-items:center;gap:4px;width:100%;min-width:0;min-height:27px;padding:3px 5px;text-align:left;background:#e9f6f1;border:1px solid #8fbfbd;border-radius:6px;color:#335568;font-size:11px;line-height:1.4}\n.frequency-trigger>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.frequency-trigger>svg:first-child{width:17px;height:17px}\n.frequency-trigger>svg:last-child{width:13px;height:13px}\n.skin-trigger{justify-content:center;white-space:nowrap}\n.skin-trigger svg{width:15px;height:15px}\n.frequency-trigger:hover,.frequency-trigger[aria-expanded=true],.skin-trigger:hover,.skin-trigger[aria-expanded=true]{color:#087f72;border-color:#328e85;background:#dff2ea}\n.feedback{font-size:10px;color:var(--mc-mismatch);margin:8px 3px;overflow-wrap:anywhere}\n.expanded{height:680px}\n.expanded-details{padding:14px 5px 16px;border-top:1px solid var(--mc-line)}\n.details-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;font-weight:600}\n.details{display:grid;grid-template-columns:65px minmax(0,1fr);gap:8px;font-size:10px;margin:12px 0}\n.details dt{color:var(--mc-muted)}\n.details dd{margin:0;min-width:0;overflow-wrap:anywhere;color:var(--mc-ink);font-family:'Cascadia Code','Microsoft YaHei',Consolas,monospace}\n.details dd.route-source{color:var(--mc-teal)}\n.distribution{padding:12px;border-radius:8px;background:#0b1d2a;color:#c4cdda}\n.distribution>strong{font-size:10px;font-weight:500;color:#afc6ca}\n#distribution-bars{display:grid;gap:9px;margin-top:10px}\n.distribution .candidate-row{font-size:10px;grid-template-columns:minmax(0,1fr) minmax(30px,1fr) 48px}\n.distribution .candidate-row b{font-size:11px}\n.record-context{display:flex;justify-content:space-between;align-items:center;gap:6px;margin:0 0 9px;font-size:9px;color:var(--mc-gold)}\n.history-mode{height:550px}\n.history{display:grid;gap:0}\n.history-row{min-width:0;width:100%;border:0;border-bottom:1px solid var(--mc-line);border-radius:0;background:transparent;padding:14px 4px;text-align:left}\n.history-row:hover{background:#ddf0e7}\n.history-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--mc-muted);font-size:9px;margin-bottom:7px}\n.history-status{color:var(--mc-teal);font-size:9px}\n.history-row[data-key=warn] .history-status,.history-row[data-key=error] .history-status{color:var(--mc-mismatch)}\n.history-row[data-key=muted] .history-status{color:var(--mc-muted)}\n.history-fingerprint{display:flex;align-items:center;justify-content:space-between;gap:6px;border-radius:5px;background:#0b1d2a;padding:7px 9px}\n.history-name{color:#eef9f6;font-size:13px;font-weight:650;min-width:0;overflow-wrap:anywhere}\n.history-prob{color:var(--mc-prob-color,#a5b9b9);font:600 15px/1.4 Arial,sans-serif;white-space:nowrap;flex:none}\n.history-sample{margin:7px 0 0;color:var(--mc-muted);font-size:9px;line-height:1.5;overflow-wrap:anywhere}\n.history-sample.warn{color:var(--mc-mismatch)}\n.history-route{display:grid;grid-template-columns:76px minmax(0,1fr);gap:5px 8px;margin:9px 0 0;font-size:11px}\n.history-route dt{color:var(--mc-muted);white-space:nowrap}\n.history-route dd{margin:0;color:var(--mc-ink);overflow-wrap:anywhere;min-width:0;font-size:12px;line-height:1.35;font-weight:500}\n.history-route-note,.history-title{margin:7px 0 0;color:var(--mc-muted);font-size:9px;line-height:1.5}\n.empty-history{padding:24px 0;text-align:center;color:var(--mc-muted);font-size:11px}\n.frequency-drawer,.evaluation-drawer,.skin-drawer,.help-popover{position:fixed;pointer-events:auto;overflow:auto;scrollbar-width:thin;scrollbar-color:#9ebfb9 transparent;border:1px solid #9bc9bc;border-radius:12px;background:#f0f8f4;box-shadow:0 12px 48px #072e3940;color:var(--mc-ink)}\n.frequency-drawer{width:300px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 60px);padding:18px;z-index:3}\n.skin-drawer{width:254px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 60px);padding:16px;z-index:3}\n.skin-options{display:grid;gap:7px;border:0;padding:0;margin:0}\n.skin-option{display:flex;align-items:center;gap:10px;min-height:57px;padding:9px 10px;border:1px solid var(--mc-line);border-radius:6px;cursor:pointer;background:var(--mc-bg)}\n.skin-option:hover{background:var(--mc-surface)}\n.skin-option:has(input:checked){border-color:var(--mc-teal);background:var(--mc-surface)}\n.skin-option:has(input:focus-visible){outline:2px solid var(--mc-teal);outline-offset:2px}\n.skin-option input{order:3;flex:none;width:13px;height:13px;margin:0 0 0 auto;accent-color:var(--mc-teal)}\n.skin-symbol{display:grid;place-items:center;width:22px;height:25px;flex:none;color:var(--mc-teal)}\n.skin-symbol svg{width:20px;height:20px}\n.skin-symbol .wing-mark{width:18px;height:25px;object-fit:contain}\n.skin-copy{display:grid;gap:3px;min-width:0}\n.skin-copy strong{font-size:12px;font-weight:600}\n.skin-copy small{font-size:10px;color:var(--mc-muted)}\n.drawer-heading{display:flex;align-items:center;justify-content:space-between;gap:8px}\n.drawer-heading strong{font-size:13px;font-weight:650}\n.drawer-subtitle{font-size:10px;color:var(--mc-muted);margin:5px 0 15px;overflow-wrap:anywhere}\n.frequency-drawer fieldset{margin:0;padding:0;border:0}\n.frequency-option{display:flex;align-items:center;gap:9px;font-size:11px;margin:15px 0;cursor:pointer;color:var(--mc-muted)}\n.frequency-option:has(input:checked){color:var(--mc-teal);font-weight:600}\n.frequency-option input{accent-color:var(--mc-teal);width:13px;height:13px;margin:0;flex:none}\n.interval-field{display:flex;align-items:center;gap:7px;margin:0 0 14px 24px;font-size:10px;color:var(--mc-muted)}\n.interval-field input,.evaluation-setup input,.evaluation-setup select{min-width:0;padding:6px 8px;border:1px solid #a7cbc3;border-radius:5px;background:#fff;color:var(--mc-ink)}\n.interval-field input{width:62px}\n.interval-field input:disabled{opacity:.5}\n.schedule-note,.drawer-cost{font-size:10px;line-height:1.65;color:var(--mc-muted);margin:12px 0;overflow-wrap:anywhere}\n.schedule-note{padding-top:12px;border-top:1px solid var(--mc-line)}\n.drawer-cost{font-size:9px}\n.drawer-error{font-size:10px;color:var(--mc-mismatch);margin:7px 0}\n.frequency-drawer .action{width:100%;margin-top:15px}\n.help-popover{z-index:4;width:280px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);padding:13px 14px;font-size:10px;line-height:1.7;color:var(--mc-muted)}\n.help-popover strong{color:var(--mc-teal);font-size:11px;font-weight:600}\n.help-popover p{margin:5px 0 0}\n.launcher{position:relative;isolation:isolate;pointer-events:auto;display:none;align-items:center;justify-content:center;width:21px;height:82px;color:var(--mc-teal);border:0;border-radius:0;background:#9cbeb3;padding:0;clip-path:polygon(0 0,100% 14px,100% calc(100% - 14px),0 100%);cursor:grab;touch-action:none;user-select:none}\n.launcher::before{content:\"\";position:absolute;inset:1px;z-index:-1;background:var(--mc-bg);clip-path:polygon(0 0,100% 13px,100% calc(100% - 13px),0 100%)}\n.launcher svg{width:18px;height:18px;transform:rotate(-90deg);stroke-width:2}\n.launcher:hover::before{background:#d1f3e8}\n.launcher:focus-visible{outline-offset:-4px}\n:host([data-dragging]) .launcher{cursor:grabbing}\n:host([data-dock-side=\"right\"]) .launcher{clip-path:polygon(0 14px,100% 0,100% 100%,0 calc(100% - 14px))}\n:host([data-dock-side=\"right\"]) .launcher::before{clip-path:polygon(0 13px,100% 0,100% 100%,0 calc(100% - 13px))}\n:host([data-dock-side=\"right\"]) .launcher svg{transform:rotate(90deg)}\n:host([data-minimized]){width:186px}\n:host([data-hidden]){width:21px}\n:host([data-hidden]) .panel{display:none}\n:host([data-hidden]) .launcher{display:flex}\n.panel{max-height:min(calc(100dvh - 24px),var(--mc-available-height,calc(100dvh - 60px)))}\n.compact-summary{display:none;margin:0 9px 13px;padding:7px 8px 8px;border:1px solid #426d7a;border-radius:5px;background:#0b1d2a;color:#eef9f6}\n.compact-candidate{display:flex;align-items:baseline;justify-content:space-between;gap:5px}\n#compact-model{min-width:0;font:600 12px/1.3 Arial,'Microsoft YaHei',sans-serif;overflow-wrap:anywhere}\n#compact-probability{flex:none;font:700 16px/1.2 Arial,sans-serif;font-variant-numeric:tabular-nums;color:var(--mc-prob-color,#a5b9b9)}\n.compact-bar{height:3px;margin-top:6px}\n.minimized{height:auto}\n.minimized .header{height:34px;padding:5px 10px;gap:4px}\n.minimized .header-actions{--mc-controls-height:26px;width:52px}\n.minimized .header-actions .icon-button{width:20px;height:24px;padding:4px}\n.minimized .header-actions .icon-button svg{width:12px;height:12px}\n.minimized .brand strong{font-size:12px}\n.minimized .brand small,.minimized .character-crop,.minimized .header-ribbons,.minimized .main-tabs,.minimized .body,.minimized .controls{display:none}\n.minimized .emblem{width:12px;height:18px}\n.minimized .compact-summary{display:block}\n.evaluation-entry{padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid var(--mc-line)}\n.evaluation-entry .details-heading span{font-size:9px;color:var(--mc-muted)}\n.evaluation-drawer{width:296.4px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 60px);padding:18px;z-index:3}\n.evaluation-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin:10px 0 16px}\n.evaluation-tabs button{min-width:0;padding:9px 5px;border:1px solid #b4d3cb;border-radius:6px;background:#e8f3ee;color:var(--mc-muted);font-size:11px}\n.evaluation-tabs button:hover{border-color:#58a693;color:var(--mc-teal)}\n.evaluation-tabs button[aria-selected=true]{background:#d4ece3;color:#157c6e;border-color:#74b9a5;font-weight:600}\n.evaluation-setup label{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11px;color:var(--mc-muted)}\n.evaluation-setup input{width:72px}\n.evaluation-setup select{max-width:75%;font-size:10px}\n.evaluation-copy{font-size:10px;line-height:1.65;color:var(--mc-muted);margin:11px 0;overflow-wrap:anywhere}\n.evaluation-warning{font-size:10px;line-height:1.65;color:#8a442a;background:#fff3e5;border:1px solid #e6c4a0;border-radius:6px;padding:8px 10px;margin:11px 0;overflow-wrap:anywhere}\n.evaluation-actions{display:flex;gap:8px;margin:15px 0}\n.evaluation-actions .action{flex:1;min-height:38px;font-size:11px}\n.evaluation-summary{font-size:11px;color:var(--mc-teal);padding-top:13px;border-top:1px solid var(--mc-line);margin-bottom:9px}\n.evaluation-summary[data-state=failed],.evaluation-summary[data-state=partial]{color:var(--mc-mismatch)}\n.evaluation-result{font-size:11px;overflow-wrap:anywhere}\n.evaluation-result details{border-bottom:1px solid var(--mc-line);padding:10px 0}\n.evaluation-result summary{color:var(--mc-ink);cursor:pointer}\n.evaluation-result pre{font:10px/1.7 Consolas,'Microsoft YaHei',monospace;white-space:pre-wrap;overflow-wrap:anywhere;max-height:240px;overflow:auto;color:var(--mc-muted);margin:10px 0}\n.attribution-message{color:var(--mc-teal);font-size:12px;line-height:1.65;margin:12px 0}\n.behavior-row{display:grid;grid-template-columns:minmax(0,1fr) 52px 64px;gap:7px;padding:7px 0;border-bottom:1px solid #bddbd777;font:10px/1.4 Consolas,'Microsoft YaHei',monospace;font-variant-numeric:tabular-nums;color:var(--mc-ink)}\n.behavior-row span:nth-child(n+2){text-align:right}\n.behavior-row[data-nearest=true]{color:var(--mc-teal);font-weight:600}\n.behavior-heading{color:var(--mc-muted)}\n.evaluation-source{font-size:9px;color:var(--mc-muted);padding-top:13px;margin:13px 0 0;border-top:1px solid var(--mc-line)}\n.evaluation-source a{color:var(--mc-teal)}\n/* The additional armor skins share layout, controls and local-only preferences. */\n:host([data-skin=light]){--mc-bg:#e9e9e5;--mc-surface:#dcdfdd;--mc-ink:#353c47;--mc-muted:#626b76;--mc-line:#b9c2c4;--mc-teal:#256d68;--mc-match:#21776c;--mc-mismatch:#b04c30;--mc-gold:#707581;--mc-card:#252e38;--mc-card-line:#5b727e;--mc-control:#e4e7e4;--mc-hover:#d2ded9;--mc-control-line:#a5b8b6;--mc-input:#f5f5f1;--mc-header-edge:#aebec3;--mc-header:#e4e7e6;--mc-primary:#344d55;--mc-primary-hover:#3c6167;--mc-primary-ink:#f0faf5;--mc-frame-border:#9aaeb8;--mc-warning-bg:#f1e3d2;--mc-warning-line:#cbb495;--mc-warning-ink:#7c442b}\n:host([data-skin=dark]){--mc-bg:#0b131c;--mc-surface:#14252e;--mc-ink:#e4eeeb;--mc-muted:#9bacb9;--mc-line:#2c4553;--mc-teal:#81e6d2;--mc-match:#7bedd1;--mc-mismatch:#ff9870;--mc-gold:#a9b7c6;--mc-card:#08131e;--mc-card-line:#375d6f;--mc-control:#111f29;--mc-hover:#203c43;--mc-control-line:#3c606b;--mc-input:#0b1721;--mc-header-edge:#426474;--mc-header:#132630;--mc-primary:#78e6d0;--mc-primary-hover:#a2f6df;--mc-primary-ink:#0d302e;--mc-frame-border:#3a586b;--mc-warning-bg:#32271f;--mc-warning-line:#6f5140;--mc-warning-ink:#f4c498;color-scheme:dark}\n:host([data-skin=light]) .panel::after{border-image-source:var(--mc-frame-light);border-image-slice:80;border-image-width:17px}\n:host([data-skin=dark]) .panel::after{inset:1px;border-image-source:var(--mc-frame-dark);border-image-slice:64;border-image-width:18px}\n:host(:is([data-skin=light],[data-skin=dark])) .panel{border-color:var(--mc-frame-border);background:var(--mc-frame-border)}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.header-ribbons,.character-crop){display:none}\n:host(:is([data-skin=light],[data-skin=dark])) .header-actions{--mc-header-edge:var(--mc-frame-border)}\n:host(:is([data-skin=light],[data-skin=dark])) .header-actions::before{background:var(--mc-header)}\n:host(:is([data-skin=light],[data-skin=dark])) .header-actions .icon-button{color:var(--mc-muted)}\n:host(:is([data-skin=light],[data-skin=dark])) .header-actions .icon-button:hover{color:var(--mc-teal);background:var(--mc-hover)}\n:host(:is([data-skin=light],[data-skin=dark])) .header-actions #hide:hover{color:var(--mc-mismatch)}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.probability,.compact-summary){border-color:var(--mc-card-line);background:var(--mc-card)}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.distribution,.history-fingerprint){background:var(--mc-card)}\n:host(:is([data-skin=light],[data-skin=dark])) .ornament-divider{height:9px;background-image:none;border-bottom:1px solid var(--mc-line);margin:0 2px 3px}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.route-row,.behavior-row,.controls){border-color:var(--mc-line)}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.action,.history-button,.frequency-trigger,.skin-trigger,.evaluation-tabs button){border-color:var(--mc-control-line);background:var(--mc-control);color:var(--mc-muted)}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.history-button:hover,.history-button[aria-pressed=true],.frequency-trigger:hover,.frequency-trigger[aria-expanded=true],.skin-trigger:hover,.skin-trigger[aria-expanded=true],.evaluation-tabs button:hover,.evaluation-tabs button[aria-selected=true]){border-color:var(--mc-teal);background:var(--mc-hover);color:var(--mc-teal)}\n:host(:is([data-skin=light],[data-skin=dark])) .action.primary{background:var(--mc-primary);color:var(--mc-primary-ink);border-color:var(--mc-control-line);box-shadow:none}\n:host(:is([data-skin=light],[data-skin=dark])) .action.primary:hover:not(:disabled){background:var(--mc-primary-hover);border-color:var(--mc-teal)}\n:host([data-skin=dark]) .action.primary .wing-mark{filter:brightness(.25) saturate(.6)}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.frequency-drawer,.evaluation-drawer,.skin-drawer,.help-popover){background:var(--mc-bg);border-color:var(--mc-control-line);scrollbar-color:var(--mc-control-line) transparent}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.interval-field input,.evaluation-setup input,.evaluation-setup select){background:var(--mc-input);border-color:var(--mc-control-line)}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.evaluation-warning,.action.cancel){background:var(--mc-warning-bg);border-color:var(--mc-warning-line);color:var(--mc-warning-ink)}\n:host(:is([data-skin=light],[data-skin=dark])) :is(.history-row:hover,.launcher:hover::before){background:var(--mc-hover)}\n:host(:is([data-skin=light],[data-skin=dark])) .launcher{background:var(--mc-control-line)}\n:host(:is([data-skin=light],[data-skin=dark])) .text-button:hover{color:var(--mc-teal)}\n:host(:is([data-skin=light],[data-skin=dark])) .track{background:var(--mc-line)}\n@media(max-width:520px){:host{left:12px;top:74px}}\n@media(max-width:275px){.header{padding-left:10px}.brand strong{font-size:16px}.emblem{width:18px;height:28px}.character-crop{width:28%}.main-tabs{margin-inline:8px}.body{padding:7px 8px 0}.probability{padding:7px 6px 8px}.section-label{gap:2px}.help-label{gap:2px}.candidate-name{font-size:16px}.percent{font-size:24px}.percent small{font-size:13px}.candidate-row{grid-template-columns:minmax(0,78px) minmax(10px,1fr) 37px;font-size:12px}.candidate-row b{font-size:14px}.combined-result{grid-template-columns:25px minmax(0,1fr) auto;column-gap:5px;padding:9px 0 5px}.candy-mark{width:25px;height:27px}.combined-result strong{font-size:14px}.route{padding:0}.route-row{grid-template-columns:17px 50px minmax(0,1fr);gap:5px}.route-symbol svg{width:16px;height:16px}.route-label{font-size:10px}.model{font-size:12px}.controls{margin:0 8px;padding:5px 3px 14px}.control-actions{grid-template-columns:65px minmax(0,1fr);gap:5px}.control-actions .action,.history-button{font-size:12px;padding:3px;gap:4px}.history-button svg{width:18px;height:18px}.action .wing-mark{width:18px;height:23px}.frequency-trigger{padding:3px 5px;gap:5px;font-size:10px}.evaluation-drawer,.frequency-drawer{padding:13px}.behavior-row{grid-template-columns:minmax(0,1fr) 39px 48px;gap:4px;font-size:8px}}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important}}\n";
    const ICONS = {"arrow-left":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"19\" y1=\"12\" x2=\"5\" y2=\"12\"/><polyline points=\"12 19 5 12 12 5\"/></svg>","arrow-right":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/><polyline points=\"12 5 19 12 12 19\"/></svg>","box":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"/><polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"/><line x1=\"12\" y1=\"22.08\" x2=\"12\" y2=\"12\"/></svg>","chevron-down":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"/></svg>","chevron-up":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"18 15 12 9 6 15\"/></svg>","clock":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>","droplet":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z\"/></svg>","help-circle":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"/><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/></svg>","list":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\"/><line x1=\"3\" y1=\"6\" x2=\"3.01\" y2=\"6\"/><line x1=\"3\" y1=\"12\" x2=\"3.01\" y2=\"12\"/><line x1=\"3\" y1=\"18\" x2=\"3.01\" y2=\"18\"/></svg>","maximize-2":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" y1=\"3\" x2=\"14\" y2=\"10\"/><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"/></svg>","minus":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/></svg>","moon":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"/></svg>","refresh-cw":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"23 4 23 10 17 10\"/><polyline points=\"1 20 1 14 7 14\"/><path d=\"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15\"/></svg>","repeat":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"17 1 21 5 17 9\"/><path d=\"M3 11V9a4 4 0 0 1 4-4h14\"/><polyline points=\"7 23 3 19 7 15\"/><path d=\"M21 13v2a4 4 0 0 1-4 4H3\"/></svg>","server":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"8\" rx=\"2\" ry=\"2\"/><rect x=\"2\" y=\"14\" width=\"20\" height=\"8\" rx=\"2\" ry=\"2\"/><line x1=\"6\" y1=\"6\" x2=\"6.01\" y2=\"6\"/><line x1=\"6\" y1=\"18\" x2=\"6.01\" y2=\"18\"/></svg>","settings":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z\"/></svg>","sun":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"5\"/><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"/><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"/><line x1=\"4.22\" y1=\"4.22\" x2=\"5.64\" y2=\"5.64\"/><line x1=\"18.36\" y1=\"18.36\" x2=\"19.78\" y2=\"19.78\"/><line x1=\"1\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"12\" x2=\"23\" y2=\"12\"/><line x1=\"4.22\" y1=\"19.78\" x2=\"5.64\" y2=\"18.36\"/><line x1=\"18.36\" y1=\"5.64\" x2=\"19.78\" y2=\"4.22\"/></svg>","x":"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>"};
    const ART = {"candy-mark":"./assets/ui/candy-mark.png","character-original":"./assets/ui/character-original.png","divider":"./assets/ui/divider.png","frame-dark":"./assets/ui/frame-dark.png","frame-light":"./assets/ui/frame-light.png","header-ribbons":"./assets/ui/header-ribbons.png","panel-frame":"./assets/ui/panel-frame.png","wing-mark":"./assets/ui/wing-mark.png"};
    const STORAGE = 'dsh-model-check.ui.v2';
    const LEGACY_STORAGE = 'dsh-model-check.ui.v1';
    const SKINS = { follow:'跟随当前主题', original:'流萤', light:'浅色 · 银灰', dark:'深色 · 黑青' };
    const resolveSkin = function resolveSkin(preference, snapshot) {
  if (preference !== 'follow') return ['original', 'light', 'dark'].includes(preference) ? preference : 'original';
  const active = snapshot?.active;
  if (active?.id === 'dsh-theme-firefly') return 'original';
  if (active?.colorScheme === 'dark') return 'dark';
  if (active?.colorScheme === 'light') return 'light';
  return 'original';
};
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
