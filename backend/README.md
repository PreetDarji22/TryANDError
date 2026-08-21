# StackIt Backend API Service

This is the Node.js / Express REST API backend for **StackIt – A Minimal Q&A Forum Platform**.

## Features

- **Authentication & Roles**:
  - Guest permissions (view questions, answers, tags).
  - User registration & login with JWT tokens (`USER` role).
  - Admin role capabilities (`ADMIN` role for moderation & stats).
- **Questions & Rich Text**:
  - Ask question with title, rich text HTML/Markdown description, and multi-select tags.
  - Tag creation & association.
  - Full-text keyword search and filtering by tag.
  - @mention detection in descriptions.
- **Answers & Accepted Answer**:
  - Post answer with rich-text content.
  - Question owners can mark/unmark one answer as accepted (`is_accepted`).
  - Triggers `NEW_ANSWER` notification to question owner.
- **Voting System**:
  - Upvote (`UPVOTE`) or Downvote (`DOWNVOTE`) answers.
  - Single vote per user per answer with score recalculation.
- **Comments & Mentions**:
  - Add comments to answers.
  - Automatically parses `@username` mentions across descriptions and comments to generate `MENTION` notifications.
- **Notification System**:
  - `GET /api/notifications` - fetch notifications.
  - `GET /api/notifications/unread-count` - get badge count for top navbar bell icon.
  - `PATCH /api/notifications/:id/read` - mark notification as read.
  - `PATCH /api/notifications/read-all` - mark all as read.
- **Rich Text Image Upload**:
  - `POST /api/upload` - upload images via multipart form data for rich text editor embedding.
- **Interactive Documentation**:
  - Built-in Swagger UI documentation at `/api-docs`.

---

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=stackit_super_secret_jwt_key_2026
DATABASE_URL=postgres://postgres:postgres@localhost:5432/stackit_db # Optional
```

*Note: If no PostgreSQL server is running, the backend automatically uses an embedded SQLite database (`database/stackit.db`).*

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Backend Server
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

### 5. Run API Verification Tests
```bash
npm test
```

---

## API Documentation
Once running, open your browser to:
- **Swagger Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
