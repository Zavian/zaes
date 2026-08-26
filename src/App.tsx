import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { WorkSection } from './components/WorkSection';
import { ProjectsSection } from './components/ProjectsSection';
import { OtherSection } from './components/OtherSection';
import { SkillsSection } from './components/SkillsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CvModal } from './components/CvModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { TabletopToolsetView } from './components/project-views/TabletopToolsetView';
import { RpgCardCreatorView } from './components/project-views/RpgCardCreatorView';
import { AclorthView } from './components/project-views/AclorthView';
import { projects } from './content/projects';
import { Project } from './types';

function MainApp() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [cvOpen, setCvOpen] = useState(false);

  // Sync state with browser URL path and hash
  const syncRouteFromLocation = useCallback(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    // Check project path e.g. /projects/tabletop-toolset or hash #project/tabletop-toolset
    let projectId: string | null = null;
    if (path.startsWith('/projects/')) {
      projectId = path.replace('/projects/', '').replace(/\/$/, '');
    } else if (hash.startsWith('#project/')) {
      projectId = hash.replace('#project/', '');
    }

    if (projectId) {
      const found = projects.find((p) => p.id === projectId || (projectId === 'campaigns' && p.id === 'aclorth'));
      if (found) {
        setSelectedProject(found);
        return;
      }
    }

    if (path === '/cv' || hash === '#cv') {
      setCvOpen(true);
      return;
    }

    // Default to main page
    setSelectedProject(null);
  }, []);

  useEffect(() => {
    syncRouteFromLocation();
    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, [syncRouteFromLocation]);

  // Navigate to a project page
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    window.history.pushState({ projectId: project.id }, '', `/projects/${project.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to the home list of projects
  const handleBackToProjects = () => {
    setSelectedProject(null);
    window.history.pushState(null, '', '/');
    setTimeout(() => {
      const target = document.querySelector('#projects');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Return to home top
  const handleNavigateHome = () => {
    setSelectedProject(null);
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Section navigation (e.g. 'about', 'work', 'projects', 'other', 'skills', 'contact')
  const handleNavigateSection = (sectionId: string) => {
    if (selectedProject) {
      // If currently on a dedicated project page, navigate back to home first
      setSelectedProject(null);
      window.history.pushState(null, '', '/');
      setTimeout(() => {
        const target = document.querySelector(`#${sectionId}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      // Already on home view
      const target = document.querySelector(`#${sectionId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOpenCv = () => {
    setCvOpen(true);
  };

  const handleCloseCv = () => {
    setCvOpen(false);
    if (window.location.pathname === '/cv' || window.location.hash === '#cv') {
      window.history.replaceState(null, '', '/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFC] dark:bg-[#111318] text-[#1A1A1A] dark:text-[#F3F4F6] font-sans selection:bg-gray-200 dark:selection:bg-gray-700 transition-colors">
      {/* Header */}
      <Header 
        onOpenCv={handleOpenCv} 
        onNavigateSection={handleNavigateSection}
        onNavigateHome={handleNavigateHome}
        isProjectPage={selectedProject !== null}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {selectedProject ? (
          // Dedicated Project Detail Sub-page
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
            {selectedProject.id === 'tabletop-toolset' && (
              <TabletopToolsetView project={selectedProject} onBack={handleBackToProjects} />
            )}
            {selectedProject.id === 'rpg-card-creator' && (
              <RpgCardCreatorView project={selectedProject} onBack={handleBackToProjects} />
            )}
            {selectedProject.id === 'aclorth' && (
              <AclorthView project={selectedProject} onBack={handleBackToProjects} />
            )}
          </div>
        ) : (
          // Main Portfolio Layout
          <>
            <Hero onOpenCv={handleOpenCv} onNavigateSection={handleNavigateSection} />
            <AboutSection />
            <WorkSection />
            <ProjectsSection onSelectProject={handleSelectProject} />
            <OtherSection />
            <SkillsSection />
            <ContactSection onOpenCv={handleOpenCv} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* CV Modal / Lightbox */}
      <CvModal isOpen={cvOpen} onClose={handleCloseCv} />

      {/* Scroll to Top floating button */}
      <ScrollToTopButton />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
