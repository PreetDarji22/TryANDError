const db = require('../config/db');

// Get system stats overview
const getSystemStats = async (req, res, next) => {
  try {
    const [usersCount, questionsCount, answersCount, commentsCount] = await Promise.all([
      db.query(`SELECT COUNT(*) AS count FROM users`),
      db.query(`SELECT COUNT(*) AS count FROM questions`),
      db.query(`SELECT COUNT(*) AS count FROM answers`),
      db.query(`SELECT COUNT(*) AS count FROM comments`),
    ]);

    res.json({
      stats: {
        users: parseInt(usersCount.rows[0]?.count || 0),
        questions: parseInt(questionsCount.rows[0]?.count || 0),
        answers: parseInt(answersCount.rows[0]?.count || 0),
        comments: parseInt(commentsCount.rows[0]?.count || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

// List all users (Admin view)
const getAllUsers = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT id, username, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
};

// Update user role (e.g. promote to ADMIN or demote to USER)
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: "Role must be either 'USER' or 'ADMIN'." });
    }

    const uRes = await db.query(`SELECT id, username FROM users WHERE id = $1`, [userId]);
    if (uRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await db.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, userId]);

    res.json({
      message: `Role for user ${uRes.rows[0].username} updated to ${role}`,
      user_id: parseInt(userId),
      role,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  updateUserRole,
};
