# 项目部署指南 (Deployment Guide)

这个项目是基于 Next.js + Prisma + SQLite 构建的。
要将其部署到公网，推荐使用 **Vercel**（前端托管）配合 **Vercel Postgres**（云数据库）。

## 准备工作
1. 注册 [GitHub](https://github.com/) 账号。
2. 注册 [Vercel](https://vercel.com/) 账号。

## 步骤 1：上传代码到 GitHub
1. 在 GitHub 上创建一个新仓库（例如 `pc-control-system`）。
2. 在本地项目根目录打开终端，运行以下命令提交代码：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

## 步骤 2：在 Vercel 上导入项目
1. 登录 Vercel，点击 **"Add New..."** -> **"Project"**。
2. 选择 "Import Git Repository"，找到刚才创建的 GitHub 仓库并点击 **Import**。
3. 在配置页面：
   - **Framework Preset**: Next.js (默认)
   - **Root Directory**: `./` (默认)
   - **Environment Variables**: 暂时留空。

## 步骤 3：配置数据库 (Postgres)
由于 SQLite 文件无法在 Vercel 的无服务器环境中持久保存，我们需要切换到 Postgres。

1. 在 Vercel 项目页面，点击 **Storage** 选项卡。
2. 点击 **Connect Store** -> **Create New** -> **Postgres**。
3. 接受条款，创建数据库（选择离你最近的区域，如 Singapore 或 US West）。
4. 创建完成后，进入数据库详情页，点击 **.env.local** 标签，复制所有环境变量。
5. 回到 Vercel 项目的 **Settings** -> **Environment Variables**，将这些变量添加进去（或者 Vercel 会自动帮你添加）。

## 步骤 4：修改代码适配 Postgres
为了让项目支持 Postgres，你需要修改 `prisma/schema.prisma`：

1. 打开 `prisma/schema.prisma`。
2. 将 `datasource` 部分修改为：
   ```prisma
   datasource db {
     provider = "postgresql"
     url = env("POSTGRES_PRISMA_URL") // 使用 Vercel 提供的连接池 URL
     directUrl = env("POSTGRES_URL_NON_POOLING") // 用于迁移的直连 URL
   }
   ```
3. 提交这些更改到 GitHub：
   ```bash
   git add prisma/schema.prisma
   git commit -m "Switch to Postgres for Vercel"
   git push
   ```

4. Vercel 会自动检测到新的提交并开始重新构建。

## 步骤 5：初始化云数据库
构建完成后，你需要初始化云数据库的表结构。
在 Vercel 部署日志中可能会因为数据库未初始化而报错，或者你可以手动执行：

1. 在本地安装 Vercel CLI：`npm i -g vercel`
2. 登录：`vercel login`
3. 连接项目：`vercel link`
4. 推送数据库结构：
   ```bash
   vercel env pull .env.development.local
   npx prisma db push
   ```
   (注意：这会将本地架构推送到 Vercel 数据库)

## 替代方案：快速预览 (临时)
如果你只是想临时给别人演示，可以使用 **Localtunnel** 将你当前的本地电脑暴露到公网，而不需要迁移数据库。

1. 启动项目：`npm start`
2. 在新终端运行：`npx localtunnel --port 3000`
3. 复制生成的 URL 发送给别人（注意：每次重启 URL 会变）。
