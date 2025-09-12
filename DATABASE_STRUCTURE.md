# FRA Database Structure

## Overview
This document describes the complete database structure for the Forest Rights Act (FRA) Atlas and Decision Support System. The database is built on PostgreSQL with PostGIS extension for spatial data management and includes comprehensive support for FRA claim management, spatial analysis, decision support, document management, and user support systems.

## Database Schema

### Core Tables

#### 1. `fra_claims` - Primary FRA Claims Table
**Purpose**: Stores all FRA claim applications and their current status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| claim_id | VARCHAR(50) | UNIQUE NOT NULL | Unique claim identifier (e.g., FRA_MP_001) |
| applicant_name | VARCHAR(100) | NOT NULL | Name of the applicant |
| father_husband_name | VARCHAR(100) | - | Father's or husband's name |
| village_name | VARCHAR(100) | NOT NULL | Village where claim is filed |
| district | VARCHAR(50) | NOT NULL | District name |
| state | VARCHAR(50) | NOT NULL | State name |
| claim_type | VARCHAR(10) | CHECK (IFR/CR/CFR) NOT NULL | Type of claim |
| area_claimed | DECIMAL(10,4) | - | Area claimed in hectares |
| status | VARCHAR(20) | CHECK DEFAULT 'pending' | Current status |
| latitude | DECIMAL(10,8) | - | GPS latitude |
| longitude | DECIMAL(11,8) | - | GPS longitude |
| tribal_group | VARCHAR(100) | - | Tribal community name |
| family_size | INTEGER | DEFAULT 1 | Number of family members |
| annual_income | DECIMAL(10,2) | - | Annual family income |
| occupation | VARCHAR(50) | - | Primary occupation |
| application_date | DATE | DEFAULT CURRENT_DATE | Date of application |
| approval_date | DATE | - | Date of approval |
| documents_digitized | BOOLEAN | DEFAULT FALSE | Whether documents are digitized |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

#### 2. `village_assets` - AI-Mapped Village Assets
**Purpose**: Stores AI-detected assets within villages using satellite imagery.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| village_name | VARCHAR(100) | NOT NULL | Village name |
| district | VARCHAR(50) | NOT NULL | District name |
| state | VARCHAR(50) | NOT NULL | State name |
| asset_type | VARCHAR(50) | NOT NULL | Type (water_body, agricultural_land, forest, homestead) |
| asset_subtype | VARCHAR(50) | - | Specific subtype |
| latitude | DECIMAL(10,8) | - | Asset latitude |
| longitude | DECIMAL(11,8) | - | Asset longitude |
| area_sqm | DECIMAL(12,2) | - | Area in square meters |
| confidence_score | DECIMAL(3,2) | - | AI confidence score (0-1) |
| detection_date | TIMESTAMP | DEFAULT NOW() | When asset was detected |
| satellite_image_date | DATE | - | Date of satellite image used |
| verified | BOOLEAN | DEFAULT FALSE | Whether asset is verified |

#### 3. `village_boundaries` - Village Geographic Boundaries
**Purpose**: Stores village boundary polygons using PostGIS geometry.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| village_name | VARCHAR(100) | NOT NULL | Village name |
| district | VARCHAR(50) | NOT NULL | District name |
| state | VARCHAR(50) | NOT NULL | State name |
| boundary_geom | GEOMETRY(POLYGON, 4326) | - | PostGIS polygon geometry |
| area_sqkm | DECIMAL(10,4) | - | Area in square kilometers |
| perimeter_km | DECIMAL(10,4) | - | Perimeter in kilometers |
| source | VARCHAR(50) | DEFAULT 'survey' | Data source |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Spatial Index**: `idx_village_boundaries_geom` on `boundary_geom` using GIST

#### 4. `village_summary` - Aggregated Village Statistics
**Purpose**: Pre-computed statistics for quick dashboard access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| village_name | VARCHAR(100) | NOT NULL | Village name |
| district | VARCHAR(50) | NOT NULL | District name |
| state | VARCHAR(50) | NOT NULL | State name |
| total_population | INTEGER | - | Total village population |
| tribal_population | INTEGER | - | Tribal population |
| total_households | INTEGER | - | Total households |
| fra_pattas_count | INTEGER | DEFAULT 0 | Number of FRA pattas issued |
| forest_cover_percentage | DECIMAL(5,2) | - | Forest cover percentage |
| agricultural_land_area | DECIMAL(10,4) | - | Agricultural land area |
| water_bodies_count | INTEGER | DEFAULT 0 | Number of water bodies |
| homesteads_count | INTEGER | DEFAULT 0 | Number of homesteads |
| last_updated | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

#### 5. `css_schemes` - Central Sector Schemes
**Purpose**: Information about government schemes for eligibility matching.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| scheme_name | VARCHAR(100) | NOT NULL | Name of the scheme |
| ministry | VARCHAR(100) | NOT NULL | Responsible ministry |
| scheme_type | VARCHAR(50) | - | Type of scheme |
| eligibility_criteria | JSONB | - | Eligibility criteria as JSON |
| description | TEXT | - | Scheme description |
| active | BOOLEAN | DEFAULT TRUE | Whether scheme is active |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

#### 6. `scheme_beneficiaries` - Scheme Beneficiary Mapping
**Purpose**: Links FRA claimants to government schemes they are eligible for.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| claim_id | VARCHAR(50) | REFERENCES fra_claims(claim_id) ON DELETE CASCADE | Foreign key to claims |
| scheme_id | INTEGER | REFERENCES css_schemes(id) ON DELETE CASCADE | Foreign key to schemes |
| status | VARCHAR(20) | CHECK DEFAULT 'eligible' | Beneficiary status |
| enrollment_date | DATE | - | Date of enrollment |
| amount_disbursed | DECIMAL(12,2) | DEFAULT 0 | Amount disbursed |
| last_disbursement_date | DATE | - | Last disbursement date |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

**Unique Constraint**: `(claim_id, scheme_id)`

#### 7. `patta_holders` - Detailed Patta Holder Information
**Purpose**: Comprehensive information about FRA patta holders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| patta_number | VARCHAR(50) | UNIQUE NOT NULL | Unique patta number |
| claim_id | VARCHAR(50) | REFERENCES fra_claims(claim_id) ON DELETE CASCADE | Foreign key to claims |
| holder_name | VARCHAR(100) | NOT NULL | Patta holder name |
| father_husband_name | VARCHAR(100) | - | Father's/husband's name |
| age | INTEGER | - | Age of holder |
| gender | VARCHAR(10) | CHECK | Gender |
| occupation | VARCHAR(50) | - | Occupation |
| annual_income | DECIMAL(10,2) | - | Annual income |
| family_size | INTEGER | - | Family size |
| land_survey_number | VARCHAR(50) | - | Survey number |
| land_classification | VARCHAR(50) | - | Land classification |
| irrigation_facility | BOOLEAN | DEFAULT FALSE | Irrigation available |
| electricity_connection | BOOLEAN | DEFAULT FALSE | Electricity available |
| road_connectivity | VARCHAR(20) | CHECK | Road connectivity level |
| mobile_number | VARCHAR(15) | - | Mobile number |
| bank_account_number | VARCHAR(30) | - | Bank account number |
| ifsc_code | VARCHAR(20) | - | IFSC code |
| aadhaar_number | VARCHAR(12) | - | Aadhaar number |
| voter_id | VARCHAR(20) | - | Voter ID |
| latitude | DECIMAL(10,8) | - | Location latitude |
| longitude | DECIMAL(11,8) | - | Location longitude |
| issue_date | DATE | - | Patta issue date |
| issuing_authority | VARCHAR(100) | - | Issuing authority |
| verification_status | VARCHAR(20) | CHECK DEFAULT 'Pending' | Verification status |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

#### 9. `support_tickets` - Support Ticket Management
**Purpose**: Manages user support tickets and help requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| ticket_id | VARCHAR(50) | UNIQUE NOT NULL | Unique ticket identifier |
| subject | VARCHAR(200) | NOT NULL | Ticket subject |
| description | TEXT | NOT NULL | Detailed description |
| category | VARCHAR(50) | NOT NULL | Support category |
| priority | VARCHAR(20) | CHECK DEFAULT 'medium' | Priority level |
| status | VARCHAR(20) | CHECK DEFAULT 'open' | Ticket status |
| user_name | VARCHAR(100) | NOT NULL | User's full name |
| user_email | VARCHAR(100) | NOT NULL | User's email address |
| user_phone | VARCHAR(15) | - | User's phone number |
| state | VARCHAR(50) | - | Related state |
| district | VARCHAR(50) | - | Related district |
| village | VARCHAR(100) | - | Related village |
| claim_id | VARCHAR(50) | REFERENCES fra_claims(claim_id) | Related claim ID |
| response | TEXT | - | Support response |
| assigned_to | VARCHAR(100) | - | Assigned support agent |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

## Relationships

```
fra_claims (1) ──── (many) scheme_beneficiaries (many) ──── (1) css_schemes
    │
    ├── (1) patta_holders
    │
    ├── (1) land_parcels
    │
    ├── (1) documents
    │
    └── (1) support_tickets
```

## Data Initialization

The database is automatically populated with sample data when the server starts through the `createFRATables.js` script, which:

1. Creates all tables in correct dependency order

