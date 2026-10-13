# Model Check

**DeepSeek Harness 模型检测插件 · 桌面 / Web 通用 · v0.1.0**

把独立指纹候选、糖果测评和响应路由放进一个轻巧的浮窗。

<table>
<tr>
<td width="42%" align="center">
<a href="https://motionalpha84.github.io/dsh-model-check/"><img src="https://motionalpha84.github.io/dsh-model-check/assets/preview.jpg" alt="Model Check 交互演示，点击打开" width="278"></a>
</td>
<td width="58%" valign="middle">
<h3>模型信息，一目了然</h3>
<p>联合检测 · 响应路由 · 会话历史<br>三款皮肤 · 跟随 DSH 主题 · 拖动吸附</p>

桌面版：

```bash
dsh plugin --profile desktop add dsh-model-check --ignore-scripts
```

独立 Web 版：

```bash
dsh plugin --profile web add dsh-model-check --ignore-scripts
```

<p><a href="#安装"><b>↓安装详情</b></a></p>
<p><sub>演示使用真实插件组件与虚构数据，提供商仅为 test-gpt、test-Claude，不调用模型、不消耗额度。README 内为静态预览，点击进入完整交互页面。</sub></p>
</td>
</tr>
</table>

## 功能

- **联合检测**：并行执行 3 次 ModelTrace 数字指纹与 1 次糖果题，展示候选、库内概率和糖果命中；支持取消与查看回答。
- **请求与响应**：分别展示供应商、请求模型和服务端响应标签。标签一致为青绿，不一致为橙红，缺少标签时明确显示未知。
- **行为指纹**：独立的手动测评入口，支持快速 / 标准 / 严格模式。Gemini 请求模型禁用此功能。
- **会话隔离**：独立的历史和检测频率；支持仅会话首轮、每 N 轮和仅手动检测。
- **紧凑浮窗**：278 px 完整面板、186 px 最小化摘要，双侧吸附、可拖动展开悬钮。最小化仍可查看候选与概率。
- **外观**：流萤、浅色 · 银灰、深色 · 黑青，或跟随当前 DSH 主题；青色粒子微光与减少动态效果适配。
- **桌面 / Web 通用**：同一个 `dsh-model-check@0.1.0` 安装包，分别安装到 `desktop` 或 `web` profile。独立 Web 的完整检测与界面流程已验证，详见 [兼容性与验证](COMPATIBILITY.md)。

## 安装

需要 **DeepSeek Harness ≥ 0.2.0-rc.2**。独立 Web 运行环境及源码构建需要 **Node.js ≥ 22**；桌面版使用 DSH 自带运行时。

### 推荐：按包名安装

按使用的 DSH 版本选择命令。两端使用同一个正式包，但插件安装位置按 profile 分开。

**桌面版**：使用 DSH 桌面安装附带的 `dsh` 命令：

```sh
dsh plugin --profile desktop add dsh-model-check --ignore-scripts
```

**独立 Web 版**：使用 Web 运行环境中的 `dsh` 命令：

```sh
dsh plugin --profile web add dsh-model-check --ignore-scripts
```

若通过 npm 临时运行 DSH、未配置 `dsh` 命令，可执行：

```sh
npx @deepseek-ai/dsh plugin --profile web add dsh-model-check --ignore-scripts
```

安装后重启对应的 DSH 进程；Web 版重启 Web 服务并刷新浏览器。打开会话并完成一次聊天请求即可看到结果。安装者不需要 npm 账号。npm 版 DSH CLI 管理 `web` profile；桌面版 `desktop` profile 应使用桌面安装附带的 CLI。

也可以在 DSH 的“添加插件 → 包名或地址”中填入：

```text
dsh-model-check
```

[npm 安装包](https://www.npmjs.com/package/dsh-model-check) · [交互演示](https://motionalpha84.github.io/dsh-model-check/)

### 备用：从 GitHub 在线安装

如果当前 npm 镜像尚未同步，可以直接使用正式版安装包地址。以下以桌面版为例，Web 版将 `--profile desktop` 改为 `--profile web`：

```sh
dsh plugin --profile desktop add https://github.com/motionalpha84/dsh-model-check/releases/download/v0.1.0/dsh-model-check-0.1.0.tgz --ignore-scripts
```

### 备用：离线安装

1. 到 [Releases](https://github.com/motionalpha84/dsh-model-check/releases/latest) 下载 `Model-Check-0.1.0.zip` 并解压。
2. 在 PowerShell 运行解压目录中的 `Install-Model-Check.ps1`。脚本会核验安装包 SHA256 并调用 DSH 官方插件命令。
3. 重启 DSH，打开会话并完成一次聊天请求。

ZIP 中的 PowerShell 安装脚本默认安装到桌面版；独立 Web 版可直接使用下方 `.tgz` 命令，并将 `--profile desktop` 改为 `--profile web`。

若未自动找到 `dsh`，给脚本传入 DSH 安装目录中的命令路径：

```powershell
.\Install-Model-Check.ps1 -DshCommand "<DSH 安装目录>\resources\runtime\cli\bin\dsh.cmd"
```

也可下载单独的 `.tgz` 包，在 DSH 的“添加插件 → 包名或地址”中输入其完整路径，或执行：

```powershell
dsh plugin --profile desktop add "<下载目录>\dsh-model-check-0.1.0.tgz" --offline --ignore-scripts
```

安装仅添加独立插件 bundle。卸载时在 DSH 插件管理器移除 `dsh-model-check` 并重启即可。

## 使用与额度

首次成功回复后默认自动检测一次。底部“自动”可改为每 N 轮或仅手动；“重新检测”启动一轮联合检测，“查看详情”查看糖果回答并调整本次糖果次数（1–10 次）。

联合检测默认额外发送 **4 次模型请求**；行为指纹分别为 **60 / 200 / 400 次**。实际使用会消耗供应商额度，可能产生费用和限流，启动前请查看页面中的数量提示。行为测试使用独立的低思考强度采样，不改变聊天设置；不把“测试导致模型降智”作为已证实结论。

拖动标题或侧边悬钮调整位置；减号最小化，关闭按钮隐藏，点击斜切悬钮恢复。“路由响应”下方展开完整分布与采样详情。历史、皮肤、布局、频率设置和刷新路由本身不发起模型推理。

## 如何理解结果

**库内概率是相对候选分布，不是模型身份认证。** 检测请求使用独立上下文，不能据此认证原聊天请求的后端。糖果命中不参与模型概率计算，也不等于数学答案正确。

数字候选库合并自两个上游快照，共 **19 个 GPT / Claude 模型**；保留各原始库的特征与校准，以 16 个共有模型为参照融合相对 log-odds。合并结果尚未独立重新校准，不能套用单库交叉验证准确率。请求模型未收录时会明确提示，不能仅因出现其他候选就认定模型被替换。

界面与演示统一使用以下模型名称。请求、匹配及历史存储仍使用原始模型 ID，名称格式不会改变检测结果。

| 系列 | 数字指纹候选模型 |
| --- | --- |
| GPT | GPT-5.4、GPT-5.5、GPT-5.6 Sol、GPT-5.6 Terra、GPT-5.6 Luna、GPT-6 Astra、GPT-6 Sol、GPT-6 Luna、GPT-6.1 Sol |
| Claude-Haiku | Claude-Haiku 4.5、Claude-Haiku 5.5 |
| Claude-Sonnet | Claude-Sonnet 4.6、Claude-Sonnet 5、Claude-Sonnet 5.5 |
| Claude-Opus | Claude-Opus 4.6、Claude-Opus 4.7、Claude-Opus 4.8、Claude-Opus 5、Claude-Opus 5.5 |

行为指纹包含 **8 个 GPT 模型基准、16 项探针**。JSD 越小表示分布越接近，置换检验的 p 值不是模型概率。原始库、上游提交和文件校验信息见 [assets/provenance.json](assets/provenance.json)。

## 本地数据

历史和设置保存在 `$DSH_HOME/model-check/state.json`；未设置时为 `~/.dsh/model-check/state.json`，也可用 `MODEL_CHECK_DATA` 指定目录。保存最近请求摘要及有限数量的测试回答，不保存 API Key、原聊天内容或原聊天推理内容。插件通过 DSH 当前供应商发送检测请求，不内置供应商密钥。

Web 版的检测与历史保存在运行 DSH Web 服务的机器上，浮窗布局和皮肤保存在当前浏览器。不同 profile 的安装并不等于数据自动隔离：同时运行桌面与 Web 时，可使用不同的 `DSH_HOME` 或为各进程设置不同的 `MODEL_CHECK_DATA`，避免共同写入同一历史文件。两端不会自动同步布局、皮肤或供应商配置。

公开演示全部使用虚构示例；`test-gpt` 和 `test-Claude` 仅是演示名称，不限制实际插件支持的供应商。

## 开发

不需要第三方 npm 依赖。

```sh
npm run build      # 校验上游快照并构建插件
npm test           # 插件回归
npm run test:demo  # 演示状态回归
npm run build:demo # 使用同一前端源码生成静态演示
npm run demo       # 本地预览，地址见终端
npm pack           # 生成可安装的插件包
```

`src/` 是插件源码，`lib/` 是发布产物，`docs/` 是 GitHub Pages 交互展示。演示的模型接口完全由内存数据模拟，不连接模型服务。正式版变更见 [CHANGELOG.md](CHANGELOG.md)。

## 致谢

- **[xqy2006](https://github.com/xqy2006)** — [ModelTrace](https://github.com/xqy2006/ModelTrace)：数字指纹方法、挑战与原始指纹库，是本插件独立指纹候选的基础。保留 [MIT 许可](LICENSE.ModelTrace)。
- **[Hao Wang / haowang02](https://github.com/haowang02)** — [Codex Candy Eval](https://github.com/haowang02/cpa-plugin-codex-candy-eval)：糖果题与命中规则、行为指纹探针和基准，以及其中附带的另一版数字指纹库。保留 [MIT 许可](LICENSE.CandyEval)。
- **[Cole Bemis / Feather](https://github.com/feathericons/feather)** — 界面线性图标，保留 [MIT 许可](LICENSE.Feather)。

感谢上游作者的开源工作。本项目是独立的 DSH 适配，不代表上游官方发布。代码使用 [MIT](LICENSE)；流萤角色素材的权利归原权利人所有，不纳入本项目代码 MIT 授权。完整来源与改动说明见 [NOTICE.md](NOTICE.md)。
