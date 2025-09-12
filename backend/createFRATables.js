import pool from './db.js';

// Create FRA-specific tables
export const createFRATables = async () => {
  try {
    // Enable PostGIS extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    
    // Drop all existing tables in correct order (respecting foreign key constraints)
    console.log('Dropping existing tables...');
    await pool.query(`DROP TABLE IF EXISTS scheme_beneficiaries CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS land_parcels CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS patta_holders CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS css_schemes CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS village_assets CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS village_boundaries CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS village_summary CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS fra_claims CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS documents CASCADE`);
    console.log('All existing tables dropped successfully');
    // FRA Claims table - Primary table for all claims
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fra_claims (
        id SERIAL PRIMARY KEY,
        claim_id VARCHAR(50) UNIQUE NOT NULL,
        applicant_name VARCHAR(100) NOT NULL,
        father_husband_name VARCHAR(100),
        village_name VARCHAR(100) NOT NULL,
        district VARCHAR(50) NOT NULL,
        state VARCHAR(50) NOT NULL,
        claim_type VARCHAR(10) CHECK (claim_type IN ('IFR', 'CR', 'CFR')) NOT NULL,
        area_claimed DECIMAL(10,4),
        status VARCHAR(20) CHECK (status IN ('pending', 'granted', 'rejected', 'under_review')) DEFAULT 'pending',
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        tribal_group VARCHAR(100),
        family_size INTEGER DEFAULT 1,
        annual_income DECIMAL(10,2),
        occupation VARCHAR(50),
        application_date DATE DEFAULT CURRENT_DATE,
        approval_date DATE,
        documents_digitized BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Village Assets table for AI-mapped assets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS village_assets (
        id SERIAL PRIMARY KEY,
        village_name VARCHAR(100) NOT NULL,
        district VARCHAR(50) NOT NULL,
        state VARCHAR(50) NOT NULL,
        asset_type VARCHAR(50) NOT NULL,
        asset_subtype VARCHAR(50),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        area_sqm DECIMAL(12,2),
        confidence_score DECIMAL(3,2),
        detection_date TIMESTAMP DEFAULT NOW(),
        satellite_image_date DATE,
        verified BOOLEAN DEFAULT FALSE
      )
    `);

    // Village Boundaries table with PostGIS geometry
    await pool.query(`
      CREATE TABLE IF NOT EXISTS village_boundaries (
        id SERIAL PRIMARY KEY,
        village_name VARCHAR(100) NOT NULL,
        district VARCHAR(50) NOT NULL,
        state VARCHAR(50) NOT NULL,
        boundary_geom GEOMETRY(POLYGON, 4326),
        area_sqkm DECIMAL(10,4),
        perimeter_km DECIMAL(10,4),
        source VARCHAR(50) DEFAULT 'survey',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create spatial index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_village_boundaries_geom 
      ON village_boundaries USING GIST (boundary_geom)
    `);

    // Village summary for aggregated data
    await pool.query(`
      CREATE TABLE IF NOT EXISTS village_summary (
        id SERIAL PRIMARY KEY,
        village_name VARCHAR(100) NOT NULL,
        district VARCHAR(50) NOT NULL,
        state VARCHAR(50) NOT NULL,
        total_population INTEGER,
        tribal_population INTEGER,
        total_households INTEGER,
        fra_pattas_count INTEGER DEFAULT 0,
        forest_cover_percentage DECIMAL(5,2),
        agricultural_land_area DECIMAL(10,4),
        water_bodies_count INTEGER DEFAULT 0,
        homesteads_count INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `);

    // CSS Schemes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS css_schemes (
        id SERIAL PRIMARY KEY,
        scheme_name VARCHAR(100) NOT NULL,
        ministry VARCHAR(100) NOT NULL,
        scheme_type VARCHAR(50),
        eligibility_criteria JSONB,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Scheme beneficiaries mapping
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scheme_beneficiaries (
        id SERIAL PRIMARY KEY,
        claim_id VARCHAR(50) REFERENCES fra_claims(claim_id) ON DELETE CASCADE,
        scheme_id INTEGER REFERENCES css_schemes(id) ON DELETE CASCADE,
        status VARCHAR(20) CHECK (status IN ('eligible', 'enrolled', 'benefiting', 'completed')) DEFAULT 'eligible',
        enrollment_date DATE,
        amount_disbursed DECIMAL(12,2) DEFAULT 0,
        last_disbursement_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(claim_id, scheme_id)
      )
    `);

    // Patta holders detailed information
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patta_holders (
        id SERIAL PRIMARY KEY,
        patta_number VARCHAR(50) UNIQUE NOT NULL,
        claim_id VARCHAR(50) REFERENCES fra_claims(claim_id) ON DELETE CASCADE,
        holder_name VARCHAR(100) NOT NULL,
        father_husband_name VARCHAR(100),
        age INTEGER,
        gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
        occupation VARCHAR(50),
        annual_income DECIMAL(10,2),
        family_size INTEGER,
        land_survey_number VARCHAR(50),
        land_classification VARCHAR(50),
        irrigation_facility BOOLEAN DEFAULT FALSE,
        electricity_connection BOOLEAN DEFAULT FALSE,
        road_connectivity VARCHAR(20) CHECK (road_connectivity IN ('Good', 'Fair', 'Poor', 'None')),
        mobile_number VARCHAR(15),
        bank_account_number VARCHAR(30),
        ifsc_code VARCHAR(20),
        aadhaar_number VARCHAR(12),
        voter_id VARCHAR(20),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        issue_date DATE,
        issuing_authority VARCHAR(100),
        verification_status VARCHAR(20) CHECK (verification_status IN ('Verified', 'Pending', 'Rejected')) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Land parcel details for CFR and CR claims
    await pool.query(`
      CREATE TABLE IF NOT EXISTS land_parcels (
        id SERIAL PRIMARY KEY,
        claim_id VARCHAR(50) REFERENCES fra_claims(claim_id) ON DELETE CASCADE,
        parcel_id VARCHAR(50) NOT NULL,
        survey_number VARCHAR(50),
        sub_division VARCHAR(20),
        area_hectares DECIMAL(10,4),
        land_type VARCHAR(50),
        forest_type VARCHAR(50),
        slope_category VARCHAR(20),
        soil_type VARCHAR(50),
        vegetation_density VARCHAR(20),
        water_source_distance INTEGER, -- meters
        road_distance INTEGER, -- meters
        boundary_coordinates JSONB,
        demarcation_status VARCHAR(20) CHECK (demarcation_status IN ('Completed', 'Pending', 'Disputed')) DEFAULT 'Pending',
        gps_survey_done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(claim_id, parcel_id)
      )
    `);

    // Documents table for FRA document management
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50) CHECK (category IN ('patta', 'claim_form', 'identity_proof', 'land_records', 'court_orders', 'other')) NOT NULL,
        state VARCHAR(50) NOT NULL,
        district VARCHAR(50),
        village VARCHAR(100),
        claim_id VARCHAR(50) REFERENCES fra_claims(claim_id) ON DELETE SET NULL,
        document_type VARCHAR(50),
        tags JSONB DEFAULT '[]',
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        status VARCHAR(20) CHECK (status IN ('pending_verification', 'verified', 'rejected', 'archived')) DEFAULT 'pending_verification',
        verified_by VARCHAR(100),
        verification_remarks TEXT,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Support tickets table for user support system
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(50) UNIQUE NOT NULL,
        subject VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
        status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
        user_name VARCHAR(100) NOT NULL,
        user_email VARCHAR(100) NOT NULL,
        user_phone VARCHAR(15),
        state VARCHAR(50),
        district VARCHAR(50),
        village VARCHAR(100),
        claim_id VARCHAR(50) REFERENCES fra_claims(claim_id) ON DELETE SET NULL,
        response TEXT,
        assigned_to VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('FRA tables created successfully');
    
    await insertSampleData();
    
  } catch (error) {
    console.error('Error creating FRA tables:', error);
  }
};

// Insert sample data for prototype
const insertSampleData = async () => {
  try {
    const sampleClaims = [
      ['FRA_MP_001', 'Ramesh Kumar', 'Deen Dayal', 'Barghat', 'Seoni', 'Madhya Pradesh', 'IFR', 2.5, 'granted', 22.0850, 79.9740, 'Gond', 5, 35000, 'Farmer', '2020-01-15', '2021-03-15'],
      ['FRA_MP_002', 'Sita Devi', 'Raman Singh', 'Kanha', 'Mandla', 'Madhya Pradesh', 'CR', 15.0, 'pending', 22.3344, 80.6114, 'Baiga', 4, 28000, 'Forest Produce Collection', '2020-02-10', null],
      ['FRA_MP_003', 'Bharat Singh', 'Lakhan Singh', 'Pench', 'Chhindwara', 'Madhya Pradesh', 'CFR', 100.0, 'granted', 21.6637, 79.0046, 'Gond', 8, 45000, 'Community Leader', '2019-11-20', '2021-01-25'],
      ['FRA_MP_004', 'Kamala Bai', 'Ram Singh', 'Satpura', 'Betul', 'Madhya Pradesh', 'IFR', 3.2, 'granted', 21.9042, 77.9026, 'Korku', 5, 25000, 'Agriculture Labor', '2020-03-05', '2021-05-20'],
      ['FRA_MP_005', 'Daulat Singh', 'Mohan Singh', 'Bandhavgarh', 'Umaria', 'Madhya Pradesh', 'CFR', 85.0, 'pending', 23.7070, 81.0327, 'Gond', 6, 38000, 'Tribal Leader', '2020-06-12', null],
      ['FRA_MP_006', 'Rukhmani Devi', 'Shyam Lal', 'Kanha Buffer', 'Mandla', 'Madhya Pradesh', 'IFR', 1.8, 'granted', 22.2500, 80.6200, 'Baiga', 4, 18000, 'Forest Produce Collection', '2020-04-08', '2021-07-10'],
      ['FRA_MP_007', 'Shyam Lal', 'Kalu Ram', 'Amarkantak', 'Anuppur', 'Madhya Pradesh', 'CR', 25.0, 'under_review', 22.6704, 81.7580, 'Gond', 7, 42000, 'Community Development', '2020-07-15', null],
      ['FRA_MP_008', 'Sumitra Bai', 'Govind Singh', 'Pachmarhi', 'Hoshangabad', 'Madhya Pradesh', 'IFR', 2.0, 'granted', 22.4676, 78.4336, 'Korku', 3, 22000, 'Small Business', '2020-05-20', '2021-09-25'],
      
      // Tripura - Detailed tribal claims
      ['FRA_TR_001', 'Bijoy Tripura', 'Ratna Tripura', 'Khowai', 'Khowai', 'Tripura', 'IFR', 1.8, 'granted', 24.0690, 91.6056, 'Tripuri', 5, 28000, 'Jhum Cultivation', '2020-01-20', '2021-04-12'],
      ['FRA_TR_002', 'Kamala Reang', 'Mohan Reang', 'Amarpur', 'Gomati', 'Tripura', 'CR', 8.5, 'under_review', 23.5850, 91.6694, 'Reang', 6, 24000, 'Handloom Weaving', '2020-03-15', null],
      ['FRA_TR_003', 'Jiban Chakma', 'Kiran Chakma', 'Belonia', 'South Tripura', 'Tripura', 'IFR', 1.5, 'granted', 23.2525, 91.4596, 'Chakma', 4, 32000, 'Weaving', '2020-02-25', '2021-06-08'],
      ['FRA_TR_004', 'Mangal Jamatia', 'Suresh Jamatia', 'Kailashahar', 'Unakoti', 'Tripura', 'CFR', 45.0, 'pending', 24.3323, 92.0034, 'Jamatia', 7, 35000, 'Traditional Medicine', '2020-04-10', null],
      ['FRA_TR_005', 'Sabitri Mog', 'Anil Mog', 'Teliamura', 'Khowai', 'Tripura', 'IFR', 2.2, 'granted', 24.1784, 91.5641, 'Mog', 3, 26000, 'Handloom', '2020-05-18', '2021-08-15'],
      ['FRA_TR_006', 'Ranjit Halam', 'Dilip Halam', 'Jampui Hills', 'North Tripura', 'Tripura', 'CR', 12.0, 'granted', 24.0832, 92.2975, 'Halam', 5, 30000, 'Horticulture', '2020-01-30', '2021-04-20'],
      
      // Odisha - Diverse tribal communities
      ['FRA_OD_001', 'Jagan Pradhan', 'Biru Pradhan', 'Similipal', 'Mayurbhanj', 'Odisha', 'CFR', 250.0, 'granted', 21.8670, 86.5180, 'Santhal', 9, 48000, 'Community Leader', '2019-12-05', '2021-02-15'],
      ['FRA_OD_002', 'Laxmi Soren', 'Manga Soren', 'Karlapat', 'Kalahandi', 'Odisha', 'IFR', 3.2, 'pending', 19.9170, 83.1470, 'Kandha', 6, 32000, 'Agriculture', '2020-03-20', null],
      ['FRA_OD_003', 'Budhan Munda', 'Soma Munda', 'Sundargarh', 'Sundargarh', 'Odisha', 'IFR', 2.8, 'granted', 22.1183, 84.0242, 'Munda', 7, 20000, 'Forest Worker', '2020-01-12', '2021-02-28'],
      ['FRA_OD_004', 'Kamala Kondh', 'Arjun Kondh', 'Niyamgiri', 'Rayagada', 'Odisha', 'CFR', 120.0, 'granted', 19.3406, 83.7180, 'Dongria Kondh', 8, 25000, 'Traditional Farming', '2019-10-15', '2021-01-10'],
      ['FRA_OD_005', 'Rama Sahu', 'Krushna Sahu', 'Bhitarkanika', 'Kendrapara', 'Odisha', 'CR', 18.5, 'pending', 20.6958, 86.9085, 'Bhuiya', 5, 28000, 'Fishing', '2020-04-25', null],
      ['FRA_OD_006', 'Devi Oram', 'Mangal Oram', 'Keonjhar', 'Keonjhar', 'Odisha', 'IFR', 2.5, 'granted', 21.6293, 85.5828, 'Ho', 5, 15000, 'NTFP Collection', '2020-06-10', '2021-10-05'],
      ['FRA_OD_007', 'Sukru Majhi', 'Basu Majhi', 'Koraput', 'Koraput', 'Odisha', 'CFR', 95.0, 'under_review', 18.8120, 82.7095, 'Paraja', 6, 22000, 'Traditional Craft', '2020-02-18', null],
      ['FRA_OD_008', 'Malati Sabar', 'Bhagat Sabar', 'Dhenkanal', 'Dhenkanal', 'Odisha', 'IFR', 1.9, 'granted', 20.6587, 85.5947, 'Sabar', 4, 12000, 'Daily Wage', '2020-07-05', '2021-11-20'],
      
      // Telangana - Forest-dependent communities
      ['FRA_TG_001', 'Venkat Goud', 'Rama Goud', 'Kawal', 'Jannaram', 'Telangana', 'CFR', 180.0, 'granted', 19.0330, 79.5940, 'Gond', 8, 52000, 'Tribal Leader', '2019-11-10', '2021-01-18'],
      ['FRA_TG_002', 'Anjamma', 'Ramulu', 'Eturnagaram', 'Mulugu', 'Telangana', 'IFR', 2.1, 'granted', 18.3230, 80.1520, 'Koya', 6, 30000, 'Agriculture', '2020-01-08', '2021-01-30'],
      ['FRA_TG_003', 'Somulu Lambada', 'Yellaiah Lambada', 'Pakhal', 'Warangal', 'Telangana', 'CR', 22.0, 'pending', 18.0037, 79.5941, 'Lambada', 7, 38000, 'Animal Husbandry', '2020-03-22', null],
      ['FRA_TG_004', 'Lakshmi Chenchu', 'Venkat Chenchu', 'Nagarjunsagar', 'Nalgonda', 'Telangana', 'IFR', 1.7, 'granted', 16.5689, 79.3124, 'Chenchu', 4, 16000, 'Honey Collection', '2020-05-15', '2021-12-10'],
      ['FRA_TG_005', 'Ravi Yerukula', 'Narayana Yerukula', 'Amrabad', 'Nagarkurnool', 'Telangana', 'CFR', 65.0, 'granted', 16.1833, 78.8167, 'Yerukula', 5, 28000, 'Forest Products', '2020-02-12', '2021-05-22'],
      ['FRA_TG_006', 'Padma Thoti', 'Srinivas Thoti', 'Kagaznagar', 'Komaram Bheem', 'Telangana', 'IFR', 2.8, 'under_review', 19.3364, 79.4614, 'Thoti', 6, 24000, 'Traditional Craft', '2020-04-18', null],
      ['FRA_TG_007', 'Krishna Pradhan', 'Ravi Pradhan', 'Eturunagaram Wildlife', 'Mulugu', 'Telangana', 'CR', 30.0, 'granted', 18.2500, 80.2000, 'Pradhan', 8, 45000, 'Community Leader', '2020-01-25', '2021-03-25'],
      ['FRA_TG_008', 'Yellamma Bagata', 'Buchi Bagata', 'Bhadrachalam', 'Bhadradri Kothagudem', 'Telangana', 'IFR', 3.1, 'pending', 17.6688, 80.8936, 'Bagata', 4, 26000, 'Forest Products', '2020-06-30', null]
    ];

    for (const claim of sampleClaims) {
      await pool.query(`
        INSERT INTO fra_claims 
        (claim_id, applicant_name, father_husband_name, village_name, district, state, claim_type, area_claimed, status, latitude, longitude, tribal_group, family_size, annual_income, occupation, application_date, approval_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (claim_id) DO NOTHING
      `, claim);
    }

    // Comprehensive village assets data
    const sampleAssets = [
      // Madhya Pradesh Assets
      ['Barghat', 'Seoni', 'Madhya Pradesh', 'water_body', 'pond', 22.0860, 79.9750, 5000, 0.92],
      ['Barghat', 'Seoni', 'Madhya Pradesh', 'agricultural_land', 'crop_field', 22.0840, 79.9730, 25000, 0.88],
      ['Barghat', 'Seoni', 'Madhya Pradesh', 'homestead', 'residential_cluster', 22.0855, 79.9735, 8000, 0.95],
      ['Kanha', 'Mandla', 'Madhya Pradesh', 'forest', 'dense_forest', 22.3350, 80.6120, 150000, 0.95],
      ['Kanha', 'Mandla', 'Madhya Pradesh', 'water_body', 'stream', 22.3340, 80.6110, 2000, 0.89],
      ['Pench', 'Chhindwara', 'Madhya Pradesh', 'forest', 'reserve_forest', 21.6640, 79.0050, 200000, 0.97],
      ['Pench', 'Chhindwara', 'Madhya Pradesh', 'agricultural_land', 'mixed_crops', 21.6630, 79.0040, 35000, 0.85],
      ['Satpura', 'Betul', 'Madhya Pradesh', 'water_body', 'reservoir', 21.9045, 77.9030, 12000, 0.93],
      ['Satpura', 'Betul', 'Madhya Pradesh', 'homestead', 'scattered_settlements', 21.9040, 77.9020, 6000, 0.87],
      
      // Tripura Assets
      ['Khowai', 'Khowai', 'Tripura', 'homestead', 'residential', 24.0695, 91.6060, 2000, 0.90],
      ['Khowai', 'Khowai', 'Tripura', 'agricultural_land', 'paddy_field', 24.0685, 91.6050, 15000, 0.92],
      ['Khowai', 'Khowai', 'Tripura', 'water_body', 'fishpond', 24.0700, 91.6065, 3000, 0.88],
      ['Amarpur', 'Gomati', 'Tripura', 'forest', 'bamboo_grove', 23.5855, 91.6700, 25000, 0.91],
      ['Amarpur', 'Gomati', 'Tripura', 'agricultural_land', 'jhum_cultivation', 23.5845, 91.6690, 18000, 0.85],
      ['Belonia', 'South Tripura', 'Tripura', 'homestead', 'tribal_village', 23.2530, 91.4600, 4000, 0.89],
      
      // Odisha Assets
      ['Similipal', 'Mayurbhanj', 'Odisha', 'forest', 'reserve_forest', 21.8680, 86.5190, 500000, 0.97],
      ['Similipal', 'Mayurbhanj', 'Odisha', 'water_body', 'waterfall', 21.8675, 86.5185, 1500, 0.94],
      ['Similipal', 'Mayurbhanj', 'Odisha', 'homestead', 'forest_settlement', 21.8665, 86.5175, 5000, 0.91],
      ['Karlapat', 'Kalahandi', 'Odisha', 'forest', 'deciduous_forest', 19.9175, 83.1475, 80000, 0.93],
      ['Karlapat', 'Kalahandi', 'Odisha', 'agricultural_land', 'millet_field', 19.9165, 83.1465, 22000, 0.87],
      ['Sundargarh', 'Sundargarh', 'Odisha', 'water_body', 'river', 22.1190, 84.0250, 8000, 0.96],
      ['Sundargarh', 'Sundargarh', 'Odisha', 'agricultural_land', 'rice_field', 22.1180, 84.0240, 30000, 0.89],
      ['Niyamgiri', 'Rayagada', 'Odisha', 'forest', 'sacred_grove', 19.3410, 83.7185, 120000, 0.98],
      
      // Telangana Assets
      ['Kawal', 'Jannaram', 'Telangana', 'forest', 'tiger_reserve', 19.0335, 79.5945, 300000, 0.96],
      ['Kawal', 'Jannaram', 'Telangana', 'water_body', 'tank', 19.0325, 79.5935, 10000, 0.90],
      ['Eturnagaram', 'Mulugu', 'Telangana', 'forest', 'wildlife_sanctuary', 18.3235, 80.1525, 180000, 0.95],
      ['Eturnagaram', 'Mulugu', 'Telangana', 'homestead', 'tribal_hamlet', 18.3225, 80.1515, 3500, 0.88],
      ['Pakhal', 'Warangal', 'Telangana', 'water_body', 'lake', 18.0040, 79.5945, 15000, 0.94],
      ['Pakhal', 'Warangal', 'Telangana', 'agricultural_land', 'cotton_field', 18.0030, 79.5935, 28000, 0.86],
      ['Nagarjunsagar', 'Nalgonda', 'Telangana', 'water_body', 'reservoir', 16.5695, 79.3130, 50000, 0.97],
      ['Amrabad', 'Nagarkurnool', 'Telangana', 'forest', 'dry_deciduous', 16.1840, 78.8175, 85000, 0.92]
    ];

    for (const asset of sampleAssets) {
      await pool.query(`
        INSERT INTO village_assets 
        (village_name, district, state, asset_type, asset_subtype, latitude, longitude, area_sqm, confidence_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, asset);
    }

    // Sample CSS schemes with proper categories and array data
    const sampleSchemes = [
      {
        scheme_name: 'PM-KISAN',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        scheme_type: 'Agriculture',
        eligibility_criteria: ['Land holding < 2 hectares', 'Cultivator farmer', 'FRA patta holder', 'Annual income < ₹6 lakh'],
        description: 'Direct income support to farmers through DBT'
      },
      {
        scheme_name: 'Jal Jeevan Mission',
        ministry: 'Ministry of Jal Shakti',
        scheme_type: 'Water',
        eligibility_criteria: ['Rural household', 'No piped water connection', 'FRA village', 'Government approved village'],
        description: 'Piped water supply to rural households'
      },
      {
        scheme_name: 'MGNREGA',
        ministry: 'Ministry of Rural Development',
        scheme_type: 'Employment',
        eligibility_criteria: ['Rural household', 'Adult member available', 'Demand-based work', 'FRA beneficiary'],
        description: 'Guaranteed wage employment for rural households'
      },
      {
        scheme_name: 'Van Dhan Yojana',
        ministry: 'Ministry of Tribal Affairs',
        scheme_type: 'Livelihood',
        eligibility_criteria: ['Tribal community', 'Forest products collection', 'FRA patta holder', 'SHG formation'],
        description: 'Value addition to tribal forest products'
      },
      {
        scheme_name: 'Pradhan Mantri Awas Yojana',
        ministry: 'Ministry of Housing and Urban Affairs',
        scheme_type: 'Housing',
        eligibility_criteria: ['Rural household', 'No pucca house', 'FRA patta holder', 'BPL category'],
        description: 'Housing for all rural households by 2022'
      },
      {
        scheme_name: 'Mid-Day Meal Scheme',
        ministry: 'Ministry of Education',
        scheme_type: 'Nutrition',
        eligibility_criteria: ['School children', 'Government school', 'Class 1-8', 'Tribal area'],
        description: 'Nutritious meal to school children'
      },
      {
        scheme_name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
        ministry: 'Ministry of Rural Development',
        scheme_type: 'Skill Development',
        eligibility_criteria: ['Rural youth', 'Age 15-35', 'FRA village', 'Below poverty line'],
        description: 'Skill development and placement for rural youth'
      },
      {
        scheme_name: 'National Rural Health Mission',
        ministry: 'Ministry of Health and Family Welfare',
        scheme_type: 'Infrastructure',
        eligibility_criteria: ['Rural area', 'Tribal village', 'FRA settlement', 'Government approved'],
        description: 'Comprehensive healthcare for rural population'
      }
    ];

    for (const scheme of sampleSchemes) {
      await pool.query(`
        INSERT INTO css_schemes
        (scheme_name, ministry, scheme_type, eligibility_criteria, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [scheme.scheme_name, scheme.ministry, scheme.scheme_type, JSON.stringify(scheme.eligibility_criteria), scheme.description]);
    }

    console.log('Sample data inserted successfully');
    
    // Village summary with realistic data
    const sampleVillageSummaries = [
      {
        village_name: 'Barghat',
        district: 'Seoni',
        state: 'Madhya Pradesh',
        total_population: 2850,
        tribal_population: 2100,
        total_households: 620,
        fra_pattas_count: 45,
        forest_cover_percentage: 75.5,
        agricultural_land_area: 450.8,
        water_bodies_count: 3,
        homesteads_count: 580
      },
      {
        village_name: 'Kanha',
        district: 'Mandla',
        state: 'Madhya Pradesh',
        total_population: 3200,
        tribal_population: 2800,
        total_households: 720,
        fra_pattas_count: 62,
        forest_cover_percentage: 85.2,
        agricultural_land_area: 320.5,
        water_bodies_count: 2,
        homesteads_count: 680
      },
      {
        village_name: 'Pench',
        district: 'Chhindwara',
        state: 'Madhya Pradesh',
        total_population: 1950,
        tribal_population: 1650,
        total_households: 420,
        fra_pattas_count: 38,
        forest_cover_percentage: 68.9,
        agricultural_land_area: 380.2,
        water_bodies_count: 4,
        homesteads_count: 395
      },
      {
        village_name: 'Khowai',
        district: 'Khowai',
        state: 'Tripura',
        total_population: 4100,
        tribal_population: 3200,
        total_households: 890,
        fra_pattas_count: 78,
        forest_cover_percentage: 45.3,
        agricultural_land_area: 680.7,
        water_bodies_count: 6,
        homesteads_count: 850
      },
      {
        village_name: 'Amarpur',
        district: 'Gomati',
        state: 'Tripura',
        total_population: 2750,
        tribal_population: 1950,
        total_households: 580,
        fra_pattas_count: 52,
        forest_cover_percentage: 52.1,
        agricultural_land_area: 520.3,
        water_bodies_count: 5,
        homesteads_count: 545
      },
      {
        village_name: 'Similipal',
        district: 'Mayurbhanj',
        state: 'Odisha',
        total_population: 4800,
        tribal_population: 4100,
        total_households: 1050,
        fra_pattas_count: 95,
        forest_cover_percentage: 92.4,
        agricultural_land_area: 280.6,
        water_bodies_count: 3,
        homesteads_count: 980
      },
      {
        village_name: 'Karlapat',
        district: 'Kalahandi',
        state: 'Odisha',
        total_population: 3600,
        tribal_population: 2900,
        total_households: 780,
        fra_pattas_count: 68,
        forest_cover_percentage: 78.6,
        agricultural_land_area: 420.8,
        water_bodies_count: 4,
        homesteads_count: 735
      },
      {
        village_name: 'Kawal',
        district: 'Jannaram',
        state: 'Telangana',
        total_population: 5200,
        tribal_population: 3800,
        total_households: 1150,
        fra_pattas_count: 110,
        forest_cover_percentage: 88.7,
        agricultural_land_area: 350.4,
        water_bodies_count: 2,
        homesteads_count: 1080
      },
      {
        village_name: 'Eturnagaram',
        district: 'Mulugu',
        state: 'Telangana',
        total_population: 3900,
        tribal_population: 3100,
        total_households: 850,
        fra_pattas_count: 82,
        forest_cover_percentage: 71.3,
        agricultural_land_area: 480.9,
        water_bodies_count: 5,
        homesteads_count: 810
      }
    ];

    for (const summary of sampleVillageSummaries) {
      await pool.query(`
        INSERT INTO village_summary
        (village_name, district, state, total_population, tribal_population, total_households,
         fra_pattas_count, forest_cover_percentage, agricultural_land_area, water_bodies_count, homesteads_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING
      `, [
        summary.village_name, summary.district, summary.state, summary.total_population,
        summary.tribal_population, summary.total_households, summary.fra_pattas_count,
        summary.forest_cover_percentage, summary.agricultural_land_area, summary.water_bodies_count,
        summary.homesteads_count
      ]);
    }

    // Insert sample documents data
    await insertSampleDocuments();

  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

// Insert sample patta holders data
const insertPattaHoldersData = async () => {
  try {
    const samplePattaHolders = [
      // Madhya Pradesh Patta Holders - Only for granted claims
      ['PH_MP_001', 'FRA_MP_001', 'Ramesh Kumar', 'Deen Dayal', 45, 'Male', 'Farmer', 35000, 5, 'Survey-234/2A', 'Agricultural', true, false, 'Fair', '9876543210', '1234567890123456', 'SBIN0001234', '123456789012', 'ABC1234567', 22.0867, 79.7388, '2021-03-15', 'Sub Divisional Officer, Seoni', 'Verified'],
      ['PH_MP_004', 'FRA_MP_004', 'Kamala Bai', 'Ram Singh', 38, 'Female', 'Agriculture Labor', 25000, 5, 'Survey-456/1B', 'Forest Land', false, false, 'Poor', '9876543211', '2345678901234567', 'PUNB0002345', '234567890123', 'DEF2345678', 21.9058, 77.7392, '2021-05-20', 'Sub Divisional Officer, Betul', 'Verified'],
      ['PH_MP_006', 'FRA_MP_006', 'Rukhmani Devi', 'Shyam Lal', 42, 'Female', 'Forest Produce Collection', 18000, 4, 'Survey-789/3C', 'Forest Land', false, false, 'Good', '9876543212', '3456789012345678', 'ICIC0003456', '345678901234', 'GHI3456789', 22.9734, 80.9449, '2021-07-10', 'Sub Divisional Officer, Mandla', 'Verified'],
      ['PH_MP_008', 'FRA_MP_008', 'Sumitra Bai', 'Govind Singh', 35, 'Female', 'Small Business', 22000, 3, 'Survey-012/4D', 'Homestead', true, true, 'Good', '9876543213', '4567890123456789', 'HDFC0004567', '456789012345', 'JKL4567890', 22.7520, 77.7273, '2021-09-25', 'Sub Divisional Officer, Hoshangabad', 'Verified'],
      
      // Tripura Patta Holders - Only for granted claims
      ['PH_TR_001', 'FRA_TR_001', 'Bijoy Tripura', 'Ratna Tripura', 40, 'Male', 'Jhum Cultivation', 28000, 5, 'Survey-101/1A', 'Agricultural', false, false, 'Fair', '9876543214', '5678901234567890', 'AXIS0005678', '567890123456', 'MNO5678901', 24.3198, 91.7478, '2021-04-12', 'Sub Divisional Officer, Khowai', 'Verified'],
      ['PH_TR_003', 'FRA_TR_003', 'Jiban Chakma', 'Kiran Chakma', 33, 'Male', 'Weaving', 32000, 4, 'Survey-202/2B', 'Homestead', true, true, 'Good', '9876543215', '6789012345678901', 'BOB0006789', '678901234567', 'PQR6789012', 23.6269, 91.4270, '2021-06-08', 'Sub Divisional Officer, Belonia', 'Verified'],
      ['PH_TR_005', 'FRA_TR_005', 'Sabitri Mog', 'Anil Mog', 29, 'Female', 'Handloom', 26000, 3, 'Survey-303/3C', 'Agricultural', false, false, 'Fair', '9876543216', '7890123456789012', 'SBI0007890', '789012345678', 'STU7890123', 23.8315, 91.2792, '2021-08-15', 'Sub Divisional Officer, Teliamura', 'Verified'],
      ['PH_TR_006', 'FRA_TR_006', 'Ranjit Halam', 'Dilip Halam', 45, 'Male', 'Horticulture', 30000, 5, 'Survey-404/4E', 'Agricultural', true, false, 'Good', '9876543217', '8901234567890123', 'AXIS0008901', '890123456789', 'UVW8901234', 24.0832, 92.2975, '2021-04-20', 'Sub Divisional Officer, Jampui Hills', 'Verified'],
      
      // Odisha Patta Holders - Only for granted claims
      ['PH_OD_001', 'FRA_OD_001', 'Jagan Pradhan', 'Biru Pradhan', 52, 'Male', 'Community Leader', 48000, 9, 'Survey-501/5A', 'Community Forest Resource', true, true, 'Good', '9876543218', '9012345678901234', 'SBI0009012', '901234567890', 'XYZ9012345', 21.8670, 86.5180, '2021-02-15', 'Sub Divisional Officer, Similipal', 'Verified'],
      ['PH_OD_003', 'FRA_OD_003', 'Budhan Munda', 'Soma Munda', 48, 'Male', 'Forest Worker', 20000, 7, 'Survey-404/4D', 'Forest Land', false, false, 'Poor', '9876543219', '0123456789012345', 'UCO0000123', '012345678901', 'ABC0123456', 22.1167, 84.0512, '2021-02-28', 'Sub Divisional Officer, Sundargarh', 'Verified'],
      ['PH_OD_004', 'FRA_OD_004', 'Kamala Kondh', 'Arjun Kondh', 43, 'Female', 'Traditional Farming', 25000, 8, 'Survey-505/5B', 'Community Forest Resource', false, false, 'Fair', '9876543220', '1234567890123456', 'CANARA0001234', '123456789012', 'DEF1234567', 19.3406, 83.7180, '2021-01-10', 'Sub Divisional Officer, Niyamgiri', 'Verified'],
      ['PH_OD_006', 'FRA_OD_006', 'Devi Oram', 'Mangal Oram', 36, 'Female', 'NTFP Collection', 15000, 5, 'Survey-606/6C', 'Forest Land', false, false, 'Poor', '9876543221', '2345678901234567', 'CANARA0002345', '234567890123', 'GHI2345678', 21.6281, 85.8245, '2021-10-05', 'Sub Divisional Officer, Keonjhar', 'Verified'],
      ['PH_OD_008', 'FRA_OD_008', 'Malati Sabar', 'Bhagat Sabar', 31, 'Female', 'Daily Wage', 12000, 4, 'Survey-707/7D', 'Agricultural', false, false, 'Fair', '9876543222', '3456789012345678', 'IDBI0003456', '345678901234', 'JKL3456789', 20.6593, 85.6188, '2021-11-20', 'Sub Divisional Officer, Dhenkanal', 'Verified'],
      
      // Telangana Patta Holders - Only for granted claims
      ['PH_TG_001', 'FRA_TG_001', 'Venkat Goud', 'Rama Goud', 55, 'Male', 'Tribal Leader', 52000, 8, 'Survey-801/8A', 'Community Forest Resource', true, true, 'Good', '9876543223', '4567890123456789', 'SBI0004567', '456789012345', 'MNO4567890', 19.0330, 79.5940, '2021-01-18', 'Sub Divisional Officer, Kawal', 'Verified'],
      ['PH_TG_002', 'FRA_TG_002', 'Anjamma', 'Ramulu', 44, 'Female', 'Agriculture', 30000, 6, 'Survey-802/8B', 'Agricultural', true, false, 'Good', '9876543224', '5678901234567890', 'ANDHRA0005678', '567890123456', 'PQR5678901', 18.8760, 80.1500, '2021-01-30', 'Sub Divisional Officer, Eturnagaram', 'Verified'],
      ['PH_TG_004', 'FRA_TG_004', 'Lakshmi Chenchu', 'Venkat Chenchu', 39, 'Female', 'Honey Collection', 16000, 4, 'Survey-803/8C', 'Forest Land', false, false, 'Poor', '9876543225', '6789012345678901', 'UNION0006789', '678901234567', 'STU6789012', 16.1000, 79.2600, '2021-12-10', 'Sub Divisional Officer, Nagarjunsagar', 'Verified'],
      ['PH_TG_005', 'FRA_TG_005', 'Ravi Yerukula', 'Narayana Yerukula', 42, 'Male', 'Forest Products', 28000, 5, 'Survey-804/8D', 'Community Forest Resource', false, true, 'Fair', '9876543226', '7890123456789012', 'UNION0007890', '789012345678', 'UVW7890123', 16.1833, 78.8167, '2021-05-22', 'Sub Divisional Officer, Amrabad', 'Verified'],
      ['PH_TG_007', 'FRA_TG_007', 'Krishna Pradhan', 'Ravi Pradhan', 52, 'Male', 'Community Leader', 45000, 8, 'Survey-805/8E', 'Community Land', true, true, 'Good', '9876543227', '8901234567890123', 'TELANGANA0008901', '890123456789', 'XYZ8901234', 18.8760, 80.1500, '2021-03-25', 'Sub Divisional Officer, Eturunagaram', 'Verified']
    ];

    for (const holder of samplePattaHolders) {
      await pool.query(`
        INSERT INTO patta_holders 
        (patta_number, claim_id, holder_name, father_husband_name, age, gender, occupation, annual_income, family_size, land_survey_number, land_classification, irrigation_facility, electricity_connection, road_connectivity, mobile_number, bank_account_number, ifsc_code, aadhaar_number, voter_id, latitude, longitude, issue_date, issuing_authority, verification_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (patta_number) DO NOTHING
      `, holder);
    }

    // Sample land parcels data
    const sampleParcels = [
      ['FRA_MP_003', 'PARCEL_MP_003_1', 'Survey-100/1', 'A', 85.5, 'Community Forest Resource', 'Dense Forest', 'Moderate', 'Red Laterite', 'Dense', 200, 1500, '{"coordinates": [[21.6637, 79.0046], [21.6647, 79.0056], [21.6657, 79.0066], [21.6647, 79.0076]]}', 'Completed', true],
      ['FRA_OD_001', 'PARCEL_OD_001_1', 'Survey-200/2', 'B', 200.0, 'Community Forest Resource', 'Sal Forest', 'Gentle', 'Alluvial', 'Very Dense', 500, 2000, '{"coordinates": [[21.8670, 86.5180], [21.8680, 86.5190], [21.8690, 86.5200], [21.8680, 86.5210]]}', 'Completed', true],
      ['FRA_TG_001', 'PARCEL_TG_001_1', 'Survey-300/3', 'C', 150.0, 'Community Forest Resource', 'Teak Forest', 'Steep', 'Black Cotton', 'Moderate', 300, 1000, '{"coordinates": [[19.0330, 79.5940], [19.0340, 79.5950], [19.0350, 79.5960], [19.0340, 79.5970]]}', 'Completed', true],
      ['FRA_TG_005', 'PARCEL_TG_005_1', 'Survey-400/4', 'D', 55.0, 'Community Forest Resource', 'Dry Deciduous', 'Moderate', 'Red Sandy', 'Sparse', 150, 800, '{"coordinates": [[16.1833, 78.8167], [16.1843, 78.8177], [16.1853, 78.8187], [16.1843, 78.8197]]}', 'Pending', false]
    ];

    for (const parcel of sampleParcels) {
      await pool.query(`
        INSERT INTO land_parcels 
        (claim_id, parcel_id, survey_number, sub_division, area_hectares, land_type, forest_type, slope_category, soil_type, vegetation_density, water_source_distance, road_distance, boundary_coordinates, demarcation_status, gps_survey_done)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT DO NOTHING
      `, parcel);
    }

    console.log('Patta holders and land parcels data inserted successfully');

  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

// Insert sample village boundaries (simplified polygons)
const insertSampleBoundaries = async () => {
  try {
    const sampleBoundaries = [
      // Madhya Pradesh villages - simplified rectangular boundaries
      ['Barghat', 'Seoni', 'Madhya Pradesh', 'POLYGON((79.9500 22.0700, 79.9800 22.0700, 79.9800 22.1000, 79.9500 22.1000, 79.9500 22.0700))', 2.5],
      ['Kanha', 'Mandla', 'Madhya Pradesh', 'POLYGON((80.5900 22.3200, 80.6300 22.3200, 80.6300 22.3500, 80.5900 22.3500, 80.5900 22.3200))', 8.2],
      ['Pench', 'Chhindwara', 'Madhya Pradesh', 'POLYGON((78.9800 21.6400, 79.0300 21.6400, 79.0300 21.6900, 78.9800 21.6900, 78.9800 21.6400))', 12.1],
      
      // Tripura villages
      ['Khowai', 'Khowai', 'Tripura', 'POLYGON((91.5800 24.0500, 91.6300 24.0500, 91.6300 24.0900, 91.5800 24.0900, 91.5800 24.0500))', 3.2],
      ['Amarpur', 'Gomati', 'Tripura', 'POLYGON((91.6500 23.5700, 91.6900 23.5700, 91.6900 23.6000, 91.6500 23.6000, 91.6500 23.5700))', 4.1],
      
      // Odisha villages
      ['Similipal', 'Mayurbhanj', 'Odisha', 'POLYGON((86.4900 21.8400, 86.5500 21.8400, 86.5500 21.9000, 86.4900 21.9000, 86.4900 21.8400))', 15.6],
      ['Karlapat', 'Kalahandi', 'Odisha', 'POLYGON((83.1200 19.9000, 83.1700 19.9000, 83.1700 19.9400, 83.1200 19.9400, 83.1200 19.9000))', 6.8],
      
      // Telangana villages
      ['Kawal', 'Jannaram', 'Telangana', 'POLYGON((79.5700 19.0100, 79.6200 19.0100, 79.6200 19.0600, 79.5700 19.0600, 79.5700 19.0100))', 9.3],
      ['Eturnagaram', 'Mulugu', 'Telangana', 'POLYGON((80.1300 18.3000, 80.1800 18.3000, 80.1800 18.3500, 80.1300 18.3500, 80.1300 18.3000))', 7.4]
    ];

    for (const boundary of sampleBoundaries) {
      await pool.query(`
        INSERT INTO village_boundaries 
        (village_name, district, state, boundary_geom, area_sqkm)
        VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), $5)
        ON CONFLICT DO NOTHING
      `, boundary);
    }
  } catch (error) {
    console.error('Error inserting sample boundaries:', error);
  }
};

const insertSampleDocuments = async () => {
  try {
    const sampleDocuments = [
      ['FRA Patta Document - Barghat', 'Official FRA patta document for Ramesh Kumar', 'patta', 'Madhya Pradesh', 'Seoni', 'Barghat', 'FRA_MP_001', 'patta_certificate', '["official", "verified"]', '/uploads/fra_patta_mp_001.pdf', 2048000, 'application/pdf', 'verified', 'SDO Seoni', 'Document verified and authenticated', '2021-03-15'],
      ['Claim Form - Kanha', 'FRA claim application form for Sita Devi', 'claim_form', 'Madhya Pradesh', 'Mandla', 'Kanha', 'FRA_MP_002', 'application_form', '["pending", "review"]', '/uploads/claim_form_mp_002.pdf', 1536000, 'application/pdf', 'pending_verification', null, null, null],
      ['Identity Proof - Pench', 'Aadhaar card copy for Bharat Singh', 'identity_proof', 'Madhya Pradesh', 'Chhindwara', 'Pench', 'FRA_MP_003', 'aadhaar_card', '["identity", "verified"]', '/uploads/aadhaar_mp_003.pdf', 512000, 'application/pdf', 'verified', 'SDO Chhindwara', 'Identity verified', '2021-01-25'],
      ['Land Records - Satpura', 'Survey documents for Kamala Bai', 'land_records', 'Madhya Pradesh', 'Betul', 'Satpura', 'FRA_MP_004', 'survey_document', '["land", "survey"]', '/uploads/land_records_mp_004.pdf', 3072000, 'application/pdf', 'verified', 'SDO Betul', 'Land records authenticated', '2021-05-20'],
      ['Court Order - Khowai', 'Tribunal court order for Bijoy Tripura', 'court_orders', 'Tripura', 'Khowai', 'Khowai', 'FRA_TR_001', 'court_order', '["court", "tribunal"]', '/uploads/court_order_tr_001.pdf', 1024000, 'application/pdf', 'verified', 'Tribunal Court', 'Court order verified', '2021-04-12'],
      ['Identity Proof - Similipal', 'Voter ID for Jagan Pradhan', 'identity_proof', 'Odisha', 'Mayurbhanj', 'Similipal', 'FRA_OD_001', 'voter_id', '["identity", "election"]', '/uploads/voter_id_od_001.pdf', 768000, 'application/pdf', 'verified', 'Election Officer', 'Voter ID verified', '2021-02-15'],
      ['Claim Form - Kawal', 'FRA claim form for Venkat Goud', 'claim_form', 'Telangana', 'Jannaram', 'Kawal', 'FRA_TG_001', 'application_form', '["application", "pending"]', '/uploads/claim_form_tg_001.pdf', 2048000, 'application/pdf', 'pending_verification', null, null, null]
    ];

    for (const doc of sampleDocuments) {
      await pool.query(`
        INSERT INTO documents
        (title, description, category, state, district, village, claim_id, document_type, tags, file_path, file_size, mime_type, status, verified_by, verification_remarks, verified_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT DO NOTHING
      `, doc);
    }

    console.log('Sample documents data inserted successfully');

  } catch (error) {
    console.error('Error inserting sample documents:', error);
  }
};

export default createFRATables;
