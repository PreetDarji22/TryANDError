const db = require('../config/db');

// Get notifications for current logged-in user
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const result = await db.query(`
      SELECT 
        n.id,
        n.user_id,
        n.actor_id,
        n.type,
        n.reference_url,
        n.is_read,
        n.created_at,
        u.username AS actor_username
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limitNum, offset]);

    const formattedNotifications = result.rows.map(n => ({
      id: n.id,
      type: n.type,
      reference_url: n.reference_url,
      is_read: Boolean(n.is_read),
      created_at: n.created_at,
      actor: {
        id: n.actor_id,
        username: n.actor_username,
      },
    }));

    res.json({ notifications: formattedNotifications });
  } catch (err) {
    next(err);
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(`
      SELECT COUNT(*) AS unread_count 
      FROM notifications 
      WHERE user_id = $1 AND (is_read = 0 OR is_read = false)
    `, [userId]);

    const count = parseInt(result.rows[0]?.unread_count || 0);
    res.json({ unread_count: count });
  } catch (err) {
    next(err);
  }
};

// Mark single notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const nRes = await db.query(`SELECT user_id FROM notifications WHERE id = $1`, [id]);
    if (nRes.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    if (nRes.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    await db.query(`UPDATE notifications SET is_read = 1 WHERE id = $1`, [id]);

    res.json({ message: 'Notification marked as read', id: parseInt(id) });
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await db.query(`UPDATE notifications SET is_read = 1 WHERE user_id = $1`, [userId]);

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
