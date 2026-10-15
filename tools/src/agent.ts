import { useEffect } from 'react';
import { SITE_DESCRIPTION, SITE_NAME, Tool, findTool, tools } from './tools';

// window.agent is the site's machine-readable surface for AI agents (MCP via webwrap). It only exists when the
// page runs inside a webwrap shell started with debug enabled (the shell sets window.__webwrap = { debug: true }).
// Site level: describe / listTools / navigate, available on every route. A tool page adds its own functions with
// registerPageAgent and they disappear again when the page unmounts.
declare global {
  interface Window {
    __webwrap?: { debug?: boolean };
    agent?: Record<string, unknown>;
  }
}

type Fns = Record<string, (...args: never[]) => unknown>;

const page: { docs: unknown; fns: Fns } = { docs: null, fns: {} };
let go: ((to: string) => void) | null = null;

const toolInfo = (t: Tool) => ({
  path: t.path,
  title: t.title,
  tagline: t.tagline,
  description: t.description,
  tags: t.tags,
  agentApi: t.agent ?? null, // what an agent can do there; null = no agent API on that page
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const siteFns = {
  describe: () => ({
    site: SITE_NAME,
    description: SITE_DESCRIPTION,
    currentRoute: window.location.pathname,
    howTo:
      'Each tool lives on its own route. Call navigate(path) to open one (the page stays loaded, no reload), then call describe() again: "page" lists the functions that tool adds to window.agent.',
    tools: tools.map(toolInfo),
    page: page.docs,
  }),
  listTools: () => tools.map(toolInfo),
  // Opens a route and waits until that tool's agent functions are registered (tools are lazy-loaded).
  navigate: async (to: string) => {
    const target = to === '/' ? undefined : findTool(to);
    if (to !== '/' && !target) throw new Error(`Unknown route "${to}". Known: / ${tools.map((t) => t.path).join(' ')}`);
    if (!go) throw new Error('Navigation is not ready yet');
    go(to);
    for (let i = 0; i < 50 && target?.agent && !page.docs; i++) await sleep(100);
    return { route: window.location.pathname, agentReady: target?.agent ? !!page.docs : null };
  },
};

function publish() {
  if (!window.__webwrap?.debug) return;
  window.agent = { ...page.fns, ...siteFns }; // site functions win on a name clash
}

// Called by a tool page; returns the function that unregisters it.
export function registerPageAgent(docs: unknown, fns: Fns): () => void {
  page.docs = docs;
  page.fns = fns;
  publish();
  return () => {
    if (page.fns !== fns) return; // a newer page already took over
    page.docs = null;
    page.fns = {};
    publish();
  };
}

// Mount once at the app root.
export function useSiteAgent(navigate: (to: string) => void) {
  useEffect(() => {
    go = navigate;
    publish();
    return () => {
      go = null;
    };
  }, [navigate]);
}
