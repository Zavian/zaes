import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-10 border-t border-gray-200 dark:border-[#262A35] text-gray-400 dark:text-gray-500 text-xs font-mono no-print">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
          <span className="text-[#1A1A1A] dark:text-[#F3F4F6] font-medium">Emanuele Sbabo</span>
          <span>·</span>
          <span className="text-gray-500 dark:text-gray-400" title="Zavian aka Emanuele Sbabo">zaes.dev</span>
        </div>

        <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center sm:text-left">
          Leiden, Netherlands · 52.1601° N, 4.4970° E
        </div>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1 px-2 rounded hover:bg-emerald-50/50 dark:hover:bg-[#181A20] cursor-pointer"
        >
          <span>Back to top</span>
          <ArrowUp className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
        </button>
      </div>
    </footer>
  );
};
