"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const webSocketServer = new ws_1.WebSocketServer({ port: 443 });
exports.default = webSocketServer;
