const db = require('../config/db');

// Vote on an answer (Upvote or Downvote)
const voteAnswer = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const { vote_type } = req.body; // 'UPVOTE' or 'DOWNVOTE'

    if (!['UPVOTE', 'DOWNVOTE'].includes(vote_type)) {
      return res.status(400).json({ error: "Vote type must be either 'UPVOTE' or 'DOWNVOTE'." });
    }

    // Check if answer exists
    const aRes = await db.query(`SELECT id FROM answers WHERE id = $1`, [answerId]);
    if (aRes.rows.length === 0) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    const userId = req.user.id;

    // Check existing vote
    const existingVote = await db.query(
      `SELECT id, vote_type FROM votes WHERE answer_id = $1 AND user_id = $2`,
      [answerId, userId]
    );

    let currentVote = null;

    if (existingVote.rows.length === 0) {
      // Create new vote
      await db.query(
        `INSERT INTO votes (answer_id, user_id, vote_type) VALUES ($1, $2, $3)`,
        [answerId, userId, vote_type]
      );
      currentVote = vote_type;
    } else {
      const prevType = existingVote.rows[0].vote_type;
      if (prevType === vote_type) {
        // Remove vote if clicked same button again
        await db.query(`DELETE FROM votes WHERE id = $1`, [existingVote.rows[0].id]);
        currentVote = null;
      } else {
        // Change vote type
        await db.query(`UPDATE votes SET vote_type = $1 WHERE id = $2`, [vote_type, existingVote.rows[0].id]);
        currentVote = vote_type;
      }
    }

    // Calculate new vote totals
    const scoreRes = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 WHEN vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END), 0) AS vote_score,
        COUNT(CASE WHEN vote_type = 'UPVOTE' THEN 1 END) AS upvotes,
        COUNT(CASE WHEN vote_type = 'DOWNVOTE' THEN 1 END) AS downvotes
      FROM votes
      WHERE answer_id = $1
    `, [answerId]);

    const stats = scoreRes.rows[0];

    res.json({
      message: 'Vote processed successfully',
      answer_id: parseInt(answerId),
      user_vote: currentVote,
      vote_score: parseInt(stats.vote_score || 0),
      upvotes: parseInt(stats.upvotes || 0),
      downvotes: parseInt(stats.downvotes || 0),
    });
  } catch (err) {
    next(err);
  }
};

// Delete user's vote on answer
const removeVote = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const userId = req.user.id;

    await db.query(`DELETE FROM votes WHERE answer_id = $1 AND user_id = $2`, [answerId, userId]);

    // Recalculate stats
    const scoreRes = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 WHEN vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END), 0) AS vote_score,
        COUNT(CASE WHEN vote_type = 'UPVOTE' THEN 1 END) AS upvotes,
        COUNT(CASE WHEN vote_type = 'DOWNVOTE' THEN 1 END) AS downvotes
      FROM votes
      WHERE answer_id = $1
    `, [answerId]);

    const stats = scoreRes.rows[0];

    res.json({
      message: 'Vote removed successfully',
      answer_id: parseInt(answerId),
      user_vote: null,
      vote_score: parseInt(stats.vote_score || 0),
      upvotes: parseInt(stats.upvotes || 0),
      downvotes: parseInt(stats.downvotes || 0),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  voteAnswer,
  removeVote,
};
