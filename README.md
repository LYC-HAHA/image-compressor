# 🖼️ 图片压缩工具

在线图片压缩与尺寸调整工具，部署在 Cloudflare Pages 上。所有图片处理均在浏览器本地完成，**图片不上传服务器**，隐私安全。

## ✨ 功能

- **图片压缩** — 可调质量（10%–100%），显著减小文件体积
- **格式转换** — 支持 JPEG / PNG / WebP，WebP 体积更小
- **尺寸调整** — 按最大宽/高缩放，保持宽高比
- **批量处理** — 一次拖入多张图片，逐张压缩
- **对比预览** — 显示压缩前后大小、节省百分比、尺寸变化
- **一键下载** — 单张下载或批量下载全部结果

## 🚀 本地预览

无需构建，直接用任意静态服务器打开即可：

```bash
# 方式一：Python
python3 -m http.server 8080

# 方式二：npx
npx serve .
```

浏览器访问 `http://localhost:8080`。

## ☁️ 部署到 Cloudflare Pages

### 方式一：Git 连接（推荐）

1. 将本仓库推送到 GitHub / GitLab
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create
3. 选择 **Pages** → Connect to Git → 选择仓库
4. 构建配置：
   - **Framework preset**: None
   - **Build command**: 留空
   - **Build output directory**: `/`（根目录）
5. 点击 **Save and Deploy**，几秒后即可获得线上地址

### 方式二：Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name image-compressor
```

## 📁 项目结构

```
.
├── index.html          # 主页面
├── css/style.css       # 样式
├── js/compressor.js    # 压缩核心逻辑（Canvas API）
├── js/app.js           # UI 交互逻辑
├── _headers            # Cloudflare Pages 安全头
├── _redirects          # SPA 回退规则
└── wrangler.toml       # Wrangler 配置
```

## 🔒 隐私说明

所有图片处理完全在浏览器中通过 Canvas API 完成，不会上传到任何服务器。关闭页面后数据即被清除。

## 🛠️ 技术栈

- 纯原生 HTML / CSS / JavaScript，零依赖
- Canvas API 进行图片压缩与缩放
- Cloudflare Pages 全球 CDN 静态托管
