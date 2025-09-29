import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  Map,
  Home,
  FileText,
  Settings,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  Database,
  TreePine,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const navItems = [
  { href: '/', label: 'FRA Atlas', icon: Map },
  { href: '/fra-dashboard/Madhya%20Pradesh', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/village', label: 'Village Profile', icon: Home },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/decision-support', label: 'Decision Support', icon: Database },
  { href: '/admin', label: 'Admin', icon: Settings },
  { href: '/support-help', label: 'Support & Help', icon: LifeBuoy },
];

const NavigationSidebar = () => {
  const { collapsed, toggleCollapse } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full bg-card text-card-foreground border-r transition-all duration-300 ease-in-out fixed z-20",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex items-center h-16 p-4 border-b shrink-0">
        {!collapsed && <span className="ml-3 text-lg font-bold text-primary">FRA Atlas</span>}
        <button
          onClick={toggleCollapse}
          className="ml-auto p-1.5 rounded-full bg-background hover:bg-muted"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-primary",
                collapsed ? "justify-center" : ""
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      
      {!collapsed && (
        <div className="p-4 border-t mt-auto shrink-0">
          <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                  Visit our help center or contact support.
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                  <Button size="sm" className="w-full" onClick={() => navigate('/support-help')}>
                    Get Support
                  </Button>
              </CardContent>
          </Card>
        </div>
      )}
    </aside>
  );
};

export default NavigationSidebar;