
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
        <div className="lg:pl-72">
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<FRAAtlas />} />
              <Route path="/fra-dashboard/:state" element={<FRADashboard />} />
              <Route path="/village/:villageId" element={<VillageProfile />} />
              <Route path="/schemes/:villageId" element={<SchemeRecommendations />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
