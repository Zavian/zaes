import React from 'react';
import { skillCategories } from '../content/skills';

export const SkillsSection: React.FC = () => {
  return (
    <section id="skills" className="py-16 md:py-20 border-b border-gray-200 dark:border-[#262A35]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Section label */}
          <div className="md:col-span-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 sticky top-20">
              Technical Skills
            </h2>
          </div>

          {/* Section content */}
          <div className="md:col-span-9 space-y-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              A straightforward overview of the technologies, tools, and workflows I work with. Practical systems experience is demonstrated in the projects and work sections above.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {skillCategories.map((category) => (
                <div
                  key={category.title}
                  className="p-5 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-3"
                >
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-gray-100 dark:border-[#262A35] pb-2">
                    {category.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-mono px-2.5 py-1 bg-gray-100 dark:bg-[#20242D] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2E333D] rounded hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
