# FRA Atlas & Decision Support System

The **Forest Rights Act (FRA), 2006** recognizes the rights of forest-dwelling communities over land and resources. However, challenges remain:

* Scattered, non-digitized FRA records (IFR, CR, CFR).
* No centralized, real-time FRA Atlas of claims & pattas.
* Missing integration of satellite-based asset mapping with FRA data.
* Lack of Decision Support System (DSS) to layer Central Sector Schemes (CSS) benefits for patta holders.

---

## Project Objectives

1. Digitize and standardize legacy FRA data (claims, pattas, verifications).
2. Build an **interactive FRA Atlas** with claims, assets, and titles.
3. Use **Remote Sensing & ML** to map land, water bodies, farms, and forest resources.
4. Integrate data into a **WebGIS Portal** with filters and dashboards.
5. Develop a **DSS engine** to recommend and layer CSS schemes for FRA holders.

---

## Tech Stack
* **Frontend (WebGIS)**: Leaflet / Mapbox
* **Backend**: Node.js / Python APIs
* **Database**: PostGIS (spatial DB), PostgreSQL
* **Geo Processing**: GDAL, GeoPandas
* **ML/Classification**: Scikit-Learn, TensorFlow
* **Satellite Data**: Sentinel-2, Landsat, ISRO Bhuvan

---

## Data Sources
* **Govt. (needs access)**: FRA claims & pattas, Revenue & Forest dept maps, CSS beneficiary data.
* **Public**:

  * Census of India (village boundaries, demographics)
    * Census of India (village boundaries, demographics)
    * Bhuvan (ISRO datasets)settlements, rivers)
    * OpenStreetMap (roads, settlements, rivers)
    * Landsat / Sentinel imagery (asset mapping)
---

## Features
* **Digitization:** OCR + NER to extract structured FRA claimant data.
* **Atlas:** Interactive WebGIS showing claims, granted areas, and progress.
* **Asset Mapping:** ML-based land-use classification from satellite images.
* **DSS Engine:** Recommends schemes (PM-KISAN, Jal Jeevan, MGNREGA, DAJGUA).
* **Visualization:** Filters by state/district/village/tribal group.

---

## Deliverables
1. FRA claims digital archive.
2. FRA Atlas (WebGIS).
3. Asset maps of FRA villages.
4. DSS engine for scheme layering.

---

## Target Users
* Ministry of Tribal Affairs
* Tribal Welfare Departments
* Forest & Revenue Departments
* Planning & Development Authorities
* NGOs & CSOs working with tribal communities

---

## Future Scope
* Real-time monitoring of CFR forests via satellite feeds.
* IoT integration (soil health, water quality sensors).
* Mobile app for patta holders to update claims & give feedback.
