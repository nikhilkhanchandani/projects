const express = require("express");
const router = express.Router();
const { loginUser, registerUser } = require("../services/auth.service");

// http://localhost:4000/api/auth/login
router.post("/login", async (req, res) => {
  const results = await loginUser(req.body, res);
  res.send(results);
});
// http://localhost:4000/api/auth/register
router.post("/register", async (req, res) => {
  const results = await registerUser(req.body, res);
  res.send(results);
});

module.exports = router;
