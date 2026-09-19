const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 XeroXpress Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check accessible at http://localhost:${PORT}/api/health`);
});

module.exports = server;
