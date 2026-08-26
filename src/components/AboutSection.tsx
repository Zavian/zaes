import React from 'react';
import { aboutContent } from '../content/about';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-20 border-b border-gray-200 dark:border-[#262A35]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Section title */}
          <div className="md:col-span-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 sticky top-20">
              About
            </h2>
          </div>

          {/* Section content */}
          <div className="md:col-span-9 space-y-6 text-gray-800 dark:text-gray-200 text-base sm:text-lg leading-relaxed">
            {aboutContent.paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono text-gray-600 dark:text-gray-400">
              <div className="p-4 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded">
                <div className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-widest font-bold mb-1.5">Current Focus</div>
                <div className="text-[#1A1A1A] dark:text-[#F3F4F6] font-sans font-medium text-sm leading-snug">
                  Multi-brand web architecture, DNS/SSL routing, QA pipelines & Tabletop Simulator 2.0 rewrite.
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded">
                <div className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-widest font-bold mb-1.5">Operating Philosophy</div>
                <div className="text-[#1A1A1A] dark:text-[#F3F4F6] font-sans font-medium text-sm leading-snug">
                  Take ownership of undocumented systems, isolate root causes with DevTools, build reliable tools.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
