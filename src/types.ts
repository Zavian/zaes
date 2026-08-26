export interface Project {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  technologies: string[];
  summary: string;
  highlights: string[];
  detailedContent?: {
    overview: string[];
    architecture?: string[];
    technicalChallenges?: string[];
    keyFeatures?: string[];
    currentStatus?: string;
    links?: { label: string; url: string; isExternal?: boolean }[];
  };
}

export interface WorkExperience {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  brands: string[];
  responsibilities: string[];
  technicalHighlights: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface OtherInterest {
  id: string;
  title: string;
  role: string;
  period: string;
  summary: string;
  points: string[];
  automationSystem?: {
    title: string;
    description: string;
    stack: string[];
    steps: { title: string; desc: string }[];
  };
}

export interface CvData {
  name: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  github: string;
  linkedin: string;
  location: string;
  overview: string;
  skills: {
    webFrontend: string[];
    qaDebugging: string[];
    infrastructureDevOps: string[];
    platformsDatabases: string[];
    scriptingLogic: string[];
    productivityTracking: string[];
  };
  experience: {
    company: string;
    role: string;
    period: string;
    location: string;
    highlights: string[];
  }[];
  technicalProjects: {
    name: string;
    period: string;
    tech: string;
    highlights: string[];
  }[];
  leadershipExperience: {
    title: string;
    context: string;
    period: string;
    highlights: string[];
  }[];
  languages: {
    language: string;
    level: string;
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    period: string;
    academicYear?: string;
    description?: string;
  }[];
  references: string;
}
