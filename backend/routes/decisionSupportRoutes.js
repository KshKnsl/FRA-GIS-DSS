import express from 'express';
import {
  getSchemeRecommendations,
  getDecisionAnalytics,
  getSchemes
} from '../controllers/decisionSupportController.js';

const router = express.Router();

// Decision support routes
router.get('/recommendations/:villageId', getSchemeRecommendations);
router.get('/analytics', getDecisionAnalytics);
router.get('/schemes', getSchemes);

export default router;