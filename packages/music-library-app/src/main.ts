import path from "node:path";

import { app, BrowserWindow, ipcMain, UtilityProcess,utilityProcess } from "electron";

import { DEBUG } from "./common/constants";
import { ClientEventChannel, isServerEventChannel } from "./common/events";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

// see https://www.electronforge.io/config/plugins/vite#hot-module-replacement-hmr
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let serverProcess: UtilityProcess | null = null;

const createWindow = async () => {
    // if (INSTALL_REACT_DEVELOPER_TOOLS) {
    //     await installReactDevTools();
    // }

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
            webSecurity: false,
        },
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        await mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        );
    }

    console.debug(`[main] initializing server process...`);
    // Note that server.ts must be configured as an electron-forge Vite entry point to get transpiled adjacent to this module
    serverProcess = utilityProcess.fork(path.resolve(__dirname, "./server.js"), [], {
        serviceName: "server",
        stdio: "inherit",
    });

    for (const channel of Object.values(ClientEventChannel)) {
        ipcMain.on(channel, (_mainEvent, data: object) => {
            const messageToForward = {
                channel,
                data,
            };

            console.debug(
                `[main] received "${channel}" event from renderer, forwarding to utility process`,
            );

            serverProcess?.postMessage(messageToForward);
        });
    }

    serverProcess.on("message", ({ channel, data }: { channel: string; data: object }) => {
        if (!isServerEventChannel(channel)) {
            return;
        }

        console.debug(
            `[main] received "${channel}" message from server, forwarding to renderer process`,
        );

        mainWindow?.webContents.send(channel, data);
    });

    if (DEBUG) {
        mainWindow.webContents.openDevTools();
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    void createWindow();
});

app.on("will-quit", () => {
    // TODO: fix this, currently getting an error about the utility process being destroyed already
    // serverProcess?.postMessage({ channel: ClientEventChannel.AUDIO_FILES_SERVER_STOP });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        void createWindow();
    }
});
