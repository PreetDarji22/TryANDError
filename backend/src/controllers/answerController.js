const db = require('../config/db');
const { notifyNewAnswer, notifyMentions } = require('../utils/notificationHelper');

// Post Answer to Question
const postAnswer = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { description } = req.body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Answer description is required.' });
    }

    // Verify question exists
    const qRes = await db.query(`SELECT id, user_id, title FROM questions WHERE id = $1`, [questionId]);
    if (qRes.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const question = qRes.rows[0];
    const userId = req.user.id;

    // Create answer
    const insertRes = await db.query(
      `INSERT INTO answers (question_id, user_id, description, is_accepted) 
       VALUES ($1, $2, $3, 0) 
       RETURNING id, question_id, user_id, description, is_accepted, created_at, updated_at`,
      [questionId, userId, description.trim()]
    );

    const answer = insertRes.rows[0];
    const refUrl = `/questions/${questionId}#answer-${answer.id}`;

    // 1. Notify Question Owner
    await notifyNewAnswer(question.user_id, userId, refUrl);

    // 2. Notify @username Mentions
    await notifyMentions(description, userId, refUrl);

    res.status(201).json({
      message: 'Answer posted successfully',
      answer: {
        ...answer,
        is_accepted: Boolean(answer.is_accepted),
        author: { id: req.user.id, username: req.user.username },
        vote_score: 0,
        upvotes: 0,
        downvotes: 0,
        comments: [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update Answer
const updateAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Answer description is required.' });
    }

    const aRes = await db.query(`SELECT * FROM answers WHERE id = $1`, [id]);
    if (aRes.rows.length === 0) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    const answer = aRes.rows[0];

    // Authorization: Answer Owner or Admin
    if (answer.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to edit this answer.' });
    }

    await db.query(
      `UPDATE answers SET description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [description.trim(), id]
    );

    res.json({
      message: 'Answer updated successfully',
      answer: {
        ...answer,
        description: description.trim(),
        is_accepted: Boolean(answer.is_accepted),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete Answer
const deleteAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const aRes = await db.query(`SELECT user_id FROM answers WHERE id = $1`, [id]);
    if (aRes.rows.length === 0) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    const answer = aRes.rows[0];

    // Authorization: Answer Owner or Admin
    if (answer.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this answer.' });
    }

    await db.query(`DELETE FROM answers WHERE id = $1`, [id]);
    res.json({ message: 'Answer deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// Toggle Accept Answer (Only Question Owner)
const acceptAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch answer & associated question
    const aRes = await db.query(`
      SELECT a.id, a.question_id, a.is_accepted, q.user_id AS question_owner_id
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.id = $1
    `, [id]);

    if (aRes.rows.length === 0) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    const answer = aRes.rows[0];

    // Authorization check: Only Question Owner can accept answer
    if (answer.question_owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the question owner can mark an answer as accepted.' });
    }

    const newAcceptedState = !Boolean(answer.is_accepted);

    // Reset all accepted answers for this question
    await db.query(`UPDATE answers SET is_accepted = 0 WHERE question_id = $1`, [answer.question_id]);

    if (newAcceptedState) {
      // Mark current answer as accepted
      await db.query(`UPDATE answers SET is_accepted = 1 WHERE id = $1`, [id]);
    }

    res.json({
      message: newAcceptedState ? 'Answer marked as accepted' : 'Answer unmarked as accepted',
      is_accepted: newAcceptedState,
      answer_id: parseInt(id),
      question_id: answer.question_id,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  postAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
};
