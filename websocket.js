var { WebSocketServer } = require('ws');

var webSocketServer = new WebSocketServer({ port: 443});

module.exports = webSocketServer;