
import React from 'react';
import { TreePine } from 'lucide-react';
import NavigationSidebar from './NavigationSidebar';

const Header = () => {
  return (
  <header className="bg-background border-b border-border shadow-sm sticky top-0 z-30">
      <div className="lg:pl-72">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu and branding */}
          <div className="flex items-center space-x-4">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-3 lg:hidden">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TreePine className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">FRA Atlas</h1>
                <span className="text-xs font-semibold text-primary bg-secondary rounded px-2 py-1 ml-2">Prototype v1.0</span>
              </div>
            </div>

            {/* Desktop Title */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-foreground">
                Forest Rights Act Monitoring System
                <span className="text-xs font-semibold text-primary bg-secondary rounded px-2 py-1 ml-2 align-middle">Prototype v1.0</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered monitoring for Madhya Pradesh • Tripura • Odisha • Telangana
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center">
            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-3 ml-4 pl-4 border-l border-border">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">G</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-primary">Government User</p>
                <p className="text-xs text-muted-foreground">Ministry of Tribal Affairs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
