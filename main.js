const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const isDev = process.env.NODE_ENV === "development";
const fs = require("fs");

let mainWindow = null;
let pythonProcess = null;

// 设置日志文件路径
const logPath = path.join(app.getPath("userData"), "app.log");
console.log("Log file path:", logPath);

// 重定向 console.log 到文件
const log = (...args) => {
  const message =
    args
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ") + "\n";
  fs.appendFileSync(logPath, message);
  process.stdout.write(message);
};

function getResourcePath() {
  if (isDev) {
    return process.cwd();
  }

  // 在打包后的应用中，资源文件在 Resources 目录下
  if (process.platform === "darwin") {
    return path.join(path.dirname(app.getAppPath()), "Resources");
  }

  return app.getAppPath();
}

function startPythonServer() {
  log("Starting Python server...");

  // 获取资源文件路径
  const resourcePath = getResourcePath();
  log("Resource path:", resourcePath);

  if (isDev) {
    // 开发环境：使用系统 Python
    log("Development mode: using system Python");
    const checkPython = spawn("python3", ["--version"]);
    checkPython.on("error", (err) => {
      log("Python check error:", err);
      dialog.showErrorBox(
        "Python 未找到",
        "请确保已安装 Python 3 并添加到系统环境变量中"
      );
      app.quit();
      return;
    });

    const pythonScript = path.join(resourcePath, "main.py");
    log("Python script path:", pythonScript);

    if (!fs.existsSync(pythonScript)) {
      log("Python script not found at:", pythonScript);
      dialog.showErrorBox("错误", `找不到 main.py 文件: ${pythonScript}`);
      app.quit();
      return;
    }

    pythonProcess = spawn(
      "python3",
      [pythonScript, "start", "--model", "lama", "--port", "8080"],
      {
        stdio: "pipe",
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
          PYTHONPATH: resourcePath,
        },
        cwd: resourcePath,
      }
    );
  } else {
    // 生产环境：使用打包的 Python 可执行文件
    log("Production mode: using bundled Python executable");
    const pythonExecutable = path.join(
      resourcePath,
      "python",
      "iopaint_server"
    );
    log("Python executable path:", pythonExecutable);

    if (!fs.existsSync(pythonExecutable)) {
      log("Python executable not found at:", pythonExecutable);
      dialog.showErrorBox(
        "错误",
        `找不到 Python 可执行文件: ${pythonExecutable}`
      );
      app.quit();
      return;
    }

    pythonProcess = spawn(
      pythonExecutable,
      ["start", "--model", "lama", "--port", "8080"],
      {
        stdio: "pipe",
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
          PYTHONPATH: resourcePath,
        },
        cwd: resourcePath,
      }
    );
  }

  // 捕获 Python 进程的输出
  pythonProcess.stdout.on("data", (data) => {
    log("Python stdout:", data.toString());
  });

  pythonProcess.stderr.on("data", (data) => {
    log("Python stderr:", data.toString());
  });

  pythonProcess.on("error", (err) => {
    log("Failed to start Python server:", err);
    dialog.showErrorBox(
      "Python 错误",
      `启动 Python 服务器失败: ${err.message}`
    );
    app.quit();
  });

  pythonProcess.on("close", (code) => {
    log(`Python server process exited with code ${code}`);
    if (code !== 0) {
      log(`Python server crashed with code ${code}`);
      dialog.showErrorBox(
        "Python 错误",
        `Python 服务器崩溃，错误代码: ${code}`
      );
      app.quit();
    }
  });

  return new Promise((resolve) => setTimeout(resolve, 2000));
}

function createWindow() {
  log("Creating window...");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, "build/icons/icon.icns"),
  });

  const loadUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "web_app", "dist", "index.html")}`;

  log(`Loading URL: ${loadUrl}`);

  mainWindow.loadURL(loadUrl).catch((err) => {
    log("Failed to load URL:", err);
    dialog.showErrorBox(
      "Loading Error",
      `Failed to load application: ${err.message}`
    );
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
  log("App is ready, starting services...");

  try {
    await startPythonServer();
    createWindow();
  } catch (err) {
    log("Failed to start application:", err);
    dialog.showErrorBox(
      "Startup Error",
      `Failed to start application: ${err.message}`
    );
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
  log("Cleaning up...");
  if (pythonProcess) {
    process.platform === "win32"
      ? spawn("taskkill", ["/pid", pythonProcess.pid, "/f", "/t"])
      : pythonProcess.kill();
  }
});
