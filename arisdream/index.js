const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//auth urls

const authRoutes = require("./controllers/auth.controller");
app.use("/api/auth", authRoutes);

app.use("/", express.static(path.join(__dirname, "/public")));

app.get("/xyz", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/test.html"));
});
const httpServer = require("http").createServer(app);
httpServer.listen(4000, () => {
  console.log("Server running");
});
