const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  validate,
  updateProfilePic,
} = require('../services/auth.service');

// http://localhost:4000/api/auth/login
router.post('/login', async (req, res) => {
  const results = await loginUser(req.body, res);
  res.send(results);
});

// http://localhost:4000/api/auth/register
router.post('/register', async (req, res) => {
  const results = await registerUser(req.body, res);
  res.send(results);
});

// http://localhost:4000/api/auth/updateProfilePic
router.post('/updateProfilePic', async (req, res) => {
  const results = await updateProfilePic(req.body, req);
  res.send(results);
});

// http://localhost:4000/api/auth/validate
router.get('/validate', async (req, res) => {
  const results = await validate(req);
  res.send(results);
});

module.exports = router;
