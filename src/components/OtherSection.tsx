import React from 'react';
import { otherInterests } from '../content/other';
import { Trophy, Cpu, Users, ShieldCheck } from 'lucide-react';

export const OtherSection: React.FC = () => {
  const wowInterest = otherInterests[0];

  return (
    <section id="other" className="py-16 md:py-20 border-b border-gray-200 dark:border-[#262A35]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Section label */}
          <div className="md:col-span-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 sticky top-20">
              Other & Systems
            </h2>
          </div>

          {/* Section content */}
          <div className="md:col-span-9 space-y-8">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">
                    {wowInterest.title}
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                  {wowInterest.period}
                </span>
              </div>

              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {wowInterest.role} · <span className="text-gray-500 dark:text-gray-400">25-27 Player Competitive Roster</span>
              </div>

              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {wowInterest.summary}
              </p>

              {/* Core points */}
              <div className="space-y-2.5 mb-6">
                {wowInterest.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-gray-800 dark:text-gray-200">
                    <span className="text-emerald-600 dark:text-emerald-400 mt-1.5 shrink-0 text-xs font-mono">-</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automation Pipeline Architecture Box */}
            {wowInterest.automationSystem && (
              <div className="p-5 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-[#262A35] pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                    <Cpu className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>{wowInterest.automationSystem.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {wowInterest.automationSystem.stack.map((item) => (
                      <span
                        key={item}
                        className="text-[11px] font-mono px-2 py-0.5 bg-gray-100 dark:bg-[#20242D] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2E333D] rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {wowInterest.automationSystem.description}
                </p>

                {/* Pipeline step cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {wowInterest.automationSystem.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded border border-gray-200 dark:border-[#2E333D] bg-gray-50 dark:bg-[#1F222A] text-xs space-y-1.5"
                    >
                      <div className="font-mono font-semibold text-emerald-800 dark:text-emerald-300">
                        {step.title}
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
