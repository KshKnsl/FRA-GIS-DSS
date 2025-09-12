import pool from './db.js';
import express from 'express';
import cors from 'cors';
import createFRATables from './createFRATables.js';

import fraRoutes from './routes/fraRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import decisionSupportRoutes from './routes/decisionSupportRoutes.js';
import documentsRoutes from './routes/documentsRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL:', res.rows[0]);
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

app.use('/api/fra', fraRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/decision-support', decisionSupportRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/support', supportRoutes);


app.get('/api/fra/dashboard/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_claims,
        COUNT(CASE WHEN status = 'granted' THEN 1 END) as granted_claims,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_claims,
        COUNT(CASE WHEN claim_type = 'IFR' THEN 1 END) as ifr_claims,
        COUNT(CASE WHEN claim_type = 'CR' THEN 1 END) as cr_claims,
        COUNT(CASE WHEN claim_type = 'CFR' THEN 1 END) as cfr_claims,
        SUM(CASE WHEN status = 'granted' THEN area_claimed ELSE 0 END) as total_granted_area
      FROM fra_claims 
      WHERE state = $1
    `, [state]);
    
    const districtResult = await pool.query(`
      SELECT 
        district,
        COUNT(*) as claims_count,
        COUNT(CASE WHEN status = 'granted' THEN 1 END) as granted_count
      FROM fra_claims 
      WHERE state = $1
      GROUP BY district
      ORDER BY claims_count DESC
    `, [state]);
    
    res.status(200).json({
      success: true,
      state: state,
      statistics: statsResult.rows[0],
      districts: districtResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FRA Atlas API is running',
  });
});

app.listen(port, () => {
  console.log(`FRA Atlas API Server is running on http://localhost:${port}`);
});