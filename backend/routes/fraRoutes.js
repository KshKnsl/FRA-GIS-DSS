import express from 'express';
import {
  getFRAClaimsByState,
  getFRAStatsByDistrict,
  getFRAVillages,
  getVillageAssets,
  addFRAClaim,
  getPattaHoldersByClaimId,
  getPattaHoldersByState,
  getLandParcels,
  getEnhancedVillageData,
  getPattaHoldersCoordinates,
  getVillageBoundaries,
  searchGlobal
} from '../controllers/fraController.js';

const router = express.Router();

router.get('/search', searchGlobal);

// FRA claims routes
router.get('/claims/:state', getFRAClaimsByState);
router.post('/claims', addFRAClaim);

// FRA statistics routes
router.get('/stats/:state/:district', getFRAStatsByDistrict);

// Village routes
router.get('/villages', getFRAVillages);
router.get('/villages/:villageId/assets', getVillageAssets);
router.get('/villages/:villageId/enhanced', getEnhancedVillageData);

// Patta holders routes
router.get('/patta-holders/:claimId', getPattaHoldersByClaimId);
router.get('/patta-holders/state/:state', getPattaHoldersByState);
router.get('/patta-holders-coordinates', getPattaHoldersCoordinates);

// Land parcels routes
router.get('/land-parcels/:claimId', getLandParcels);

// Village boundaries routes
router.get('/village-boundaries', getVillageBoundaries);

export default router;