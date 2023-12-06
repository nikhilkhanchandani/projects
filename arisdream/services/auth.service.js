/**
 * Once user logs in here, we create a token called as JWT(json web token), cookie which can be accessed by backend and frontend
 */

const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const maxAge = 60 * 60 * 24 * 3; // how long the cookie is going to last

const createToken = (obj) => {
  const token = jwt.sign(obj, "secretKeySalt", {
    expiresIn: maxAge,
  });
  return token;
};

const registerUser = async (data, res) => {
  // check if username/email exists in database, and if it does give error
  const rUsername = await db.query("select * from users WHERE username = ?", [
    data.username,
  ]);
  if (rUsername[0][0]) {
    //Username already exits in db
    return {
      status: false,
      error: "Username already exists, please use a different username",
    };
  }
  const rEmail = await db.query("select * from users WHERE email = ?", [
    data.email,
  ]);
  if (rEmail[0][0]) {
    //Email already exits in db
    return {
      status: false,
      error: "Email already exists, please use a different email",
    };
  }
  // encrypt password using bycrpt
  const salt = await bcrypt.genSalt();
  const password = await bcrypt.hash(data.password, salt);
  // insert data in database
  const row = await db.query(
    "INSERT INTO users(username, email, password, name, profilePic) VALUES (?, ?, ?, ?, ?)",
    [data.username, data.email, password, data.name, data.profilePic]
  );
  // get unique id from data
  const obj = {
    id: row[0].insertId,
    name: data.name,
    email: data.email,
    username: data.username,
  };
  // create json web token
  const token = createToken(obj);
  // set cookie with this token
  res.cookie("jwt", token, {
    withCredentials: true,
    httpOnly: false,
    maxAge: maxAge * 1000,
  });
  // return data to user with the cookie
  return {
    id: row[0].insertId,
    name: data.name,
    email: data.email,
    username: data.username,
    token,
  };
};

const loginUser = async (data, res) => {
  //Takes username and queries database w the username
  const rUsername = await db.query("select * from users WHERE username = ?", [
    data.username,
  ]);
  if (!rUsername[0][0]) {
    //Username is not in our database, give error
    return {
      status: false,
      error: "Username does not exist, please register!",
    };
  }
  console.log("user: ", rUsername[0][0]);

  // If found, take username / password, compare db password with that specific user
  // If pass does not match, throw error
  const check = await bcrypt.compare(data.password, rUsername[0][0].password);
  if (!check) {
    return {
      status: false,
      error:
        "Password does not match in database. So please use correct password.",
    };
  }

  // Token creation
  // get unique id from data
  const obj = {
    id: rUsername[0][0].id,
    name: rUsername[0][0].name,
    email: rUsername[0][0].email,
    username: rUsername[0][0].username,
  };
  // create json web token
  const token = createToken(obj);
  // set cookie with this token
  res.cookie("jwt", token, {
    withCredentials: true,
    httpOnly: false,
    maxAge: maxAge * 1000,
  });
  // return data to user with the cookie
  return {
    status: true,
    id: rUsername[0][0].id,
    name: rUsername[0][0].name,
    email: rUsername[0][0].email,
    username: rUsername[0][0].username,
    token,
  };
};

module.exports = {
  loginUser,
  registerUser,
};
