import React from 'react';
import { ArrowUpRight, Hammer } from 'lucide-react';
import { SITE_DESCRIPTION, tools } from '../tools';
import { Link } from '../router';

export const Home: React.FC = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
    <p className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">Tools</p>
    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F3F4F6] mb-3">Zavian's Tools</h1>
    <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mb-10">{SITE_DESCRIPTION} Everything runs in your browser, no account needed.</p>

    <ul className="grid gap-4 sm:grid-cols-2">
      {tools.map((t) => (
        <li key={t.id}>
          <Link
            href={t.path}
            className="group block h-full p-5 rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20] hover:border-emerald-600 dark:hover:border-emerald-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-bold text-lg text-[#1A1A1A] dark:text-[#F3F4F6]">{t.title}</h2>
              <ArrowUpRight className="w-4 h-4 mt-1.5 text-gray-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">{t.tagline}</p>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {t.tags.map((tag) => (
                <span key={tag} className="text-xs font-mono px-2 py-0.5 bg-gray-100 dark:bg-[#1F222A] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2E333D] rounded">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        </li>
      ))}
      <li className="p-5 rounded border border-dashed border-gray-300 dark:border-[#2E333D] text-gray-400 dark:text-gray-500 flex items-center gap-3">
        <Hammer className="w-4 h-4 shrink-0" />
        <span className="text-sm">More tools are on the way.</span>
      </li>
    </ul>
  </div>
);
