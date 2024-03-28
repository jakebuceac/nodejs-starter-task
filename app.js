var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var webSocketServer = require('./websocket');

const redis = require('redis');
const client = redis.createClient();

client.connect();

client.on('error', (err) => {
    console.log(`Error ${err}`)
});

var apiOperator = require('./routes/api/operator');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// api
app.use('/api/operator', apiOperator);

// web
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

webSocketServer.on('connection', async function connection(webSocketServer) {
  webSocketServer.on('error', console.error);

  const message = {
    type: "connection",
    data: JSON.parse(await client.get('data'))
  }

  webSocketServer.send(JSON.stringify(message));
});

module.exports = app;
