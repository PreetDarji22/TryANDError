-- COMMON QUERIES FOR STACKIT BACKEND

-- 1. Get all questions with their author, tags, and answer count
SELECT 
    q.id AS question_id,
    q.title,
    q.description,
    q.created_at,
    u.username AS author,
    (
        SELECT array_agg(t.name) 
        FROM tags t 
        JOIN question_tags qt ON t.id = qt.tag_id 
        WHERE qt.question_id = q.id
    ) AS tags,
    (
        SELECT COUNT(*) 
        FROM answers a 
        WHERE a.question_id = q.id
    ) AS answer_count
FROM questions q
JOIN users u ON q.user_id = u.id
ORDER BY q.created_at DESC;


-- 2. Get a single question with its tags
SELECT 
    q.id,
    q.title,
    q.description,
    q.created_at,
    u.username AS author,
    (
        SELECT array_agg(t.name) 
        FROM tags t 
        JOIN question_tags qt ON t.id = qt.tag_id 
        WHERE qt.question_id = q.id
    ) AS tags
FROM questions q
JOIN users u ON q.user_id = u.id
WHERE q.id = 1;


-- 3. Get all answers for a specific question along with the author and net vote count
SELECT 
    a.id AS answer_id,
    a.description,
    a.is_accepted,
    a.created_at,
    u.username AS author,
    (
        SELECT COUNT(*) 
        FROM votes v 
        WHERE v.answer_id = a.id AND v.vote_vote_type = 'UPVOTE'
    ) - (
        SELECT COUNT(*) 
        FROM votes v 
        WHERE v.answer_id = a.id AND v.vote_vote_type = 'DOWNVOTE'
    ) AS net_votes
FROM answers a
JOIN users u ON a.user_id = u.id
WHERE a.question_id = 1
ORDER BY a.is_accepted DESC, net_votes DESC, a.created_at ASC;


-- 4. Get unread notifications for a specific user
SELECT 
    n.id AS notification_id,
    n.type,
    n.reference_url,
    n.created_at,
    actor.username AS triggered_by
FROM notifications n
JOIN users actor ON n.actor_id = actor.id
WHERE n.user_id = 1 AND n.is_read = FALSE
ORDER BY n.created_at DESC;


-- 5. Mark all notifications as read for a user
UPDATE notifications
SET is_read = TRUE
WHERE user_id = 1 AND is_read = FALSE;


-- 6. Insert a new vote (Upvote or Downvote)
-- Uses ON CONFLICT to update the vote if the user has already voted on this answer
INSERT INTO votes (answer_id, user_id, vote_vote_type) 
VALUES (1, 2, 'UPVOTE')
ON CONFLICT (answer_id, user_id) 
DO UPDATE SET vote_vote_type = EXCLUDED.vote_vote_type, created_at = CURRENT_TIMESTAMP;


-- 7. Get total points/reputation for a user (based on upvotes received on their answers)
SELECT 
    COUNT(v.id) AS total_upvotes_received
FROM answers a
JOIN votes v ON a.id = v.answer_id
WHERE a.user_id = 1 AND v.vote_vote_type = 'UPVOTE';
