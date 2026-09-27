export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  energyChampionName: string;
  phone: string;
  companyName: string;
  industry: string; // 'hotel' | 'supermarket' | 'office' | 'other'
  location: string; // 'Zone 4' | 'Marcory' | 'Cocody' | 'Deux Plateaux' | etc.
  employeeCount: number;
}

export interface EnergyRecord {
  id: string;
  month: string; // 'Janvier', 'Février', etc.
  year: number;
  cieKWh: number;
  cieCostFCFA: number;
  gasoilLitres: number;
  gasoilCostFCFA: number;
  totalMWh: number; // calculated as (cieKWh + gasoilLitres * 10) / 1000
}

export interface ForumPost {
  id: string;
  author: string;
  company: string;
  role: string;
  content: string;
  likes: number;
  commentsCount: number;
  tags: string[];
  date: string;
}

export interface EnergyChallenge {
  id: string;
  title: string;
  description: string;
  targetReduction: number; // percentage
  daysRemaining: number;
  participantsCount: number;
  joined: boolean;
  rewardBadge: string;
}

export interface PMEStatus {
  id: string;
  companyName: string;
  industry: string;
  location: string;
  contactName: string;
  contactEmail: string;
  ytdTotalMWh: number;
  cieCostYTD: number;
  gasoilCostYTD: number;
  complianceState: "Conforme" | "Alerte modérée"| "Alerte de niveau critique" | "En infraction";
  submittedReport: boolean;
  designatedChampion: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SystemThreshold {
  regulationName: string;
  mwhLimit: number;
  fineAmountFCFA: number;
  reportingDeadline: string;
}
