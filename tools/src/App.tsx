import React, { Suspense, lazy, useEffect } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { NavProvider, usePath } from './router';
import { SITE_NAME, findTool } from './tools';
import { ThemeProvider } from './ThemeContext';

// The generator is a large, client-only tool: keep it out of the main bundle.
const GeneratorPage = lazy(() => import('./generator/GeneratorPage'));

const UploadPage = lazy(() => import('./upload/UploadPage'));

const Loading = () => (
  <div className="max-w-4xl mx-auto px-6 py-16 text-sm font-mono text-gray-500 dark:text-gray-400">Loading…</div>
);

function Shell({ initialPath }: { initialPath?: string }) {
  const [path, navigate] = usePath(initialPath);
  const tool = findTool(path);

  useEffect(() => {
    document.title = tool ? `${tool.title} | ${SITE_NAME}` : SITE_NAME;
  }, [tool]);

  return (
    <NavProvider value={navigate}>
      <div className="min-h-screen flex flex-col bg-[#FCFCFC] dark:bg-[#111318] text-[#1A1A1A] dark:text-[#F3F4F6] font-sans selection:bg-gray-200 dark:selection:bg-emerald-400/35 transition-colors">
        <Header path={path} />
        <main className="flex-grow">
          {tool?.id === 'generator' ? (
            <Suspense fallback={<Loading />}>
              <GeneratorPage />
            </Suspense>
          ) : tool?.id === 'upload' ? (
            <Suspense fallback={<Loading />}>
              <UploadPage />
            </Suspense>
          ) : (
            <Home />
          )}
        </main>
        {tool?.id !== 'generator' && <Footer />}
      </div>
    </NavProvider>
  );
}

export default function App({ initialPath }: { initialPath?: string }) {
  return (
    <ThemeProvider>
      <Shell initialPath={initialPath} />
    </ThemeProvider>
  );
}
