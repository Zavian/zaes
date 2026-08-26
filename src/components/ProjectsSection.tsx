import React from 'react';
import { projects } from '../content/projects';
import { Project } from '../types';
import { ArrowRight, Layers, Sparkles, Database, Wrench } from 'lucide-react';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onSelectProject }) => {
  const getProjectIcon = (id: string) => {
    switch (id) {
      case 'tabletop-toolset':
        return <Wrench className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />;
      case 'rpg-card-creator':
        return <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />;
      case 'aclorth':
        return <Database className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />;
      default:
        return <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />;
    }
  };

  const getActionLabel = (id: string) => {
    switch (id) {
      case 'tabletop-toolset':
        return 'View Architecture & Lua Scripts →';
      case 'rpg-card-creator':
        return 'Open Tool Details & Live App →';
      case 'aclorth':
        return 'Explore Setting & Campaigns →';
      default:
        return 'View Project Details →';
    }
  };

  return (
    <section id="projects" className="py-16 md:py-20 border-b border-gray-200 dark:border-[#262A35]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Section label */}
          <div className="md:col-span-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 sticky top-20">
              Selected Projects
            </h2>
          </div>

          {/* Projects list */}
          <div className="md:col-span-9 space-y-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Selected long-term technical and creative projects. Each represents years of continuous iteration, systems architecture, and practical problem solving.
            </p>

            <div className="space-y-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group p-6 bg-white dark:bg-[#181A20] hover:bg-gray-50/80 dark:hover:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] hover:border-emerald-200 dark:hover:border-emerald-800/60 rounded transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getProjectIcon(project.id)}
                      <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-[#F3F4F6] group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] px-2 py-0.5 rounded">
                      {project.period}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {project.subtitle}
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono px-2 py-0.5 bg-gray-100 dark:bg-[#20242D] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2E333D] rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
                    {project.summary}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-1.5 mb-6 text-sm text-gray-600 dark:text-gray-400">
                    {project.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-1 shrink-0 font-mono text-xs">-</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Deep dive action button */}
                  <div className="pt-3 border-t border-gray-200 dark:border-[#2E333D] flex items-center justify-between">
                    <button
                      onClick={() => onSelectProject(project)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 transition-all cursor-pointer font-mono"
                    >
                      <span>{getActionLabel(project.id)}</span>
                    </button>
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                      Detailed page available
                    </span>
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
