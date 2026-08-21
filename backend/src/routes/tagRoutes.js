const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/', tagController.getAllTags);
router.post('/', requireAuth, tagController.createTag);
router.delete('/:id', requireAuth, requireAdmin, tagController.deleteTag);

module.exports = router;
