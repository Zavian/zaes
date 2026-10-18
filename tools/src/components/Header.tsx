import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { tools } from '../tools';
import { Link } from '../router';

export const Header: React.FC<{ path: string }> = ({ path }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FCFCFC]/90 dark:bg-[#111318]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#262A35] transition-colors no-print">
      <div className="max-w-[2200px] mx-auto px-4 sm:px-6 py-2 sm:py-0 sm:h-14 flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-1">
        <Link href="/" className="flex items-center gap-2.5 mr-auto text-[#1A1A1A] dark:text-[#F3F4F6] hover:opacity-80 transition-opacity">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          <span className="font-bold text-lg tracking-tight">Zavian</span>
          <span className="hidden min-[420px]:inline text-xs font-mono text-gray-400 dark:text-gray-500">tools.zaes.dev</span>
        </Link>

        <nav className="order-last sm:order-none w-full sm:w-auto flex items-center gap-5 overflow-x-auto whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400" aria-label="Tools">
          {tools.map((t) => (
            <Link
              key={t.id}
              href={t.path}
              className={
                'py-1 transition-colors hover:text-emerald-700 dark:hover:text-emerald-400 ' +
                (path.startsWith(t.path) ? 'text-emerald-700 dark:text-emerald-400' : '')
              }
            >
              {t.title}
            </Link>
          ))}
        </nav>

        <span className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-[#2E333D]" />
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-[#1F222A] transition-colors cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
