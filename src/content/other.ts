import { OtherInterest } from '../types';

export const otherInterests: OtherInterest[] = [
  {
    id: "wow-raid-leadership",
    title: "World of Warcraft: Raid Leadership & Systems Analysis",
    role: "Raid Leader & Systems Coordinator",
    period: "2022 - Present",
    summary: "Led a 25-27 player competitive raiding team to multiple Cutting Edge achievements (clearing mythic difficulty at the highest competitive level). Responsible for real-time strategic shot-calling, log analysis, roster planning, and recruitment pipeline automation.",
    points: [
      "Real-Time Strategy & Execution: Directed high-intensity encounters requiring split-second coordination, positional adaptation, and cooldown management across 20+ simultaneous players.",
      "Combat Data Analytics: Analyzed high-volume encounter logs (WarcraftLogs API) to pinpoint mechanical failures, DPS/HPS pacing bottlenecks, and mitigation timing errors between attempts.",
      "Roster Management & Culture: Maintained a reliable, high-retention 25+ person team across multiple multi-month raid tiers with structured communication and objective performance reviews."
    ],
    automationSystem: {
      title: "Automated Recruitment Pipeline",
      description: "Engineered a serverless recruitment workflow to filter, score, and aggregate prospective applicants automatically without manual spreadsheet overhead.",
      stack: ["Google Forms", "Google Apps Script", "Cloudflare Workers", "WarcraftLogs API", "Discord Webhooks"],
      steps: [
        {
          title: "1. Intake & Validation",
          desc: "Applicant submits character details, previous progression logs, and availability through a structured form."
        },
        {
          title: "2. Edge Processing & Querying",
          desc: "Cloudflare Worker parses character realm/name, queries third-party combat log APIs, and extracts percentile rankings and mechanical error metrics."
        },
        {
          title: "3. Notification & Assessment",
          desc: "Formatted applicant summary card with instant log links and role availability is dispatched to officer channels for review."
        }
      ]
    }
  }
];

