import React from 'react';
import { ArrowDown, MapPin, Briefcase, Server } from 'lucide-react';

interface HeroProps {
  onOpenCv: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCv, onNavigateSection }) => {
  const handleScroll = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const target = document.querySelector(`#${sectionId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="pt-12 pb-16 md:pt-20 md:pb-24 border-b border-gray-200 dark:border-[#262A35]">
      <div className="max-w-4xl mx-auto px-6">
        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs font-mono text-gray-500 dark:text-gray-400 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 px-2.5 py-1 rounded text-emerald-900 dark:text-emerald-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            Leiden, Netherlands
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] px-2.5 py-1 rounded text-gray-700 dark:text-gray-300">
            <Briefcase className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            Web Dev @ ColorControl Group
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] px-2.5 py-1 rounded text-gray-700 dark:text-gray-300">
            <Server className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            100+ Domains & Infrastructure
          </span>
        </div>

        {/* Name and headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F3F4F6] leading-[1.15] mb-3">
          Emanuele Sbabo
        </h1>

        <p className="text-lg sm:text-xl font-normal text-emerald-800 dark:text-emerald-400 max-w-2xl leading-relaxed mb-6 font-mono text-sm sm:text-base">
          Web Developer & Technical QA Analyst
        </p>

        {/* Intro copy */}
        <div className="max-w-2xl space-y-4 text-base sm:text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-8">
          <p>
            I build and maintain web platforms, digital infrastructure, debugging pipelines, and QA workflows. Outside of work, I build tools, write tabletop RPGs, design fictional worlds, and generally find new ways of making computers do things they probably were not supposed to do.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={(e) => handleScroll(e, 'projects')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-medium rounded shadow-xs transition-colors cursor-pointer"
          >
            <span>Explore Projects</span>
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleScroll(e, 'work')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#181A20] text-[#1A1A1A] dark:text-[#F3F4F6] border border-gray-200 dark:border-[#2E333D] hover:border-emerald-300 dark:hover:border-emerald-700 text-sm font-medium rounded hover:bg-emerald-50/40 dark:hover:bg-[#20242D] transition-colors cursor-pointer"
          >
            <span>Professional Work</span>
          </button>
          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-4 py-2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-medium transition-colors cursor-pointer"
          >
            <span>View CV</span>
          </button>
        </div>
      </div>
    </section>
  );
};
