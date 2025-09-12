import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Map, 
  BarChart3, 
  Users,
  Home,
  ChevronRight,
  ChevronDown,
  MapPin,
  TreePine,
  Award,
  Settings
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

const NavigationSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    dashboards: false
  });
  const location = useLocation();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const states = [
    { name: 'Madhya Pradesh', code: 'MP' },
    { name: 'Tripura', code: 'TR' },
    { name: 'Odisha', code: 'OD' },
    { name: 'Telangana', code: 'TG' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isActiveState = (state) => {
    return location.pathname.includes(`/fra-dashboard/${state}`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <TreePine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">FRA Atlas</h2>
            <p className="text-xs text-gray-500">Forest Rights Act</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {/* Main Map */}
          <Link
            to="/"
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive('/') 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
            onClick={() => setIsOpen(false)}
          >
            <Map className="w-4 h-4" />
            <span>Interactive Atlas</span>
          </Link>

          <Separator className="my-4" />

          {/* Dashboards Section */}
          <div>
            <button
              onClick={() => toggleSection('dashboards')}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboards</span>
              </div>
              {expandedSections.dashboards ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {expandedSections.dashboards && (
              <div className="ml-7 mt-2 space-y-1">
                {states.map((state) => (
                  <Link
                    key={state.code}
                    to={`/fra-dashboard/${state.name}`}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      isActiveState(state.name)
                        ? "bg-green-50 text-green-700 border-l-2 border-green-500"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3" />
                      <span>{state.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {state.code}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Quick Actions */}
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Quick Actions
            </h3>
            
            <Link
              to="/village/sample"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive('/village/sample')
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
              onClick={() => setIsOpen(false)}
            >
              <Users className="w-4 h-4" />
              <span>Village Profile</span>
            </Link>

            <Link
              to="/schemes/sample"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive('/schemes/sample')
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
              onClick={() => setIsOpen(false)}
            >
              <Award className="w-4 h-4" />
              <span>Scheme Recommendations</span>
            </Link>
          </div>
        </nav>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">G</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Government User
            </p>
            <p className="text-xs text-gray-500 truncate">
              Ministry of Tribal Affairs
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Open navigation</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 lg:w-72">
        <div className="flex flex-col bg-white border-r border-gray-200 h-full">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default NavigationSidebar;