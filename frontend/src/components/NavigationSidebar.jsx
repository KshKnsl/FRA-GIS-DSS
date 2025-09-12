import React, { useState } from 'react';
import { useSidebar } from './SidebarContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, ChevronRight, ChevronLeft, TreePine, Home } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, to: '/fra-dashboard/Madhya Pradesh' },
  { label: 'FRA Atlas', icon: <TreePine className="w-4 h-4" />, to: '/' },
  { label: 'Village Profile', icon: <Home className="w-4 h-4" />, to: '/village' },
  { label: 'Decision Support', icon: <ChevronRight className="w-4 h-4" />, to: '/decision-support' },
  { label: 'Documents', icon: <ChevronRight className="w-4 h-4" />, to: '/documents' },
  { label: 'Admin', icon: <Users className="w-4 h-4" />, to: '/admin' },
  { label: 'Support & Help', icon: <ChevronRight className="w-4 h-4" />, to: '/support-help' },
];

const NavigationSidebar = () => {
  const location = useLocation();
  const { sidebarOpen } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Emit collapse state to App.jsx
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-collapse', { detail: { collapsed } }));
  }, [collapsed]);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  const filteredNavItems = NAV_ITEMS.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full bg-background text-foreground w-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TreePine className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">FRA Atlas</h2>
            <p className="text-xs text-muted-foreground">Forest Rights Act</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-primary bg-secondary rounded px-2 py-1 w-fit mt-2 inline-block">Prototype v1.0</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {filteredNavItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.to
                  ? 'bg-secondary text-primary border border-border'
                  : 'hover:bg-muted hover:text-foreground text-muted-foreground'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={handleThemeToggle} className="w-full">
          Toggle Theme
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">G</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">Government User</p>
            <p className="text-xs text-muted-foreground truncate">Ministry of Tribal Affairs</p>
          </div>
        </div>
      </div>
    </div>
  );

  const SidebarContent = () => (
    <div className={cn('flex flex-col h-full bg-background text-foreground transition-all duration-300', collapsed ? 'w-20' : 'w-72')}>
      {/* Top controls */}
      <div className="flex flex-col gap-2 p-4 border-b border-border">
        <div className="flex gap-2 items-center justify-between">
          {!collapsed && (
            <Button variant="outline" size="sm" onClick={() => setCollapsed(true)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          {!collapsed && (
            <Button variant="outline" size="sm" onClick={handleThemeToggle}>
              Toggle Theme
            </Button>
          )}
        </div>
        {!collapsed && (
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mt-2"
          />
        )}
      </div>
      <div className="p-6 border-b border-border flex flex-col gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TreePine className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg text-foreground">FRA Atlas</h2>
              <p className="text-xs text-muted-foreground">Forest Rights Act</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <span className="text-xs font-semibold text-primary bg-secondary rounded px-2 py-1 w-fit">Prototype v1.0</span>
        )}
      </div>
      <ScrollArea className={cn('flex-1 p-4', collapsed ? 'p-2' : 'p-4')}>
        <nav className="space-y-1">
          {filteredNavItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.to
                  ? 'bg-secondary text-primary border border-border'
                  : 'hover:bg-muted hover:text-foreground text-muted-foreground'
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-border mt-auto">
        <div className={cn('flex items-center px-3 py-2 rounded-lg bg-secondary', collapsed ? 'justify-center' : 'space-x-3')}>
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">G</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">Government User</p>
              <p className="text-xs text-muted-foreground truncate">Ministry of Tribal Affairs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Trigger */}
      <Button
        variant="default"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-primary-foreground border-2 border-primary shadow-lg hover:bg-primary/90"
        onClick={() => setMobileOpen(true)}
      >
        <ChevronRight className="w-5 h-5" />
        <span className="sr-only">Open navigation menu</span>
      </Button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 lg:hidden shadow-xl" style={{ backgroundColor: 'var(--background)' }}>
            <div className="flex flex-col h-full">
              {/* Close button */}
              <div className="flex justify-end p-4 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileOpen(false)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <MobileSidebarContent />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      {sidebarOpen && (
        <>
          <div className={cn('hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40', collapsed ? 'lg:w-20' : 'lg:w-72')}>
            <SidebarContent />
          </div>
          {/* Floating expand button when collapsed */}
          {collapsed && (
            <button
              className="hidden lg:flex fixed left-20 top-20 z-50 w-8 h-8 bg-primary text-primary-foreground rounded-full shadow-lg items-center justify-center hover:bg-primary/90 transition-colors"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </>
      )}
    </>
  );
};

export default NavigationSidebar;