import React, { createContext, useState, useContext } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // Add collapsed state

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  const toggleCollapse = () => {
    setCollapsed(prev => !prev);
  };


  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar, collapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
};