const db = require('../config/db');

/**
  Create notification record in DB
 */
async function createNotification(userId, actorId, type, referenceUrl) {
  // Don't notify oneself
  if (parseInt(userId) === parseInt(actorId)) return;

  try {
    await db.query(
      `INSERT INTO notifications (user_id, actor_id, type, reference_url, is_read) 
       VALUES ($1, $2, $3, $4, 0)`,
      [userId, actorId, type, referenceUrl]
    );
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
}

/**
  Scan text for @username mentions and notify mentioned users
 */
async function notifyMentions(text, actorId, referenceUrl) {
  if (!text) return;

  // Match @username (alphanumeric and underscore)
  const regex = /@([a-zA-Z0-9_]+)/g;
  const matches = [...text.matchAll(regex)];
  
  const usernames = Array.from(new Set(matches.map(m => m[1])));

  for (const username of usernames) {
    try {
      const userRes = await db.query(`SELECT id FROM users WHERE LOWER(username) = LOWER($1)`, [username]);
      if (userRes.rows.length > 0) {
        const targetUserId = userRes.rows[0].id;
        await createNotification(targetUserId, actorId, 'MENTION', referenceUrl);
      }
    } catch (err) {
      console.error(`Failed to process mention for @${username}:`, err.message);
    }
  }
}

/**
  Notify question owner of a new answer
 */
async function notifyNewAnswer(questionOwnerId, actorId, referenceUrl) {
  await createNotification(questionOwnerId, actorId, 'NEW_ANSWER', referenceUrl);
}

/**
  Notify answer owner of a new comment
 */
async function notifyNewComment(answerOwnerId, actorId, referenceUrl) {
  await createNotification(answerOwnerId, actorId, 'NEW_COMMENT', referenceUrl);
}

module.exports = {
  createNotification,
  notifyMentions,
  notifyNewAnswer,
  notifyNewComment,
};
