const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const commentController = require('../controllers/commentController');
const voteController = require('../controllers/voteController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.put('/:id', requireAuth, answerController.updateAnswer);
router.delete('/:id', requireAuth, answerController.deleteAnswer);
router.patch('/:id/accept', requireAuth, answerController.acceptAnswer);

// Vote on answer
router.post('/:answerId/vote', requireAuth, voteController.voteAnswer);
router.delete('/:answerId/vote', requireAuth, voteController.removeVote);

// Comment on answer
router.post('/:answerId/comments', requireAuth, commentController.postComment);

module.exports = router;
