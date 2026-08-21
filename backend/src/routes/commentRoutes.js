const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.delete('/:id', requireAuth, commentController.deleteComment);

module.exports = router;
