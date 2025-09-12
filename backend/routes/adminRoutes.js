import express from 'express';
import { getAdminStats, getSystemHealth, getMonthlyTrends } from '../controllers/adminController.js';

const router = express.Router();

// Admin dashboard routes
router.get('/stats', getAdminStats);
router.get('/health', getSystemHealth);
router.get('/monthly-trends', getMonthlyTrends);

export default router;