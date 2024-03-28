"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const redis_1 = __importDefault(require("redis"));
const operator_js_1 = __importDefault(require("./routes/api/operator.js"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const users_js_1 = __importDefault(require("./routes/users.js"));
const websocket_js_1 = __importDefault(require("./websocket.js"));
const client = redis_1.default.createClient();
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
client.connect();
client.on('error', (err) => {
    console.log(`Error ${err}`);
});
var app = (0, express_1.default)();
// view engine setup
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// api
app.use('/api/operator', operator_js_1.default);
// web
app.use('/', index_js_1.default);
app.use('/users', users_js_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
websocket_js_1.default.on('connection', async function connection(webSocketServer) {
    webSocketServer.on('error', console.error);
    const message = {
        type: "connection",
        data: JSON.parse(await client.get('data') ?? 'null')
    };
    webSocketServer.send(JSON.stringify(message));
});
exports.default = app;
