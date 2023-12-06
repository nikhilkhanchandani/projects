const mysql = require("mysql2/promise");

const mysqlPool = mysql.createPool({
  host: "108.60.201.22",
  user: "consultl_user",
  password: "Target34!",
  database: "project1",
});

module.exports = mysqlPool;
