const express = require("express");
const md5 = require("md5");
const mysql = require("mysql");
const session = require("express-session");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const pagesRoutes = require("./routes/pages");
const actionsRoutes = require("./routes/actions");

const connection = require("./dbconnection");

connection.connect();

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(authRoutes);
app.use(pagesRoutes);
app.use(actionsRoutes);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen("3000", (req, res) => {
  console.log("App started");
});
