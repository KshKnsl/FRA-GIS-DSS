import express from 'express';
import {
  getSchemeRecommendations,
  getDecisionAnalytics,
  getSchemes
} from '../controllers/decisionSupportController.js';

const router = express.Router();

router.use((req, res, next) => {
    console.log(`[DSS Router] Request received for path: ${req.path}`);
    next();
});

router.post('/recommendations/:villageId', getSchemeRecommendations);
router.get('/analytics', getDecisionAnalytics);
router.get('/schemes', getSchemes);

export default router;