var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var dotenv = require('dotenv').config();
const multer = require('multer')()
var indexRouter = require('./routes/index');
const response = require('./utils/formatResponse')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  const status = err.status || 500;
  if (err.name === "NotFoundError") {
    return response(res, status, false, "Not Found", null)
  } 
  return response(res, false, status, err.message, null)
});

module.exports = app;
