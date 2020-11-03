/**
 * TODO:
 * 1. [x] connect to redis
 * 2. [] create route to fetch current trends (used by clients for initial
 * page load)
 * 3. [] implement socket.io / subscribe to redis / publish to clients
 *    on change? should this be a separate container/service?)
 */
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var googleRouter = require("./routes/google");
var twitterRouter = require("./routes/twitter");
var yahooRouter = require("./routes/yahoo");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/google", googleRouter);
app.use("/twitter", twitterRouter);
app.use("/yahoo", yahooRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  console.error(err);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(res.locals || { error: "An error has occured." });
});

module.exports = app;
