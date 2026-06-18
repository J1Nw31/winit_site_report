# WINIT 站点二维码报修网站

当前网站：

```text
https://j1nw31.github.io/winit_site_report/
```

二维码链接格式：

```text
https://你的域名/?site=LS01
```

扫码后页面会锁定并显示 `LS01`。用户填写问题描述后，通过新的信息平台发送：

```text
平台：https://hik2.tail6f1a46.ts.net/
频道：离线工作站报障
标题：LS01
内容：用户填写的问题描述
```

## Cloudflare Pages 部署

1. 在 Cloudflare Pages 创建项目并连接本仓库。
2. Root directory 设置为 `web`。
3. 不需要 Build command。
4. Build output directory 设置为 `.`。
5. 在项目 Settings > Variables and Secrets 添加：

```text
PUSH_SERVER=https://hik2.tail6f1a46.ts.net
PUSH_TOPIC=离线工作站报障
PUSH_PASSWORD=winit777
```

当前使用的信息平台配置为：

```text
PUSH_SERVER=https://hik2.tail6f1a46.ts.net
PUSH_TOPIC=离线工作站报障
PUSH_PASSWORD=winit777
```

当前报修网页调用 Push Center 的 `/api/external/report` 接口；旧二维码仍然沿用原来的 `?site=站点编号` 格式。

部署后，为每个站点制作不同二维码：

```text
https://你的域名/?site=LS01
https://你的域名/?site=LS02
https://你的域名/?site=LS03
```

站点格式支持 2-6 个英文字母加 2-4 位数字。

在 `C:\Winit\web_site_report` 中运行 `Generate-Site-QR.ps1` 可以批量生成二维码：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\Generate-Site-QR.ps1 -Site LS01,LS02,LS03
```

二维码保存在本项目的 `qr` 目录。

现有站点二维码仍然沿用原来的 `?site=站点编号` 格式，不需要因为更换信息平台而重新打印。

## GitHub Pages 快速部署

`config.js` 的 `mode` 设置为 `direct` 时，静态网页会直接向信息平台
发送消息，可部署到 GitHub Pages。此方式会在浏览器源码中暴露频道和密码，
仅适合内网或可接受此风险的场景。

Cloudflare Pages 部署时可将 `mode` 改为 `server`，由
`functions/api/report.js` 隐藏频道和密码并执行服务端验证。
