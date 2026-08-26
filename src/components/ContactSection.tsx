import React, { useState } from 'react';
import { Mail, Copy, Check, Github, Linkedin, FileText, ArrowUpRight } from 'lucide-react';

interface ContactSectionProps {
  onOpenCv: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenCv }) => {
  const [copied, setCopied] = useState(false);
  const email = "hello@zaes.dev";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-16 md:py-20 border-b border-gray-200 dark:border-[#262A35]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Section label */}
          <div className="md:col-span-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 sticky top-20">
              Contact
            </h2>
          </div>

          {/* Section content */}
          <div className="md:col-span-9 space-y-6">
            <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              If you want to get in touch, email is probably the easiest way.
            </p>

            {/* Email Box */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 h-10 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-mono rounded shadow-xs transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="leading-none">{email}</span>
              </a>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 h-10 px-3.5 bg-white dark:bg-[#181A20] hover:bg-emerald-50/50 dark:hover:bg-[#20242D] text-[#1A1A1A] dark:text-[#F3F4F6] border border-gray-200 dark:border-[#2E333D] hover:border-emerald-300 dark:hover:border-emerald-700 text-sm font-mono rounded transition-colors cursor-pointer"
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold leading-none">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                    <span className="text-sm leading-none">Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* External Links & CV */}
            <div className="pt-6 border-t border-gray-200 dark:border-[#262A35] flex flex-wrap items-center gap-6 text-sm">
              <a
                href="https://github.com/Zavian"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub (Zavian)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              </a>

              <a
                href="https://www.linkedin.com/in/emanuele-sbabo-5b153b331/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              </a>

              <button
                onClick={onOpenCv}
                className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium hover:underline transition-all ml-auto sm:ml-0 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>View & Print Curriculum Vitae →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
