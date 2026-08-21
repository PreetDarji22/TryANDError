const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const answerController = require('../controllers/answerController');
const { optionalAuth, requireAuth } = require('../middlewares/authMiddleware');

// Public / Guest endpoints
router.get('/', optionalAuth, questionController.getQuestions);
router.get('/:id', optionalAuth, questionController.getQuestionById);

// Protected user endpoints
router.post('/', requireAuth, questionController.createQuestion);
router.put('/:id', requireAuth, questionController.updateQuestion);
router.delete('/:id', requireAuth, questionController.deleteQuestion);

// Post answer to a specific question
router.post('/:questionId/answers', requireAuth, answerController.postAnswer);

module.exports = router;
