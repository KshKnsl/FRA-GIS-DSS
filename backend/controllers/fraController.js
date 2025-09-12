import pool from '../db.js';

// Get all FRA claims for a specific state
export const getFRAClaimsByState = async (req, res) => {
  try {
    const { state } = req.params;
    const result = await pool.query(
      `SELECT * FROM fra_claims WHERE state = $1 ORDER BY created_at DESC`,
      [state]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching FRA claims:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FRA claims'
    });
  }
};

// Get FRA statistics by district
export const getFRAStatsByDistrict = async (req, res) => {
  try {
    const { state, district } = req.params;
    const result = await pool.query(
      `SELECT 
        district,
        COUNT(*) as total_claims,
        COUNT(CASE WHEN status = 'granted' THEN 1 END) as granted_claims,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_claims,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_claims,
        COUNT(CASE WHEN claim_type = 'IFR' THEN 1 END) as ifr_claims,
        COUNT(CASE WHEN claim_type = 'CR' THEN 1 END) as cr_claims,
        COUNT(CASE WHEN claim_type = 'CFR' THEN 1 END) as cfr_claims
       FROM fra_claims 
       WHERE state = $1 AND district = $2
       GROUP BY district`,
      [state, district]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows[0] || {},
    });
  } catch (error) {
    console.error('Error fetching FRA statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FRA statistics'
    });
  }
};

// Get all villages with FRA pattas
export const getFRAVillages = async (req, res) => {
  try {
    const { state } = req.query;
    let query = `
      SELECT DISTINCT 
        village_name,
        district,
        state,
        latitude,
        longitude,
        COUNT(*) as total_pattas
      FROM fra_claims 
      WHERE status = 'granted'
    `;
    
    let params = [];
    if (state) {
      query += ` AND state = $1`;
      params.push(state);
    }
    
    query += ` GROUP BY village_name, district, state, latitude, longitude`;
    
    const result = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching FRA villages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FRA villages'
    });
  }
};

// Get asset mapping data for a village
export const getVillageAssets = async (req, res) => {
  try {
    const { villageName } = req.params;
    const result = await pool.query(
      `SELECT * FROM village_assets WHERE village_name = $1`,
      [villageName]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching village assets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching village assets'
    });
  }
};

// Get scheme eligibility recommendations
export const getSchemeRecommendations = async (req, res) => {
  try {
    const { villageId } = req.params;
    
    // Get village data and assets
    const villageResult = await pool.query(
      `SELECT v.*, va.* FROM fra_claims v 
       LEFT JOIN village_assets va ON v.village_name = va.village_name 
       WHERE v.id = $1 AND v.status = 'granted'`,
      [villageId]
    );
    
    if (villageResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found or no granted FRA claims'
      });
    }
    
    const villageData = villageResult.rows[0];
    const recommendations = [];
    
    // Rule-based recommendations
    if (villageData.water_bodies_count < 2) {
      recommendations.push({
        scheme: 'Jal Jeevan Mission',
        priority: 'High',
        reason: 'Low water body count detected',
        ministry: 'Ministry of Jal Shakti'
      });
    }
    
    if (villageData.agricultural_land_area > 0) {
      recommendations.push({
        scheme: 'PM-KISAN',
        priority: 'Medium',
        reason: 'Agricultural land detected',
        ministry: 'Ministry of Agriculture'
      });
    }
    
    if (villageData.forest_cover_percentage > 70) {
      recommendations.push({
        scheme: 'Forest Conservation Schemes',
        priority: 'High',
        reason: 'High forest cover area',
        ministry: 'Ministry of Environment'
      });
    }
    
    recommendations.push({
      scheme: 'MGNREGA',
      priority: 'Medium',
      reason: 'Rural employment generation',
      ministry: 'Ministry of Rural Development'
    });
    
    res.status(200).json({
      success: true,
      village: villageData,
      recommendations: recommendations
    });
  } catch (error) {
    console.error('Error generating scheme recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations'
    });
  }
};

// Add new FRA claim
export const addFRAClaim = async (req, res) => {
  try {
    let {
      claim_id,
      applicant_name,
      village_name,
      district,
      state,
      claim_type,
      area_claimed,
      status,
      latitude,
      longitude,
      tribal_group
    } = req.body;

    // Auto-generate claim_id if not provided
    if (!claim_id || claim_id === "") {
      const prefix = (state && state.length > 1 ? state.slice(0,2).toUpperCase() : "XX");
      claim_id = `FRA_${prefix}_${Date.now()}`;
    }

    const result = await pool.query(
      `INSERT INTO fra_claims 
       (claim_id, applicant_name, village_name, district, state, claim_type, 
        area_claimed, status, latitude, longitude, tribal_group, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING *`,
      [claim_id, applicant_name, village_name, district, state, claim_type, 
       area_claimed, status, latitude, longitude, tribal_group]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding FRA claim:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding FRA claim'
    });
  }
};

// Get patta holders by claim ID
export const getPattaHoldersByClaimId = async (req, res) => {
  try {
    const { claimId } = req.params;
    const result = await pool.query(
      `SELECT ph.*, fc.village_name, fc.district, fc.state 
       FROM patta_holders ph 
       JOIN fra_claims fc ON ph.claim_id = fc.claim_id 
       WHERE ph.claim_id = $1`,
      [claimId]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching patta holders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patta holders'
    });
  }
};

// Get all patta holders for a state
export const getPattaHoldersByState = async (req, res) => {
  try {
    const { state } = req.params;
    const result = await pool.query(
      `SELECT ph.*, fc.village_name, fc.district, fc.state, fc.claim_type, fc.area_claimed, fc.status as claim_status
       FROM patta_holders ph 
       JOIN fra_claims fc ON ph.claim_id = fc.claim_id 
       WHERE fc.state = $1 AND fc.status = 'granted'
       ORDER BY ph.created_at DESC`,
      [state]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching patta holders by state:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patta holders'
    });
  }
};

// Get land parcel details for a claim
export const getLandParcels = async (req, res) => {
  try {
    const { claimId } = req.params;
    const result = await pool.query(
      `SELECT * FROM land_parcels WHERE claim_id = $1 ORDER BY created_at DESC`,
      [claimId]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching land parcels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching land parcels'
    });
  }
};

// Get enhanced village data with patta holders
export const getEnhancedVillageData = async (req, res) => {
  try {
    const { villageId } = req.params;
    
    // Get FRA claims for the village
    const claimsResult = await pool.query(
      `SELECT * FROM fra_claims WHERE village_name = $1 OR id::text = $1`,
      [villageId]
    );
    
    if (claimsResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }
    
    const claims = claimsResult.rows;
    const claimIds = claims.map(claim => claim.claim_id);
    
    // Get patta holders for these claims
    const pattaHoldersResult = await pool.query(
      `SELECT * FROM patta_holders WHERE claim_id = ANY($1::text[])`,
      [claimIds]
    );
    
    // Get land parcels for these claims
    const parcelsResult = await pool.query(
      `SELECT * FROM land_parcels WHERE claim_id = ANY($1::text[])`,
      [claimIds]
    );
    
    // Get village assets
    const assetsResult = await pool.query(
      `SELECT * FROM village_assets WHERE village_name = $1`,
      [claims[0].village_name]
    );
    
    res.status(200).json({
      success: true,
      village: claims[0],
      claims: claims,
      pattaHolders: pattaHoldersResult.rows,
      landParcels: parcelsResult.rows,
      assets: assetsResult.rows
    });
  } catch (error) {
    console.error('Error fetching enhanced village data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enhanced village data'
    });
  }
};

// Get patta holders with coordinates for map display
export const getPattaHoldersCoordinates = async (req, res) => {
  try {
    const { state } = req.query;
    let query = `
      SELECT 
        ph.patta_number,
        ph.holder_name,
        ph.occupation,
        ph.land_classification,
        ph.latitude,
        ph.longitude,
        fc.village_name,
        fc.district,
        fc.state,
        fc.claim_type,
        fc.area_claimed
      FROM patta_holders ph 
      JOIN fra_claims fc ON ph.claim_id = fc.claim_id 
      WHERE fc.status = 'granted' 
        AND ph.latitude IS NOT NULL 
        AND ph.longitude IS NOT NULL
    `;
    
    let params = [];
    if (state && state !== 'All States') {
      query += ` AND fc.state = $1`;
      params.push(state);
    }
    
    query += ` ORDER BY ph.created_at DESC`;
    
    const result = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching patta holders coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patta holders coordinates'
    });
  }
};

// Get village boundaries as GeoJSON
export const getVillageBoundaries = async (req, res) => {
  try {
    const { state } = req.query;
    let query = `
      SELECT 
        village_name,
        district,
        state,
        area_sqkm,
        ST_AsGeoJSON(boundary_geom) as geojson
      FROM village_boundaries
    `;
    
    let params = [];
    if (state && state !== 'All States') {
      query += ` WHERE state = $1`;
      params.push(state);
    }
    
    const result = await pool.query(query, params);
    
    // Convert to GeoJSON FeatureCollection
    const features = result.rows.map(row => ({
      type: 'Feature',
      properties: {
        village_name: row.village_name,
        district: row.district,
        state: row.state,
        area_sqkm: row.area_sqkm
      },
      geometry: JSON.parse(row.geojson)
    }));
    
    res.status(200).json({
      success: true,
      data: {
        type: 'FeatureCollection',
        features: features
      }
    });
  } catch (error) {
    console.error('Error fetching village boundaries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching village boundaries'
    });
  }
};
