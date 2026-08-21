const bcrypt = require('bcryptjs');
const { initDatabase, query } = require('../config/db');

async function seed() {
  console.log('🌱 Starting database seed...');
  await initDatabase();

  // Clear existing data
  await query(`DELETE FROM notifications`);
  await query(`DELETE FROM comments`);
  await query(`DELETE FROM votes`);
  await query(`DELETE FROM answers`);
  await query(`DELETE FROM question_tags`);
  await query(`DELETE FROM tags`);
  await query(`DELETE FROM questions`);
  await query(`DELETE FROM users`);

  console.log('Cleared old tables.');

  // Create Users
  const salt = await bcrypt.genSalt(10);
  const userPasswordHash = await bcrypt.hash('password123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123456', salt);

  const adminRes = await query(
    `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['admin', 'admin@stackit.com', adminPasswordHash, 'ADMIN']
  );
  const adminId = adminRes.rows[0].id;

  const janeRes = await query(
    `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['jane_doe', 'jane@stackit.com', userPasswordHash, 'USER']
  );
  const janeId = janeRes.rows[0].id;

  const johnRes = await query(
    `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['john_smith', 'john@stackit.com', userPasswordHash, 'USER']
  );
  const johnId = johnRes.rows[0].id;

  const alexRes = await query(
    `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['alex_dev', 'alex@stackit.com', userPasswordHash, 'USER']
  );
  const alexId = alexRes.rows[0].id;

  console.log('Created seed users: admin, jane_doe, john_smith, alex_dev.');

  // Create Tags
  const tagNames = ['react', 'jwt', 'express', 'node', 'javascript', 'database'];
  const tagMap = {};

  for (const name of tagNames) {
    const tRes = await query(`INSERT INTO tags (name) VALUES ($1) RETURNING id, name`, [name]);
    tagMap[name] = tRes.rows[0].id;
  }

  // Create Question 1 by jane_doe
  const q1Res = await query(
    `INSERT INTO questions (user_id, title, description) VALUES ($1, $2, $3) RETURNING id`,
    [
      janeId,
      'How to handle JWT authentication refresh tokens securely in React & Express?',
      '<p>I am building a web application using Express and React. What is the recommended way to store and refresh <strong>JWT tokens</strong>? Should I use <code>httpOnly</code> cookies or localStorage? CC @alex_dev</p>'
    ]
  );
  const q1Id = q1Res.rows[0].id;

  // Link tags for Q1
  await query(`INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)`, [q1Id, tagMap['react']]);
  await query(`INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)`, [q1Id, tagMap['jwt']]);
  await query(`INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)`, [q1Id, tagMap['express']]);

  // Create Question 2 by john_smith
  const q2Res = await query(
    `INSERT INTO questions (user_id, title, description) VALUES ($1, $2, $3) RETURNING id`,
    [
      johnId,
      'What are the performance differences between PostgreSQL and SQLite for medium apps?',
      '<p>Can someone explain when to pick <em>SQLite</em> versus <em>PostgreSQL</em> for a production application?</p>'
    ]
  );
  const q2Id = q2Res.rows[0].id;

  await query(`INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)`, [q2Id, tagMap['database']]);
  await query(`INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)`, [q2Id, tagMap['express']]);

  // Answers to Q1
  const a1Res = await query(
    `INSERT INTO answers (question_id, user_id, description, is_accepted) VALUES ($1, $2, $3, 1) RETURNING id`,
    [
      q1Id,
      alexId,
      '<p>The best security practice is storing access tokens in memory and refresh tokens in an <strong>httpOnly, Secure cookie</strong>. This prevents XSS attacks from retrieving your tokens. @jane_doe</p>',
    ]
  );
  const a1Id = a1Res.rows[0].id;

  const a2Res = await query(
    `INSERT INTO answers (question_id, user_id, description, is_accepted) VALUES ($1, $2, $3, 0) RETURNING id`,
    [
      q1Id,
      johnId,
      '<p>You can also use an automated refresh interceptor in Axios or Fetch API to seamlessly request new tokens before expiration.</p>',
    ]
  );
  const a2Id = a2Res.rows[0].id;

  // Votes on Answer 1
  await query(`INSERT INTO votes (answer_id, user_id, vote_type) VALUES ($1, $2, 'UPVOTE')`, [a1Id, janeId]);
  await query(`INSERT INTO votes (answer_id, user_id, vote_type) VALUES ($1, $2, 'UPVOTE')`, [a1Id, johnId]);
  await query(`INSERT INTO votes (answer_id, user_id, vote_type) VALUES ($1, $2, 'DOWNVOTE')`, [a2Id, janeId]);

  // Comments on Answer 1
  await query(
    `INSERT INTO comments (answer_id, user_id, content) VALUES ($1, $2, $3)`,
    [a1Id, janeId, 'Thanks @alex_dev! This solved my problem. Is SameSite=Strict recommended?']
  );

  // Notifications
  await query(
    `INSERT INTO notifications (user_id, actor_id, type, reference_url, is_read) VALUES ($1, $2, 'NEW_ANSWER', $3, 0)`,
    [janeId, alexId, `/questions/${q1Id}#answer-${a1Id}`]
  );
  await query(
    `INSERT INTO notifications (user_id, actor_id, type, reference_url, is_read) VALUES ($1, $2, 'MENTION', $3, 0)`,
    [alexId, janeId, `/questions/${q1Id}`]
  );

  console.log('✅ Database seeded successfully!');
  console.log('------------------------------------------------');
  console.log('Test Credentials:');
  console.log('👤 Admin User:  email: admin@stackit.com  | password: admin123456');
  console.log('👤 Regular User: email: jane@stackit.com   | password: password123');
  console.log('👤 Regular User: email: john@stackit.com   | password: password123');
  console.log('👤 Regular User: email: alex@stackit.com   | password: password123');
  console.log('------------------------------------------------');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
