const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const isDev = process.env.NODE_ENV === "development";

let mainWindow = null;
let pythonProcess = null;

function startPythonServer() {
  console.log("Starting Python server...");

  pythonProcess = spawn(
    "python3",
    ["main.py", "start", "--model", "lama", "--port", "8080"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1", // 确保 Python 输出不被缓存
      },
    }
  );

  pythonProcess.on("error", (err) => {
    console.error("Failed to start Python server:", err);
    app.quit();
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python server process exited with code ${code}`);
    if (code !== 0) {
      console.error(`Python server crashed with code ${code}`);
      app.quit();
    }
  });

  // 给 Python 服务器一些启动时间
  return new Promise((resolve) => setTimeout(resolve, 2000));
}

function createWindow() {
  console.log("Creating window...");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const loadUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "web_app", "dist", "index.html")}`;
  console.log(`Loading URL: ${loadUrl}`);

  mainWindow.loadURL(loadUrl).catch((err) => {
    console.error("Failed to load URL:", err);
    app.quit();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  console.log("App is ready, starting services...");

  try {
    await startPythonServer();
    createWindow();
  } catch (err) {
    console.error("Failed to start application:", err);
    app.quit();
  }

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  console.log("Cleaning up...");
  if (pythonProcess) {
    process.platform === "win32"
      ? spawn("taskkill", ["/pid", pythonProcess.pid, "/f", "/t"])
      : pythonProcess.kill();
  }
});
