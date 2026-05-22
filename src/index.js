'use strict';
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
const perchanceRoutes = require('./api/routes/perchance.js');
const packRoutes = require('./api/routes/pack.js');

app.use('/api/perchance', perchanceRoutes);
app.use('/api/pack', packRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '8.0.0', timestamp: new Date().toISOString() });
});

// Static web build
const webBuild = path.join(__dirname, '..', 'web', 'dist');
app.use(express.static(webBuild));
app.get('*', (_req, res) => {
  res.sendFile(path.join(webBuild, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});

module.exports = app;
