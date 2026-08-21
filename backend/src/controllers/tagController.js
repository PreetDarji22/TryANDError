const db = require('../config/db');

// Get all tags with total usage count
const getAllTags = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.name, COUNT(qt.question_id) AS question_count
      FROM tags t
      LEFT JOIN question_tags qt ON t.id = qt.tag_id
      GROUP BY t.id, t.name
      ORDER BY question_count DESC, t.name ASC
    `);

    res.json({ tags: result.rows });
  } catch (err) {
    next(err);
  }
};

// Create a new tag (or return existing)
const createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required.' });
    }

    const cleanName = name.trim().toLowerCase();

    // Check existing
    const existing = await db.query(`SELECT id, name FROM tags WHERE LOWER(name) = $1`, [cleanName]);
    if (existing.rows.length > 0) {
      return res.json({ tag: existing.rows[0], message: 'Tag already exists.' });
    }

    const insertRes = await db.query(`INSERT INTO tags (name) VALUES ($1) RETURNING id, name`, [cleanName]);
    res.status(201).json({ tag: insertRes.rows[0], message: 'Tag created successfully.' });
  } catch (err) {
    next(err);
  }
};

// Delete tag (Admin only)
const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tagRes = await db.query(`SELECT id FROM tags WHERE id = $1`, [id]);
    if (tagRes.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found.' });
    }

    await db.query(`DELETE FROM tags WHERE id = $1`, [id]);
    res.json({ message: 'Tag deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTags,
  createTag,
  deleteTag,
};
