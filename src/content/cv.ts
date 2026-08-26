import { CvData } from '../types';

export const cvData: CvData = {
  name: "Emanuele Sbabo",
  title: "Web Developer & Technical QA Analyst",
  phone: "+31 06 88591797",
  email: "hello@zaes.dev",
  website: "https://zaes.dev",
  github: "https://github.com/Zavian",
  linkedin: "https://www.linkedin.com/in/emanuele-sbabo-5b153b331/",
  location: "Leiden, NL",
  overview: "Web Developer with 2+ years of experience in the Netherlands, currently responsible for the web presence of multiple brands alongside AV Flexologic. I've led platform migrations from Odoo to Lovable, debug cross-browser and cross-device issues using browser DevTools, and manage DNS and SSL configuration for 100+ domains. Outside work I write and script for tabletop RPGs, which has given me a solid grounding in state machines and system logic.",
  
  skills: {
    webFrontend: [
      "HTML5",
      "CSS3",
      "JavaScript (ES6+)",
      "TypeScript (Basic)",
      "jQuery",
      "Bootstrap (v4/v5)",
      "REST APIs",
      "JSON",
      "HTTP/HTTPS"
    ],
    qaDebugging: [
      "Browser DevTools (Console, Network, DOM)",
      "Cross-Browser & Cross-Device Testing",
      "Regression Testing",
      "Test Case & Scenario Writing"
    ],
    infrastructureDevOps: [
      "Git",
      "GitHub (Branching, Merge Requests)",
      "DNS Management",
      "Cloudflare",
      "SSL Configuration"
    ],
    platformsDatabases: [
      "Odoo",
      "Lovable",
      "WordPress",
      "MySQL / SQL (Querying & Data Verification)"
    ],
    scriptingLogic: [
      "Lua",
      "XML",
      "C#",
      "PHP",
      "Python",
      "Tabletop Simulator Modding API"
    ],
    productivityTracking: [
      "Odoo Project Management",
      "Obsidian",
      "Google Workspace",
      "MS Office Suite"
    ]
  },

  experience: [
    {
      company: "AV Flexologic and Color Control Group",
      role: "Web Developer",
      period: "August 2024 - Present",
      location: "Leiden, Netherlands",
      highlights: [
        "Led the full redevelopment of multiple corporate brand presences (AV Flexologic, Tech Sleeves, ColorControl), rebuilding them from outdated 2017-era WordPress into Odoo and later into Lovable, with AV Flexologic and Tech Sleeves deeply integrated with the company CRM.",
        "Implemented automatic machine translation across the AV Flexologic website for its international customer base.",
        "Migrated sites between Odoo and Lovable, using Polypane to check every page across devices, verifying copy, assets, and form submissions were all correct after the move.",
        "Diagnosed and resolved cross-browser, cross-device, and layout bugs using browser developer tools to ensure uniform functionality across desktop and mobile.",
        "Took full ownership and documentation of the corporate network infrastructure, managing DNS records, SSL certificates, and routing configurations for over 100 domain properties.",
        "Worked with the IT Manager to troubleshoot internal tools and resolve technical complaints from the team, keeping sites stable and responsive day to day.",
        "Rebuilt the department's digital infrastructure from scratch after most of the team and leadership left shortly after I joined. Recovered access to lost accounts, reorganized OneDrive, and restored order to systems nobody had maintained.",
        "Coordinated all technical setup for remote Factory Acceptance Tests (FATs), including OBS, gimbals, and other recording equipment, testing everything in advance to make sure it worked reliably during the test."
      ]
    }
  ],

  technicalProjects: [
    {
      name: "Tabletop RPG Automation & Toolset",
      period: "2019 - Present",
      tech: "Lua, XML, Tabletop Simulator API",
      highlights: [
        "Designed and maintained a library of Lua/XML automation tools for a Dungeons & Dragons table in Tabletop Simulator since 2019.",
        "Started a full rewrite (2.0) in late 2025, extending the toolset to also support Daggerheart, still in progress.",
        "Implemented state machines, event listeners, and interactive UI elements via custom XML/Lua scripting to handle complex dynamic game rule logic.",
        "Continuously tested, debugged, and iterated on edge cases to resolve multiplayer sync issues and state desynchronization."
      ]
    },
    {
      name: "Interactive RPG Card Creator & Exporter",
      period: "2019 - Present",
      tech: "JavaScript, jQuery, HTML5, CSS3, Bootstrap",
      highlights: [
        "Developed an interactive web tool allowing users to dynamically design, customize, and generate visual RPG item/spell cards directly in the browser.",
        "Implemented client-side asset rendering and data validation, enabling seamless export and online uploading of generated cards for digital tabletop play."
      ]
    }
  ],

  leadershipExperience: [
    {
      title: "Mythic Raid Leader & Guild Operations",
      context: "World of Warcraft",
      period: "2022 - Present",
      highlights: [
        "Led a 25-27 player competitive team to multiple Cutting Edge titles (awarded to guilds who clear the hardest raid content before the next patch) through fight mechanic dissection, and real-time shot-calling.",
        "Used combat log analysis tools to review raid performance, refine strategy, and inform roster assignments, adjusting the team's approach between attempts based on data and guides.",
        "Built a recruitment pipeline where applicants submitted a form that automatically pulled their combat performance stats from third-party tracking sites, formatted the application, and posted it to team channels for them to review (Google Forms, Google Scripting, Cloudflare Workers)."
      ]
    },
    {
      title: "Narrative Systems & World Architecture",
      context: "RPG Writing, world building, game design",
      period: "2018 - Present",
      highlights: [
        "Structured, cross-referenced, and maintained an interconnected documentation system tracking thousands of entities, quest variables, factions, and world states.",
        "Ran long-term weekly interactive tabletop campaigns across three consecutive campaigns since 2018, managing multi-path player agency and reactive world states."
      ]
    }
  ],

  languages: [
    { language: "Italian", level: "Native" },
    { language: "English", level: "Full Professional Proficiency (daily professional and technical use)" },
    { language: "Dutch / French / Spanish", level: "Elementary / Basic comprehension" }
  ],

  education: [
    {
      degree: "High School Diploma in Computer Science",
      institution: 'ITT "G. Chilesotti"',
      location: "Thiene (Vicenza), Italy",
      period: "A.Y. 2014/2015",
      academicYear: "A.Y. 2014/2015",
      description: "Formal technical computer science diploma with focus on software development, algorithms, networking, systems architecture, and database logic."
    }
  ],

  references: "References available upon request."
};

