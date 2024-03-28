"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const websocket_js_1 = __importDefault(require("../../websocket.js"));
const redis_1 = __importDefault(require("redis"));
var router = express_1.default.Router();
const client = redis_1.default.createClient();
/* GET home page. */
router.get('/', async function (req, res, next) {
    if (!req.query.op || !req.query.op_name || !req.query.status) {
        return res.status(404).send('Route not found');
    }
    const operationId = req.query.op;
    await client.connect();
    client.on('error', (err) => {
        console.log(`Error ${err}`);
    });
    const data = JSON.parse(await client.get('data') ?? 'null');
    if (data[operationId]) {
        data[operationId].status = req.query.status;
        await client.set('data', JSON.stringify(data));
        data[operationId].id = req.query.op;
        const message = {
            type: "update",
            data: data[operationId]
        };
        websocket_js_1.default.clients.forEach(function each(client) {
            client.send(JSON.stringify(message));
        });
        await client.disconnect();
        return res.json({
            message: 'Status updated successfully'
        });
    }
    else {
        return res.json({
            message: 'User does not exist'
        });
    }
});
exports.default = router;
