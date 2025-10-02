import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Sun, Moon } from 'lucide-react';

const Header = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shrink-0">
       <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">
            Forest Rights Act Monitoring System
            <span className="text-xs font-semibold text-primary bg-secondary rounded px-2 py-1 ml-2 align-middle">
              Prototype v1.0
            </span>
          </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        </form>

        <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">G</span>
            </div>
          <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">Government User</span>
              <span className="text-xs text-muted-foreground">Ministry of Tribal Affairs</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;