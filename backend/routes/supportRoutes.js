import express from 'express';
import {
  getSupportTickets,
  submitSupportTicket,
  updateTicketStatus,
  getHelpContent,
  getSupportStats
} from '../controllers/supportController.js';

const router = express.Router();

// Support ticket routes
router.get('/tickets', getSupportTickets);
router.post('/tickets', submitSupportTicket);
router.put('/tickets/:id', updateTicketStatus);

// Help content routes
router.get('/help', getHelpContent);
router.get('/faq', getHelpContent); // Use getHelpContent for FAQ endpoint
router.get('/stats', getSupportStats);

export default router;