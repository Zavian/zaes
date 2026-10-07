import { projects } from './content/projects';
import { Project } from './types';

export const SITE_URL = 'https://zaes.dev';

export interface Route {
  path: string;
  // Path the canonical URL points at (differs from `path` for aliases like /cv)
  canonical: string;
  title: string;
  description: string;
  project?: Project;
}

const HOME_TITLE = 'Emanuele Sbabo | Web Developer (zaes.dev)';
const HOME_DESCRIPTION =
  'Personal homepage, portfolio, and project archive of Emanuele Sbabo: web developer, technical QA analyst, and tabletop RPG worldbuilder.';

// Truncate at a word boundary so the result never exceeds `max` characters
const truncate = (text: string, max = 160) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s.,;:]+$/, '') + '…';
};

export const projectTitle = (project: Project) => `${project.title} | Emanuele Sbabo`;

export const routes: Route[] = [
  { path: '/', canonical: '/', title: HOME_TITLE, description: HOME_DESCRIPTION },
  ...projects.map((project) => ({
    path: `/projects/${project.id}`,
    canonical: `/projects/${project.id}`,
    title: projectTitle(project),
    description: truncate(project.summary),
    project,
  })),
  { path: '/cv', canonical: '/', title: HOME_TITLE, description: HOME_DESCRIPTION },
];

export const pageTitle = (project: Project | null) => (project ? projectTitle(project) : HOME_TITLE);

// Resolve a project from a path (/projects/<id>, optional trailing slash or .html) or a #project/<id> hash
export function resolveProject(path: string, hash: string): Project | null {
  let projectId: string | null = null;
  if (path.startsWith('/projects/')) {
    projectId = path.replace('/projects/', '').replace(/\/$/, '').replace(/\.html$/, '');
  } else if (hash.startsWith('#project/')) {
    projectId = hash.replace('#project/', '');
  }
  if (!projectId) return null;
  return projects.find((p) => p.id === projectId || (projectId === 'campaigns' && p.id === 'aclorth')) ?? null;
}
