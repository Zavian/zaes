import React, { useState } from 'react';
import { Menu, X, FileText, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenCv: () => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigateHome: () => void;
  isProjectPage?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenCv, 
  onNavigateSection, 
  onNavigateHome,
  isProjectPage = false 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'About', id: 'about' },
    { name: 'Work', id: 'work' },
    { name: 'Projects', id: 'projects' },
    { name: 'Other', id: 'other' },
    { name: 'Skills', id: 'skills' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(id);
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigateHome();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FCFCFC]/90 dark:bg-[#111318]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#262A35] transition-colors no-print">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={handleBrandClick}
          className="group flex items-baseline gap-2.5 text-[#1A1A1A] dark:text-[#F3F4F6] hover:opacity-80 transition-opacity text-left cursor-pointer"
          title="Return to Home page"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
            <span className="font-bold text-lg tracking-tight">Emanuele Sbabo</span>
          </div>
          <span 
            className="text-xs font-mono text-gray-400 dark:text-gray-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
            title="zaes · Zavian aka Emanuele Sbabo"
          >
            zaes.dev
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-500 dark:text-gray-400">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleLinkClick(link.id)}
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer"
            >
              {link.name}
            </button>
          ))}

          <div className="h-4 w-px bg-gray-200 dark:bg-[#2E333D]" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-[#1F222A] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            onClick={onOpenCv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>CV</span>
          </button>
        </nav>

        {/* Mobile Nav Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1F222A] transition-colors"
            aria-label="Toggle dark/light theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-gray-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
          <button
            onClick={onOpenCv}
            className="px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded text-emerald-900 dark:text-emerald-300"
          >
            CV
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-[#1F222A] rounded"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer / Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-16 z-50 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="border-b border-gray-200 dark:border-[#262A35] bg-[#FCFCFC] dark:bg-[#111318] px-6 py-5 space-y-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[11px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              Navigation
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.id)}
                  className="flex items-center text-left w-full px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-[#1A1D24] active:bg-emerald-100 transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-[#262A35]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCv();
                }}
                className="flex items-center justify-between w-full px-3.5 py-3 rounded-lg text-sm font-medium text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/60 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  View Curriculum Vitae (PDF/Web)
                </span>
                <ArrowUpRight className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
