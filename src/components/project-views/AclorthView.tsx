import React from 'react';
import { Project } from '../../types';
import { ArrowLeft, ArrowUpRight, Crown, Flame, GraduationCap, BookOpen, Compass, Layers, GitBranch } from 'lucide-react';

interface AclorthViewProps {
  project: Project;
  onBack: () => void;
}

export const AclorthView: React.FC<AclorthViewProps> = ({ project, onBack }) => {
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
            1,000,000+ Words in Obsidian
          </span>
          <span className="text-xs font-mono bg-gray-100 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">
            3 Consecutive Campaigns
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F3F4F6] mb-2">
          Campaigns & Narrative Systems
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
          Three long-term tabletop campaigns spanning 6+ years of continuous weekly play, structured in a 1,000,000+ word relational Obsidian vault.
        </p>

        {/* Public Lore Portal Link Card */}
        <div className="p-5 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div>
              <div className="text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">Public Archive</div>
              <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">dnd.zaes.dev Lore & Campaign Portal</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">Interactive campaign documentation & codex</div>
            </div>
          </div>
          <a
            href="https://dnd.zaes.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-mono rounded font-semibold shadow-xs transition-colors shrink-0"
          >
            <span>Explore Live Lore on dnd.zaes.dev</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
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

      {/* Key Scope Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded">
          <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase">Documented Scope</div>
          <div className="text-lg font-bold text-[#1A1A1A] dark:text-[#F3F4F6] font-mono">1,000,000+</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">Words in Obsidian Vault</div>
        </div>
        <div className="p-3.5 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded">
          <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase">Timeline</div>
          <div className="text-lg font-bold text-[#1A1A1A] dark:text-[#F3F4F6] font-mono">6+ Years</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">Continuous weekly sessions</div>
        </div>
        <div className="p-3.5 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded">
          <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase">Campaigns</div>
          <div className="text-lg font-bold text-[#1A1A1A] dark:text-[#F3F4F6] font-mono">3 Major Arcs</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">Chronological continuity</div>
        </div>
        <div className="p-3.5 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded">
          <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase">Obsidian Notes</div>
          <div className="text-lg font-bold text-[#1A1A1A] dark:text-[#F3F4F6] font-mono">3,500+</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">Bidirectional links</div>
        </div>
      </div>

      {/* Active Campaign Deep-Dive */}
      <div className="p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-[#2E333D] pb-3">
          <div>
            <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">Active Weekly Campaign</div>
            <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">A Vow of Silk and Steel</h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-gray-100 dark:bg-[#20242D] px-2 py-1 rounded border border-gray-200 dark:border-[#2E333D] text-gray-600 dark:text-gray-300">
              Tier: 2-3 (Medium to High)
            </span>
            <span className="bg-emerald-700 dark:bg-emerald-600 text-white px-2 py-1 rounded font-semibold">
              Live Campaign
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase font-semibold">The Setting: Astravia</div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Astravia is a mist-shrouded continent of ancient kingdoms, dense forests, and forgotten ruins, sealed off from all other known lands through an ancient, unexplained magic. Life across the provinces is defined by the fragile, hostile balance between three dominant powers:
          </p>
        </div>

        {/* Three Major Factions Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* The Crown */}
          <div className="p-4 bg-gray-50 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A] dark:text-[#F3F4F6] font-bold text-sm">
              <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>The Crown</span>
            </div>
            <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase">Monarchy & Feudal Order</div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Struggles to maintain sovereign authority across the provinces as ambitious noble houses plot in the shadows, constantly challenged by the wild dangers lurking beyond civilized walls.
            </p>
          </div>

          {/* Church of the Sacred Flame */}
          <div className="p-4 bg-gray-50 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A] dark:text-[#F3F4F6] font-bold text-sm">
              <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>The Sacred Flame</span>
            </div>
            <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase">Zealous Theocracy</div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Preaches an uncompromising dogma of salvation to the faithful while ruthlessly hunting down the last surviving elven bloodlines, deemed heretical and dangerous.
            </p>
          </div>

          {/* The Academy */}
          <div className="p-4 bg-gray-50 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A] dark:text-[#F3F4F6] font-bold text-sm">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>The Academy</span>
            </div>
            <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase">Arcane Scholars & Relics</div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Mages delve into forbidden lore within secluded towers, dispatching expeditions into dangerous ruins to recover potent relics to further their secret plans and arcane power.
            </p>
          </div>
        </div>
      </div>

      {/* The Three Campaigns Chronology */}
      <div className="p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 uppercase font-semibold">
          <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Chronology of the Three Campaigns</span>
        </div>

        <div className="space-y-3">
          {/* Campaign 1 */}
          <div className="p-4 bg-gray-50 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-[#F3F4F6]">
                Campaign I: Lament of the Damned
              </h3>
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500">First Campaign (2018 - 2020)</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              The foundational long-term campaign exploring regional power struggles, ancient arcane seals, and early continental factions. Established the core geopolitical history, magical rules, and consequence systems.
            </p>
          </div>

          {/* Campaign 2 */}
          <div className="p-4 bg-gray-50 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-[#F3F4F6]">
                Campaign II: The Dragon Ajax & The Fallen
              </h3>
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500">Second Campaign (2021 - 2023)</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Spurred by the demise of the realm's first adventuring party at the claws of the legendary dragon Ajax. Explored mercenary alliances, political warfare, industrial logistics, and the ultimate strategic confrontation to bring down Ajax.
            </p>
          </div>

          {/* Campaign 3 */}
          <div className="p-4 bg-gray-50 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-[#F3F4F6]">
                Campaign III: A Vow of Silk and Steel
              </h3>
              <span className="text-xs font-mono text-emerald-900 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800/60 rounded">
                Active Campaign (Weekly Sessions)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Set in the mist-shrouded continent of Astravia, sealed by ancient unknown magic. A high-stakes adventure dealing with the tense friction between the Monarchy, the zealous Church of the Sacred Flame, and the relic-hunting Academy.
            </p>
          </div>
        </div>
      </div>

      {/* Systems-First Worldbuilding & Obsidian Architecture */}
      <div className="p-6 bg-white dark:bg-[#181A20] border border-gray-200 dark:border-[#2E333D] rounded space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 uppercase font-semibold">
          <GitBranch className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Systems-First Worldbuilding & Knowledge Architecture</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Rather than treating worldbuilding as passive storytelling, the setting is engineered like a relational distributed state machine:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 bg-gray-50 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded space-y-1">
            <div className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-400">Dynamic Causality</div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Caravan disruptions or regional political shifts ripple automatically into neighboring provinces via trade equations and military posture adjustments.
            </p>
          </div>
          <div className="p-3.5 bg-gray-50 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded space-y-1">
            <div className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-400">YAML Frontmatter</div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Standardized metadata schemas (faction alignment, active status, geographic coordinates, era) powering Dataview queries across 3,500+ markdown files.
            </p>
          </div>
          <div className="p-3.5 bg-gray-50 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded space-y-1">
            <div className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-400">Relational Longevity</div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Decisions and player outcomes from 2018 still generate direct NPC dialogue, political factions, and physical world consequences in current 2026 weekly sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
