# WINIT 站点二维码报修网站

当前网站：

```text
https://j1nw31.github.io/winit_site_report/
```

二维码链接格式：

```text
https://你的域名/?site=LS01
```

扫码后页面会锁定并显示 `LS01`。用户填写问题描述后，服务端通过
ntfy 发送：

```text
站点：LS01
问题：用户填写的描述
时间：悉尼时间
```

## Cloudflare Pages 部署

1. 在 Cloudflare Pages 创建项目并连接本仓库。
2. Root directory 设置为 `web`。
3. 不需要 Build command。
4. Build output directory 设置为 `.`。
5. 在项目 Settings > Variables and Secrets 添加：

```text
NTFY_TOPIC=winit-help-9f4c72a81d6e3b50c7a2
NTFY_TOKEN=
```

`NTFY_TOKEN` 仅在 ntfy 服务器要求认证时填写。

部署后，为每个站点制作不同二维码：

```text
https://你的域名/?site=LS01
https://你的域名/?site=LS02
https://你的域名/?site=LS03
```

站点格式支持 2-6 个英文字母加 2-4 位数字。

项目根目录的 `Generate-Site-QR.ps1` 可以批量生成二维码：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\Generate-Site-QR.ps1 -Site LS01,LS02,LS03
```

## GitHub Pages 快速部署

`config.js` 的 `mode` 设置为 `direct` 时，静态网页会直接向 ntfy
发送消息，可部署到 GitHub Pages。此方式会在浏览器源码中暴露 Topic，
应使用难以猜测的随机 Topic。

Cloudflare Pages 部署时可将 `mode` 改为 `server`，由
`functions/api/report.js` 隐藏 Topic 并执行服务端验证。
