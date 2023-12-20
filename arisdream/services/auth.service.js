const db = require('./db');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { secretSalt } = require('../config');
const bcrypt = require('bcrypt');

const maxAge = 60 * 60 * 24 * 3;

const createToken = (obj) => {
  const token = jwt.sign(obj, secretSalt, {
    expiresIn: maxAge,
  });
  return token;
};

const validate = async (req) => {
  try {
    // token access
    const token = req.cookies.jwt;
    const decodeToken = await jwt.verify(token, secretSalt);
    return { status: true, ...decodeToken };
  } catch (err) {
    return { status: false, error: err.message };
  }
};

const updateProfilePic = async (data, req) => {
  try {
    const token = req.cookies.jwt;
    const decodeToken = await jwt.verify(token, secretSalt);

    // insert the record in database
    await db.query('UPDATE users set profilePic = ? WHERE id = ?', [
      data.profilePic,
      decodeToken.id,
    ]);

    const rUsername = await db.query('select * from users WHERE id = ?', [
      decodeToken.id,
    ]);
    if (!rUsername[0][0]) {
      return {
        status: false,
        error: 'Update User Does not exists.',
      };
    }

    // return the user information, with token
    return {
      status: true,
      id: decodeToken.id,
      name: rUsername[0][0].name,
      email: rUsername[0][0].email,
      username: rUsername[0][0].username,
      profilePic: rUsername[0][0].profilePic,
    };
  } catch (err) {
    return { status: false, error: err.message };
  }
};

const registerUser = async (data, res) => {
  // check if username exist in database, if it exists give error
  const rUsername = await db.query('select * from users WHERE username = ?', [
    data.username,
  ]);

  if (rUsername[0][0]) {
    // that means user with username already exist in database, so we have to return error
    return {
      status: false,
      error:
        'User already exists with current username, Please use different username',
    };
  }
  // check if email exist in database, if it exists give error
  const rEmail = await db.query('select * from users WHERE email = ?', [
    data.email,
  ]);

  if (rEmail[0][0]) {
    // that means user with username already exist in database, so we have to return error
    return {
      status: false,
      error:
        'User already exists with current email, Please use different email',
    };
  }
  // encrypt the password
  const salt = await bcrypt.genSalt();
  const password = await bcrypt.hash(data.password, salt);
  // insert the record in database
  const row = await db.query(
    'INSERT INTO users(username, email, password, name, profilePic) VALUES (?, ?, ?, ?, ?)',
    [data.username, data.email, password, data.name, data.profilePic]
  );

  const dir = `./public/profilePics/user_${row[0].insertId}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  // id which is inserted for the above record,
  const obj = {
    id: row[0].insertId,
    name: data.name,
    email: data.email,
    username: data.username,
    profilePic: data.profilePic,
  };
  // create the token
  const token = createToken(obj);
  // set the cookie with this token
  res.cookie('jwt', token, {
    withCredentials: true,
    httpOnly: false,
    maxAge: maxAge * 1000,
  });
  // return the user information, with token
  return {
    status: true,
    id: row[0].insertId,
    name: data.name,
    email: data.email,
    username: data.username,
    profilePic: data.profilePic,
    token,
    dir,
  };
};

const loginUser = async (data, res) => {
  // i will take the username and query the db with that username
  const rUsername = await db.query('select * from users WHERE username = ?', [
    data.username,
  ]);
  // if not found, then give error that user does not exist
  if (!rUsername[0][0]) {
    // that means user is not in our db and so return error
    return {
      status: false,
      error: 'Username does not match in database. So please register first.',
    };
  }
  // if found, we will record along with password, compare db password with what user has given
  const check = await bcrypt.compare(data.password, rUsername[0][0].password);
  if (!check) {
    // password does not match
    return {
      status: false,
      error:
        'Password does not match in database. So please use correct password.',
    };
  }
  // if password does not match, throw an error that password does not match
  // follow token creation method
  // id which is inserted for the above record,
  const obj = {
    id: rUsername[0][0].id,
    name: rUsername[0][0].name,
    email: rUsername[0][0].email,
    username: rUsername[0][0].username,
    profilePic: rUsername[0][0].profilePic,
  };
  // create the token
  const token = createToken(obj);
  // set the cookie with this token
  res.cookie('jwt', token, {
    withCredentials: true,
    httpOnly: false,
    maxAge: maxAge * 1000,
  });
  // return the user information, with token
  return {
    status: true,
    id: rUsername[0][0].id,
    name: rUsername[0][0].name,
    email: rUsername[0][0].email,
    username: rUsername[0][0].username,
    profilePic: rUsername[0][0].profilePic,
    token,
  };
};

module.exports = {
  loginUser,
  registerUser,
  validate,
  updateProfilePic,
};
