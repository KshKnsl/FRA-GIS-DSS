
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import FRAAtlas from './pages/FRAAtlas';
import FRADashboard from './pages/FRADashboard';
import VillageProfile from './pages/VillageProfile';
import SchemeRecommendations from './pages/SchemeRecommendations';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<FRAAtlas />} />
          <Route path="/fra-dashboard/:state" element={<FRADashboard />} />
          <Route path="/village/:villageId" element={<VillageProfile />} />
          <Route path="/schemes/:villageId" element={<SchemeRecommendations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
