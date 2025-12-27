# 项目部署指南 (Deployment Guide)

这个项目是基于 Next.js + Prisma + SQLite 构建的。
要将其部署到公网，推荐使用 **Vercel**（前端托管）配合 **Vercel Postgres**（云数据库）和 **Vercel Blob**（文件存储）。

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

## 步骤 4：配置对象存储 (Blob)
**必须步骤：** 为了支持图片上传，你需要配置 Vercel Blob。

1. 在 Vercel 项目页面，点击 **Storage** 选项卡。
2. 点击 **Connect Store** -> **Create New** -> **Blob**。
3. 创建完成后，你会获得一个 `BLOB_READ_WRITE_TOKEN`。
4. 确保这个 Token 已经添加到项目的 **Settings** -> **Environment Variables** 中。
5. **本地开发**：如果你想在本地测试上传功能，需要将 `BLOB_READ_WRITE_TOKEN` 添加到本地的 `.env` 文件中。
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxx
   ```

## 步骤 5：修改代码适配 Postgres
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

## 步骤 6：初始化云数据库
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

## 进阶：如果空间不足怎么办？(Storage Solutions)
Vercel Blob 免费版提供 250MB 存储空间。
我们已经实现了图片自动压缩（每张约 0.2MB），这大约可以存储 **1250 张照片**。

如果您的照片超过这个数量，建议切换到 **Cloudflare R2**：
1. **优势**：提供 **10GB** 免费存储（约 50,000 张压缩照片），且无流量费。
2. **如何切换**：
   - 注册 Cloudflare R2。
   - 创建 Bucket。
   - 修改 `lib/storage.ts` 文件，将 Vercel Blob 的代码替换为 AWS S3 SDK（R2 兼容 S3 协议）。
   - 我们的代码已经做好了抽象，只需要修改这一个文件即可完成迁移。
