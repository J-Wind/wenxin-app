#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
DIST_DIR="$ROOT_DIR/dist"

echo "🚀 Railway Build Script"
echo ""

# ==================== 步骤 1 ====================
echo "🗑️  [1/3] 清理 dist 目录"
rm -rf "$DIST_DIR"
echo "   ✅ dist 目录已清理"
echo ""

# ==================== 步骤 2 ====================
echo "🔨 [2/3] 并行构建 server 和 client"

# 并行构建
echo "   ├─ 启动 server 构建..."
npm run build:server > /tmp/build-server.log 2>&1 &
SERVER_PID=$!

echo "   ├─ 启动 client 构建..."
npm run build:client > /tmp/build-client.log 2>&1 &
CLIENT_PID=$!

# 等待两个构建完成
SERVER_EXIT=0
CLIENT_EXIT=0

wait $SERVER_PID || SERVER_EXIT=$?
wait $CLIENT_PID || CLIENT_EXIT=$?

# 检查构建结果
if [ $SERVER_EXIT -ne 0 ]; then
  echo "   ❌ Server 构建失败"
  cat /tmp/build-server.log
  exit 1
fi

if [ $CLIENT_EXIT -ne 0 ]; then
  echo "   ❌ Client 构建失败"
  cat /tmp/build-client.log
  exit 1
fi

echo "   ✅ Server 构建完成"
echo "   ✅ Client 构建完成"
echo ""

# ==================== 步骤 3 ====================
echo "📦 [3/3] 准备产物"

# 拷贝 run.sh 到 dist/
if [ -f "$ROOT_DIR/scripts/run.sh" ]; then
  cp "$ROOT_DIR/scripts/run.sh" "$DIST_DIR/"
fi

# 拷贝 .env 文件（如果存在）
if [ -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env" "$DIST_DIR/"
fi

# 移动 client 下的 HTML 文件到 dist/dist/client
if [ -d "$DIST_DIR/client" ]; then
  mkdir -p "$DIST_DIR/dist/client"
  find "$DIST_DIR/client" -maxdepth 1 -name "*.html" -exec mv {} "$DIST_DIR/dist/client/" \;
fi

# 清理无用文件
rm -rf "$DIST_DIR/scripts"
rm -rf "$DIST_DIR/tsconfig.node.tsbuildinfo"

echo "   ✅ 产物准备完成"
echo ""

echo "🎉 构建成功！"
