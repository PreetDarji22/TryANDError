const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middlewares/uploadMiddleware');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/', requireAuth, upload.single('image'), uploadController.uploadImage);

module.exports = router;
