import { app, BrowserWindow, ipcMain } from "electron";
import { exec } from "child_process";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

interface PortInfo {
  protocol: string;
  localAddress: string;
  port: number;
  foreignAddress: string;
  foreignPort: number;
  state: string;
  pid: number;
}

function getUsedPorts(): Promise<PortInfo[]> {
  return new Promise((resolve, reject) => {
    exec("netstat -ano", { windowsHide: true }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      const lines = stdout
        .split("\n")
        .filter(
          (line) =>
            line.trim().startsWith("TCP") || line.trim().startsWith("UDP"),
        );
      const ports: PortInfo[] = [];

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 5) continue;

        const protocol = parts[0];
        const localAddress = parts[1];
        const localParts = localAddress.split(":");
        const portStr = localParts[localParts.length - 1];
        const localIp = localParts.slice(0, -1).join(":") || localAddress;

        const port = parseInt(portStr ?? "", 10);

        const foreignAddress = protocol === "UDP" ? "*" : (parts[2] ?? "*");
        const state = protocol === "UDP" ? "LISTENING" : (parts[3] ?? "UNKNOWN");
        const pid =
          protocol === "UDP" ? parseInt(parts[2] ?? "0", 10) : parseInt(parts[4] ?? "0", 10);

        if (!isNaN(port)) {
          ports.push({
            protocol,
            localAddress: localIp,
            port,
            foreignAddress: foreignAddress,
            foreignPort: foreignAddress.includes(":")
              ? parseInt(foreignAddress.split(":").pop() ?? "0", 10)
              : 0,
            state,
            pid,
          });
        }
      }
      resolve(ports);
    });
  });
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../.next/index.html"));
  }
}

ipcMain.handle('get-used-ports', async () => {
  try {
    return await getUsedPorts();
  } catch (error) {
    console.error('Error getting ports:', error);
    throw error;
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
