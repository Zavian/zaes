import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show when page is scrolled down > 350px
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Back to top"
      className="no-print fixed bottom-6 right-6 z-30 p-3 rounded-full bg-white/95 dark:bg-[#1C1F26]/95 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#2E333D] shadow-lg hover:shadow-xl hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700/60 backdrop-blur-xs transition-all duration-200 cursor-pointer active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
