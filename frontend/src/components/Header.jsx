
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">
              � FRA Atlas
            </div>
            <div className="text-sm text-green-200">
              AI-powered Forest Rights Act Monitoring System
            </div>
          </div>
          <nav className="flex space-x-6">
            <Link 
              to="/" 
              className="hover:text-green-200 transition-colors duration-200 font-medium"
            >
              Atlas Map
            </Link>
            <Link 
              to="/fra-dashboard/Madhya Pradesh" 
              className="hover:text-green-200 transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>
            <div className="text-sm text-green-200">
              Ministry of Tribal Affairs
            </div>
          </nav>
        </div>
        <div className="mt-2 text-xs text-green-100">
          Integrated Monitoring for Madhya Pradesh • Tripura • Odisha • Telangana
        </div>
      </div>
    </header>
  );
};

export default Header;
