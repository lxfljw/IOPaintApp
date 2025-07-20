# 🎨 颜色配置说明

## 📁 颜色变量文件

所有颜色变量都统一在 `web_app/src/lib/colors.ts` 文件中定义，方便全局修改。

## 🎯 主要颜色变量

### 主色调 - 绿色系
```typescript
export const GREEN_PRIMARY = "#22c55e"; // 主要绿色
export const GREEN_LIGHT = "#4ade80"; // 浅绿色
export const GREEN_DARK = "#16a34a"; // 深绿色
export const GREEN_TRANSPARENT = "#22c55ebb"; // 半透明绿色
```

### 画笔相关颜色
```typescript
export const BRUSH_COLOR = GREEN_TRANSPARENT; // 画笔轨迹颜色
export const BRUSH_BORDER_COLOR = GREEN_PRIMARY; // 画笔边框颜色
export const BRUSH_BG_COLOR = GREEN_TRANSPARENT; // 画笔背景颜色
```

### 进度条相关颜色
```typescript
export const SLIDER_TRACK_COLOR = `${GREEN_PRIMARY}20`; // 进度条轨道颜色
export const SLIDER_RANGE_COLOR = GREEN_PRIMARY; // 进度条填充颜色
export const SLIDER_THUMB_BORDER_COLOR = `${GREEN_PRIMARY}60`; // 进度条滑块边框颜色
```

### 悬停效果颜色
```typescript
export const HOVER_BG_COLOR = "#86efac"; // 悬停背景色
export const HOVER_BORDER_COLOR = "#4ade80"; // 悬停边框色
export const HOVER_TEXT_COLOR = "#166534"; // 悬停文字色
```

## 🔧 如何修改颜色

### 1. 修改主色调
要改变整个应用的颜色主题，只需修改 `GREEN_PRIMARY` 变量：

```typescript
// 改为蓝色主题
export const GREEN_PRIMARY = "#3b82f6"; // 蓝色
export const GREEN_LIGHT = "#60a5fa"; // 浅蓝色
export const GREEN_DARK = "#1d4ed8"; // 深蓝色
export const GREEN_TRANSPARENT = "#3b82f6bb"; // 半透明蓝色
```

### 2. 修改特定颜色
要修改特定功能的颜色，直接修改对应的变量：

```typescript
// 修改画笔颜色为红色
export const BRUSH_COLOR = "#ef4444bb"; // 红色画笔轨迹
export const BRUSH_BORDER_COLOR = "#dc2626"; // 红色画笔边框
```

### 3. 添加新的颜色主题
可以创建多个颜色主题：

```typescript
// 蓝色主题
export const BLUE_THEME = {
  PRIMARY: "#3b82f6",
  LIGHT: "#60a5fa",
  DARK: "#1d4ed8",
  TRANSPARENT: "#3b82f6bb",
};

// 紫色主题
export const PURPLE_THEME = {
  PRIMARY: "#8b5cf6",
  LIGHT: "#a78bfa",
  DARK: "#7c3aed",
  TRANSPARENT: "#8b5cf6bb",
};
```

## 📍 颜色使用位置

### 画笔光标
- **文件**: `web_app/src/components/Editor.tsx`
- **函数**: `renderBrush()`
- **颜色**: `BRUSH_BORDER_COLOR`, `BRUSH_BG_COLOR`

### 画笔轨迹
- **文件**: `web_app/src/lib/const.ts`
- **变量**: `BRUSH_COLOR`
- **实际绘制**: `web_app/src/lib/utils.ts` 中的 `drawLines()` 函数

### 进度条
- **文件**: `web_app/src/components/ui/slider.tsx`
- **颜色**: `SLIDER_TRACK_COLOR`, `SLIDER_RANGE_COLOR`, `SLIDER_THUMB_BORDER_COLOR`

### 文件上传悬停效果
- **文件**: `web_app/src/components/FileSelect.tsx`
- **颜色**: `HOVER_BG_COLOR`, `HOVER_BORDER_COLOR`, `HOVER_TEXT_COLOR`

## 🚀 快速修改示例

### 改为蓝色主题
```typescript
// 在 colors.ts 中修改
export const GREEN_PRIMARY = "#3b82f6"; // 蓝色
export const GREEN_LIGHT = "#60a5fa"; // 浅蓝色
export const GREEN_DARK = "#1d4ed8"; // 深蓝色
export const GREEN_TRANSPARENT = "#3b82f6bb"; // 半透明蓝色
```

### 改为紫色主题
```typescript
// 在 colors.ts 中修改
export const GREEN_PRIMARY = "#8b5cf6"; // 紫色
export const GREEN_LIGHT = "#a78bfa"; // 浅紫色
export const GREEN_DARK = "#7c3aed"; // 深紫色
export const GREEN_TRANSPARENT = "#8b5cf6bb"; // 半透明紫色
```

### 改为橙色主题
```typescript
// 在 colors.ts 中修改
export const GREEN_PRIMARY = "#f97316"; // 橙色
export const GREEN_LIGHT = "#fb923c"; // 浅橙色
export const GREEN_DARK = "#ea580c"; // 深橙色
export const GREEN_TRANSPARENT = "#f97316bb"; // 半透明橙色
```

## ⚠️ 注意事项

1. **透明度**: 颜色值末尾的 `bb` 表示透明度，可以根据需要调整
2. **一致性**: 修改颜色时建议保持整个应用的颜色一致性
3. **可读性**: 确保文字颜色与背景颜色有足够的对比度
4. **重新构建**: 修改颜色后需要重新构建前端应用

## 🔄 重新构建

修改颜色后，需要重新构建前端应用：

```bash
cd web_app && npm run build
cd .. && npm run package
``` 