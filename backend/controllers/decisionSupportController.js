import pool from '../db.js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getFallbackRecommendations = () => {
  return {
    recommendations: [
      { name: 'MGNREGA', priority: 'Medium', match_score: 70, reasons: ['Fallback: Provides employment opportunities.', 'Fallback: Applicable to most rural areas.'] },
      { name: 'Jal Jeevan Mission', priority: 'Medium', match_score: 65, reasons: ['Fallback: Aims to provide safe and adequate drinking water.'] },
    ]
  };
};

export const testGroq = async (req, res) => {
  try {
    console.log("[DSS Controller] Running Groq API test...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Is the Groq API working? Respond with a short confirmation.' }],
      model: 'deepseek-r1-distill-llama-70b',
    });
    const message = chatCompletion.choices[0]?.message?.content || "No response content";
    console.log("[DSS Controller] Groq API test successful.");
    res.status(200).json({ success: true, message: "Groq API is working.", response: message });
  } catch (error) {
    console.error('[DSS Controller] Groq API test FAILED:', error);
    res.status(500).json({ success: false, message: 'Groq API test failed.', error: error.message });
  }
};


export const getSchemeRecommendations = async (req, res, next) => {
  const { villageId } = req.params;
  console.log(`[DSS Controller] Handler triggered for village: ${villageId}`);
  try {
    const filters = req.body;

    const villageResult = await pool.query(
      `SELECT * FROM village_summary WHERE village_name = $1 LIMIT 1`,
      [villageId]
    );

    if (villageResult.rowCount === 0) {
      console.warn(`[DSS Controller] Village not found in database: ${villageId}`);
      return res.status(404).json({ success: false, message: `Village '${villageId}' not found.` });
    }
    const village = villageResult.rows[0];

    const assetsResult = await pool.query(
      `SELECT asset_type, COUNT(*) as count FROM village_assets WHERE village_name = $1 GROUP BY asset_type`,
      [village.village_name]
    );
    const assets = assetsResult.rows.reduce((acc, row) => {
      acc[row.asset_type] = row.count;
      return acc;
    }, {});
    
    const schemesResult = await pool.query("SELECT scheme_name, description, eligibility_criteria FROM css_schemes WHERE active = true");
    const availableSchemes = schemesResult.rows;

    const prompt = `
      You are a highly specialized government scheme allocation analyst for India's Ministry of Tribal Affairs. Your sole task is to provide data-driven, precise recommendations.

      **Analyze the following data for the village of "${village.village_name}":**

      **Village Profile:**
      - State: ${village.state}
      - Population: ${village.total_population} (Tribal: ${village.tribal_population}, which is ${((village.tribal_population / village.total_population) * 100).toFixed(1)}%)
      - Households: ${village.total_households}
      - FRA Pattas Granted: ${village.fra_pattas_count}
      - Forest Cover: ${village.forest_cover_percentage}%
      - Agricultural Land: ${village.agricultural_land_area} hectares
      - Water Bodies Count: ${village.water_bodies_count}
      - Mapped Assets: ${JSON.stringify(assets)}

      **Socio-Economic Parameters (lower is worse):**
      - Water Scarcity Index: ${filters.waterIndex || '0.5'}
      - Poverty Score (%): ${filters.povertyScore || '50'}
      - Forest Degradation: ${filters.forestDegradation || 'medium'}

      **Available Government Schemes & Eligibility Criteria:**
      ${availableSchemes.map(s => `- **${s.scheme_name}**: ${s.description}. Eligibility: ${JSON.stringify(s.eligibility_criteria)}`).join('\n')}

      **Your Task:**
      1.  Rigorously compare the "Village Profile" and "Socio-Economic Parameters" against the "Eligibility Criteria" for each scheme.
      2.  Generate a JSON object with a single root key: "recommendations".
      3.  The value must be an array of the top 5 most suitable schemes for this specific village.
      4.  The "match_score" for each scheme MUST be directly and logically derived from the provided data. A high score requires strong data alignment with eligibility and needs. A village with many water bodies should have a low score for water schemes. A village with no agricultural land should have a very low score for PM-KISAN.
      5.  The "reasons" MUST cite specific data points from the village profile to justify the score.

      **Output Format (Strictly JSON):**
      Each object in the "recommendations" array must have:
      - "name": The scheme name.
      - "priority": "High", "Medium", or "Low".
      - "match_score": A number from 0-100. This score must be unique and specific to this village's data.
      - "reasons": An array of 2-3 concise strings citing data points.

      Return ONLY the raw JSON object.
    `;

    console.log("[DSS Controller] Sending prompt to Groq AI for analysis...");
    let aiResponse;
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'deepseek-r1-distill-llama-70b', // <-- UPDATED MODEL
            temperature: 0.2, 
            max_tokens: 2048,
            response_format: { type: "json_object" },
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Groq API returned an empty response.");
        }
        aiResponse = JSON.parse(content);

        if (!aiResponse.recommendations || !Array.isArray(aiResponse.recommendations)) {
            console.warn("[DSS Controller] AI response is not in the expected format. Using fallback.", aiResponse);
            aiResponse = getFallbackRecommendations();
        }

    } catch (apiError) {
        console.error("[DSS Controller] Groq API call failed:", apiError);
        return res.status(200).json({
            success: true,
            source: 'fallback',
            village: village,
            recommendations: getFallbackRecommendations().recommendations,
        });
    }

    const recommendations = aiResponse.recommendations || [];
    console.log(`[DSS Controller] Successfully generated ${recommendations.length} recommendations for ${villageId}.`);

    res.status(200).json({
      success: true,
      source: 'ai',
      village: village,
      recommendations: recommendations,
    });
  } catch (error) {
    console.error(`[DSS Controller] CRITICAL ERROR while processing village ${villageId}:`, error);
    next(error);
  }
};


export const getDecisionAnalytics = async (req, res) => {
  try {
    const { state, district } = req.query;

    let whereClause = "";
    let params = [];
    let paramIndex = 1;

    if (state && state !== "all") {
      whereClause += ` WHERE fc.state = $${paramIndex}`;
      params.push(state);
      paramIndex++;
    }

    if (district && district !== "all") {
      whereClause += `${
        whereClause ? " AND" : " WHERE"
      } fc.district = $${paramIndex}`;
      params.push(district);
      paramIndex++;
    }

    const eligibilityStats = await pool.query(
      `
      SELECT
        COUNT(*) as total_households,
        COUNT(CASE WHEN annual_income < 50000 THEN 1 END) as low_income_households,
        COUNT(CASE WHEN asset_type = 'agricultural_land' THEN 1 END) as agricultural_households,
        COUNT(CASE WHEN asset_type = 'water_body' THEN 1 END) as water_stressed_households,
        COUNT(CASE WHEN tribal_group IS NOT NULL THEN 1 END) as tribal_households
      FROM fra_claims fc
      LEFT JOIN village_assets va ON fc.village_name = va.village_name
      ${whereClause}
    `,
      params
    );

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
        schemeStats: schemeStats.rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching decision analytics",
    });
  }
};

export const getSchemes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM css_schemes WHERE active = true ORDER BY scheme_name"
    );

    const schemes = result.rows.map((scheme) => ({
      id: scheme.scheme_name.toLowerCase().replace(/\s+/g, "_"),
      name: scheme.scheme_name,
      category: scheme.scheme_type,
      ministry: scheme.ministry,
      description: scheme.description,
      eligibility: scheme.eligibility_criteria,
      priority: "Medium",
      icon: null, 
      benefits: [],
      active: scheme.active,
    }));

    res.status(200).json({
      success: true,
      data: schemes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching schemes",
    });
  }
};