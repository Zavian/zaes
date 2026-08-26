import { Project } from '../types';

export const projects: Project[] = [
  {
    id: "tabletop-toolset",
    title: "Tabletop RPG Toolset",
    subtitle: "Custom Lua/XML Engine & Game Automation Suite for Tabletop Simulator",
    period: "2019 - Present",
    technologies: ["Lua", "XML", "Tabletop Simulator API", "State Machines", "Event Listeners"],
    summary: "A robust software suite built to automate complex game rules, inventory systems, and reactive user interfaces in digital tabletop environments. Maintained since 2019 and currently undergoing a comprehensive 2.0 rewrite.",
    highlights: [
      "Originally engineered for Dungeons & Dragons and expanded to support modern game systems like Daggerheart.",
      "Implements state machines and event-driven architecture to keep multiplayer tabletop instances synchronized in real time.",
      "Features dynamic custom XML/Lua UI elements with responsive state binding and rule automation.",
      "Required deep debugging of networked edge cases, latency desynchronization, and state recovery under volatile multiplayer conditions."
    ],
    detailedContent: {
      overview: [
        "Digital tabletop simulators provide physics and 3D space, but lack native mechanics for complex roleplaying systems. In 2019, I started building a dedicated Lua/XML automation system to eliminate manual record-keeping and speed up gameplay.",
        "Over five years of continuous weekly playtesting, the toolset has evolved from basic dice and modifier scripts into an event-driven framework featuring condition tracking, dynamic turn queues, and combat resolvers.",
        "I am currently developing a complete '2.0' architectural rewrite. The new iteration decouples game rules from Tabletop Simulator's proprietary UI runtime via a modular state-machine pattern, making it straightforward to adapt from D&D 5e to Daggerheart and custom rulesets."
      ],
      architecture: [
        "State Engine: Deterministic finite-state machines managing entity turns, character resource states, and action economies.",
        "UI Layer: Custom XML layouts dynamically hydrated and styled via Lua event hooks.",
        "Sync Protocol: Robust broadcast and listener system managing global vs. player-specific object properties with optimistic local updates.",
        "Debug & Validation Harness: Integrated console logger and state dump tools to diagnose networked desyncs and script execution errors in real time."
      ],
      technicalChallenges: [
        "Network Race Conditions: Resolving simultaneous player actions on shared game objects without crashing the host Lua sandbox.",
        "Memory & Garbage Collection: Optimizing recurring update loops and event listeners to prevent frame drops in physics-heavy 3D scenes.",
        "System Flexibility: Abstracting core combat and inventory mechanics so new rulebooks (like Daggerheart's Hope/Fear dice mechanics) can be plugged in without rewriting the UI."
      ],
      currentStatus: "Active - 2.0 rewrite in progress with modular system abstractions and multi-ruleset support.",
      links: [
        { label: "Tabletop Simulator Scripts (v1)", url: "https://github.com/Zavian/Tabletop-Simulator-Scripts", isExternal: true },
        { label: "Tabletop Simulator Scripts 2.0 (Rewrite)", url: "https://github.com/Zavian/Tabletop-Simulator-Scripts-2.0", isExternal: true }
      ]
    }
  },
  {
    id: "rpg-card-creator",
    title: "RPG Card Creator",
    subtitle: "Interactive Browser-Based Tool for Designing & Exporting Tabletop Cards",
    period: "2019 - Present",
    technologies: ["JavaScript", "HTML5 Canvas", "CSS3", "jQuery", "Bootstrap", "JSON Export"],
    summary: "An adapted, online-focused RPG card generator based on crobi's card system with custom tag support, BBCode formatting, front/back customization, and direct export pipelines for Tabletop Simulator and digital VTTs.",
    highlights: [
      "Dynamic browser rendering of high-resolution printable card templates with customizable borders, icons, and typography.",
      "Pure client-side architecture with data validation, local caching, and JSON import/export schemas.",
      "Integrated export pipelines formatted for direct upload into Tabletop Simulator deck sheets and home printing grids.",
      "Online-focused feature set with direct image uploading and quick tabletop asset generation."
    ],
    detailedContent: {
      overview: [
        "Tabletop games often require quick physical or digital reference cards for custom items, magical spells, and NPC abilities. Existing tools were either bloated, behind paywalls, or lacked export formats optimized for digital VTTs.",
        "RPG Card Creator was built as a lightweight, dependable client-side application adapted from crobi's card generator. It allows users to write formatted text with BBCode tags, select rarity borders, configure stats, and instantly render formatted cards in real time.",
        "The tool handles canvas-based rendering and DOM-to-image exports, ensuring cards print at crisp 300 DPI or export as formatted asset decks ready to be dropped into Tabletop Simulator."
      ],
      keyFeatures: [
        "Live WYSIWYG card preview with dynamic text reflow and badge scaling.",
        "Categorized item templates: Weapons, Armor, Consumables, Spells, and Lore Handouts.",
        "Batch export functionality generating both single-card PNGs and structured deck sheets for Tabletop Simulator.",
        "Client-side persistence storing card libraries in browser storage without requiring external accounts or servers."
      ],
      technicalChallenges: [
        "Text Fitting & Font Metrics: Accurately calculating text bounds and automatically scaling description typography so lengthy lore doesn't overflow card borders.",
        "Cross-Browser Canvas Export: Ensuring clean alpha channel handling and accurate color profiles across Firefox, Safari, and Chromium when exporting high-res images."
      ],
      currentStatus: "Maintained & used weekly for campaign asset generation.",
      links: [
        { label: "Live Card Creator Tool", url: "https://zavian.github.io/generator/generate.html", isExternal: true },
        { label: "GitHub Repository (zavian.github.io)", url: "https://github.com/Zavian/zavian.github.io", isExternal: true }
      ]
    }
  },
  {
    id: "aclorth",
    title: "Campaigns & Narrative Systems",
    subtitle: "Ongoing Tabletop Setting, Interactive World Archive & Lore System",
    period: "2018 - Present",
    technologies: ["Obsidian", "Markdown Knowledge Graph", "Relational Lore Schemas", "Cartography", "Systems Design"],
    summary: "A massive, living fictional universe spanning three consecutive long-term weekly campaigns since 2018. Documented through over 1,000,000 words in a relational Obsidian vault modeling thousands of interconnected factions, characters, locations, and historical variables.",
    highlights: [
      "Three consecutive long-running campaigns with weekly sessions driven by player agency and emergent consequences.",
      "Over 1,000,000 words of cross-linked documentation, lore, political mechanics, and historical chronicles in Obsidian.",
      "Relational system design: Factions, resources, geographic borders, and timelines react dynamically to campaign outcomes.",
      "Structured knowledge management utilizing strict taxonomy, bidirectional links, timeline tracking, and metadata frontmatter."
    ],
    detailedContent: {
      overview: [
        "Beginning in 2017/2018, this universe was engineered around consequences, geopolitical tension, and deep history. Rather than a static fantasy world, it operates as a dynamic ecosystem of competing factions, volatile magical anomalies, and shifting alliances.",
        "Over six years of continuous weekly play across three major campaign arcs, players have directly shaped world history: triggering industrial shifts, toppling dynasties, discovering forgotten technologies, and redrawing regional maps.",
        "Maintaining continuity across this scale required treating worldbuilding like software engineering: using relational schemas, metadata tags, historical changelogs, and strict bidirectional link taxonomy in an Obsidian vault exceeding 1,000,000 words."
      ],
      architecture: [
        "Entity Graph: Over 3,500 interconnected markdown files representing NPCs, factions, settlements, relics, and historical events.",
        "Causality Tracking: Systematic tracking of campaign decisions and chronological ripples affecting distant regions.",
        "Faction Dynamics: Modeled political entities with defined assets, ideological goals, internal fractures, and diplomatic stances.",
        "Cartography & Visuals: Custom regional and continental maps linked directly to geographic codices and trade route data."
      ],
      keyFeatures: [
        "Campaign I: Lament of the Damned - Foundational campaign exploring regional fractures, ancient arcane seals, and the northern borders.",
        "Campaign II: The Dragon Ajax & The Fallen - Focused on the struggle to defeat the dragon Ajax after the demise of the initial party, dealing with multiplanar conflict and ultimately a monstrous faction of dragons.",
        "Campaign III: A Vow of Silk and Steel - Active weekly campaign set in the hidden continent of Astravia, navigating a high-stakes three-way power struggle between The Crown, The Church of the Sacred Flame, and The Academy."
      ],
      currentStatus: "Active weekly campaign ('A Vow of Silk and Steel') and continuous lore archive expansion.",
      links: [
        { label: "Public D&D / World Lore Portal (dnd.zaes.dev)", url: "https://dnd.zaes.dev", isExternal: true }
      ]
    }
  }
];


