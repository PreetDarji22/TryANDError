-- SEED DATA FOR STACKIT

-- 1. Insert Users
-- Passwords should typically be hashed. Using dummy hashes for demonstration.
INSERT INTO users (username, email, password_hash, role) VALUES 
('johndoe', 'john@example.com', 'hashed_password_123', 'USER'),
('janedoe', 'jane@example.com', 'hashed_password_456', 'USER'),
('admin_user', 'admin@stackit.com', 'hashed_password_789', 'ADMIN');

-- 2. Insert Tags
INSERT INTO tags (name) VALUES 
('React'),
('JavaScript'),
('PostgreSQL'),
('Node.js'),
('JWT'),
('CSS');

-- 3. Insert Questions
INSERT INTO questions (user_id, title, description) VALUES 
(1, 'How to implement JWT authentication in Node.js?', '<p>I am building a new application and need to secure my API endpoints. What is the best way to implement <strong>JWT</strong> authentication using Express and Node.js?</p>'),
(2, 'What are the key differences between useMemo and useCallback?', '<p>I understand both are used for performance optimization in React, but I am confused about when to use <code>useMemo</code> versus <code>useCallback</code>. Can someone explain with examples?</p>');

-- 4. Insert Question Tags
-- Question 1: Node.js, JWT, JavaScript
INSERT INTO question_tags (question_id, tag_id) VALUES 
(1, 4), -- Node.js
(1, 5), -- JWT
(1, 2); -- JavaScript

-- Question 2: React, JavaScript
INSERT INTO question_tags (question_id, tag_id) VALUES 
(2, 1), -- React
(2, 2); -- JavaScript

-- 5. Insert Answers
INSERT INTO answers (question_id, user_id, description, is_accepted) VALUES 
(1, 2, '<p>To implement JWT in Node.js, you can use the <code>jsonwebtoken</code> package. First, install it via npm. Then, you can sign a token using <code>jwt.sign(payload, secret)</code> upon successful login, and verify it in a middleware using <code>jwt.verify(token, secret)</code>.</p>', TRUE),
(2, 1, '<p><code>useMemo</code> is used to memoize a calculated <strong>value</strong> so it doesn''t need to be recalculated on every render, while <code>useCallback</code> is used to memoize a <strong>function definition</strong> so it maintains referential equality across renders.</p>', FALSE);

-- 6. Insert Votes
-- John upvotes Jane's answer to his question
INSERT INTO votes (answer_id, user_id, vote_vote_type) VALUES 
(1, 1, 'UPVOTE');
-- Admin upvotes John's answer
INSERT INTO votes (answer_id, user_id, vote_vote_type) VALUES 
(2, 3, 'UPVOTE');

-- 7. Insert Comments
-- Admin comments on Jane's answer
INSERT INTO comments (answer_id, user_id, content) VALUES 
(1, 3, 'Great explanation! One thing to add: always store the JWT securely, preferably in HttpOnly cookies.');

-- 8. Insert Notifications
-- John gets notified that Jane answered his question
INSERT INTO notifications (user_id, actor_id, type, reference_url, is_read) VALUES 
(1, 2, 'NEW_ANSWER', '/questions/1#answer-1', FALSE);
-- Jane gets notified that Admin commented on her answer
INSERT INTO notifications (user_id, actor_id, type, reference_url, is_read) VALUES 
(2, 3, 'NEW_COMMENT', '/questions/1#answer-1', FALSE);
