require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize Database Connection & Tables
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`================================================`);
      console.log(`🚀 StackIt Backend Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`⚡ Health Check:       http://localhost:${PORT}/api/health`);
      console.log(`================================================`);
    });
  } catch (err) {
    console.error('Failed to start StackIt server:', err);
    process.exit(1);
  }
}

startServer();
