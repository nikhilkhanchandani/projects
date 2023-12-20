const mysql = require("mysql2/promise");

const mysqlPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "project1",
});

module.exports = mysqlPool;
