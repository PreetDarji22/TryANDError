const http = require('http');
const app = require('../app');
const { initDatabase } = require('../config/db');

let server;
const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, body = null, token = null, isMultipart = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {},
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    let payload = null;
    if (body) {
      payload = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Verification Suite...');
  await initDatabase();

  server = app.listen(PORT);

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    console.log('✔ Health Check Status:', health.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Register new user
    const testUsername = 'testuser_' + Date.now();
    const regRes = await request('POST', '/auth/register', {
      username: testUsername,
      email: `${testUsername}@example.com`,
      password: 'password123',
    });
    console.log('✔ Register Status:', regRes.status, 'User:', regRes.body.user?.username);
    if (regRes.status !== 201) throw new Error('Registration failed');
    const userToken = regRes.body.token;

    // 3. Login as Jane Doe (from seed)
    const loginRes = await request('POST', '/auth/login', {
      loginIdentifier: 'jane@stackit.com',
      password: 'password123',
    });
    console.log('✔ Login Status:', loginRes.status, 'Logged in as:', loginRes.body.user?.username);
    if (loginRes.status !== 200) throw new Error('Login failed');
    const janeToken = loginRes.body.token;
    const janeId = loginRes.body.user.id;

    // Login as Alex Dev (from seed)
    const alexLogin = await request('POST', '/auth/login', {
      loginIdentifier: 'alex@stackit.com',
      password: 'password123',
    });
    const alexToken = alexLogin.body.token;

    // Login as Admin
    const adminLogin = await request('POST', '/auth/login', {
      loginIdentifier: 'admin@stackit.com',
      password: 'admin123456',
    });
    const adminToken = adminLogin.body.token;

    // 4. Guest View Questions
    const guestQuestions = await request('GET', '/questions');
    console.log('✔ Guest Questions Fetch:', guestQuestions.status, 'Count:', guestQuestions.body.questions?.length);
    if (guestQuestions.status !== 200) throw new Error('Guest fetch questions failed');

    // 5. Ask a Question with Tags and Mentions
    const newQuestion = await request('POST', '/questions', {
      title: 'How to implement notification badges in React navbar?',
      description: '<p>I need to render a bell icon with unread notification count. @john_smith can you help?</p>',
      tags: ['react', 'notifications', 'frontend'],
    }, janeToken);
    console.log('✔ Ask Question Status:', newQuestion.status, 'Question ID:', newQuestion.body.question?.id);
    if (newQuestion.status !== 201) throw new Error('Ask question failed');
    const questionId = newQuestion.body.question.id;

    // 6. Post Answer
    const newAnswer = await request('POST', `/questions/${questionId}/answers`, {
      description: '<p>You can call <code>/api/notifications/unread-count</code> on interval or via WebSocket! @jane_doe</p>',
    }, alexToken);
    console.log('✔ Post Answer Status:', newAnswer.status, 'Answer ID:', newAnswer.body.answer?.id);
    if (newAnswer.status !== 201) throw new Error('Post answer failed');
    const answerId = newAnswer.body.answer.id;

    // 7. Accept Answer (as Jane - question owner)
    const acceptRes = await request('PATCH', `/answers/${answerId}/accept`, {}, janeToken);
    console.log('✔ Accept Answer Status:', acceptRes.status, 'Is Accepted:', acceptRes.body.is_accepted);
    if (acceptRes.status !== 200 || !acceptRes.body.is_accepted) throw new Error('Accept answer failed');

    // 8. Vote on Answer
    const voteRes = await request('POST', `/answers/${answerId}/vote`, { vote_type: 'UPVOTE' }, janeToken);
    console.log('✔ Vote Answer Status:', voteRes.status, 'New Score:', voteRes.body.vote_score);
    if (voteRes.status !== 200 || voteRes.body.vote_score !== 1) throw new Error('Vote answer failed');

    // 9. Post Comment on Answer
    const commentRes = await request('POST', `/answers/${answerId}/comments`, {
      content: 'Great solution @alex_dev!',
    }, janeToken);
    console.log('✔ Post Comment Status:', commentRes.status, 'Comment ID:', commentRes.body.comment?.id);
    if (commentRes.status !== 201) throw new Error('Post comment failed');

    // 10. Check Notifications for Jane Doe
    const unreadCountRes = await request('GET', '/notifications/unread-count', null, janeToken);
    console.log('✔ Unread Notifications Count:', unreadCountRes.body.unread_count);

    const notifsRes = await request('GET', '/notifications', null, janeToken);
    console.log('✔ Notifications Received:', notifsRes.body.notifications?.length);
    if (notifsRes.body.notifications.length === 0) throw new Error('Notifications check failed');

    // Mark notifications as read
    const markAllRead = await request('PATCH', '/notifications/read-all', {}, janeToken);
    console.log('✔ Mark All Read Status:', markAllRead.status);

    // 11. Tags Fetch
    const tagsRes = await request('GET', '/tags');
    console.log('✔ Tags List Count:', tagsRes.body.tags?.length);

    // 12. Admin Stats
    const adminStats = await request('GET', '/admin/stats', null, adminToken);
    console.log('✔ Admin Stats Status:', adminStats.status, 'Stats:', adminStats.body.stats);
    if (adminStats.status !== 200) throw new Error('Admin stats failed');

    console.log('🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
