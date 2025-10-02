import express from 'express';
import multer from 'multer';
import {
  getDocuments,
  uploadDocument,
  getDocumentById,
  updateDocumentStatus,
  getDocumentOCR
} from '../controllers/documentsController.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Document management routes
router.get('/', getDocuments);
router.post('/upload', upload.single('document'), uploadDocument);
router.get('/:id', getDocumentById);
router.put('/:id/status', updateDocumentStatus);
router.get('/:id/ocr', getDocumentOCR);

export default router;