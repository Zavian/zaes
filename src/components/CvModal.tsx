import React, { useState, useEffect } from 'react';
import { cvData } from '../content/cv';
import { X, Printer, Copy, Check, MapPin, Mail, Globe, Github, Linkedin, Phone, FileText, Eye, Code } from 'lucide-react';

interface CvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CvModal: React.FC<CvModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'web' | 'markdown'>('pdf');
  const [copiedMd, setCopiedMd] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getMarkdownContent = () => {
    return `# ${cvData.name.toUpperCase()}
**${cvData.title.toUpperCase()}**
${cvData.phone} | ${cvData.location.toUpperCase()} | ${cvData.email.toUpperCase()} | ${cvData.linkedin}

---

## Overview
${cvData.overview}

## Skills & abilities
- **Web & Frontend:** ${cvData.skills.webFrontend.join(', ')}
- **QA & Debugging:** ${cvData.skills.qaDebugging.join(', ')}
- **Infrastructure & DevOps:** ${cvData.skills.infrastructureDevOps.join(', ')}
- **Platforms & Databases:** ${cvData.skills.platformsDatabases.join(', ')}
- **Scripting & Logic:** ${cvData.skills.scriptingLogic.join(', ')}
- **Productivity & Tracking:** ${cvData.skills.productivityTracking.join(', ')}

## Experience
### AV FLEXOLOGIC AND COLOR CONTROL GROUP
**Web Developer | August 2024 - Present**
${cvData.experience[0].highlights.map(h => `- ${h}`).join('\n')}

## Technical & Open-Source Projects
### TABLETOP RPG AUTOMATION & TOOLSET ( 2019 – PRESENT)
*Lua, XML, Tabletop Simulator API*
${cvData.technicalProjects[0].highlights.map(h => `- ${h}`).join('\n')}

### INTERACTIVE RPG CARD CREATOR & EXPORTER (2019 – PRESENT)
*JavaScript, jQuery, HTML5, CSS3, Bootstrap*
${cvData.technicalProjects[1].highlights.map(h => `- ${h}`).join('\n')}

## Leadership & Systems Experience
### MYTHIC RAID LEADER & GUILD OPERATIONS (2022 – PRESENT)
*World of Warcraft*
${cvData.leadershipExperience[0].highlights.map(h => `- ${h}`).join('\n')}

### NARRATIVE SYSTEMS & WORLD ARCHITECTURE ( 2018 – PRESENT)
*RPG Writing, world building, game design*
${cvData.leadershipExperience[1].highlights.map(h => `- ${h}`).join('\n')}

## Languages
- Italian: Native.
- English: Full Professional Proficiency (daily professional and technical use).
- Dutch / French / Spanish: Elementary / Basic comprehension.

## Education
**HIGH SCHOOL DIPLOMA IN COMPUTER SCIENCE**
ITT “G. Chilesotti” – Thiene (Vicenza), Italy (A.Y. 2014/2015)

## References
References available upon request.
`;
  };

  const handleCopyMarkdown = () => {
    const md = getMarkdownContent();
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 dark:bg-black/85 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 cv-modal-backdrop cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#ECEEF2] dark:bg-[#13151B] text-[#1A1A1A] dark:text-[#F3F4F6] rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2E333D] my-auto cv-modal-dialog cursor-default"
      >
        
        {/* Controls Header Bar (hidden in physical print) */}
        <div className="no-print bg-white dark:bg-[#181A20] sticky top-0 z-20 shadow-xs">
          
          {/* Row 1: CV Title --------------------- X Close Button */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-b border-gray-100 dark:border-[#222631]">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">
                Curriculum Vitae <span className="font-normal text-gray-500 dark:text-gray-400">· Emanuele Sbabo</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#20242D] rounded-md transition-colors cursor-pointer"
              aria-label="Close modal"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Row 2: Copy to Markdown, Print button ----------------- Tab Switcher */}
          <div className="bg-gray-50/70 dark:bg-[#14161C] px-4 py-2.5 sm:px-6 border-b border-gray-200 dark:border-[#262A35] flex flex-wrap items-center justify-between gap-3">
            
            {/* Left: Copy to Markdown & Print / PDF */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-white dark:bg-[#20242D] hover:bg-emerald-50/50 dark:hover:bg-[#282C37] border border-gray-200 dark:border-[#2E333D] rounded text-[#1A1A1A] dark:text-[#F3F4F6] transition-colors cursor-pointer shadow-2xs"
                title="Copy formatted markdown text"
              >
                {copiedMd ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Copy to Markdown</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded font-medium shadow-xs transition-colors cursor-pointer"
                title="Print Document or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>

            {/* Right: Tab Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#20242D] p-1 rounded border border-gray-200 dark:border-[#2E333D] text-xs font-mono ml-auto">
              <button
                onClick={() => setActiveTab('pdf')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'pdf'
                    ? 'bg-white dark:bg-[#181A20] text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white'
                }`}
                title="Exact PDF Sheet Replica"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Sheet</span>
              </button>

              <button
                onClick={() => setActiveTab('web')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'web'
                    ? 'bg-white dark:bg-[#181A20] text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white'
                }`}
                title="Interactive Web View"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Web View</span>
              </button>

              <button
                onClick={() => setActiveTab('markdown')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'markdown'
                    ? 'bg-white dark:bg-[#181A20] text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white'
                }`}
                title="Raw Markdown / Plain Text"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Markdown</span>
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: EXACT PDF DOCUMENT REPLICA (2-PAGE SHEET VIEW)                     */}
        {/* ========================================================================= */}
        {activeTab === 'pdf' && (
          <div className="printable-cv-container p-3 sm:p-8 bg-[#DCE0E6] dark:bg-[#0B0D11] flex flex-col items-center gap-8">
            
            {/* PAGE 1 */}
            <div className="pdf-page-sheet w-full max-w-[780px] bg-white text-[#222222] shadow-xl p-8 sm:p-12 font-sans text-[13px] leading-[1.48] border border-gray-300">
              
              {/* Header Title */}
              <div className="text-center mb-4">
                <h1 className="text-3xl sm:text-4xl font-medium tracking-[0.14em] text-[#222222] uppercase">
                  EMANUELE SBABO
                </h1>
                <div className="text-[13px] sm:text-[14px] font-bold tracking-[0.10em] text-[#222222] uppercase mt-2">
                  WEB DEVELOPER &amp; TECHNICAL QA ANALYST
                </div>
              </div>

              {/* Horizontal Divider Top */}
              <div className="w-full border-t border-gray-400 my-3" />

              {/* Contact Bar */}
              <div className="text-center text-[11px] sm:text-[11.5px] font-medium tracking-wide text-[#333333] mb-3">
                <span>+31 06 88591797</span>
                <span className="mx-2 text-gray-400">|</span>
                <span>LEIDEN, NL</span>
                <span className="mx-2 text-gray-400">|</span>
                <a href="mailto:hello@zaes.dev" className="hover:underline text-[#222222]">HELLO@ZAES.DEV</a>
                <span className="mx-2 text-gray-400">|</span>
                <a href={cvData.linkedin} target="_blank" rel="noreferrer" className="text-[#0066CC] hover:underline font-semibold print-link">
                  LINKEDIN
                </a>
              </div>

              {/* Horizontal Divider Bottom */}
              <div className="w-full border-t border-gray-400 mb-6" />

              {/* Section 1: Overview */}
              <div className="flex flex-col sm:flex-row gap-4 mb-5 print-avoid-break">
                <div className="w-full sm:w-[130px] shrink-0 font-bold text-[#222222] text-[13px]">
                  Overview
                </div>
                <div className="flex-1 text-[#222222] text-justify leading-relaxed">
                  {cvData.overview}
                </div>
              </div>

              {/* Section 2: Skills & abilities */}
              <div className="flex flex-col sm:flex-row gap-4 mb-5 print-avoid-break">
                <div className="w-full sm:w-[130px] shrink-0 font-bold text-[#222222] text-[13px] leading-tight">
                  Skills &amp;<br />abilities
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] leading-none text-[#222222]">•</span>
                    <div>
                      <span className="font-semibold text-[#222222]">Web &amp; Frontend: </span>
                      <span className="text-[#333333]">{cvData.skills.webFrontend.join(', ')}.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] leading-none text-[#222222]">•</span>
                    <div>
                      <span className="font-semibold text-[#222222]">QA &amp; Debugging: </span>
                      <span className="text-[#333333]">{cvData.skills.qaDebugging.join(', ')}.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] leading-none text-[#222222]">•</span>
                    <div>
                      <span className="font-semibold text-[#222222]">Infrastructure &amp; DevOps: </span>
                      <span className="text-[#333333]">{cvData.skills.infrastructureDevOps.join(', ')}.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] leading-none text-[#222222]">•</span>
                    <div>
                      <span className="font-semibold text-[#222222]">Platforms &amp; Databases: </span>
                      <span className="text-[#333333]">{cvData.skills.platformsDatabases.join(', ')}.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] leading-none text-[#222222]">•</span>
                    <div>
                      <span className="font-semibold text-[#222222]">Scripting &amp; Logic: </span>
                      <span className="text-[#333333]">{cvData.skills.scriptingLogic.join(', ')}.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] leading-none text-[#222222]">•</span>
                    <div>
                      <span className="font-semibold text-[#222222]">Productivity &amp; Tracking: </span>
                      <span className="text-[#333333]">{cvData.skills.productivityTracking.join(', ')}.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Experience */}
              <div className="flex flex-col sm:flex-row gap-4 print-avoid-break">
                <div className="w-full sm:w-[130px] shrink-0 font-bold text-[#222222] text-[13px]">
                  Experience
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="font-bold text-[#222222] uppercase tracking-wide text-[12.5px]">
                      AV FLEXOLOGIC AND COLOR CONTROL GROUP
                    </div>
                    <div className="text-[12px] font-normal text-[#333333] mb-2">
                      Web Developer | August 2024 - Present
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {cvData.experience[0].highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-[14px] leading-none text-[#222222]">•</span>
                        <div className="text-[#333333] leading-relaxed">
                          {item}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Print break marker between pages */}
            <div className="pdf-page-break" />

            {/* PAGE 2 */}
            <div className="pdf-page-sheet w-full max-w-[780px] bg-white text-[#222222] shadow-xl p-8 sm:p-12 font-sans text-[13px] leading-[1.48] border border-gray-300 relative">
              
              {/* Section 4: Technical & Open-Source Projects */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 print-avoid-break">
                <div className="w-full sm:w-[130px] shrink-0 font-bold text-[#222222] text-[13px] leading-tight">
                  Technical &amp;<br />Open-Source<br />Projects
                </div>
                <div className="flex-1 space-y-4">
                  {/* Project 1 */}
                  <div className="space-y-1.5">
                    <div>
                      <div className="font-bold text-[#222222] uppercase tracking-wide text-[12.5px]">
                        TABLETOP RPG AUTOMATION &amp; TOOLSET ( 2019 – PRESENT)
                      </div>
                      <div className="text-[12px] font-normal text-[#444444]">
                        Lua, XML, Tabletop Simulator API
                      </div>
                    </div>
                    <div className="space-y-1">
                      {cvData.technicalProjects[0].highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-[14px] leading-none text-[#222222]">•</span>
                          <div className="text-[#333333] leading-relaxed">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project 2 */}
                  <div className="space-y-1.5">
                    <div>
                      <div className="font-bold text-[#222222] uppercase tracking-wide text-[12.5px]">
                        INTERACTIVE RPG CARD CREATOR &amp; EXPORTER (2019 – PRESENT)
                      </div>
                      <div className="text-[12px] font-normal text-[#444444]">
                        JavaScript, jQuery, HTML5, CSS3, Bootstrap
                      </div>
                    </div>
                    <div className="space-y-1">
                      {cvData.technicalProjects[1].highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-[14px] leading-none text-[#222222]">•</span>
                          <div className="text-[#333333] leading-relaxed">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Leadership & Systems Experience */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 print-avoid-break">
                <div className="w-full sm:w-[130px] shrink-0 font-bold text-[#222222] text-[13px] leading-tight">
                  Leadership &amp;<br />Systems<br />Experience
                </div>
                <div className="flex-1 space-y-4">
                  {/* Leadership 1 */}
                  <div className="space-y-1.5">
                    <div>
                      <div className="font-bold text-[#222222] uppercase tracking-wide text-[12.5px]">
                        MYTHIC RAID LEADER &amp; GUILD OPERATIONS (2022 – PRESENT)
                      </div>
                      <div className="text-[12px] font-normal text-[#444444]">
                        World of Warcraft
                      </div>
                    </div>
                    <div className="space-y-1">
                      {cvData.leadershipExperience[0].highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-[14px] leading-none text-[#222222]">•</span>
                          <div className="text-[#333333] leading-relaxed">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leadership 2 */}
                  <div className="space-y-1.5">
                    <div>
                      <div className="font-bold text-[#222222] uppercase tracking-wide text-[12.5px]">
                        NARRATIVE SYSTEMS &amp; WORLD ARCHITECTURE ( 2018 – PRESENT)
                      </div>
                      <div className="text-[12px] font-normal text-[#444444]">
                        RPG Writing, world building, game design
                      </div>
                    </div>
                    <div className="space-y-1">
                      {cvData.leadershipExperience[1].highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-[14px] leading-none text-[#222222]">•</span>
                          <div className="text-[#333333] leading-relaxed">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: Languages */}
              <div className="flex flex-col sm:flex-row gap-4 mb-5 print-avoid-break">
                <div className="w-full sm:w-[130px] shrink-0 font-bold text-[#222222] text-[13px]">
                  Languages
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] leading-none text-[#222222]">•</span>
                    <div className="text-[#333333]">Italian: Native.</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] leading-none text-[#222222]">•</span>
                    <div className="text-[#333333]">English: Full Professional Proficiency (daily professional and technical use).</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] leading-none text-[#222222]">•</span>
                    <div className="text-[#333333]">Dutch / French / Spanish: Elementary / Basic comprehension.</div>
                  </div>
                </div>
              </div>

              {/* Section 7: Education */}
              <div className="flex flex-col sm:flex-row gap-4 mb-5 print-avoid-break">
                <div className="w-full sm:w-[130px] shrink-0 font-bold text-[#222222] text-[13px]">
                  Education
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="font-bold text-[#222222] uppercase tracking-wide text-[12.5px]">
                    HIGH SCHOOL DIPLOMA IN COMPUTER SCIENCE
                  </div>
                  <div className="text-[12px] text-[#333333]">
                    ITT “G. Chilesotti” – Thiene (Vicenza), Italy (A.Y. 2014/2015)
                  </div>
                </div>
              </div>

              {/* Section 8: References */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 print-avoid-break">
                <div className="w-full sm:w-[130px] shrink-0 font-bold text-[#222222] text-[13px]">
                  References
                </div>
                <div className="flex-1 text-[#333333]">
                  References available upon request.
                </div>
              </div>

              {/* Decorative small bottom line as seen in the original PDF */}
              <div className="w-28 border-t border-gray-400 mt-6" />

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WEB INTERACTIVE VIEW (Dark/Light responsive theme)                 */}
        {/* ========================================================================= */}
        {activeTab === 'web' && (
          <div className="p-6 sm:p-10 space-y-8 font-sans">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-[#262A35] pb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F3F4F6]">
                {cvData.name}
              </h1>
              <div className="text-base text-emerald-800 dark:text-emerald-400 mt-1 mb-4 font-mono font-medium text-sm">
                {cvData.title}
              </div>

              <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs font-mono text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  {cvData.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  {cvData.phone}
                </span>
                <a href={`mailto:${cvData.email}`} className="flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400">
                  <Mail className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  {cvData.email}
                </a>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  zaes.dev
                </span>
                <a href={cvData.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400">
                  <Github className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  github.com/Zavian
                </a>
                <a href={cvData.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400">
                  <Linkedin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  linkedin.com/in/emanuele-sbabo
                </a>
              </div>
            </div>

            {/* Professional Overview */}
            <div>
              <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-2">
                Professional Overview
              </h2>
              <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                {cvData.overview}
              </p>
            </div>

            {/* Technical Skills */}
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
                Technical Proficiencies
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
                  <span className="text-emerald-700 dark:text-emerald-400 block mb-1 font-semibold uppercase text-[10px]">Web & Frontend:</span>
                  <span className="text-[#1A1A1A] dark:text-[#F3F4F6] leading-relaxed">{cvData.skills.webFrontend.join(', ')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
                  <span className="text-emerald-700 dark:text-emerald-400 block mb-1 font-semibold uppercase text-[10px]">QA & Debugging:</span>
                  <span className="text-[#1A1A1A] dark:text-[#F3F4F6] leading-relaxed">{cvData.skills.qaDebugging.join(', ')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
                  <span className="text-emerald-700 dark:text-emerald-400 block mb-1 font-semibold uppercase text-[10px]">Infrastructure & DevOps:</span>
                  <span className="text-[#1A1A1A] dark:text-[#F3F4F6] leading-relaxed">{cvData.skills.infrastructureDevOps.join(', ')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
                  <span className="text-emerald-700 dark:text-emerald-400 block mb-1 font-semibold uppercase text-[10px]">Platforms & Databases:</span>
                  <span className="text-[#1A1A1A] dark:text-[#F3F4F6] leading-relaxed">{cvData.skills.platformsDatabases.join(', ')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
                  <span className="text-emerald-700 dark:text-emerald-400 block mb-1 font-semibold uppercase text-[10px]">Scripting & Logic:</span>
                  <span className="text-[#1A1A1A] dark:text-[#F3F4F6] leading-relaxed">{cvData.skills.scriptingLogic.join(', ')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
                  <span className="text-emerald-700 dark:text-emerald-400 block mb-1 font-semibold uppercase text-[10px]">Productivity & Project Tracking:</span>
                  <span className="text-[#1A1A1A] dark:text-[#F3F4F6] leading-relaxed">{cvData.skills.productivityTracking.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
                Professional Work Experience
              </h2>

              {cvData.experience.map((exp, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-1 border-b border-gray-100 dark:border-[#262A35] pb-1.5">
                    <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">
                      {exp.role} · <span className="font-semibold text-gray-700 dark:text-gray-300">{exp.company}</span>
                    </h3>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {exp.period} | {exp.location}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {exp.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-1 shrink-0 font-mono text-xs">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured Technical Projects */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
                Selected Technical Projects
              </h2>

              <div className="space-y-3">
                {cvData.technicalProjects.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded text-xs sm:text-sm space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#1A1A1A] dark:text-[#F3F4F6] text-sm">{proj.name}</span>
                      <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{proj.period}</span>
                    </div>
                    <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      Tech: {proj.tech}
                    </div>
                    <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-1">
                      {proj.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 font-mono text-[10px]">-</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Leadership Experience */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
                Leadership & Systems Architecture
              </h2>

              <div className="space-y-3">
                {cvData.leadershipExperience.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded text-xs sm:text-sm space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">{item.title}</span>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{item.period}</span>
                    </div>
                    <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      Context: {item.context}
                    </div>
                    <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-1">
                      {item.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 font-mono text-[10px]">-</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
                Languages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                {cvData.languages.map((lang, idx) => (
                  <div key={idx} className="p-2.5 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded">
                    <span className="font-bold text-[#1A1A1A] dark:text-[#F3F4F6] block">{lang.language}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-[11px]">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
                Education & Qualifications
              </h2>
              {cvData.education.map((edu, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-[#1F222A] border border-gray-200 dark:border-[#2E333D] rounded text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                    <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">{edu.degree}</span>
                    <span className="font-mono text-gray-400 dark:text-gray-500">{edu.period}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {edu.institution} · {edu.location}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {edu.description}
                  </p>
                </div>
              ))}
            </div>

            {/* References */}
            <div className="pt-2 text-center text-xs font-mono text-gray-400 dark:text-gray-500">
              {cvData.references}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MARKDOWN / PLAIN TEXT VIEW                                         */}
        {/* ========================================================================= */}
        {activeTab === 'markdown' && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#2E333D] pb-2">
              <span>Formatted Markdown Source</span>
              <button
                onClick={handleCopyMarkdown}
                className="text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {copiedMd ? 'Copied to Clipboard' : 'Copy All Text'}
              </button>
            </div>
            <pre className="p-4 bg-white dark:bg-[#0E1015] border border-gray-200 dark:border-[#2E333D] rounded font-mono text-xs text-[#1A1A1A] dark:text-[#E2E8F0] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[65vh]">
              {getMarkdownContent()}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
