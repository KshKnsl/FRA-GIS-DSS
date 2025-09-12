import pool from '../db.js';

// Get admin dashboard statistics
export const getAdminStats = async (req, res) => {
  try {
    // Overall statistics
    const overallStats = await pool.query(`
      SELECT
        COUNT(*) as total_claims,
        COUNT(CASE WHEN status = 'granted' THEN 1 END) as approved_claims,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_claims,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_claims,
        SUM(CASE WHEN status = 'granted' THEN area_claimed ELSE 0 END) as total_area_granted,
        COUNT(DISTINCT village_name) as total_villages,
        COUNT(DISTINCT district) as total_districts,
        COUNT(DISTINCT state) as total_states
      FROM fra_claims
    `);

    // Monthly claims data for the last 12 months
    const monthlyStats = await pool.query(`
      SELECT
        DATE_TRUNC('month', application_date) as month,
        COUNT(*) as claims_count
      FROM fra_claims
      WHERE application_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', application_date)
      ORDER BY month
    `);

    // Status distribution
    const statusStats = await pool.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM fra_claims
      GROUP BY status
    `);

    // State-wise statistics
    const stateStats = await pool.query(`
      SELECT
        state,
        COUNT(*) as total_claims,
        COUNT(CASE WHEN status = 'granted' THEN 1 END) as approved_claims,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_claims,
        SUM(CASE WHEN status = 'granted' THEN area_claimed ELSE 0 END) as area_granted
      FROM fra_claims
      GROUP BY state
      ORDER BY total_claims DESC
    `);

    // Data quality metrics
    const dataQuality = await pool.query(`
      SELECT
        COUNT(*) as total_claims,
        COUNT(CASE WHEN documents_digitized = true THEN 1 END) as digitized_claims,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as geo_referenced_claims,
        (SELECT COUNT(*) FROM patta_holders WHERE verification_status = 'Verified') as verified_pattas
      FROM fra_claims
    `);

    res.status(200).json({
      success: true,
      data: {
        overall: overallStats.rows[0],
        monthly: monthlyStats.rows,
        statusDistribution: statusStats.rows,
        stateWise: stateStats.rows,
        dataQuality: dataQuality.rows[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics'
    });
  }
};

// Get system health metrics
export const getSystemHealth = async (req, res) => {
  try {
    // Database connection health
    const dbHealth = await pool.query('SELECT NOW()');

    // Table counts
    const tableCounts = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM fra_claims) as claims_count,
        (SELECT COUNT(*) FROM patta_holders) as patta_holders_count,
        (SELECT COUNT(*) FROM land_parcels) as land_parcels_count,
        (SELECT COUNT(*) FROM village_assets) as assets_count,
        (SELECT COUNT(*) FROM village_boundaries) as boundaries_count
    `);

    // Recent activity
    const recentActivity = await pool.query(`
      SELECT
        'claim_created' as activity_type,
        claim_id as reference_id,
        applicant_name as description,
        created_at as timestamp
      FROM fra_claims
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: {
        database: {
          status: 'healthy',
          last_check: dbHealth.rows[0].now
        },
        counts: tableCounts.rows[0],
        recentActivity: recentActivity.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system health metrics'
    });
  }
};

// Get monthly trends data
export const getMonthlyTrends = async (req, res) => {
  try {
    const monthlyStats = await pool.query(`
      SELECT
        DATE_TRUNC('month', application_date) as month,
        COUNT(*) as value
      FROM fra_claims
      WHERE application_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', application_date)
      ORDER BY month
    `);

    // Format the data for the frontend chart
    const formattedData = monthlyStats.rows.map(row => ({
      month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
      value: parseInt(row.value)
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly trends'
    });
  }
};