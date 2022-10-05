const createError = require("http-errors");
const express = require("express");
const path = require("path");

const cookieParser = require("cookie-parser");
const logger = require("morgan");
const hbs = require("express-handlebars");
const db = require("./config/connection");
const session = require("express-session");
const nocache = require("nocache");
require('dotenv').config()


db.connect((err) => {
  if (err) console.log("connection Error" + err);
  else console.log("Database connected to port 27017");
});

const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, "views", "layout"),
    partialsDir: path.join(__dirname, "views", "partials"),
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    cookie: { maxAge: 60000000},
  })
);
app.use(nocache());

app.use("/", usersRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
