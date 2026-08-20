export type StartupType = 'Startup' | 'Scale-up' | 'Unicorn' | 'Bootstrapped' | 'Public';

export type StartupStage = 'Idea' | 'Pre-seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C+' | 'Growth';

export type SectorType = 
  | 'AI / ML'
  | 'SaaS'
  | 'FinTech'
  | 'EdTech'
  | 'HealthTech'
  | 'Cybersecurity'
  | 'DeepTech'
  | 'EV'
  | 'ClimateTech'
  | 'AgriTech'
  | 'E-commerce'
  | 'D2C'
  | 'Logistics'
  | 'PropTech'
  | 'Gaming'
  | 'Web3'
  | 'Robotics'
  | 'IoT';

export type WorkMode = 'Remote' | 'On-site' | 'Hybrid';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export interface FundingRound {
  id: string;
  roundType: StartupStage;
  amount: string;
  date: string;
  leadInvestors: string[];
  valuation?: string;
}

export interface FounderRef {
  id: string;
  name: string;
  slug: string;
  role: string;
  photo: string;
  linkedin?: string;
  twitter?: string;
}

export interface Startup {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription?: string;
  logo: string;
  website: string;
  foundedYear: number;
  type: StartupType;
  stage: StartupStage;
  areaId: string;
  areaName: string;
  address: string;
  latitude: number;
  longitude: number;
  employeeRange: string;
  totalFunding: string;
  fundingRounds: FundingRound[];
  techStack: string[];
  linkedin: string;
  twitter?: string;
  github?: string;
  verified: boolean;
  hiring: boolean;
  sectors: SectorType[];
  founders: FounderRef[];
  products?: {
    name: string;
    description: string;
  }[];
  jobsCount: number;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Founder {
  id: string;
  name: string;
  slug: string;
  photo: string;
  coverImage?: string;
  role: string;
  startupId: string;
  startupName: string;
  startupSlug: string;
  startupLogo?: string;
  bio: string;
  linkedin: string;
  twitter?: string;
  github?: string;
  email?: string;
  sectors: SectorType[];
  stage: StartupStage;
  location: string;
  areaId: string;
  previousCompanies?: string[];
  education?: string;
  skills: string[];
  verified: boolean;
}

export interface Investor {
  id: string;
  name: string;
  slug: string;
  logo: string;
  type: 'Venture Capital' | 'Angel Syndicate' | 'Micro VC' | 'Family Office' | 'Corporate VC';
  stages: StartupStage[];
  focusSectors: SectorType[];
  location: string;
  checkSize: string;
  portfolioCompanies: {
    name: string;
    slug?: string;
    logo?: string;
    sector: SectorType;
  }[];
  website: string;
  linkedin: string;
  description: string;
  totalInvestments: number;
}

export interface Job {
  id: string;
  title: string;
  startupId: string;
  startupName: string;
  startupSlug: string;
  startupLogo: string;
  location: string;
  areaName: string;
  workMode: WorkMode;
  type: JobType;
  experience: string;
  salaryRange: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  postedDate: string;
  isFresherFriendly: boolean;
  isInternship: boolean;
  applyUrl?: string;
  contactEmail: string;
}

export interface Area {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  city: 'Noida' | 'Greater Noida' | 'Yamuna Expressway';
  description: string;
  startupCount: number;
  hiringCount: number;
  topSectors: SectorType[];
  latitude: number;
  longitude: number;
  popularHubs: string[];
  connectivity: string;
}

export interface Submission {
  id: string;
  companyName: string;
  tagline: string;
  website: string;
  foundedYear: number;
  type: StartupType;
  stage: StartupStage;
  sector: SectorType;
  areaId: string;
  areaName: string;
  address: string;
  founderName: string;
  founderRole: string;
  founderEmail: string;
  founderLinkedin: string;
  employeeRange: string;
  totalFunding: string;
  description: string;
  techStack: string;
  hiring: boolean;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface Bookmark {
  id: string;
  type: 'startup' | 'job' | 'founder' | 'investor';
  itemId: string;
  createdAt: string;
}

export interface StartupFilterState {
  search: string;
  area: string;
  sector: string;
  stage: string;
  type: string;
  verifiedOnly: boolean;
  hiringOnly: boolean;
  sortBy: 'recent' | 'funded' | 'hiring' | 'alphabetical' | 'relevance';
}

export interface FounderFilterState {
  search: string;
  sector: string;
  stage: string;
  location: string;
}

export interface JobFilterState {
  search: string;
  role: string;
  workMode: string;
  experience: string;
  isFresher: boolean;
  isInternship: boolean;
  area: string;
}

export interface EcosystemStats {
  totalStartups: number;
  totalFounders: number;
  totalInvestors: number;
  totalIncubators: number;
  totalJobs: number;
  totalFundingDisclosed: string;
  hiringStartupsCount: number;
  sectorBreakdown: { sector: SectorType; count: number; percentage: number }[];
  stageBreakdown: { stage: StartupStage; count: number; percentage: number }[];
  areaBreakdown: { areaName: string; count: number; hiringCount: number }[];
  fundingTimeline: { year: number; amountMillions: number; dealsCount: number }[];
}
