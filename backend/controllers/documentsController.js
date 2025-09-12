import pool from '../db.js';

// Get all documents with filtering
export const getDocuments = async (req, res) => {
  const {
    category,
    state,
    status,
    search,
    page = 1,
    limit = 20
  } = req.query;

  let whereClause = '';
  let params = [];
  let paramIndex = 1;

  // Build WHERE clause based on filters
  if (category && category !== 'all') {
    whereClause += ` WHERE category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (state && state !== 'all') {
    whereClause += `${whereClause ? ' AND' : ' WHERE'} state = $${paramIndex}`;
    params.push(state);
    paramIndex++;
  }

  if (status && status !== 'all') {
    whereClause += `${whereClause ? ' AND' : ' WHERE'} status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (search) {
    whereClause += `${whereClause ? ' AND' : ' WHERE'} (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM documents ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const totalCount = parseInt(countResult.rows[0].count);

  // Get documents with pagination
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const documentsQuery = `
    SELECT * FROM documents
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const documentsResult = await pool.query(documentsQuery, params);

  // Get category counts
  const categoryStats = await pool.query(`
    SELECT
      category,
      COUNT(*) as count,
      COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count
    FROM documents
    GROUP BY category
  `);

  res.status(200).json({
    success: true,
    data: documentsResult.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount,
      pages: Math.ceil(totalCount / limit)
    },
    stats: categoryStats.rows
  });
};

// Upload document
export const uploadDocument = async (req, res) => {
  const {
    title,
    description,
    category,
    state,
    district,
    village,
    claimId,
    documentType,
    tags
  } = req.body;

  // In a real implementation, you'd handle file upload here
  // For now, we'll simulate document creation
  const documentData = {
    title,
    description,
    category,
    state,
    district,
    village,
    claim_id: claimId,
    document_type: documentType,
    tags: tags ? JSON.parse(tags) : [],
    file_path: `/uploads/${Date.now()}_${title.replace(/\s+/g, '_')}.pdf`,
    file_size: 1024000, // 1MB
    mime_type: 'application/pdf',
    status: 'pending_verification'
  };

  const result = await pool.query(`
    INSERT INTO documents
    (title, description, category, state, district, village, claim_id, document_type, tags, file_path, file_size, mime_type, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    RETURNING *
  `, [
    documentData.title,
    documentData.description,
    documentData.category,
    documentData.state,
    documentData.district,
    documentData.village,
    documentData.claim_id,
    documentData.document_type,
    JSON.stringify(documentData.tags),
    documentData.file_path,
    documentData.file_size,
    documentData.mime_type,
    documentData.status
  ]);

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`
    SELECT d.*, fc.applicant_name, fc.village_name
    FROM documents d
    LEFT JOIN fra_claims fc ON d.claim_id = fc.claim_id
    WHERE d.id = $1
  `, [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
};

// Update document status
export const updateDocumentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, verifiedBy, remarks } = req.body;

  const result = await pool.query(`
    UPDATE documents
    SET status = $1, verified_by = $2, verification_remarks = $3, verified_at = NOW()
    WHERE id = $4
    RETURNING *
  `, [status, verifiedBy, remarks, id]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
};

// Get OCR results for document
export const getDocumentOCR = async (req, res) => {
  const { id } = req.params;

  // In a real implementation, you'd call an OCR service
  // For now, return mock OCR data
  const mockOCRData = {
    documentId: id,
    extractedText: "This is mock OCR extracted text from the document...",
    confidence: 0.85,
    fields: {
      applicantName: "John Doe",
      villageName: "Sample Village",
      area: "2.5 hectares",
      date: "2023-01-15"
    },
    processingTime: "2.3 seconds"
  };

  res.status(200).json({
    success: true,
    data: mockOCRData
  });
};