const db = require('../config/db');
const { notifyNewComment, notifyMentions } = require('../utils/notificationHelper');

// Post comment on answer
const postComment = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required.' });
    }

    // Verify answer exists & get answer owner + question id
    const aRes = await db.query(
      `SELECT a.id, a.user_id, a.question_id FROM answers a WHERE a.id = $1`,
      [answerId]
    );

    if (aRes.rows.length === 0) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    const answer = aRes.rows[0];
    const userId = req.user.id;

    // Create comment
    const insertRes = await db.query(
      `INSERT INTO comments (answer_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, answer_id, user_id, content, created_at`,
      [answerId, userId, content.trim()]
    );

    const comment = insertRes.rows[0];
    const refUrl = `/questions/${answer.question_id}#comment-${comment.id}`;

    // 1. Notify Answer Owner
    await notifyNewComment(answer.user_id, userId, refUrl);

    // 2. Notify @username Mentions
    await notifyMentions(content, userId, refUrl);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        ...comment,
        author: { id: req.user.id, username: req.user.username },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete Comment
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cRes = await db.query(`SELECT user_id FROM comments WHERE id = $1`, [id]);
    if (cRes.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    const comment = cRes.rows[0];

    // Authorization: Owner or Admin
    if (comment.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment.' });
    }

    await db.query(`DELETE FROM comments WHERE id = $1`, [id]);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  postComment,
  deleteComment,
};
