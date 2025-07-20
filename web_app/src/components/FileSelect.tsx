import { useState } from "react";
import useResolution from "@/hooks/useResolution";

type FileSelectProps = {
  onSelection: (file: File) => void;
};

export default function FileSelect(props: FileSelectProps) {
  const { onSelection } = props;

  const [uploadElemId] = useState(`file-upload-${Math.random().toString()}`);

  const resolution = useResolution();

  function onFileSelected(file: File) {
    if (!file) {
      return;
    }
    // Skip non-image files
    const isImage = file.type.match("image.*");
    if (!isImage) {
      return;
    }
    try {
      // Check if file is larger than 20mb
      if (file.size > 20 * 1024 * 1024) {
        throw new Error("file too large");
      }
      onSelection(file);
    } catch (e) {
      // eslint-disable-next-line
      alert(`error: ${(e as any).message}`);
    }
  }

  return (
    <div className="absolute flex w-screen h-screen justify-center items-center pointer-events-none">
      <label
        htmlFor={uploadElemId}
        className="grid bg-background border-[2px] border-dashed border-gray-300 rounded-lg min-w-[600px] pointer-events-auto transition-all duration-200"
        style={{
          borderColor: "#d1d5db", // 默认边框色
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#86efac"; // 悬停背景色
          e.currentTarget.style.borderColor = "#4ade80"; // 悬停边框色
          e.currentTarget.style.color = "#166534"; // 悬停文字色
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = ""; // 恢复默认背景色
          e.currentTarget.style.borderColor = "#d1d5db"; // 恢复默认边框色
          e.currentTarget.style.color = ""; // 恢复默认文字色
        }}
      >
        <div
          className="grid p-16 w-full h-full"
          onDragOver={(ev) => {
            ev.stopPropagation();
            ev.preventDefault();
          }}
        >
          <input
            className="hidden"
            id={uploadElemId}
            name={uploadElemId}
            type="file"
            onChange={(ev) => {
              const file = ev.currentTarget.files?.[0];
              if (file) {
                onFileSelected(file);
              }
            }}
            accept="image/png, image/jpeg"
          />
          <p className="text-center">
            {resolution === "desktop"
              ? "点击或拖拽图片文件到这里"
              : "点击这里加载图片"}
          </p>
        </div>
      </label>
    </div>
  );
}
