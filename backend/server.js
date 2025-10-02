import pool from './db.js';
import express from 'express';
import cors from 'cors';
import createFRATables from './createFRATables.js';
import fs from 'fs';
import path from 'path';

import fraRoutes from './routes/fraRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import decisionSupportRoutes from './routes/decisionSupportRoutes.js';
import documentsRoutes from './routes/documentsRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

console.log("--- server.js: Main server file loading... ---");

const uploadsDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected:', res.rows[0].now);
    await createFRATables();
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  console.log(`[SERVER LOG] Received Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/fra', fraRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/decision-support', decisionSupportRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/support', supportRoutes);

console.log("--- server.js: All routes registered. ---");

app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.',
    error: err.message
  });
});

app.listen(port, () => {
  console.log(`FRA Atlas API Server is running on http://localhost:${port}`);
});