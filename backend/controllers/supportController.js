import pool from '../db.js';

// Get help content
export const getHelpContent = async (req, res) => {
  const { category } = req.query;

  const helpContent = {
    tutorials: [
      {
        id: "getting-started",
        title: "Getting Started with FRA Atlas",
        category: "basics",
        content: "Learn the basics of navigating and using the FRA Atlas platform...",
        videoUrl: "/videos/getting-started.mp4",
        steps: [
          "Navigate to the FRA Atlas page",
          "Select your state and district",
          "Use filters to find specific claims",
          "Click on map markers for details"
        ]
      },
      {
        id: "claim-submission",
        title: "Submitting FRA Claims",
        category: "claims",
        content: "Step-by-step guide to submitting new FRA claims...",
        videoUrl: "/videos/claim-submission.mp4",
        steps: [
          "Click 'Add New FRA Claim' button",
          "Fill in applicant details",
          "Specify claim area and type",
          "Upload supporting documents",
          "Submit for verification"
        ]
      },
      {
        id: "map-navigation",
        title: "Map Navigation and Tools",
        category: "maps",
        content: "Learn to use map tools and navigation features...",
        videoUrl: "/videos/map-navigation.mp4",
        steps: [
          "Zoom in/out using mouse wheel",
          "Pan by dragging the map",
          "Use layer controls to show/hide data",
          "Search for specific locations"
        ]
      }
    ],
    faqs: [
      {
        id: "fra-eligibility",
        question: "Who is eligible for FRA benefits?",
        answer: "Scheduled Tribes and other traditional forest dwellers who have been residing in forests for generations and depend on forests for livelihood.",
        category: "eligibility"
      },
      {
        id: "claim-process",
        question: "What is the process for filing an FRA claim?",
        answer: "1. Identify forest rights, 2. File claim with Gram Sabha, 3. Verification by Forest Rights Committee, 4. Approval and issuance of patta.",
        category: "process"
      },
      {
        id: "documents-required",
        question: "What documents are required for FRA claims?",
        answer: "Residence proof, identity proof, forest dependency proof, and evidence of traditional rights over forest land.",
        category: "documents"
      }
    ],
    guides: [
      {
        id: "fra-act-summary",
        title: "FRA Act 2006 - Summary",
        category: "legal",
        content: "The Forest Rights Act 2006 recognizes and vests forest rights in forest dwelling communities...",
        downloadUrl: "/downloads/fra-act-summary.pdf"
      },
      {
        id: "claim-form-guide",
        title: "FRA Claim Form Guide",
        category: "forms",
        content: "Complete guide to filling FRA claim forms correctly...",
        downloadUrl: "/downloads/claim-form-guide.pdf"
      }
    ]
  };

  let filteredContent = helpContent;

  if (category && category !== 'all') {
    filteredContent = {
      tutorials: helpContent.tutorials.filter(t => t.category === category),
      faqs: helpContent.faqs.filter(f => f.category === category),
      guides: helpContent.guides.filter(g => g.category === category)
    };
  }

  res.status(200).json({
    success: true,
    data: filteredContent
  });
};

// Submit support ticket
export const submitSupportTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      priority,
      userName,
      userEmail,
      userPhone,
      state,
      district,
      village,
      claimId
    } = req.body;

    // Generate ticket ID
    const ticketId = `TICKET_${Date.now()}`;

    const result = await pool.query(`
      INSERT INTO support_tickets
      (ticket_id, subject, description, category, priority, status, user_name, user_email, user_phone, state, district, village, claim_id, created_at)
      VALUES ($1, $2, $3, $4, $5, 'open', $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *
    `, [
      ticketId,
      subject,
      description,
      category,
      priority,
      userName,
      userEmail,
      userPhone,
      state,
      district,
      village,
      claimId
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Support ticket submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting support ticket'
    });
  }
};

// Get support tickets
export const getSupportTickets = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereClause += ` WHERE status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category && category !== 'all') {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM support_tickets ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get tickets with pagination
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const ticketsQuery = `
      SELECT * FROM support_tickets
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const ticketsResult = await pool.query(ticketsQuery, params);

    res.status(200).json({
      success: true,
      data: ticketsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support tickets'
    });
  }
};

// Update ticket status
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response, assignedTo } = req.body;

    const result = await pool.query(`
      UPDATE support_tickets
      SET status = $1, response = $2, assigned_to = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [status, response, assignedTo, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating ticket status'
    });
  }
};

// Get support statistics
export const getSupportStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tickets,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_resolution_hours
      FROM support_tickets
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);

    const categoryStats = await pool.query(`
      SELECT
        category,
        COUNT(*) as count
      FROM support_tickets
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY category
    `);

    res.status(200).json({
      success: true,
      data: {
        overall: stats.rows[0],
        byCategory: categoryStats.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support statistics'
    });
  }
};