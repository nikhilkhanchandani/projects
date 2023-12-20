const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('express-async-errors');

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

// auth urls
const authRoutes = require('./controllers/auth.controller');
app.use('/api/auth', authRoutes);

// upload urls
const uploadRoutes = require('./controllers/upload.controller');
app.use('/api/upload', uploadRoutes);

app.use('/public', express.static(path.join(__dirname, '/public')));

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

app.use((err, _req, res, next) => {
  res.status(err.status || 500).send({
    status: false,
    error: err.message,
    message: 'Something went wrong!',
  });
});

app.use(express.static('client/build'));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

const httpServer = require('http').createServer(app);
httpServer.listen(4000, () => {
  console.log('server running');
});
