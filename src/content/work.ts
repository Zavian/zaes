import { WorkExperience } from '../types';

export const workExperience: WorkExperience = {
  company: "AV Flexologic and Color Control Group",
  role: "Web Developer",
  period: "August 2024 - Present",
  location: "Leiden, Netherlands",
  summary: "Responsible for the web presence, platform redevelopments, multi-brand infrastructure, and digital operations across AV Flexologic, Tech Sleeves, and ColorControl.",
  brands: ["AV Flexologic", "Tech Sleeves", "ColorControl"],
  responsibilities: [
    "Led the full redevelopment of multiple corporate brand presences (AV Flexologic, Tech Sleeves, ColorControl), rebuilding them from outdated 2017-era WordPress into Odoo and later into Lovable, with AV Flexologic and Tech Sleeves deeply integrated with the company CRM.",
    "Implemented automatic machine translation across the AV Flexologic website for its international customer base.",
    "Migrated sites between Odoo and Lovable, using Polypane to check every page across devices, verifying copy, assets, and form submissions were all correct after the move.",
    "Diagnosed and resolved cross-browser, cross-device, and layout bugs using browser developer tools to ensure uniform functionality across desktop and mobile.",
    "Took full ownership and documentation of the corporate network infrastructure, managing DNS records, SSL certificates, and routing configurations for over 100 domain properties.",
    "Worked with the IT Manager to troubleshoot internal tools and resolve technical complaints from the team, keeping sites stable and responsive day to day.",
    "Rebuilt the department's digital infrastructure from scratch after most of the team and leadership left shortly after joining. Recovered access to lost accounts, reorganized OneDrive, and restored order to systems nobody had maintained.",
    "Coordinated all technical setup for remote Factory Acceptance Tests (FATs), including OBS, gimbals, and other recording equipment, testing everything in advance to make sure it worked reliably during the test."
  ],
  technicalHighlights: [
    "100+ Domains DNS, SSL & Routing",
    "WordPress -> Odoo & Lovable Migrations",
    "CRM & Lead Pipeline Integrations",
    "Multilingual Machine Translation",
    "Cross-Browser QA & DevTools Profiling",
    "Remote Factory Acceptance Test (FAT) Infrastructure"
  ]
};

