#!/bin/bash

# 进入可执行文件目录
dir="$(cd "$(dirname "$0")" && pwd)"
cd "$dir/build/python" || { echo "目录不存在: $dir/build/python"; exit 1; }

# 启动后端服务（后台）
./iopaint_server start --model lama --port 8080 &
PID=$!
echo "已启动 iopaint_server，PID=$PID"

# 最多等待60秒，每秒检测一次
for i in {1..60}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/server-config)
  if [ "$RESPONSE" = "200" ]; then
    echo "✅ 后端服务启动成功，/api/v1/server-config 可访问 (等待了 $i 秒)"
    RESULT=0
    break
  fi
  sleep 1
done

if [ "$RESPONSE" != "200" ]; then
  echo "❌ 后端服务启动失败，/api/v1/server-config 无法访问 (HTTP $RESPONSE) (已等待60秒)"
  RESULT=1
fi

# 关闭后端服务
kill $PID
wait $PID 2>/dev/null

exit $RESULT 