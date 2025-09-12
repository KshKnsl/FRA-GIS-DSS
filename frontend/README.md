# FRA Atlas Frontend

A modern React-based frontend for the Forest Rights Act (FRA) Atlas and Decision Support System. This application provides an interactive WebGIS interface for FRA claim management, village profiling, and AI-powered decision support.

## 🚀 Features

### Core Functionality
- **Interactive FRA Atlas**: WebGIS-based mapping with React Leaflet
- **Village Profiling**: Detailed village information with AI-mapped assets
- **Claim Management**: FRA claim tracking and status monitoring
- **Decision Support**: AI-powered scheme recommendations for patta holders
- **Admin Dashboard**: Comprehensive analytics and statistics
- **Document Management**: File upload and processing capabilities
- **Support System**: Ticket-based support for users

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Data**: Live updates from PostgreSQL database
- **AI Integration**: Machine learning for asset detection and recommendations
- **Modern UI**: Radix UI components with custom styling
- **Performance**: Optimized with Vite build system

## 🛠️ Technology Stack

### Frontend Framework
- **React 19**: Latest React with modern hooks and concurrent features
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing for SPA navigation

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **Lucide React**: Beautiful icon library
- **Tailwind Animate**: CSS animation utilities

### Mapping & GIS
- **React Leaflet**: React wrapper for Leaflet mapping library
- **Leaflet**: Open-source JavaScript library for interactive maps
- **OpenStreetMap**: Free map tiles and data

### Data Visualization
- **Recharts**: Composable charting library built on React
- **Custom Charts**: Specialized FRA analytics components

### HTTP Client
- **Axios**: Promise-based HTTP client for API calls
- **Fetch API**: Modern browser API for data fetching

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── image.png          # Application logo
│   └── ...
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Radix UI components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   └── ...
│   │   └── fra/          # FRA-specific components
│   │       ├── ControlPanel.jsx
│   │       ├── FRAClaimPopup.jsx
│   │       ├── FRAMap.jsx
│   │       └── FRASidebar.jsx
│   ├── pages/            # Page components
│   │   ├── Admin.jsx
│   │   ├── AdminCharts.jsx
│   │   ├── DecisionSupport.jsx
│   │   ├── Documents.jsx
│   │   ├── FRAAtlas.jsx
│   │   ├── FRADashboard.jsx
│   │   ├── Help.jsx
│   │   ├── Support.jsx
│   │   └── VillageProfile.jsx
│   ├── lib/              # Utility libraries
│   │   └── utils.js
│   ├── App.css           # Global styles
│   ├── App.jsx           # Main application component
│   ├── index.css         # Tailwind CSS imports
│   └── main.jsx          # Application entry point
├── components.json       # Radix UI configuration
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── vercel.json           # Vercel deployment configuration
└── vite.config.js        # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm** or **yarn** or **pnpm**: Package manager
- **Backend Server**: FRA Atlas backend running on port 4000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fra-atlas/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_BACKEND_URL=http://localhost:4000
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist/` directory.

## 🔧 Configuration

### Environment Variables
- `VITE_BACKEND_URL`: Backend API base URL (default: `http://localhost:4000`)

### Tailwind CSS
The application uses Tailwind CSS with custom configuration:
- Custom color palette for FRA theme
- Extended spacing and typography scales
- Custom animation utilities

### Vite Configuration
- React plugin for JSX support
- Path aliases for clean imports
- Development server proxy configuration

## 📱 Pages & Components

### Main Pages

#### FRA Atlas (`FRAAtlas.jsx`)
- Interactive map with FRA claims visualization
- Collapsible control panel with filters
- Real-time claim status updates
- GPS coordinate display

#### Village Profile (`VillageProfile.jsx`)
- Detailed village information display
- AI-mapped assets visualization
- Interactive map with asset markers
- FRA claims status tracking

#### Decision Support (`DecisionSupport.jsx`)
- AI-powered scheme recommendations
- Village parameter analysis
- Eligibility matrix for government schemes
- Interactive filters and parameters

#### Admin Dashboard (`Admin.jsx`, `AdminCharts.jsx`)
- FRA implementation statistics
- Real-time analytics and charts
- District-wise performance metrics
- Monthly trends visualization

#### Documents (`Documents.jsx`)
- File upload and management
- Document processing status
- Search and filtering capabilities
- Secure file storage integration

#### Help & Support (`Help.jsx`, `Support.jsx`)
- Interactive FAQ system
- Ticket-based support system
- User guide and tutorials
- Real-time support chat

### UI Components

#### Radix UI Components
- **Button**: Consistent button styling with variants
- **Card**: Information display containers
- **Input**: Form input fields with validation
- **Select**: Dropdown selection components
- **Tabs**: Tabbed interface navigation
- **Dialog**: Modal dialogs and popups
- **Badge**: Status and category indicators

#### FRA-Specific Components
- **FRAMap**: Interactive Leaflet map component
- **FRAClaimPopup**: Claim information popup
- **ControlPanel**: Map control and filtering panel
- **FRASidebar**: Navigation and information sidebar

## 🔌 API Integration

### Backend Endpoints

#### FRA Data
- `GET /api/fra/villages` - List all villages
- `GET /api/fra/villages/:id/enhanced` - Village details
- `GET /api/fra/assets/:villageId` - Village assets
- `GET /api/fra/dashboard/:state` - State dashboard data

#### Admin
- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/monthly-trends` - Monthly trends data

#### Decision Support
- `GET /api/decision-support/recommendations/:villageId` - Scheme recommendations

#### Documents
- `GET /api/documents` - Document list
- `POST /api/documents/upload` - File upload

#### Support
- `GET /api/support/tickets` - Support tickets
- `POST /api/support/tickets` - Create support ticket

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Fallback UI states
- Network error recovery

## 🎨 Styling & Theming

### Design System
- **Color Palette**: FRA-specific green and blue theme
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent spacing scale
- **Shadows**: Subtle shadow system for depth

### Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Optimized for tablets and desktops

## 🧪 Development

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Automatic code formatting
- **TypeScript**: Type checking (optional)

### Development Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Serve the `dist/` directory with any static server
3. Configure reverse proxy for API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Version History

### v1.0.0
- Initial release
- Complete FRA Atlas functionality
- AI-powered decision support
- Admin dashboard with analytics
- Document management system
- Support ticket system
