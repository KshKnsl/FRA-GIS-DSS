import express from 'express';
import {
  getDocuments,
  uploadDocument,
  getDocumentById,
  updateDocumentStatus,
  getDocumentOCR
} from '../controllers/documentsController.js';

const router = express.Router();

// Document management routes
router.get('/', getDocuments);
router.post('/upload', uploadDocument);
router.get('/:id', getDocumentById);
router.put('/:id/status', updateDocumentStatus);
router.get('/:id/ocr', getDocumentOCR);

export default router;