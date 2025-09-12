
import React from 'react';
import { TreePine } from 'lucide-react';
import NavigationSidebar from './NavigationSidebar';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="lg:pl-72">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu and branding */}
          <div className="flex items-center space-x-4">
            <NavigationSidebar />
            
            {/* Mobile Logo */}
            <div className="flex items-center space-x-3 lg:hidden">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">FRA Atlas</h1>
              </div>
            </div>

            {/* Desktop Title */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">
                Forest Rights Act Monitoring System
              </h1>
              <p className="text-sm text-gray-500">
                AI-powered monitoring for Madhya Pradesh • Tripura • Odisha • Telangana
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center">
            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">G</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Government User</p>
                <p className="text-xs text-gray-500">Ministry of Tribal Affairs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
