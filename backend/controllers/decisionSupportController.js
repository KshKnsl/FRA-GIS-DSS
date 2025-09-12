import pool from '../db.js';

// Get scheme recommendations for a village
export const getSchemeRecommendations = async (req, res) => {
  try {
    const { villageId } = req.params;

    // Get village data
    const villageResult = await pool.query(
      `SELECT * FROM fra_claims WHERE village_name = $1 OR id::text = $1`,
      [villageId]
    );

    if (villageResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    const village = villageResult.rows[0];

    // Get village assets for additional context
    const assetsResult = await pool.query(
      `SELECT * FROM village_assets WHERE village_name = $1`,
      [village.village_name]
    );

    const assets = assetsResult.rows;

    // Generate recommendations based on village data
    const recommendations = [];

    // PM-KISAN recommendation
    const hasAgriculturalLand = assets.some(asset => asset.asset_type === 'agricultural_land');
    if (hasAgriculturalLand) {
      recommendations.push({
        scheme: 'PM-KISAN',
        category: 'Agriculture',
        priority: 'High',
        reason: 'Agricultural land detected in village',
        eligibility: ['Land holding < 2 hectares', 'Cultivator farmer', 'FRA patta holder'],
        benefits: ['₹6,000 per year in 3 installments', 'Direct bank transfer'],
        villageData: village
      });
    }

    // Jal Jeevan Mission recommendation
    const waterBodiesCount = assets.filter(asset => asset.asset_type === 'water_body').length;
    if (waterBodiesCount < 2) {
      recommendations.push({
        scheme: 'Jal Jeevan Mission',
        category: 'Water',
        priority: 'High',
        reason: `Low water body count (${waterBodiesCount}) detected`,
        eligibility: ['Rural household', 'Low water index (< 0.4)', 'FRA village'],
        benefits: ['Functional household tap connection', 'Water quality testing'],
        villageData: village
      });
    }

    // MGNREGA recommendation
    recommendations.push({
      scheme: 'MGNREGA',
      category: 'Employment',
      priority: 'Medium',
      reason: 'Rural employment generation for FRA villages',
      eligibility: ['Rural household', 'Demand-based work', 'FRA beneficiary'],
      benefits: ['100 days of guaranteed wage employment', '₹202 per day wage'],
      villageData: village
    });

    // Forest-based schemes
    const forestArea = assets.filter(asset => asset.asset_type === 'forest').length;
    if (forestArea > 0) {
      recommendations.push({
        scheme: 'Van Dhan Yojana',
        category: 'Livelihood',
        priority: 'Medium',
        reason: `Forest area detected (${forestArea} assets)`,
        eligibility: ['Tribal community', 'Forest products collection', 'FRA patta holder'],
        benefits: ['Value addition to forest products', 'Marketing support', 'Skill development'],
        villageData: village
      });
    }

    // Education schemes for tribal areas
    if (village.tribal_group) {
      recommendations.push({
        scheme: 'Eklavya Model Residential Schools',
        category: 'Education',
        priority: 'High',
        reason: `Tribal community (${village.tribal_group}) identified`,
        eligibility: ['Tribal students', 'Class 6-12', 'Residential facility'],
        benefits: ['Free education', 'Accommodation', 'Quality education in tribal context'],
        villageData: village
      });
    }

    res.status(200).json({
      success: true,
      village: village,
      assets: assets,
      recommendations: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations'
    });
  }
};

// Get decision support analytics
export const getDecisionAnalytics = async (req, res) => {
  try {
    const { state, district } = req.query;

    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    if (state && state !== 'all') {
      whereClause += ` WHERE fc.state = $${paramIndex}`;
      params.push(state);
      paramIndex++;
    }

    if (district && district !== 'all') {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} fc.district = $${paramIndex}`;
      params.push(district);
      paramIndex++;
    }

    // Get scheme eligibility statistics
    const eligibilityStats = await pool.query(`
      SELECT
        COUNT(*) as total_households,
        COUNT(CASE WHEN annual_income < 50000 THEN 1 END) as low_income_households,
        COUNT(CASE WHEN asset_type = 'agricultural_land' THEN 1 END) as agricultural_households,
        COUNT(CASE WHEN asset_type = 'water_body' THEN 1 END) as water_stressed_households,
        COUNT(CASE WHEN tribal_group IS NOT NULL THEN 1 END) as tribal_households
      FROM fra_claims fc
      LEFT JOIN village_assets va ON fc.village_name = va.village_name
      ${whereClause}
    `, params);

    // Get scheme-wise recommendations
    const schemeStats = await pool.query(`
      SELECT
        'PM-KISAN' as scheme,
        COUNT(CASE WHEN va.asset_type = 'agricultural_land' THEN 1 END) as eligible_count
      FROM fra_claims fc
      LEFT JOIN village_assets va ON fc.village_name = va.village_name
      ${whereClause}
      UNION ALL
      SELECT
        'Jal Jeevan Mission' as scheme,
        COUNT(CASE WHEN va.asset_type = 'water_body' THEN 1 END) as eligible_count
      FROM fra_claims fc
      LEFT JOIN village_assets va ON fc.village_name = va.village_name
      ${whereClause}
      UNION ALL
      SELECT
        'MGNREGA' as scheme,
        COUNT(*) as eligible_count
      FROM fra_claims fc
      ${whereClause}
    `);

    res.status(200).json({
      success: true,
      data: {
        eligibilityStats: eligibilityStats.rows[0],
        schemeStats: schemeStats.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching decision analytics'
    });
  }
};

// Get all available schemes
export const getSchemes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM css_schemes WHERE active = true ORDER BY scheme_name'
    );

    const schemes = result.rows.map(scheme => ({
      id: scheme.scheme_name.toLowerCase().replace(/\s+/g, '_'),
      name: scheme.scheme_name,
      category: scheme.scheme_type,
      ministry: scheme.ministry,
      description: scheme.description,
      eligibility: scheme.eligibility_criteria,
      priority: 'Medium', // Default priority, can be enhanced with logic
      icon: null, // Will be set in frontend based on category
      benefits: [], // Can be enhanced with additional data
      active: scheme.active
    }));

    res.status(200).json({
      success: true,
      data: schemes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schemes'
    });
  }
};