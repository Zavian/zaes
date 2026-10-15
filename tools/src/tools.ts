export interface Tool {
  id: string;
  path: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
}

// Add new tools here: they show up on the home page and in the header automatically.
export const tools: Tool[] = [
  {
    id: 'generator',
    path: '/generator',
    title: 'RPG Card Generator',
    tagline: 'Spells, items and creatures as printable cards',
    description:
      'Design tabletop RPG cards with a live preview, print double-sided sheets, and export images for Tabletop Simulator. Opens save files from the original generator.',
    tags: ['Cards', 'Print', 'Tabletop Simulator'],
  },
];

export const SITE_URL = 'https://tools.zaes.dev';
export const SITE_NAME = "Zavian's Tools";
export const SITE_DESCRIPTION = 'Free browser tools for tabletop RPG players and game masters, made by Zavian.';

export const findTool = (path: string): Tool | undefined => {
  const clean = path.replace(/\/$/, '').replace(/\.html$/, '');
  return tools.find((t) => t.path === clean);
};
