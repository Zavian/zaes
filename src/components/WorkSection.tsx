import React from 'react';
import { workExperience } from '../content/work';
import { CheckCircle2, Globe, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export const WorkSection: React.FC = () => {
  return (
    <section id="work" className="py-16 md:py-20 border-b border-gray-200 dark:border-[#262A35]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Section label */}
          <div className="md:col-span-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 sticky top-20">
              Work
            </h2>
          </div>

          {/* Section details */}
          <div className="md:col-span-9 space-y-8">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">
                  {workExperience.company}
                </h3>
                <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                  {workExperience.period}
                </span>
              </div>

              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {workExperience.role} · <span className="text-gray-500 dark:text-gray-400">{workExperience.location}</span>
              </div>

              {/* Brands */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Brands:</span>
                {workExperience.brands.map((brand) => (
                  <span
                    key={brand}
                    className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#1F222A] px-2 py-0.5 rounded border border-gray-200 dark:border-[#2E333D]"
                  >
                    {brand}
                  </span>
                ))}
              </div>

              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {workExperience.summary}
              </p>
            </div>

            {/* Responsibilities list */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">
                Key Responsibilities & Systems Ownership
              </h4>
              <ul className="space-y-2.5">
                {workExperience.responsibilities.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                    <span className="text-emerald-600 dark:text-emerald-400 mt-1.5 shrink-0 text-xs font-mono">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Highlights Box */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 uppercase tracking-wider font-semibold">
                <Terminal className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Production Scope Highlights</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2 bg-white dark:bg-[#1F222A] p-2.5 rounded border border-gray-200 dark:border-[#2E333D]">
                  <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>100+ Domains DNS, SSL & Routing</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-[#1F222A] p-2.5 rounded border border-gray-200 dark:border-[#2E333D]">
                  <Cpu className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>WordPress -&gt; Odoo & Lovable Migrations</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-[#1F222A] p-2.5 rounded border border-gray-200 dark:border-[#2E333D]">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>CRM Sync & Multilingual Translation</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-[#1F222A] p-2.5 rounded border border-gray-200 dark:border-[#2E333D]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>Remote FAT Streaming Infrastructure</span>
                </div>
              </div>
            </div>

            {/* Note on engineering mindset */}
            <div className="border-l-2 border-emerald-600 dark:border-emerald-500 pl-4 py-1 text-sm text-gray-600 dark:text-gray-300 italic">
              "A lot of my work boils down to figuring out why something is broken, fixing it properly, and making sure I don't have to fix the same thing again next week."
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
