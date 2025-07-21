import { useCallback, useEffect, useRef, useState } from "react";

import useInputImage from "@/hooks/useInputImage";
import { keepGUIAlive } from "@/lib/utils";
import { getServerConfig } from "@/lib/api";
import Header from "@/components/Header";
import Workspace from "@/components/Workspace";
import FileSelect from "@/components/FileSelect";
import { Toaster } from "./components/ui/toaster";
import { useStore } from "./lib/states";
import { useWindowSize } from "react-use";

const SUPPORTED_FILE_TYPE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/tiff",
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [file, updateAppState, setServerConfig, setFile] = useStore((state) => [
    state.file,
    state.updateAppState,
    state.setServerConfig,
    state.setFile,
  ]);

  const userInputImage = useInputImage();
  const windowSize = useWindowSize();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const checkServer = async () => {
      try {
        await fetch("http://127.0.0.1:8080/api/v1/server-config");
        setLoading(false);
      } catch (e) {
        timer = setTimeout(checkServer, 1000);
      }
    };
    checkServer();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userInputImage) {
      setFile(userInputImage);
    }
  }, [userInputImage, setFile]);

  useEffect(() => {
    updateAppState({ windowSize });
  }, [windowSize]);

  useEffect(() => {
    const fetchServerConfig = async () => {
      const serverConfig = await getServerConfig();
      setServerConfig(serverConfig);
      if (serverConfig.isDesktop) {
        // Keeping GUI Window Open
        keepGUIAlive();
      }
    };
    fetchServerConfig();
  }, []);

  const dragCounter = useRef(0);

  const handleDrag = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragIn = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current += 1;
  }, []);

  const handleDragOut = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current > 0) return;
  }, []);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files.length > 0
    ) {
      if (event.dataTransfer.files.length > 1) {
        // setToastState({
        //   open: true,
        //   desc: "Please drag and drop only one file",
        //   state: "error",
        //   duration: 3000,
        // })
      } else {
        const dragFile = event.dataTransfer.files[0];
        const fileType = dragFile.type;
        if (SUPPORTED_FILE_TYPE.includes(fileType)) {
          setFile(dragFile);
        } else {
          // setToastState({
          //   open: true,
          //   desc: "Please drag and drop an image file",
          //   state: "error",
          //   duration: 3000,
          // })
        }
      }
      event.dataTransfer.clearData();
    }
  }, []);

  const onPaste = useCallback((event: ClipboardEvent) => {
    // TODO: when sd side panel open, ctrl+v not work
    // https://htmldom.dev/paste-an-image-from-the-clipboard/
    if (!event.clipboardData) {
      return;
    }
    const clipboardItems = event.clipboardData.items;
    const items: DataTransferItem[] = Array.prototype.slice
      .call(clipboardItems)
      .filter((item: DataTransferItem) => {
        // Filter the image items only
        return item.type.indexOf("image") !== -1;
      });

    if (items.length === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // TODO: add confirm dialog

    const item = items[0];
    // Get the blob of image
    const blob = item.getAsFile();
    if (blob) {
      setFile(blob);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("dragenter", handleDragIn);
    window.addEventListener("dragleave", handleDragOut);
    window.addEventListener("dragover", handleDrag);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("paste", onPaste);
    return function cleanUp() {
      window.removeEventListener("dragenter", handleDragIn);
      window.removeEventListener("dragleave", handleDragOut);
      window.removeEventListener("dragover", handleDrag);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("paste", onPaste);
    };
  });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: 20,
        }}
      >
        <div>正在加载应用，请稍后</div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full bg-[radial-gradient(circle_at_1px_1px,_#8e8e8e8e_1px,_transparent_0)] [background-size:20px_20px] bg-repeat">
      <Toaster />
      <Header />
      <Workspace />
      {!file ? (
        <FileSelect
          onSelection={async (f) => {
            setFile(f);
          }}
        />
      ) : null}
    </main>
  );
}
