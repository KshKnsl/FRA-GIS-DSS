
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NavigationSidebar from './components/NavigationSidebar';
import FRAAtlas from './pages/FRAAtlas';
import FRADashboard from './pages/FRADashboard';
import VillageProfile from './pages/VillageProfile';
import Admin from './pages/Admin';
import DecisionSupport from './pages/DecisionSupport';
import Documents from './pages/Documents';
import SupportHelp from './pages/SupportHelp';
import React, { useContext } from 'react';
import { SidebarProvider, useSidebar } from './components/SidebarContext';

function AppContent() {
  const { sidebarOpen } = useSidebar();
  const [collapsed, setCollapsed] = React.useState(false);
  React.useEffect(() => {
    const handler = (e) => {
      if (e.detail && typeof e.detail.collapsed === 'boolean') {
        setCollapsed(e.detail.collapsed);
      }
    };
    window.addEventListener('sidebar-collapse', handler);
    return () => window.removeEventListener('sidebar-collapse', handler);
  }, []);

  const sidebarWidth = sidebarOpen ? (collapsed ? 80 : 288) : 0; 

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <NavigationSidebar onCollapse={val => setCollapsed(val)} />
        </div>
        <main
          className="flex-1 min-h-screen transition-all"
          style={{ marginLeft: sidebarWidth }}
        >
          <Routes>
            <Route path="/" element={<FRAAtlas />} />
            <Route path="/fra-dashboard/:state" element={<FRADashboard />} />
            <Route path="/village" element={<VillageProfile />} />
            <Route path="/village/:villageId" element={<VillageProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/decision-support" element={<DecisionSupport />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/support-help" element={<SupportHelp />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <SidebarProvider>
      <Router>
        <AppContent />
      </Router>
    </SidebarProvider>
  );
}

export default App;
