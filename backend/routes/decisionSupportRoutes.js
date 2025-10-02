import express from 'express';
import {
  getSchemeRecommendations,
  getDecisionAnalytics,
  getSchemes,
  testGroq 
} from '../controllers/decisionSupportController.js';

const router = express.Router();

console.log("--- decisionSupportRoutes.js: Router file loaded. ---");

// log every request 
router.use((req, res, next) => {
    console.log(`[DSS Router] Request received for path: ${req.path}`);
    next();
});

router.get('/test-groq', testGroq);

router.post('/recommendations/:villageId', getSchemeRecommendations);
router.get('/analytics', getDecisionAnalytics);
router.get('/schemes', getSchemes);

export default router;