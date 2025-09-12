import pool from './db.js';
import express from 'express';
import cors from 'cors';
import createFRATables from './createFRATables.js';
import {
  getFRAClaimsByState,
  getFRAStatsByDistrict,
  getFRAVillages,
  getVillageAssets,
  getSchemeRecommendations,
  addFRAClaim,
  getPattaHoldersByClaimId,
  getPattaHoldersByState,
  getPattaHoldersCoordinates,
  getLandParcels,
  getEnhancedVillageData,
  getVillageBoundaries
} from './controllers/fraController.js';

// Initialize database tables
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

// FRA Atlas API Routes
app.get('/api/fra/claims/:state', getFRAClaimsByState);
app.get('/api/fra/stats/:state/:district', getFRAStatsByDistrict);
app.get('/api/fra/villages', getFRAVillages);
app.get('/api/fra/assets/:villageId', getVillageAssets);
app.get('/api/fra/recommendations/:villageId', getSchemeRecommendations);
app.post('/api/fra/claims', addFRAClaim);

// Patta holder and land parcel routes
app.get('/api/fra/patta-holders/claim/:claimId', getPattaHoldersByClaimId);
app.get('/api/fra/patta-holders/state/:state', getPattaHoldersByState);
app.get('/api/fra/patta-holders/coordinates', getPattaHoldersCoordinates);
app.get('/api/fra/land-parcels/:claimId', getLandParcels);
app.get('/api/fra/village-enhanced/:villageId', getEnhancedVillageData);
app.get('/api/fra/village-boundaries', getVillageBoundaries);

// Health check endpoint

// Dashboard summary endpoint
app.get('/api/fra/dashboard/:state', async (req, res) => {
  try {
    const { state } = req.params;
    
    // Get overall statistics
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
    
    // Get district-wise breakdown
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FRA Atlas API is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`FRA Atlas API Server is running on http://localhost:${port}`);
});