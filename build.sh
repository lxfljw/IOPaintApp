#!/bin/bash

echo "🚀 开始构建水印魔术师应用..."

# 检查是否在正确的目录
if [ ! -f "main.py" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 创建构建目录
mkdir -p build
mkdir -p dist

echo "📦 构建 Python 服务器..."
# 使用 PyInstaller 打包 Python 应用
python3 -m PyInstaller build_python.spec --distpath build/python --workpath build/temp --clean

if [ $? -ne 0 ]; then
    echo "❌ Python 打包失败"
    exit 1
fi

echo "✅ Python 服务器打包完成"

echo "🌐 构建前端应用..."
# 构建前端
cd web_app
npm run build
cd ..

if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

echo "✅ 前端应用构建完成"

echo "📱 构建 Electron 应用..."
# 构建 Electron 应用
npm run package

if [ $? -ne 0 ]; then
    echo "❌ Electron 应用打包失败"
    exit 1
fi

echo "✅ 应用打包完成！"
echo "📁 输出文件位置: release/" 