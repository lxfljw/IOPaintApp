// 统一的颜色变量系统
// 所有绿色相关的颜色都在这里定义，方便全局修改

// 主色调 - 绿色系
export const GREEN_PRIMARY = "#22c55e"; // 主要绿色
export const GREEN_LIGHT = "#4ade80"; // 浅绿色
export const GREEN_DARK = "#16a34a"; // 深绿色
export const GREEN_TRANSPARENT = "#22c55ebb"; // 半透明绿色

// 画笔相关颜色
export const BRUSH_COLOR = GREEN_TRANSPARENT; // 画笔轨迹颜色
export const BRUSH_BORDER_COLOR = GREEN_PRIMARY; // 画笔边框颜色
export const BRUSH_BG_COLOR = GREEN_TRANSPARENT; // 画笔背景颜色

// 进度条相关颜色
export const SLIDER_TRACK_COLOR = `${GREEN_PRIMARY}20`; // 进度条轨道颜色 (20% 透明度)
export const SLIDER_RANGE_COLOR = GREEN_PRIMARY; // 进度条填充颜色
export const SLIDER_THUMB_BORDER_COLOR = `${GREEN_PRIMARY}60`; // 进度条滑块边框颜色 (60% 透明度)

// 悬停效果颜色
export const HOVER_BG_COLOR = "#86efac"; // 悬停背景色 (green-300)
export const HOVER_BORDER_COLOR = "#4ade80"; // 悬停边框色 (green-400)
export const HOVER_TEXT_COLOR = "#166534"; // 悬停文字色 (green-900)

// 交互光标颜色
export const CURSOR_COLOR = GREEN_PRIMARY; // 交互光标颜色

// 导出所有颜色变量，方便在其他文件中使用
export const COLORS = {
  GREEN_PRIMARY,
  GREEN_LIGHT,
  GREEN_DARK,
  GREEN_TRANSPARENT,
  BRUSH_COLOR,
  BRUSH_BORDER_COLOR,
  BRUSH_BG_COLOR,
  SLIDER_TRACK_COLOR,
  SLIDER_RANGE_COLOR,
  SLIDER_THUMB_BORDER_COLOR,
  HOVER_BG_COLOR,
  HOVER_BORDER_COLOR,
  HOVER_TEXT_COLOR,
  CURSOR_COLOR,
} as const;
