
"use strict";

const {
  contextBridge
} = require("electron");

contextBridge.exposeInMainWorld(
  "hireflowDesktop",
  {
    platform: process.platform,

    getVersion: () => {
      return require("electron").app?.getVersion?.();
    }
  }
);
