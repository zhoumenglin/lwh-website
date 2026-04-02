# Vercel 部署与维护指南

本文档面向非技术背景用户，帮助你理解 Vercel 部署原理，并指导你将项目部署到新的 GitHub 仓库 + 新的 Vercel 账号。

---

## 目录

1. [Vercel 到底做了什么](#1-vercel-到底做了什么)
2. [项目关键配置文件](#2-项目关键配置文件)
3. [从零部署到新 Vercel 账号](#3-从零部署到新-vercel-账号)
4. [日常维护：修改代码后如何更新网站](#4-日常维护修改代码后如何更新网站)
5. [常见问题与注意事项](#5-常见问题与注意事项)

---

## 1. Vercel 到底做了什么

当你在 Vercel 网站上关联 GitHub 仓库并点击 Deploy 时，Vercel 在后台完成了以下事情：

### 1.1 建立 GitHub 集成

Vercel 在你的 GitHub 仓库上安装了一个 Webhook（钩子）。这意味着：

- 每次你 `git push` 代码到 `main` 分支，GitHub 会自动通知 Vercel
- Vercel 收到通知后，自动拉取最新代码并开始构建

### 1.2 自动构建流程

Vercel 拉取代码后，按顺序执行以下步骤：

```
1. npm install          ← 安装项目依赖（node_modules）
2. npm run build        ← 执行 astro build，生成静态网页文件到 dist/ 目录
3. 部署 dist/ 目录      ← 将生成的网页文件分发到全球 CDN 节点
```

### 1.3 部署结果

- **生产部署（Production）**：推送到 `main` 分支触发，对应你的正式网址（如 `liwenhui.vercel.app`）
- **预览部署（Preview）**：推送到其他分支或提交 Pull Request 时触发，Vercel 会生成一个临时预览链接，方便你在正式上线前查看效果

### 1.4 一句话总结

> Vercel = 自动化的"构建 + 部署"服务。你只需要把代码推到 GitHub，它负责把代码变成网页并上线。

---

## 2. 项目关键配置文件

了解这几个文件的作用，才能正确部署到新环境。

### `vercel.json` — 告诉 Vercel 怎么构建

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

| 字段 | 含义 |
|------|------|
| `buildCommand` | 构建命令，Vercel 用它来编译你的项目 |
| `outputDirectory` | 构建产物目录，Vercel 会部署这个文件夹里的文件 |
| `framework` | 告诉 Vercel 这是个 Astro 项目，会自动优化一些设置 |

### `astro.config.mjs` — Astro 框架配置

```js
export default defineConfig({
  site: 'https://liwenhui.vercel.app',  // ← 你的网站地址
  output: 'static',                      // ← 生成纯静态 HTML
  adapter: vercel(),                     // ← 使用 Vercel 适配器
  integrations: [mdx(), tailwind()]      // ← 插件：MDX 内容 + TailwindCSS 样式
});
```

**部署到新环境时，需要修改 `site` 字段为新的网址。**

### `package.json` — 项目依赖和脚本

定义了项目用到的所有第三方库，以及可以执行的命令（`dev`、`build` 等）。

### `.npmrc` — 包管理器兼容配置

```
shamefully-hoist=true
```

这行配置确保使用 `pnpm` 安装依赖时不会出问题。如果你用 `npm` 安装，这个文件不影响。

---

## 3. 从零部署到新 Vercel 账号

### 前提条件

- 一个 GitHub 账号
- 一个 Vercel 账号（可在 [vercel.com](https://vercel.com) 用 GitHub 登录免费注册）
- 电脑上已安装 [Git](https://git-scm.com/) 和 [Node.js](https://nodejs.org/)（建议 v18 或以上）

### 步骤一：在 GitHub 上创建新仓库

1. 登录 GitHub，点击右上角 **+** → **New repository**
2. 填写仓库名（如 `my-website`），选择 **Private** 或 **Public**
3. **不要**勾选 "Add a README file"（因为我们会推送已有代码）
4. 点击 **Create repository**
5. 记下仓库地址，形如：`https://github.com/你的用户名/my-website.git`

### 步骤二：修改项目配置

打开 `astro.config.mjs`，将 `site` 改为新的网址：

```js
// 如果你还没有自定义域名，先写 Vercel 默认给的地址
// 格式是：https://你的项目名.vercel.app
site: 'https://my-website.vercel.app',
```

> 提示：这个地址在 Vercel 部署完成后才能确认。你可以先写一个预估的，部署后再改。

### 步骤三：推送代码到新仓库

打开终端（Terminal），进入项目目录，执行以下命令：

```bash
# 进入项目目录
cd /你的项目路径/lwh-website

# 查看当前远程仓库配置
git remote -v

# 如果已有 origin 指向旧仓库，先移除
git remote remove origin

# 添加新的远程仓库
git remote add origin https://github.com/你的用户名/my-website.git

# 推送代码到新仓库
git push -u origin main
```

### 步骤四：在 Vercel 上导入项目

1. 登录 [vercel.com](https://vercel.com)
2. 点击 **Add New...** → **Project**
3. 在 "Import Git Repository" 页面，找到你刚才创建的 GitHub 仓库
   - 如果看不到仓库，点击 **Adjust GitHub App Permissions** 授权 Vercel 访问你的仓库
4. 点击仓库旁边的 **Import**

### 步骤五：确认构建设置并部署

导入后 Vercel 会自动识别 Astro 框架，你应该看到以下预填设置：

| 设置项 | 值 |
|--------|-----|
| Framework Preset | Astro |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install`（或自动检测） |

**确认无误后，点击 Deploy。** 等待 1-2 分钟，构建完成后你会看到部署成功的页面和网站链接。

### 步骤六（可选）：绑定自定义域名

1. 在 Vercel 项目页面，进入 **Settings** → **Domains**
2. 输入你的域名（如 `www.example.com`），点击 **Add**
3. Vercel 会提示你添加 DNS 记录：
   - 如果是根域名（`example.com`）：添加 **A 记录**，指向 `76.76.21.21`
   - 如果是子域名（`www.example.com`）：添加 **CNAME 记录**，指向 `cname.vercel-dns.com`
4. 到你的域名注册商（如阿里云、Cloudflare）的 DNS 管理页面添加对应记录
5. 等待 DNS 生效（通常几分钟到几小时），Vercel 会自动配置 HTTPS 证书

绑定域名后，记得回来修改 `astro.config.mjs` 中的 `site` 为你的正式域名，然后 `git push` 更新。

---

## 4. 日常维护：修改代码后如何更新网站

### 方式一：Git Push 自动部署（推荐）

这是最常用的方式，改完代码后只需 3 个命令：

```bash
# 1. 查看你改了哪些文件
git status

# 2. 把修改的文件加入暂存区
git add .

# 3. 提交并推送
git commit -m "描述你的修改内容"
git push
```

推送后，Vercel 会在 1-2 分钟内自动构建并更新线上网站。你可以在 [Vercel Dashboard](https://vercel.com/dashboard) 查看部署状态。

### 方式二：本地预览后再推送

如果改动较大，建议先在本地预览效果：

```bash
# 安装依赖（仅首次或 package.json 变化时需要）
npm install

# 启动本地开发服务器
npm run dev
```

浏览器访问 `http://localhost:4321` 查看效果。确认无误后再执行方式一的 git push。

### 方式三：Vercel CLI 手动部署（高级）

适用于不想通过 GitHub 推送的场景：

```bash
# 安装 Vercel CLI（仅首次）
npm install -g vercel

# 登录 Vercel 账号
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

---

## 5. 常见问题与注意事项

### Q: 构建失败了怎么办？

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)，点击你的项目
2. 找到失败的部署记录，点击进入
3. 查看 **Build Logs**（构建日志），错误信息通常会标红显示
4. 常见原因：
   - 依赖安装失败 → 检查 `package.json` 中的依赖版本
   - 语法错误 → 根据日志定位到具体文件和行号
   - 图片/文件找不到 → 检查路径是否正确（区分大小写）

**快速自查方法**：在本地执行 `npm run build`，如果本地构建成功，Vercel 上通常也会成功。

### Q: 如何配置环境变量？

1. 在 Vercel 项目页面，进入 **Settings** → **Environment Variables**
2. 添加键值对（如 `API_KEY` = `xxx`）
3. 选择环境（Production / Preview / Development）
4. 保存后，下次部署会自动生效

目前本项目没有使用环境变量，如果以后需要（比如接入第三方 API），在这里配置即可。

### Q: 分支预览是什么？

当你创建新分支并推送时，Vercel 会自动为该分支生成一个预览链接。这非常适合用来：

- 测试新功能，确认无误后再合并到 `main`
- 让其他人预览你的改动

### Q: 推送后多久网站会更新？

通常 1-2 分钟。构建时间取决于项目复杂度，本项目是纯静态站点，构建很快。

### Q: 可以回滚到之前的版本吗？

可以。在 Vercel Dashboard 的 **Deployments** 页面，找到你想恢复的部署版本，点击右侧 **...** 菜单 → **Promote to Production**，即可回滚。

### Q: 免费额度够用吗？

Vercel 的 Hobby（免费）计划对个人网站完全够用：
- 每月 100GB 带宽
- 无限次部署
- 自动 HTTPS
- 全球 CDN

---

## 快速参考卡片

| 场景 | 命令 |
|------|------|
| 本地开发 | `npm run dev` → 访问 `localhost:4321` |
| 本地构建测试 | `npm run build` |
| 推送更新到线上 | `git add . && git commit -m "描述" && git push` |
| 查看部署状态 | 打开 Vercel Dashboard |
| 回滚版本 | Vercel Dashboard → Deployments → 选版本 → Promote to Production |
