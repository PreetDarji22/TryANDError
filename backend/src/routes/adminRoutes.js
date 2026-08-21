const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// All admin routes require authenticated user with ADMIN role
router.use(requireAuth, requireAdmin);

router.get('/stats', adminController.getSystemStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/role', adminController.updateUserRole);

module.exports = router;
