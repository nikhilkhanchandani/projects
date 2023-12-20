const express = require('express');
const router = express.Router();
const {
  uploadMultipleFiles,
  viewRecords,
  deleteAllRecords,
  deleteRecords,
  viewRecord,
  fileUpload,
} = require('../services/upload.service');

// http://localhost:4000/api/upload/multiple
router.post('/multiple', async (req, res) => {
  await uploadMultipleFiles(req, res);
});

// http://localhost:4000/api/upload/fileUpload
router.post('/fileUpload', async (req, res) => {
  await fileUpload(req, res);
});

// http://localhost:4000/api/upload/view/1
router.get('/view/:id', async (req, res) => {
  const results = await viewRecord(req, req.params.id);
  res.send(results);
});

// http://localhost:4000/api/upload/view
router.get('/view', async (req, res) => {
  const results = await viewRecords(req);
  res.send(results);
});

// http://localhost:4000/api/upload/delete/1
router.delete('/delete/:id', async (req, res) => {
  const results = await deleteRecords(req, req.params.id);
  res.send(results);
});

// http://localhost:4000/api/upload/deleteAll
router.delete('/deleteAll', async (req, res) => {
  const results = await deleteAllRecords(req);
  res.send(results);
});

module.exports = router;
