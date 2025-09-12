# FRA Atlas Backend

A robust Node.js/Express backend API for the Forest Rights Act (FRA) Atlas and Decision Support System. Built with PostgreSQL and PostGIS for spatial data management, providing comprehensive REST APIs for FRA claim management, AI-powered decision support, and administrative analytics.

## 🚀 Features

### Core API Functionality
- **FRA Claims Management**: Complete CRUD operations for FRA claims
- **Spatial Data Processing**: PostGIS integration for geographic queries
- **AI Decision Support**: Intelligent scheme recommendations
- **Admin Analytics**: Real-time statistics and reporting
- **Document Management**: File upload and processing
- **User Support System**: Ticket-based support management
- **Village Profiling**: Comprehensive village data aggregation

### Technical Features
- **RESTful API Design**: Clean, consistent API endpoints
- **Database Integration**: PostgreSQL with PostGIS extension
- **Error Handling**: Comprehensive error management and logging
- **Security**: CORS, input validation, and secure practices
- **Performance**: Optimized queries and connection pooling
- **Scalability**: Modular architecture with organized routes

## 🛠️ Technology Stack

### Backend Framework
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast, unopinionated web framework
- **ES6 Modules**: Modern JavaScript module system

### Database
- **PostgreSQL**: Advanced open-source relational database
- **PostGIS**: Spatial database extension for PostgreSQL
- **pg (node-postgres)**: PostgreSQL client for Node.js

### Development Tools
- **Nodemon**: Automatic server restart during development
- **Dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing middleware

### API Features
- **RESTful Endpoints**: Standard HTTP methods and status codes
- **JSON Responses**: Consistent API response format
- **Input Validation**: Request data validation and sanitization
- **Error Responses**: Structured error handling and messaging

## 📁 Project Structure

```
backend/
├── controllers/           # Request handlers for different modules
│   ├── adminController.js        # Admin dashboard and analytics
│   ├── decisionSupportController.js  # AI decision support logic
│   ├── documentsController.js    # Document management
│   ├── fraController.js          # FRA claims and village data
│   └── supportController.js      # Support ticket system
├── routes/               # API route definitions
│   ├── adminRoutes.js           # Admin-related endpoints
│   ├── decisionSupportRoutes.js # Decision support endpoints
│   ├── documentsRoutes.js       # Document endpoints
│   ├── fraRoutes.js             # FRA data endpoints
│   └── supportRoutes.js         # Support endpoints
├── middleware/           # Custom middleware functions
├── models/               # Data models and schemas
├── services/             # Business logic services
├── utils/                # Utility functions and helpers
├── createFRATables.js    # Database schema and sample data
├── db.js                 # Database connection configuration
├── server.js             # Main application server
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **PostgreSQL**: Version 12.0 or higher with PostGIS extension
- **npm** or **yarn** or **pnpm**: Package manager

### Database Setup

1. **Install PostgreSQL and PostGIS**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib postgis

   # macOS with Homebrew
   brew install postgresql postgis

   # Windows
   # Download from postgresql.org
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE fra_atlas;
   \c fra_atlas;
   CREATE EXTENSION postgis;
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fra_atlas
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=4000
   ```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fra-atlas/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

The server will start on `http://localhost:4000` and automatically:
- Connect to the PostgreSQL database
- Create all required tables
- Populate sample data
- Enable CORS for frontend communication

## 🔧 API Endpoints

### FRA Data Endpoints (`/api/fra`)

#### Village Management
- `GET /api/fra/villages` - Get all villages with basic information
- `GET /api/fra/villages/:id/enhanced` - Get detailed village information
- `GET /api/fra/assets/:villageId` - Get AI-mapped assets for a village
- `GET /api/fra/dashboard/:state` - Get state-wise dashboard statistics

#### Claim Management
- `GET /api/fra/claims` - Get all FRA claims
- `GET /api/fra/claims/:id` - Get specific claim details
- `POST /api/fra/claims` - Create new FRA claim
- `PUT /api/fra/claims/:id` - Update claim information
- `DELETE /api/fra/claims/:id` - Delete claim

### Admin Endpoints (`/api/admin`)

#### Statistics & Analytics
- `GET /api/admin/stats` - Get comprehensive admin statistics
- `GET /api/admin/monthly-trends` - Get monthly claim trends
- `GET /api/admin/district-stats` - Get district-wise statistics
- `GET /api/admin/scheme-beneficiaries` - Get scheme beneficiary data

#### Dashboard Data
- `GET /api/admin/dashboard-summary` - Get dashboard summary
- `GET /api/admin/pending-approvals` - Get pending approvals count
- `GET /api/admin/recent-activity` - Get recent system activity

### Decision Support Endpoints (`/api/decision-support`)

#### AI Recommendations
- `GET /api/decision-support/recommendations/:villageId` - Get scheme recommendations
- `POST /api/decision-support/analyze` - Analyze village parameters
- `GET /api/decision-support/schemes` - Get available government schemes

#### Eligibility Checking
- `POST /api/decision-support/check-eligibility` - Check scheme eligibility
- `GET /api/decision-support/eligibility-matrix` - Get eligibility matrix

### Document Management (`/api/documents`)

#### File Operations
- `GET /api/documents` - Get all documents
- `POST /api/documents/upload` - Upload new document
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document

#### Processing Status
- `GET /api/documents/:id/status` - Get processing status
- `POST /api/documents/:id/process` - Trigger document processing

### Support System (`/api/support`)

#### Ticket Management
- `GET /api/support/tickets` - Get all support tickets
- `POST /api/support/tickets` - Create new support ticket
- `GET /api/support/tickets/:id` - Get specific ticket
- `PUT /api/support/tickets/:id` - Update ticket status
- `DELETE /api/support/tickets/:id` - Delete ticket

#### FAQ System
- `GET /api/support/faq` - Get FAQ data
- `POST /api/support/faq` - Add new FAQ entry

### Health Check
- `GET /api/health` - Server health check endpoint

## 🗄️ Database Schema

### Core Tables

#### `fra_claims`
Primary table for all FRA claim applications with spatial coordinates.

#### `village_assets`
AI-detected assets within villages (water bodies, agricultural land, forests, homesteads).

#### `village_boundaries`
Geographic boundaries of villages using PostGIS polygon geometry.

#### `village_summary`
Aggregated statistics for quick dashboard access.

#### `css_schemes`
Central Sector Schemes information for eligibility matching.

#### `scheme_beneficiaries`
Links FRA claimants to eligible government schemes.

#### `patta_holders`
Detailed information about FRA patta holders.

#### `land_parcels`
Detailed land parcel information for CFR claims.

### Sample Data

The system automatically populates comprehensive sample data including:
- **28 FRA claims** across 4 states (Madhya Pradesh, Tripura, Odisha, Telangana)
- **AI-mapped assets** for each village
- **Geographic boundaries** using PostGIS
- **Government schemes** and beneficiary linkages
- **Detailed patta holder** information
- **Land parcel details** for CFR claims

## 🔒 Security & Best Practices

### Input Validation
- All API inputs are validated using middleware
- SQL injection prevention through parameterized queries
- XSS protection with input sanitization

### Error Handling
- Structured error responses with appropriate HTTP status codes
- Comprehensive logging for debugging and monitoring
- Graceful degradation for database connection issues

### CORS Configuration
- Configured to allow frontend application access
- Restricted to specific origins in production
- Proper preflight request handling

## 📊 Performance Optimization

### Database Optimization
- **Connection Pooling**: Efficient database connection management
- **Indexing**: Strategic indexes on frequently queried columns
- **Spatial Indexing**: GIST indexes for geographic queries
- **Query Optimization**: Efficient SQL queries with proper joins

### API Optimization
- **Response Compression**: Gzip compression for API responses
- **Caching**: Appropriate caching strategies for static data
- **Pagination**: Paginated responses for large datasets
- **Async Operations**: Non-blocking I/O operations

## 🧪 Development & Testing

### Development Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run build    # Build for production (if applicable)
```

### Database Management
```bash
# Reset database (drops all tables and recreates with sample data)
npm run db:reset

# Seed database with sample data
npm run db:seed

# Run database migrations
npm run db:migrate
```

### Testing
```bash
npm test         # Run test suite
npm run test:watch  # Run tests in watch mode
npm run test:coverage  # Generate test coverage report
```

## 🚀 Deployment

### Production Environment Setup

1. **Environment Variables**
   ```env
   NODE_ENV=production
   DB_HOST=your_production_db_host
   DB_PORT=5432
   DB_NAME=fra_atlas_prod
   DB_USER=your_db_user
   DB_PASSWORD=your_secure_password
   PORT=4000
   ```

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "fra-atlas-backend"
   pm2 save
   pm2 startup
   ```

3. **Reverse Proxy (nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 📈 Monitoring & Logging

### Application Logs
- Request/response logging with timestamps
- Error logging with stack traces
- Database query logging for performance monitoring

### Health Monitoring
- `/api/health` endpoint for load balancer checks
- Database connection health checks
- Memory and CPU usage monitoring

## 🤝 API Documentation

### Response Format
All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Authentication
Future implementation will include:
- JWT-based authentication
- Role-based access control (RBAC)
- API key management

## 🔄 Version History

### v1.0.0
- Initial release
- Complete FRA claims management system
- PostGIS spatial data integration
- AI-powered decision support
- Admin analytics dashboard
- Document management system
- Support ticket system
- Comprehensive sample data

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation
- Contact the development team

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- Use ES6+ features and async/await
- Follow consistent naming conventions
- Add JSDoc comments for functions
- Write comprehensive error handling
- Maintain modular code structure