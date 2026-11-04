
"use strict";

const {
  app,
  BrowserWindow,
  Menu,
  shell
} = require("electron");

const path = require("path");

let mainWindow;

const isDevelopment = !app.isPackaged;

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1500,
    height: 950,

    minWidth: 1050,
    minHeight: 700,

    title: "HIREFLOW | HR Workspace",

    backgroundColor: "#ffffff",

    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(
        __dirname,
        "electron",
        "preload.js"
      ),

      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.loadFile(
    path.join(__dirname, "index.html")
  );

  // 외부 링크는 기본 브라우저에서 열기
  mainWindow.webContents.setWindowOpenHandler(
    ({ url }) => {

      if (
        url.startsWith("https://") ||
        url.startsWith("http://")
      ) {
        shell.openExternal(url);
      }

      return {
        action: "deny"
      };
    }
  );

  // 외부 사이트로 앱 화면이 이동하지 않도록 제한
  mainWindow.webContents.on(
    "will-navigate",
    (event, navigationUrl) => {

      if (
        navigationUrl.startsWith("http://") ||
        navigationUrl.startsWith("https://")
      ) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }

    }
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (isDevelopment) {
    // 개발 중에만 개발자 도구 사용 가능
    // mainWindow.webContents.openDevTools();
  }
}

function createMenu() {

  const template = [
    {
      label: "HIREFLOW",
      submenu: [
        {
          label: "새로고침",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            mainWindow?.reload();
          }
        },
        {
          label: "개발자 도구",
          accelerator: "F12",
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          }
        },
        {
          type: "separator"
        },
        {
          label: "종료",
          accelerator: "Alt+F4",
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "화면",
      submenu: [
        {
          label: "전체 화면",
          accelerator: "F11",
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(
                !mainWindow.isFullScreen()
              );
            }
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(template)
  );
}

app.whenReady().then(() => {

  createMenu();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

});

app.on("window-all-closed", () => {

  if (process.platform !== "darwin") {
    app.quit();
  }

});
