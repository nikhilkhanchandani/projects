const db = require('./db');
const multer = require('multer');
const fs = require('fs');
const fsPromise = require('fs/promises');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { secretSalt } = require('../config');

const viewRecords = async (req) => {
  try {
    const token = req.cookies.jwt;
    const decodeToken = await jwt.verify(token, secretSalt);

    const rec = await db.query('select * from posts WHERE userId = ?', [
      decodeToken.id,
    ]);

    const count = rec[0].length;

    return { status: true, count, results: rec[0] };
  } catch (err) {
    return { status: false, error: err.message };
  }
};

const viewRecord = async (req, id) => {
  try {
    const token = req.cookies.jwt;
    const decodeToken = await jwt.verify(token, secretSalt);

    const rec = await db.query(
      'select * from posts WHERE userId = ? and postId = ?',
      [decodeToken.id, id]
    );

    return { status: true, result: rec[0][0] };
  } catch (err) {
    return { status: false, error: err.message };
  }
};

const deleteRecords = async (req, id) => {
  try {
    const token = req.cookies.jwt;
    const decodeToken = await jwt.verify(token, secretSalt);
    const rec = await db.query(
      'select * from posts WHERE userId = ? and postId = ?',
      [decodeToken.id, id]
    );

    if (rec[0].length > 0) {
      for (let res of rec[0]) {
        const images = JSON.parse(res.images);
        for (let img of images) {
          await fsPromise.unlink(img.destination + '/' + img.filename);
        }
      }
    }

    await db.query('delete from posts WHERE userId = ? and postId = ?', [
      decodeToken.id,
      id,
    ]);

    return { status: true };
  } catch (err) {
    return { status: false, error: err.message };
  }
};

const deleteAllRecords = async (req) => {
  try {
    const token = req.cookies.jwt;
    const decodeToken = await jwt.verify(token, secretSalt);
    const dir = `./public/uploads/user_${decodeToken.id}`;
    fs.rmSync(dir, { recursive: true, force: true });
    await db.query('delete from posts WHERE userId = ?', [decodeToken.id]);

    return { status: true };
  } catch (err) {
    return { status: false, error: err.message };
  }
};

const fileUpload = async (req, res) => {
  try {
    const dir = req.query.dir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueString = uuidv4();
        cb(null, uniqueString + '_' + Date.now() + '_' + file.originalname);
      },
    });
    const upload = multer({ storage }).array('file', 1000);
    upload(req, res, async function (err) {
      try {
        if (req.fileValidationError) {
          return res.send({ status: false, error: req.fileValidationError });
        } else if (!req.files) {
          return res.send({
            status: false,
            error: 'Please select a file to upload',
          });
        } else if (err instanceof multer.MulterError) {
          return res.send({ status: false, error: err });
        } else if (err) {
          return res.send({ status: false, error: err });
        }

        for (let file of req.files) {
          const url = `${file.destination.replace('./public', '/public')}/${
            file.filename
          }`;
          file.url = url;
        }

        return res.send({
          status: true,
          files: req.files,
        });
      } catch (err) {
        return res.send({ status: false, error: err.message });
      }
    });
  } catch (err) {
    return res.send({ status: false, error: err.message });
  }
};

const uploadMultipleFiles = async (req, res) => {
  try {
    // token access
    const token = req.cookies.jwt;
    const decodeToken = await jwt.verify(token, secretSalt);

    const dir = `./public/uploads/user_${decodeToken.id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueString = uuidv4();
        cb(null, uniqueString + '_' + Date.now() + '_' + file.originalname);
      },
    });
    const upload = multer({ storage }).array('file', 1000);

    upload(req, res, async function (err) {
      try {
        if (req.fileValidationError) {
          return res.send({ status: false, error: req.fileValidationError });
        } else if (!req.files) {
          return res.send({
            status: false,
            error: 'Please select a file to upload',
          });
        } else if (err instanceof multer.MulterError) {
          return res.send({ status: false, error: err });
        } else if (err) {
          return res.send({ status: false, error: err });
        }

        for (let file of req.files) {
          const url = `${file.destination.replace('./public', '/public')}/${
            file.filename
          }`;
          file.url = url;
        }

        const row = await db.query(
          'INSERT INTO posts(userId, images, text) VALUES (?, ?, ?)',
          [decodeToken.id, JSON.stringify(req.files), req.body.text]
        );

        return res.send({
          status: true,
          files: req.files,
          body: req.body,
          id: row[0].insertId,
        });
      } catch (err) {
        return res.send({ status: false, error: err.message });
      }
    });
  } catch (err) {
    return res.send({ status: false, error: err.message });
  }
};

module.exports = {
  uploadMultipleFiles,
  viewRecords,
  deleteAllRecords,
  deleteRecords,
  viewRecord,
  fileUpload,
};
