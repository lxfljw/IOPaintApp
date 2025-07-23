#!/bin/bash

echo "1. 检查项目根目录下 models 目录和 big-lama.pt 是否存在..."
if [ -f "models/big-lama.pt" ]; then
    echo "✅ models/big-lama.pt 存在"
else
    echo "❌ models/big-lama.pt 不存在，请先下载到 models 目录！"
    exit 1
fi

echo
echo "2. 检查 package.json 里 extraResources 配置..."
if grep -q '"from": "models"' package.json && grep -q '"to": "Resources/models"' package.json; then
    echo "✅ package.json 里包含 models -> Resources/models 配置"
else
    echo "❌ package.json 缺少 models -> Resources/models 配置，请手动添加！"
    exit 1
fi

echo
echo "3. 检查打包后 app 里 models 目录和 big-lama.pt 是否存在..."
APP_PATH=$(find release -type d -name "*.app" | head -n 1)
if [ -z "$APP_PATH" ]; then
    echo "❌ 没有找到打包后的 .app 文件，请先打包！"
    exit 1
fi

MODELS_PATH="$APP_PATH/Contents/Resources/models"
if [ -d "$MODELS_PATH" ]; then
    if [ -f "$MODELS_PATH/big-lama.pt" ]; then
        echo "✅ 打包后的 app 里 models/big-lama.pt 存在"
    else
        echo "❌ 打包后的 app 里 models 目录下没有 big-lama.pt"
        exit 1
    fi
else
    echo "❌ 打包后的 app 里没有 models 目录"
    exit 1
fi

echo
echo "🎉 检查通过，模型文件已正确打包进 app！" 