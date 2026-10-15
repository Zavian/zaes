import React, { useCallback, useEffect, useState } from 'react';

// Tiny path router: the site is a handful of static pages, so no router library is needed.
export function usePath(initial?: string): [string, (to: string) => void] {
  const [path, setPath] = useState(() => initial ?? window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState(null, '', to);
    setPath(to);
    window.scrollTo({ top: 0 });
  }, []);

  return [path, navigate];
}

const NavContext = React.createContext<(to: string) => void>(() => {});
export const NavProvider = NavContext.Provider;

export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }> = ({ href, onClick, ...rest }) => {
  const navigate = React.useContext(NavContext);
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        // Let the browser handle new-tab clicks and modified clicks.
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
};
