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
import React from 'react';
import { SidebarProvider, useSidebar } from './components/SidebarContext';
import { cn } from './lib/utils';

function AppContent() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen w-full bg-background">
      <NavigationSidebar />
      <div className={cn("flex flex-col h-screen transition-all duration-300 ease-in-out", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <Header />
        <main className="flex-1 overflow-auto">
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