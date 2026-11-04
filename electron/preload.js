
"use strict";

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld(
  "hireflowDesktop",
  {
    platform: process.platform
  }
);
