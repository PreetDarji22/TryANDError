const db = require('../config/db');
const { notifyMentions } = require('../utils/notificationHelper');

// Helper to attach tag objects to question by tag names array
async function syncQuestionTags(questionId, tagNames = []) {
  // Delete existing tags linkage
  await db.query(`DELETE FROM question_tags WHERE question_id = $1`, [questionId]);

  if (!Array.isArray(tagNames) || tagNames.length === 0) return [];

  const uniqueTags = Array.from(new Set(tagNames.map(t => t.trim()).filter(Boolean)));
  const tagObjects = [];

  for (const tagName of uniqueTags) {
    const cleanName = tagName.toLowerCase();
    let tagRes = await db.query(`SELECT id, name FROM tags WHERE LOWER(name) = $1`, [cleanName]);
    let tagId;

    if (tagRes.rows.length === 0) {
      const insertRes = await db.query(`INSERT INTO tags (name) VALUES ($1) RETURNING id, name`, [cleanName]);
      tagId = insertRes.rows[0].id;
      tagObjects.push(insertRes.rows[0]);
    } else {
      tagId = tagRes.rows[0].id;
      tagObjects.push(tagRes.rows[0]);
    }

    await db.query(`INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)`, [questionId, tagId]);
  }

  return tagObjects;
}

// Create Question
const createQuestion = async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Question title is required.' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Question description is required.' });
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'Questions must include at least one relevant tag.' });
    }

    const userId = req.user.id;

    // Create question record
    const insertRes = await db.query(
      `INSERT INTO questions (user_id, title, description) VALUES ($1, $2, $3) RETURNING id, user_id, title, description, created_at, updated_at`,
      [userId, title.trim(), description.trim()]
    );

    const question = insertRes.rows[0];

    // Attach tags
    const savedTags = await syncQuestionTags(question.id, tags);

    // Notify @username mentions in description
    const refUrl = `/questions/${question.id}`;
    notifyMentions(description, userId, refUrl);

    res.status(201).json({
      message: 'Question posted successfully',
      question: {
        ...question,
        author: { id: req.user.id, username: req.user.username },
        tags: savedTags,
        answers_count: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get Questions (List with filters, search, sorting & pagination)
const getQuestions = async (req, res, next) => {
  try {
    const { search, tag, sort = 'newest', page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      whereConditions.push(`(LOWER(q.title) LIKE LOWER($${paramIndex}) OR LOWER(q.description) LIKE LOWER($${paramIndex}))`);
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (tag && tag.trim()) {
      whereConditions.push(`q.id IN (
        SELECT qt.question_id FROM question_tags qt
        JOIN tags t ON qt.tag_id = t.id
        WHERE LOWER(t.name) = LOWER($${paramIndex})
      )`);
      queryParams.push(tag.trim());
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let orderByClause = 'ORDER BY q.created_at DESC';
    if (sort === 'oldest') {
      orderByClause = 'ORDER BY q.created_at ASC';
    } else if (sort === 'answers') {
      orderByClause = 'ORDER BY answers_count DESC, q.created_at DESC';
    }

    // Main SQL
    const mainQuery = `
      SELECT 
        q.id,
        q.user_id,
        q.title,
        q.description,
        q.created_at,
        q.updated_at,
        u.username AS author_username,
        u.email AS author_email,
        u.role AS author_role,
        (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) AS answers_count,
        (SELECT COUNT(*) > 0 FROM answers a WHERE a.question_id = q.id AND a.is_accepted = true) AS has_accepted_answer
      FROM questions q
      JOIN users u ON q.user_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM questions q
      ${whereClause}
    `;

    const [questionsRes, countRes] = await Promise.all([
      db.query(mainQuery, [...queryParams, limitNum, offset]),
      db.query(countQuery, queryParams),
    ]);

    const totalCount = parseInt(countRes.rows[0]?.total || 0);

    // Fetch tags for questions
    const questionIds = questionsRes.rows.map(q => q.id);
    let tagsMap = {};

    if (questionIds.length > 0) {
      const placeholders = questionIds.map((_, idx) => `$${idx + 1}`).join(',');
      const tagsRes = await db.query(`
        SELECT qt.question_id, t.id, t.name
        FROM question_tags qt
        JOIN tags t ON qt.tag_id = t.id
        WHERE qt.question_id IN (${placeholders})
      `, questionIds);

      tagsRes.rows.forEach(row => {
        if (!tagsMap[row.question_id]) tagsMap[row.question_id] = [];
        tagsMap[row.question_id].push({ id: row.id, name: row.name });
      });
    }

    const formattedQuestions = questionsRes.rows.map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      created_at: q.created_at,
      updated_at: q.updated_at,
      answers_count: parseInt(q.answers_count || 0),
      has_accepted_answer: Boolean(q.has_accepted_answer),
      author: {
        id: q.user_id,
        username: q.author_username,
        role: q.author_role,
      },
      tags: tagsMap[q.id] || [],
    }));

    res.json({
      questions: formattedQuestions,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get single question with full details, answers, comments & votes
const getQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    // Fetch question
    const qRes = await db.query(`
      SELECT q.*, u.username AS author_username, u.role AS author_role
      FROM questions q
      JOIN users u ON q.user_id = u.id
      WHERE q.id = $1
    `, [id]);

    if (qRes.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const q = qRes.rows[0];

    // Fetch tags
    const tagsRes = await db.query(`
      SELECT t.id, t.name
      FROM tags t
      JOIN question_tags qt ON t.id = qt.tag_id
      WHERE qt.question_id = $1
    `, [id]);

    // Fetch answers
    const answersRes = await db.query(`
      SELECT 
        a.id,
        a.question_id,
        a.user_id,
        a.description,
        a.is_accepted,
        a.created_at,
        a.updated_at,
        u.username AS author_username,
        u.role AS author_role,
        COALESCE(SUM(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 WHEN v.vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END), 0) AS vote_score,
        COUNT(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 END) AS upvotes,
        COUNT(CASE WHEN v.vote_type = 'DOWNVOTE' THEN 1 END) AS downvotes
      FROM answers a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN votes v ON a.id = v.answer_id
      WHERE a.question_id = $1
      GROUP BY a.id, u.username, u.role
      ORDER BY a.is_accepted DESC, vote_score DESC, a.created_at ASC
    `, [id]);

    const answerIds = answersRes.rows.map(a => a.id);

    // Fetch comments for all answers
    let commentsMap = {};
    let userVotesMap = {};

    if (answerIds.length > 0) {
      const placeholders = answerIds.map((_, idx) => `$${idx + 1}`).join(',');

      const commentsRes = await db.query(`
        SELECT c.id, c.answer_id, c.user_id, c.content, c.created_at, u.username AS author_username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.answer_id IN (${placeholders})
        ORDER BY c.created_at ASC
      `, answerIds);

      commentsRes.rows.forEach(c => {
        if (!commentsMap[c.answer_id]) commentsMap[c.answer_id] = [];
        commentsMap[c.answer_id].push({
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          author: { id: c.user_id, username: c.author_username },
        });
      });

      // User votes if logged in
      if (currentUserId) {
        const userVotesRes = await db.query(`
          SELECT answer_id, vote_type
          FROM votes
          WHERE user_id = $${answerIds.length + 1} AND answer_id IN (${placeholders})
        `, [...answerIds, currentUserId]);

        userVotesRes.rows.forEach(uv => {
          userVotesMap[uv.answer_id] = uv.vote_type;
        });
      }
    }

    const formattedAnswers = answersRes.rows.map(a => ({
      id: a.id,
      description: a.description,
      is_accepted: Boolean(a.is_accepted),
      created_at: a.created_at,
      updated_at: a.updated_at,
      vote_score: parseInt(a.vote_score || 0),
      upvotes: parseInt(a.upvotes || 0),
      downvotes: parseInt(a.downvotes || 0),
      user_vote: userVotesMap[a.id] || null,
      author: {
        id: a.user_id,
        username: a.author_username,
        role: a.author_role,
      },
      comments: commentsMap[a.id] || [],
    }));

    res.json({
      question: {
        id: q.id,
        title: q.title,
        description: q.description,
        created_at: q.created_at,
        updated_at: q.updated_at,
        author: {
          id: q.user_id,
          username: q.author_username,
          role: q.author_role,
        },
        tags: tagsRes.rows,
        answers: formattedAnswers,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update question
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;

    const qRes = await db.query(`SELECT * FROM questions WHERE id = $1`, [id]);
    if (qRes.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const question = qRes.rows[0];

    // Authorization: Owner or Admin
    if (question.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to edit this question.' });
    }

    const updatedTitle = title !== undefined ? title.trim() : question.title;
    const updatedDesc = description !== undefined ? description.trim() : question.description;

    await db.query(
      `UPDATE questions SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [updatedTitle, updatedDesc, id]
    );

    let savedTags = [];
    if (Array.isArray(tags)) {
      savedTags = await syncQuestionTags(id, tags);
    } else {
      const tagsRes = await db.query(`
        SELECT t.id, t.name FROM tags t
        JOIN question_tags qt ON t.id = qt.tag_id
        WHERE qt.question_id = $1
      `, [id]);
      savedTags = tagsRes.rows;
    }

    res.json({
      message: 'Question updated successfully',
      question: {
        id: parseInt(id),
        title: updatedTitle,
        description: updatedDesc,
        tags: savedTags,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete question
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const qRes = await db.query(`SELECT user_id FROM questions WHERE id = $1`, [id]);
    if (qRes.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const question = qRes.rows[0];

    // Authorization: Owner or Admin
    if (question.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this question.' });
    }

    await db.query(`DELETE FROM questions WHERE id = $1`, [id]);
    res.json({ message: 'Question deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
