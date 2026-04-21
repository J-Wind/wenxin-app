#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."

# 安装依赖
echo "📦 Installing dependencies..."
npm install

# 构建项目
echo "🔨 Building project..."
npm run build

# 启动服务器
echo "🌐 Starting server..."
cd dist
NODE_ENV=production node server/main.js
