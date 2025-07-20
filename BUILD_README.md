# 水印魔术师 - 构建说明

## 🚀 快速构建

### 方法 1: 使用构建脚本（推荐）
```bash
./build.sh
```

### 方法 2: 分步构建
```bash
# 1. 构建 Python 服务器
npm run build:python

# 2. 构建前端应用
npm run build

# 3. 构建 Electron 应用
npm run package
```

## 📦 构建产物

构建完成后，您将在以下位置找到文件：

- **Python 可执行文件**: `build/python/iopaint_server`
- **前端构建文件**: `web_app/dist/`
- **最终应用**: `release/` 目录下的 `.dmg` 文件

## 🔧 环境要求

### 开发环境
- **Python 3.9+**: 用于运行和打包 Python 应用
- **Node.js 16+**: 用于构建前端和 Electron 应用
- **npm**: 包管理器
- **PyInstaller**: Python 打包工具

### 安装依赖
```bash
# 安装 Python 依赖
pip3 install -r requirements.txt
pip3 install pyinstaller

# 安装 Node.js 依赖
npm install
cd web_app && npm install && cd ..
```

## 🎯 打包特性

### ✅ 已实现的功能
- **Python 环境完全打包**: 使用 PyInstaller 将 Python 解释器和所有依赖打包到可执行文件中
- **开发/生产环境分离**: 开发时使用系统 Python，生产时使用打包的 Python
- **自动依赖检测**: 自动检测并包含所有必要的 Python 包
- **跨平台支持**: 支持 macOS 平台

### 📋 打包内容
- **Python 可执行文件**: 包含完整的 Python 解释器和所有依赖
- **AI 模型**: 首次启动时自动下载 lama 模型
- **前端应用**: React + TypeScript 构建的 Web 界面
- **Electron 应用**: 桌面应用外壳

## 🚨 注意事项

1. **首次启动**: 应用首次启动时会下载 AI 模型，可能需要几分钟到几十分钟
2. **文件大小**: 由于包含了完整的 Python 环境和 AI 模型，最终应用文件较大（约 200MB+）
3. **权限**: 应用可能需要访问文件系统权限
4. **网络**: 首次启动需要互联网连接下载模型

## 🔍 故障排除

### 常见问题

1. **PyInstaller 命令未找到**
   ```bash
   python3 -m PyInstaller --version
   ```

2. **Python 依赖安装失败**
   ```bash
   pip3 install --upgrade pip
   pip3 install -r requirements.txt
   ```

3. **Node.js 依赖安装失败**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **构建失败**
   - 检查是否有足够的磁盘空间
   - 确保所有依赖都已正确安装
   - 查看构建日志获取详细错误信息

## 📝 开发模式

在开发模式下，应用会使用系统的 Python 环境：

```bash
# 设置开发环境变量
export NODE_ENV=development

# 启动开发模式
npm run dev
```

## 🎉 用户安装

用户只需要：
1. 下载 `.dmg` 文件
2. 拖拽到 Applications 文件夹
3. 双击启动应用

**无需安装 Python 或任何其他依赖！** 