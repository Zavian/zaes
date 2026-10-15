import React from 'react';

export const Footer: React.FC = () => (
  <footer className="py-8 border-t border-gray-200 dark:border-[#262A35] text-gray-400 dark:text-gray-500 text-xs font-mono no-print">
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span>
        Made by <span className="text-[#1A1A1A] dark:text-[#F3F4F6] font-medium">Zavian</span>
      </span>
      <span>
        Icons by{' '}
        <a className="underline hover:text-emerald-700 dark:hover:text-emerald-400" href="https://game-icons.net" target="_blank" rel="noopener noreferrer">
          game-icons.net
        </a>{' '}
        (CC BY 3.0)
      </span>
    </div>
  </footer>
);
