import { UserProfile, EnergyRecord, ForumPost, EnergyChallenge, PMEStatus, ChatMessage, SystemThreshold } from "./types";

// User Personas Profiles
export const defaultProfiles: Record<string, UserProfile> = {
  kofi: {
    id: "kofi",
    name: "Kofi Amon",
    email: "kofi.amon@grandsud.ci",
    role: "Directeur Technique & Gérant",
    energyChampionName: "Alex Yao (Superviseur Maintenance)",
    phone: "+225 07 48 93 12 45",
    companyName: "Hôtel Le Grand Sud",
    industry: "hotel",
    location: "Zone 4",
    employeeCount: 45
  },
  mariame: {
    id: "mariame",
    name: "Mariame Tanoh",
    email: "m.tanoh@deuxplateauxcentre.ci",
    role: "Facility Manager & Responsable Administrative",
    energyChampionName: "Hermann Kouadio (Électricien Pro)",
    phone: "+225 05 66 18 20 90",
    companyName: "Marcory Business Center",
    industry: "office",
    location: "Marcory Center",
    employeeCount: 15
  },
  newuser: {
    id: "newuser",
    name: "M. Diallo",
    email: "diallo@grandbazar.ci",
    role: "Propriétaire",
    energyChampionName: "",
    phone: "+225 01 02 03 44 55",
    companyName: "Le Grand Bazar Cocody",
    industry: "supermarket",
    location: "Cocody",
    employeeCount: 22
  },
  vierge: {
    id: "vierge",
    name: "",
    email: "",
    role: "",
    energyChampionName: "",
    phone: "",
    companyName: "",
    industry: "other",
    location: "",
    employeeCount: 0
  }
};

// Energy Records history for Kofi's Hotel (rolling 12-month cumulative ~882 MWh - Critical Alert near 1000 MWh)
export const kofiEnergyRecords: EnergyRecord[] = [
  { id: "k1", month: "Janvier", year: 2026, cieKWh: 68000, cieCostFCFA: 6800000, gasoilLitres: 1200, gasoilCostFCFA: 960000, totalMWh: 80.0 },
  { id: "k2", month: "Février", year: 2026, cieKWh: 72000, cieCostFCFA: 7200000, gasoilLitres: 1400, gasoilCostFCFA: 1120000, totalMWh: 86.0 },
  { id: "k3", month: "Mars", year: 2026, cieKWh: 79000, cieCostFCFA: 7900000, gasoilLitres: 1600, gasoilCostFCFA: 1280000, totalMWh: 95.0 },
  { id: "k4", month: "Avril", year: 2026, cieKWh: 84000, cieCostFCFA: 8400000, gasoilLitres: 1100, gasoilCostFCFA: 880000, totalMWh: 95.0 },
  { id: "k5", month: "Mai", year: 2026, cieKWh: 82000, cieCostFCFA: 8200000, gasoilLitres: 1300, gasoilCostFCFA: 1040000, totalMWh: 95.0 },
  { id: "k6", month: "Juin", year: 2026, cieKWh: 60000, cieCostFCFA: 6000000, gasoilLitres: 2100, gasoilCostFCFA: 1680000, totalMWh: 81.0 }, // early June estimate
  { id: "k7", month: "Juillet", year: 2025, cieKWh: 55000, cieCostFCFA: 5500000, gasoilLitres: 950, gasoilCostFCFA: 760000, totalMWh: 64.5 },
  { id: "k8", month: "Août", year: 2025, cieKWh: 52000, cieCostFCFA: 5200000, gasoilLitres: 1100, gasoilCostFCFA: 880000, totalMWh: 63.0 },
  { id: "k9", month: "Septembre", year: 2025, cieKWh: 61000, cieCostFCFA: 6100000, gasoilLitres: 1200, gasoilCostFCFA: 960000, totalMWh: 73.0 },
  { id: "k10", month: "Octobre", year: 2025, cieKWh: 67000, cieCostFCFA: 6700000, gasoilLitres: 1300, gasoilCostFCFA: 1040000, totalMWh: 80.0 },
  { id: "k11", month: "Novembre", year: 2025, cieKWh: 70000, cieCostFCFA: 7000000, gasoilLitres: 1050, gasoilCostFCFA: 840000, totalMWh: 80.5 },
  { id: "k12", month: "Décembre", year: 2025, cieKWh: 75000, cieCostFCFA: 7500000, gasoilLitres: 1400, gasoilCostFCFA: 1120000, totalMWh: 89.0 },
];

// Energy Records history for Mariame's Office Center (rolling 12-month cumulative ~1 052 MWh - Crossed Threshold, needs declaration)
export const mariameEnergyRecords: EnergyRecord[] = [
  { id: "m1", month: "Janvier", year: 2026, cieKWh: 85000, cieCostFCFA: 8500000, gasoilLitres: 1500, gasoilCostFCFA: 1200000, totalMWh: 100.0 },
  { id: "m2", month: "Février", year: 2026, cieKWh: 89000, cieCostFCFA: 8900000, gasoilLitres: 1800, gasoilCostFCFA: 1440000, totalMWh: 107.0 },
  { id: "m3", month: "Mars", year: 2026, cieKWh: 94000, cieCostFCFA: 9400000, gasoilLitres: 2200, gasoilCostFCFA: 1760000, totalMWh: 116.0 },
  { id: "m4", month: "Avril", year: 2026, cieKWh: 91000, cieCostFCFA: 9100000, gasoilLitres: 1600, gasoilCostFCFA: 1280000, totalMWh: 107.0 },
  { id: "m5", month: "Mai", year: 2026, cieKWh: 88000, cieCostFCFA: 8800000, gasoilLitres: 1900, gasoilCostFCFA: 1520000, totalMWh: 107.0 },
  { id: "m6", month: "Juin", year: 2026, cieKWh: 75000, cieCostFCFA: 7500000, gasoilLitres: 3100, gasoilCostFCFA: 2480000, totalMWh: 106.0 }, // High June fuel due to power outages
  { id: "m7", month: "Juillet", year: 2025, cieKWh: 68000, cieCostFCFA: 6800000, gasoilLitres: 1200, gasoilCostFCFA: 960000, totalMWh: 80.0 },
  { id: "m8", month: "Août", year: 2025, cieKWh: 64000, cieCostFCFA: 6400000, gasoilLitres: 1400, gasoilCostFCFA: 1120000, totalMWh: 78.0 },
  { id: "m9", month: "Septembre", year: 2025, cieKWh: 72000, cieCostFCFA: 7200000, gasoilLitres: 1300, gasoilCostFCFA: 1040000, totalMWh: 85.0 },
  { id: "m10", month: "Octobre", year: 2025, cieKWh: 78000, cieCostFCFA: 7800000, gasoilLitres: 1600, gasoilCostFCFA: 1280000, totalMWh: 94.0 },
  { id: "m11", month: "Novembre", year: 2025, cieKWh: 80000, cieCostFCFA: 8000000, gasoilLitres: 1800, gasoilCostFCFA: 1440000, totalMWh: 98.0 },
  { id: "m12", month: "Décembre", year: 2025, cieKWh: 81000, cieCostFCFA: 8100000, gasoilLitres: 1700, gasoilCostFCFA: 1360000, totalMWh: 98.0 },
];

// New User blank initial records
export const newUserPageRecords: EnergyRecord[] = [
  { id: "n1", month: "Janvier", year: 2026, cieKWh: 21000, cieCostFCFA: 2100000, gasoilLitres: 400, gasoilCostFCFA: 320000, totalMWh: 25.0 },
  { id: "n2", month: "Février", year: 2026, cieKWh: 23000, cieCostFCFA: 2300000, gasoilLitres: 500, gasoilCostFCFA: 400000, totalMWh: 28.0 },
  { id: "n3", month: "Mars", year: 2026, cieKWh: 24000, cieCostFCFA: 2400000, gasoilLitres: 450, gasoilCostFCFA: 360000, totalMWh: 28.5 },
];

// Blank slate: genuinely empty account with no pre-filled history
export const vergeEnergyRecords: EnergyRecord[] = [];

// Forum discussions
export const initialForumPosts: ForumPost[] = [
  {
    id: "f1",
    author: "M. Koffi",
    company: "Hôtel Le Grand Sud",
    role: "Gérant",
    content: "Bonjour à tous, face à l'Arrêté 156, notre établissement s'approche dangereusement des 1 000 MWh/an. J'ai calculé que la climatisation représente plus de 55% de nos frais CIE ! Des collègues hôteliers de Zone 4 ont-ils des astuces concrètes ?",
    likes: 12,
    commentsCount: 4,
    tags: ["Climatisation", "Hôtellerie", "Zone 4", "Arrêté 156"],
    date: "Il y a 2 jours"
  },
  {
    id: "f2",
    author: "Mme Aka",
    company: "Hôtel Emeraude",
    role: "Responsable Administrative",
    content: "Pour pallier les micro-coupures d'Abidjan tout en optimisant notre calcul réglementaire, on a mis en place un planning d'arrêt alterné des refroidisseurs. Notre gardien note enfin précisément le litrage du gasoil sur l'app plutôt que sur un cahier d'atelier qui se perd !",
    likes: 18,
    commentsCount: 6,
    tags: ["Gasoil", "Groupes Électrogènes", "Organisation"],
    date: "Il y a 3 jours"
  },
  {
    id: "f3",
    author: "M. Bakayoko",
    company: "Alimentation Générale Bietry",
    role: "Propriétaire",
    content: "Est-ce que quelqu'un sait si les sous-compteurs de nos locataires dans un même espace commercial doivent être inclus dans la déclaration globale DGE ou s'ils déclarent séparément ?",
    likes: 5,
    commentsCount: 3,
    tags: ["Législation", "Sous-Compteurs", "Bietry"],
    date: "Il y a 5 jours"
  }
];

// Eco-saving challenges in Abidjan
export const initialChallenges: EnergyChallenge[] = [
  {
    id: "c1",
    title: "Chasse aux Veilles Nocturnes",
    description: "Éteignez tous les écrans, serveurs non-critiques et enseignes de Marcory et Cocody entre 22h et 6h pendant 30 jours.",
    targetReduction: 8,
    daysRemaining: 12,
    participantsCount: 34,
    joined: false,
    rewardBadge: "Éco-Veilleur d'Or 🎖️"
  },
  {
    id: "c2",
    title: "Thermostat Abidjan à 24°C",
    description: "Bloquez la climatisation de tous les bureaux sur un seuil éco à 24°C ou plus. Un nettoyage complet des filtres est requis.",
    targetReduction: 12,
    daysRemaining: 18,
    participantsCount: 56,
    joined: true,
    rewardBadge: "Maître du Climat Éco ❄️"
  },
  {
    id: "c3",
    title: "Souveraineté Sans Gasoil",
    description: "Réduire de 15% le recours au groupe de secours via des délestages de confort consentis dans les parties communes.",
    targetReduction: 15,
    daysRemaining: 5,
    participantsCount: 19,
    joined: false,
    rewardBadge: "Champion Carbon-Clean ⛽"
  }
];

// Prepopulated list of Abidjan companies for DGE Admin Perspective
export const initialPMEStatusList: PMEStatus[] = [
  {
    id: "p1",
    companyName: "Hôtel Le Grand Sud",
    industry: "hotel",
    location: "Zone 4",
    contactName: "Kofi Amon",
    contactEmail: "kofi.amon@grandsud.ci",
    ytdTotalMWh: 982.0, // = somme des 12 relevés de kofiEnergyRecords (cohérent avec le tableau de bord)
    cieCostYTD: 82500000,
    gasoilCostYTD: 12560000,
    complianceState: "Alerte de niveau critique",
    submittedReport: false,
    designatedChampion: true
  },
  {
    id: "p2",
    companyName: "Marcory Business Center",
    industry: "office",
    location: "Marcory Center",
    contactName: "Mariame Tanoh",
    contactEmail: "m.tanoh@deuxplateauxcentre.ci",
    ytdTotalMWh: 1176.0, // = somme des 12 relevés de mariameEnergyRecords (cohérent avec le tableau de bord)
    cieCostYTD: 96500000,
    gasoilCostYTD: 16880000,
    complianceState: "En infraction", // Above 1000 MWh but hasn't finalized reporting yet!
    submittedReport: false,
    designatedChampion: true
  },
  {
    id: "p3",
    companyName: "Alimentation Générale Bietry",
    industry: "supermarket",
    location: "Bietry",
    contactName: "M. Bakayoko",
    contactEmail: "bakayoko@alim-bietry.ci",
    ytdTotalMWh: 450.3,
    cieCostYTD: 38275500, // recalculé (répartition ~85% CIE / 15% gasoil, cohérente avec les prix unitaires de l'app)
    gasoilCostYTD: 5403600,
    complianceState: "Conforme",
    submittedReport: true,
    designatedChampion: false
  },
  {
    id: "p4",
    companyName: "Résidence Prestige",
    industry: "hotel",
    location: "Cocody Mermoz",
    contactName: "Mme Diarra",
    contactEmail: "diarra@prestige-mermoz.ci",
    ytdTotalMWh: 981.2,
    cieCostYTD: 83402000, // recalculé (répartition ~85% CIE / 15% gasoil, cohérente avec les prix unitaires de l'app)
    gasoilCostYTD: 11774400,
    complianceState: "Alerte de niveau critique",
    submittedReport: false,
    designatedChampion: true
  },
  {
    id: "p5",
    companyName: "Carrefour Supermarché",
    industry: "supermarket",
    location: "Cocody Riviera",
    contactName: "Directeur Énergie Club",
    contactEmail: "energy@carrefour.ci",
    ytdTotalMWh: 1450.0,
    cieCostYTD: 123250000, // recalculé (répartition ~85% CIE / 15% gasoil, cohérente avec les prix unitaires de l'app)
    gasoilCostYTD: 17400000,
    complianceState: "Conforme", // Above 1000 MWh and already submitted their DGE documentation!
    submittedReport: true,
    designatedChampion: true
  },
  {
    id: "p6",
    companyName: "Hôtel l'Émeraude",
    industry: "hotel",
    location: "Zone 4",
    contactName: "Mme Aka",
    contactEmail: "aka@emeraude.ci",
    ytdTotalMWh: 710.4,
    cieCostYTD: 60384000, // recalculé (répartition ~85% CIE / 15% gasoil, cohérente avec les prix unitaires de l'app)
    gasoilCostYTD: 8524800,
    complianceState: "Alerte modérée",
    submittedReport: false,
    designatedChampion: false
  }
];

// Default advisory initial chat logs
export const initialChatsByProfile: Record<string, ChatMessage[]> = {
  kofi: [
    { id: "ch1", role: "assistant", content: "Bonjour M. Kofi Amon. Je suis Seka, votre conseiller intelligent DGE. J'analyse vos consommations cumulées de l'Hôtel Le Grand Sud (Zone 4) actuellement mesurées à 882.5 MWh/an. Vous êtes à 88% de la limite de l'Arrêté 156. Comment puis-je vous aider aujourd'hui à optimiser votre clim ou votre déclaration ?", timestamp: "10:00" },
  ],
  mariame: [
    { id: "ch1", role: "assistant", content: "Bienvenue Mme Mariame Tanoh. Marcory Business Center a franchi le palier de l'Arrêté 156 avec 1052 MWh de consommation électrique (CIE) et thermique (Gasoil) consolidée. Pour éviter l'amende de 5 000 000 FCFA, nous devons générer votre rapport de conformité technique de la DGE avant le 31 janvier. Je suis à votre service pour vous guider pas-à-pas.", timestamp: "11:15" },
  ],
  newuser: [
    { id: "ch1", role: "assistant", content: "Bienvenue sur votre espace d'efficacité énergétique souveraine. Pour commencer à dialoguer, saisissez quelques relevés de compteurs dans l'onglet Statistiques, ou posez-moi des questions sur les obligations réglementaires de l'Arrêté 156 à Abidjan.", timestamp: "12:00" }
  ],
  vierge: [
    { id: "ch1", role: "assistant", content: "Bonjour ! Je suis Seka, votre conseiller DGE. Votre compte est vierge : aucune donnée n'est pré-remplie. Complétez d'abord votre profil dans l'onglet Profil, puis saisissez votre premier relevé CIE et gasoil dans l'onglet Statistiques pour que je puisse suivre votre conformité à l'Arrêté 156.", timestamp: "09:00" }
  ]
};

// Default regulatory constants
export const defaultSystemThreshold: SystemThreshold = {
  regulationName: "Arrêté Ministériel N°156 / DGE du 8 Juin 2026",
  mwhLimit: 1000,
  fineAmountFCFA: 5000000,
  reportingDeadline: "31 Janvier"
};
