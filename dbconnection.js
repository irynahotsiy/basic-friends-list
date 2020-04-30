require("dotenv").config();
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "test",
  port: process.env.DB_PORT || 3306,
  multipleStatements: true,
});

module.exports = connection;
