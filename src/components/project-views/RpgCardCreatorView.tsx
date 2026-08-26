import React from 'react';
import { Project } from '../../types';
import { ArrowLeft, ExternalLink, Github, ArrowUpRight, Check, Layers, Printer, Sparkles, SlidersHorizontal, Image, Code2 } from 'lucide-react';

interface RpgCardCreatorViewProps {
  project: Project;
  onBack: () => void;
}

export const RpgCardCreatorView: React.FC<RpgCardCreatorViewProps> = ({ project, onBack }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-1 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to all projects</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300">
            {project.period}
          </span>
          <span className="text-xs font-mono bg-emerald-700 dark:bg-emerald-600 text-white px-2 py-0.5 rounded font-semibold shadow-xs">
            Open Source Tool
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F3F4F6] mb-2">
          {project.title}
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
          {project.subtitle}
        </p>

        {/* Action Link Card for Live App & GitHub */}
        <div className="p-5 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">Live Application</div>
            <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">RPG Card Generator Web App</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">zavian.github.io/generator/generate.html</div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://github.com/Zavian/zavian.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#20242D] hover:bg-emerald-50/50 dark:hover:bg-[#282C37] border border-gray-200 dark:border-[#2E333D] text-[#1A1A1A] dark:text-[#F3F4F6] text-xs font-mono rounded transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
              <ArrowUpRight className="w-3 h-3 text-gray-400" />
            </a>
            <a
              href="https://zavian.github.io/generator/generate.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-mono rounded font-semibold shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Live Card Generator</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((t) => (
            <span
              key={t}
              className="text-xs font-mono px-2 py-0.5 bg-gray-100 dark:bg-[#1F222A] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2E333D] rounded"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Overview text */}
      <div className="space-y-4 text-base text-gray-800 dark:text-gray-200 leading-relaxed">
        {project.detailedContent?.overview.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
            <Code2 className="w-3.5 h-3.5" />
            <span>BBCode & Tag Formatting</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Supports custom inline formatting tags including bold, italics, bullets, colored text, and dynamic stat badges to cleanly separate content semantics from styling.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Tabletop Simulator Deck Sheets</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Stitches multiple generated cards into custom 10×7 matrix deck sheets formatted specifically for automated importing into Tabletop Simulator and digital VTTs.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
            <Printer className="w-3.5 h-3.5" />
            <span>High-Resolution 300 DPI Print Export</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Renders print-ready single cards and multi-card sheets at exact physical card dimensions (2.5×3.5 in) with clean cut lines and color profiles for tabletop home printing.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Client-Side Local Storage & JSON</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            All card decks and item libraries persist locally in browser storage with full JSON import/export capabilities, allowing seamless backups without account requirements.
          </p>
        </div>
      </div>

      {/* Technical Highlights & Key Challenges */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 font-mono">
          Technical Challenges & Solutions
        </h3>
        <div className="space-y-3">
          {project.detailedContent?.technicalChallenges.map((challenge, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {challenge}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
