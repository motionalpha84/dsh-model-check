param(
    [string]$DshCommand = '',
    [string]$HarnessProfile = 'desktop'
)

$ErrorActionPreference = 'Stop'
$packageName = 'dsh-model-check'
$packageVersion = '0.1.0'
$archiveName = "$packageName-$packageVersion.tgz"
$archivePath = Join-Path $PSScriptRoot $archiveName
$releaseManifest = Join-Path $PSScriptRoot 'release.json'
if (-not (Test-Path -LiteralPath $archivePath)) { throw "找不到安装包：$archivePath。请先解压完整发布文件夹。" }
if (-not (Test-Path -LiteralPath $releaseManifest)) { throw '找不到 release.json，无法校验安装包。' }
$releaseInfo = Get-Content -LiteralPath $releaseManifest -Raw | ConvertFrom-Json
$expectedHash = $releaseInfo.package.sha256
$actualHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
if (-not $expectedHash -or $actualHash -ne $expectedHash) { throw '安装包 SHA256 校验未通过，请使用完整发布包。' }

if (-not $DshCommand) {
    $dshInfo = Get-Command dsh -ErrorAction SilentlyContinue
    if ($dshInfo) { $DshCommand = $dshInfo.Source }
}
if (-not $DshCommand -or -not (Test-Path -LiteralPath $DshCommand)) {
    throw '未找到 Harness 自带的 dsh 命令。可传入 -DshCommand "安装目录\resources\runtime\cli\bin\dsh.cmd"。'
}

Write-Host "正在安装 Model Check $packageVersion…"
& $DshCommand plugin --profile $HarnessProfile add $archivePath --offline --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw "Harness 插件安装命令失败，退出码 $LASTEXITCODE。" }

$harnessData = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' }
$profileDirectory = Join-Path $harnessData "profiles\$HarnessProfile"
$profileManifest = Get-Content -LiteralPath (Join-Path $profileDirectory 'package.json') -Raw | ConvertFrom-Json
$installedManifest = Get-Content -LiteralPath (Join-Path $profileDirectory "node_modules\$packageName\package.json") -Raw | ConvertFrom-Json
if ($installedManifest.name -ne $packageName -or $installedManifest.version -ne $packageVersion) { throw '安装后的插件版本不符。' }
if ($profileManifest.dsh.profile.bundles -notcontains $packageName) { throw '插件已下载，但未加入 profile bundle。' }
Write-Host 'Model Check 已安装并启用。请重新启动 Harness，进入对话查看流萤风格浮窗。' -ForegroundColor Green
Write-Host '路由响应下方的斜切按钮可展开详情；底部可设置自动检测频率、切换并记住皮肤。'
