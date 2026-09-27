import React, { useState, useRef } from "react";
import { 
  Building2, 
  Settings, 
  User, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Users, 
  Download, 
  PlusCircle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  Flame, 
  Zap, 
  ShieldAlert, 
  Coins, 
  TrendingDown, 
  Camera, 
  Loader2, 
  Compass, 
  Bell, 
  Sliders,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  LockKeyhole,
  RotateCcw,
  Calculator,
  MapPin,
  Snowflake,
  Lightbulb,
  Gauge,
  Menu,
  X
} from "lucide-react";
import { UserProfile, EnergyRecord, ForumPost, EnergyChallenge, PMEStatus, SystemThreshold, ChatMessage } from "./types";
import { defaultProfiles, kofiEnergyRecords, mariameEnergyRecords, newUserPageRecords, vergeEnergyRecords, initialForumPosts, initialChallenges, initialPMEStatusList, defaultSystemThreshold, initialChatsByProfile } from "./data";

const MONTH_ORDER = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const getRecordTime = (record: EnergyRecord) =>
  record.year * 12 + MONTH_ORDER.indexOf(record.month);

const getLatestRecords = (records: EnergyRecord[], count: number) =>
  [...records].sort((a, b) => getRecordTime(b) - getRecordTime(a)).slice(0, count);

type InfrastructureType = "hotel" | "office" | "supermarket" | "restaurant" | "warehouse";

type SiteEstimate = {
  id: string;
  siteName: string;
  infrastructureType: InfrastructureType;
  areaM2: number;
  operatingHoursPerDay: number;
  acUnits: number;
  coldRooms: number;
  generatorHoursPerMonth: number;
  annualCieMWh: number;
  annualGasoilMWh: number;
  totalAnnualMWh: number;
};

const infrastructureProfiles: Record<InfrastructureType, {
  label: string;
  baseKWhPerM2Year: number;
  defaultHours: number;
  acKWhPerHour: number;
  coldRoomKWhPerDay: number;
}> = {
  hotel: {
    label: "Hôtel / résidence",
    baseKWhPerM2Year: 145,
    defaultHours: 18,
    acKWhPerHour: 1.6,
    coldRoomKWhPerDay: 18,
  },
  office: {
    label: "Bureaux / centre d'affaires",
    baseKWhPerM2Year: 95,
    defaultHours: 10,
    acKWhPerHour: 1.35,
    coldRoomKWhPerDay: 4,
  },
  supermarket: {
    label: "Supermarché / commerce",
    baseKWhPerM2Year: 185,
    defaultHours: 14,
    acKWhPerHour: 1.5,
    coldRoomKWhPerDay: 32,
  },
  restaurant: {
    label: "Restaurant / maquis",
    baseKWhPerM2Year: 135,
    defaultHours: 12,
    acKWhPerHour: 1.4,
    coldRoomKWhPerDay: 24,
  },
  warehouse: {
    label: "Entrepôt / atelier",
    baseKWhPerM2Year: 65,
    defaultHours: 9,
    acKWhPerHour: 1.15,
    coldRoomKWhPerDay: 14,
  },
};

const formatFCFA = (value: number) => `${value.toLocaleString('fr-FR')} FCFA`;
const formatMWh = (value: number) => `${value.toFixed(1)} MWh`;

export default function App() {
  // Navigation & Screen States
  const [currentScreen, setCurrentScreen] = useState<"splash" | "onboarding" | "auth" | "twoFactor" | "app" | "admin">("splash");
  const [currentTab, setCurrentTab] = useState<"dashboard" | "stats" | "calculator" | "alerts" | "advisor" | "community" | "settings" | "seka">("dashboard");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication & Session States
  const [selectedPersona, setSelectedPersona] = useState<"kofi" | "mariame" | "newuser" | "vierge">("kofi");
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfiles.kofi);
  const [energyRecords, setEnergyRecords] = useState<EnergyRecord[]>(kofiEnergyRecords);
  
  // Custom Registration / Inputs State
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCompanyName, setAuthCompanyName] = useState("");
  const [authLocation, setAuthLocation] = useState("Zone 4, Abidjan");
  const [isSignUp, setIsSignUp] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("246810");
  const [twoFactorInput, setTwoFactorInput] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [twoFactorSentAt, setTwoFactorSentAt] = useState("");

  // Quick entry for new record
  const [newMonth, setNewMonth] = useState("Juillet");
  const [newYear, setNewYear] = useState(2026);
  const [newCieKWh, setNewCieKWh] = useState("");
  const [newCieFCFA, setNewCieFCFA] = useState("");
  const [newGasoilLitres, setNewGasoilLitres] = useState("");
  const [newGasoilFCFA, setNewGasoilFCFA] = useState("");

  // Infrastructure calculator
  const [siteName, setSiteName] = useState("Site principal");
  const [infrastructureType, setInfrastructureType] = useState<InfrastructureType>("hotel");
  const [siteAreaM2, setSiteAreaM2] = useState(850);
  const [operatingHoursPerDay, setOperatingHoursPerDay] = useState(infrastructureProfiles.hotel.defaultHours);
  const [acUnits, setAcUnits] = useState(18);
  const [coldRooms, setColdRooms] = useState(2);
  const [generatorHoursPerMonth, setGeneratorHoursPerMonth] = useState(18);
  const [siteEstimates, setSiteEstimates] = useState<SiteEstimate[]>([]);

  // Community States
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(initialForumPosts);
  const [newForumText, setNewForumText] = useState("");
  const [newForumTags, setNewForumTags] = useState("");
  const [challenges, setChallenges] = useState<EnergyChallenge[]>(initialChallenges);

  // Admin DGE States
  const [adminThreshold, setAdminThreshold] = useState<SystemThreshold>(defaultSystemThreshold);
  const [pmeStatusList, setPmeStatusList] = useState<PMEStatus[]>(initialPMEStatusList);
  const [adminSearchCompany, setAdminSearchCompany] = useState("");
  const [newDGEAnnouncement, setNewDGEAnnouncement] = useState("");
  const [adminReplies, setAdminReplies] = useState<Record<string, string>>({});
  const [activeAdminPME, setActiveAdminPME] = useState<PMEStatus | null>(null);

  // Chatbot Seka states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatsByProfile["kofi"]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Notification center alerts simulation
  const [systemNotifications, setSystemNotifications] = useState<string[]>([
    "DGE: Les rapports officiels d'homologation pour l'Arrêté 156 doivent être déposés avant le 31 janvier.",
    "Baisse de tension signalée sur le réseau moyenne tension à Marcory (Zone 4) le 8 juin.",
  ]);

  // Sync profile when selected persona changes during demo
  const handlePersonaSwitch = (personaKey: "kofi" | "mariame" | "newuser" | "vierge") => {
    setSelectedPersona(personaKey);
    setUserProfile(defaultProfiles[personaKey]);
    setChatMessages(initialChatsByProfile[personaKey] || initialChatsByProfile["newuser"]);
    setChatInput("");
    if (personaKey === "kofi") {
      setEnergyRecords(kofiEnergyRecords);
    } else if (personaKey === "mariame") {
      setEnergyRecords(mariameEnergyRecords);
    } else if (personaKey === "newuser") {
      setEnergyRecords(newUserPageRecords);
    } else {
      // Compte vierge : aucun relevé pré-rempli
      setEnergyRecords(vergeEnergyRecords);
    }
  };

  const handleTabChange = (tab: typeof currentTab) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  const generateTwoFactorCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const startTwoFactorChallenge = () => {
    const code = generateTwoFactorCode();
    setTwoFactorCode(code);
    setTwoFactorInput("");
    setTwoFactorError("");
    setTwoFactorSentAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setCurrentScreen("twoFactor");
  };

  // Calculations for current user: DGE indicators use the latest 12 monthly records.
  const complianceRecords = getLatestRecords(energyRecords, 12);
  const chartRecords = [...getLatestRecords(energyRecords, 8)].reverse();
  const totalCieKWh = complianceRecords.reduce((acc, r) => acc + r.cieKWh, 0);
  const totalCieCostFCFA = complianceRecords.reduce((acc, r) => acc + r.cieCostFCFA, 0);
  const totalGasoilLitres = complianceRecords.reduce((acc, r) => acc + r.gasoilLitres, 0);
  const totalGasoilCostFCFA = complianceRecords.reduce((acc, r) => acc + r.gasoilCostFCFA, 0);
  const totalMWh = complianceRecords.reduce((acc, r) => acc + r.totalMWh, 0);
  
  // Projected annual consumption based on current records size
  const currentMonthsCount = complianceRecords.length;
  const projectedAnnualMWh = currentMonthsCount > 0 ? (totalMWh / currentMonthsCount) * 12 : 0;
  
  // DGE Compliance Level & Warning Status
  const criticalLimit = adminThreshold.mwhLimit; // 1000 MWh
  const percentageOfLimit = (totalMWh / criticalLimit) * 100;

  // ROI & Économies: comparaison du dernier relevé vs le précédent
  const sortedByTimeDesc = [...energyRecords].sort((a, b) => getRecordTime(b) - getRecordTime(a));
  const latestRecord = sortedByTimeDesc[0];
  const previousRecord = sortedByTimeDesc[1];
  const latestTotalCostFCFA = latestRecord ? latestRecord.cieCostFCFA + latestRecord.gasoilCostFCFA : 0;
  const previousTotalCostFCFA = previousRecord ? previousRecord.cieCostFCFA + previousRecord.gasoilCostFCFA : 0;
  const savingsFCFA = previousRecord ? previousTotalCostFCFA - latestTotalCostFCFA : 0;
  const savingsPercent = previousTotalCostFCFA > 0 ? (savingsFCFA / previousTotalCostFCFA) * 100 : 0;

  const activeInfrastructure = infrastructureProfiles[infrastructureType];
  const usageFactor = Math.max(0.45, operatingHoursPerDay / activeInfrastructure.defaultHours);
  const estimatedBaseKWh = siteAreaM2 * activeInfrastructure.baseKWhPerM2Year * usageFactor;
  const estimatedAcKWh = acUnits * activeInfrastructure.acKWhPerHour * operatingHoursPerDay * 312;
  const estimatedColdKWh = coldRooms * activeInfrastructure.coldRoomKWhPerDay * 365;
  const estimatedGeneratorLitres = generatorHoursPerMonth * 12 * Math.max(6, siteAreaM2 / 120);
  const estimatedGasoilKWh = estimatedGeneratorLitres * 10;
  const estimatedAnnualCieMWh = (estimatedBaseKWh + estimatedAcKWh + estimatedColdKWh) / 1000;
  const estimatedAnnualGasoilMWh = estimatedGasoilKWh / 1000;
  const estimatedAnnualSiteMWh = estimatedAnnualCieMWh + estimatedAnnualGasoilMWh;
  const siteLimitPercentage = (estimatedAnnualSiteMWh / criticalLimit) * 100;
  const allSitesAnnualMWh = siteEstimates.reduce((acc, site) => acc + site.totalAnnualMWh, 0);
  const largestSavedSite = siteEstimates.reduce<SiteEstimate | null>((largest, site) => {
    if (!largest || site.totalAnnualMWh > largest.totalAnnualMWh) return site;
    return largest;
  }, null);
  const referenceSiteName = largestSavedSite?.siteName || siteName || "Site en cours";
  const referenceSiteMWh = largestSavedSite?.totalAnnualMWh || estimatedAnnualSiteMWh;
  const referenceSiteType = largestSavedSite
    ? infrastructureProfiles[largestSavedSite.infrastructureType].label
    : activeInfrastructure.label;

  const targetedAdvice = [
    ...(siteLimitPercentage >= 70 || referenceSiteMWh >= criticalLimit * 0.7 ? [{
      title: "Priorité DGE immédiate",
      impact: "Risque réglementaire",
      icon: AlertTriangle,
      tone: "red" as const,
      detail: `${referenceSiteName} atteint ${formatMWh(referenceSiteMWh)} estimés. Préparez les justificatifs CIE/gasoil, nommez le référent énergie et planifiez un audit interne avant le dépôt DGE.`,
      action: "Créer une revue mensuelle des relevés et bloquer toute hausse non justifiée au-delà de 5%.",
    }] : []),
    ...(estimatedAcKWh / 1000 >= estimatedAnnualSiteMWh * 0.28 ? [{
      title: "Climatisation à traiter en premier",
      impact: `≈ ${(estimatedAcKWh / 1000).toFixed(1)} MWh/an`,
      icon: Snowflake,
      tone: "blue" as const,
      detail: `${acUnits} climatiseurs sur ${operatingHoursPerDay} h/jour pèsent fortement dans le bilan de ${siteName}.`,
      action: "Régler les consignes à 24°C minimum, nettoyer les filtres chaque mois et couper les zones vides après fermeture.",
    }] : []),
    ...(coldRooms > 0 ? [{
      title: "Froid commercial sous surveillance",
      impact: `≈ ${(estimatedColdKWh / 1000).toFixed(1)} MWh/an`,
      icon: Snowflake,
      tone: "cyan" as const,
      detail: `${coldRooms} chambre(s) froide(s) fonctionnent toute l'année et créent une charge continue.`,
      action: "Contrôler les joints, limiter les ouvertures longues, vérifier les températures de consigne et dégivrer selon planning.",
    }] : []),
    ...(generatorHoursPerMonth >= 15 ? [{
      title: "Groupe électrogène coûteux",
      impact: `≈ ${estimatedGeneratorLitres.toFixed(0)} L/an`,
      icon: Flame,
      tone: "orange" as const,
      detail: `${generatorHoursPerMonth} h/mois de groupe ajoutent ${formatMWh(estimatedAnnualGasoilMWh)} au calcul réglementaire.`,
      action: "Tenir un registre heures/litres, isoler les circuits essentiels et éviter d'alimenter climatisation de confort pendant les coupures.",
    }] : []),
    ...(operatingHoursPerDay > activeInfrastructure.defaultHours ? [{
      title: "Horaires d'exploitation à optimiser",
      impact: `${operatingHoursPerDay} h/jour`,
      icon: Calendar,
      tone: "slate" as const,
      detail: `Le site fonctionne au-dessus du profil type ${activeInfrastructure.label}, ce qui augmente la base électrique du bâtiment.`,
      action: "Créer une checklist fermeture: enseignes, éclairage secondaire, prises bureaux, ventilation et équipements non critiques.",
    }] : []),
    {
      title: "Mesure simple à lancer cette semaine",
      impact: "Gain rapide",
      icon: CheckCircle2,
      tone: "emerald" as const,
      detail: `Pour ${activeInfrastructure.label}, le meilleur point de départ est de comparer chaque mois les MWh estimés au relevé réel CIE + gasoil.`,
      action: "Saisir le prochain relevé dans Statistiques, puis ajuster surface, clims et groupe dans le calculateur.",
    },
  ].slice(0, 5);
  
  let complianceStatus: "Conforme" | "Alerte modérée" | "Alerte de niveau critique" | "En infraction" = "Conforme";
  let statusColor = "text-emerald-500 bg-emerald-50 border-emerald-200";
  let badgePulse = "bg-emerald-500";
  let actionAdvice = "Votre trajectoire énergétique est sécurisée. Continuez à surveiller votre indice.";

  if (totalMWh >= criticalLimit) {
    complianceStatus = "En infraction";
    statusColor = "text-red-600 bg-red-50 border-red-200";
    badgePulse = "bg-red-600 animate-ping";
    actionAdvice = "URGENT : Seuil de 1000 MWh Dépassé ! Amende de 5 000 000 FCFA applicable. Générez immédiatement votre rapport réglementaire ci-dessous.";
  } else if (percentageOfLimit >= 90) {
    complianceStatus = "Alerte de niveau critique";
    statusColor = "text-amber-600 bg-amber-50 border-amber-200";
    badgePulse = "bg-amber-600 animate-pulse";
    actionAdvice = "CRITIQUE : Vous avez franchi 90% du seuil réglementaire. Désignez votre Référent Énergie et optimisez l'éclairage nocturne.";
  } else if (percentageOfLimit >= 70) {
    complianceStatus = "Alerte modérée";
    statusColor = "text-yellow-600 bg-yellow-50 border-yellow-100";
    badgePulse = "bg-yellow-500";
    actionAdvice = "ATTENTION : Seuil DGE de 70% atteint. Sensibilisez vos employés et activez le mode Éco clim à 24°C.";
  }

  const handleInfrastructureTypeChange = (type: InfrastructureType) => {
    setInfrastructureType(type);
    setOperatingHoursPerDay(infrastructureProfiles[type].defaultHours);
  };

  const handleSaveSiteEstimate = () => {
    const estimate: SiteEstimate = {
      id: Math.random().toString(),
      siteName: siteName.trim() || infrastructureProfiles[infrastructureType].label,
      infrastructureType,
      areaM2: siteAreaM2,
      operatingHoursPerDay,
      acUnits,
      coldRooms,
      generatorHoursPerMonth,
      annualCieMWh: estimatedAnnualCieMWh,
      annualGasoilMWh: estimatedAnnualGasoilMWh,
      totalAnnualMWh: estimatedAnnualSiteMWh,
    };

    setSiteEstimates(prev => [estimate, ...prev]);
    setSystemNotifications(prev => [
      `Simulation infrastructure enregistrée pour ${estimate.siteName}: ${estimate.totalAnnualMWh.toFixed(1)} MWh/an estimés.`,
      ...prev
    ]);
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const buildDGEReportHtml = () => {
    const sortedRecords = [...complianceRecords].sort((a, b) => getRecordTime(a) - getRecordTime(b));
    const firstRecord = sortedRecords[0];
    const lastRecord = sortedRecords[sortedRecords.length - 1];
    const reportDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const periodLabel = firstRecord && lastRecord
      ? `${firstRecord.month} ${firstRecord.year} - ${lastRecord.month} ${lastRecord.year}`
      : "Période non renseignée";
    const reportRef = `DGE-${userProfile.companyName.replace(/[^a-z0-9]/gi, "-").toUpperCase()}-${new Date().getFullYear()}`;
    const riskLevel = totalMWh >= criticalLimit
      ? "Dépassement du seuil réglementaire"
      : percentageOfLimit >= 90
        ? "Alerte critique avant seuil"
        : percentageOfLimit >= 70
          ? "Alerte modérée"
          : "Trajectoire conforme";

    const recordRows = sortedRecords.map((record) => `
      <tr>
        <td>${escapeHtml(record.month)} ${record.year}</td>
        <td>${record.cieKWh.toLocaleString('fr-FR')}</td>
        <td>${formatFCFA(record.cieCostFCFA)}</td>
        <td>${record.gasoilLitres.toLocaleString('fr-FR')}</td>
        <td>${formatFCFA(record.gasoilCostFCFA)}</td>
        <td><strong>${formatMWh(record.totalMWh)}</strong></td>
      </tr>
    `).join("");

    const siteRows = siteEstimates.length > 0
      ? siteEstimates.map((site) => `
        <tr>
          <td>${escapeHtml(site.siteName)}</td>
          <td>${escapeHtml(infrastructureProfiles[site.infrastructureType].label)}</td>
          <td>${site.areaM2.toLocaleString('fr-FR')} m²</td>
          <td>${formatMWh(site.annualCieMWh)}</td>
          <td>${formatMWh(site.annualGasoilMWh)}</td>
          <td><strong>${formatMWh(site.totalAnnualMWh)}</strong></td>
        </tr>
      `).join("")
      : `<tr><td colspan="6" class="muted">Aucune simulation d'infrastructure annexée au rapport.</td></tr>`;

    return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Rapport DGE - ${escapeHtml(userProfile.companyName)}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; line-height: 1.45; margin: 0; background: #f8fafc; }
    .page { max-width: 980px; margin: 0 auto; background: #ffffff; padding: 34px; }
    .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 3px solid #10b981; padding-bottom: 18px; }
    .brand { font-size: 22px; font-weight: 800; letter-spacing: .04em; color: #064e3b; }
    .subtitle { color: #475569; font-size: 12px; margin-top: 6px; }
    .ref { text-align: right; font-size: 11px; color: #475569; }
    h1 { font-size: 25px; margin: 28px 0 8px; }
    h2 { font-size: 15px; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; color: #064e3b; }
    .meta-grid, .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
    .box { border: 1px solid #e2e8f0; border-radius: 10px; padding: 13px; background: #f8fafc; }
    .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: .08em; }
    .value { font-size: 15px; font-weight: 800; margin-top: 5px; }
    .value.big { font-size: 24px; }
    .status { display: inline-block; padding: 7px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .status.warning { background: #fffbeb; color: #b45309; border-color: #fde68a; }
    .status.danger { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th { background: #0f172a; color: #ffffff; text-align: left; padding: 9px; }
    td { border-bottom: 1px solid #e2e8f0; padding: 9px; vertical-align: top; }
    .summary { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 15px; margin-top: 18px; font-size: 13px; }
    .muted { color: #64748b; }
    .recommendations li { margin-bottom: 7px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 34px; }
    .signature { border-top: 1px solid #94a3b8; padding-top: 8px; min-height: 70px; font-size: 12px; color: #475569; }
    .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b; }
    @media print { body { background: #ffffff; } .page { padding: 0; } }
  </style>
</head>
<body>
  <main class="page">
    <section class="header">
      <div>
        <div class="brand">SOUVERAIN ÉNERGIE</div>
        <div class="subtitle">Rapport de conformité énergétique - Direction Générale de l'Énergie</div>
      </div>
      <div class="ref">
        <strong>Référence :</strong> ${escapeHtml(reportRef)}<br />
        <strong>Date d'édition :</strong> ${reportDate}<br />
        <strong>Période auditée :</strong> ${escapeHtml(periodLabel)}
      </div>
    </section>

    <h1>Rapport réglementaire de consolidation CIE + gasoil</h1>
    <span class="status ${complianceStatus === "En infraction" ? "danger" : complianceStatus === "Conforme" ? "" : "warning"}">${escapeHtml(complianceStatus)}</span>

    <section class="meta-grid">
      <div class="box"><div class="label">Établissement</div><div class="value">${escapeHtml(userProfile.companyName)}</div></div>
      <div class="box"><div class="label">Localisation</div><div class="value">${escapeHtml(userProfile.location)}, Abidjan</div></div>
      <div class="box"><div class="label">Responsable</div><div class="value">${escapeHtml(userProfile.name)}</div></div>
      <div class="box"><div class="label">Secteur</div><div class="value">${escapeHtml(userProfile.industry)}</div></div>
      <div class="box"><div class="label">Référent énergie</div><div class="value">${escapeHtml(userProfile.energyChampionName || "À désigner")}</div></div>
      <div class="box"><div class="label">Contact</div><div class="value">${escapeHtml(userProfile.email)}</div></div>
    </section>

    <section class="kpi-grid">
      <div class="box"><div class="label">Consommation consolidée</div><div class="value big">${formatMWh(totalMWh)}</div></div>
      <div class="box"><div class="label">Seuil DGE applicable</div><div class="value big">${formatMWh(criticalLimit)}</div></div>
      <div class="box"><div class="label">Taux du seuil</div><div class="value big">${percentageOfLimit.toFixed(0)}%</div></div>
      <div class="box"><div class="label">CIE moyenne tension</div><div class="value">${totalCieKWh.toLocaleString('fr-FR')} kWh</div></div>
      <div class="box"><div class="label">Gasoil secours</div><div class="value">${totalGasoilLitres.toLocaleString('fr-FR')} L</div></div>
      <div class="box"><div class="label">Charges énergétiques</div><div class="value">${formatFCFA(totalCieCostFCFA + totalGasoilCostFCFA)}</div></div>
    </section>

    <div class="summary">
      <strong>Conclusion de conformité :</strong> ${escapeHtml(riskLevel)}. ${escapeHtml(actionAdvice)}
    </div>

    <h2>1. Détail mensuel des relevés consolidés</h2>
    <table>
      <thead>
        <tr>
          <th>Mois</th><th>CIE kWh</th><th>Coût CIE</th><th>Gasoil L</th><th>Coût gasoil</th><th>Total MWh</th>
        </tr>
      </thead>
      <tbody>${recordRows || `<tr><td colspan="6" class="muted">Aucun relevé disponible.</td></tr>`}</tbody>
    </table>

    <h2>2. Annexes infrastructure par endroit</h2>
    <table>
      <thead>
        <tr>
          <th>Endroit</th><th>Infrastructure</th><th>Surface</th><th>CIE estimé</th><th>Gasoil estimé</th><th>Total estimé</th>
        </tr>
      </thead>
      <tbody>${siteRows}</tbody>
    </table>

    <h2>3. Méthode de calcul</h2>
    <p class="muted">
      La consommation réglementaire consolidée est calculée selon la formule :
      <strong>Total MWh = (kWh CIE + litres de gasoil × 10) / 1000</strong>.
      Les simulations d'infrastructure sont des estimations opérationnelles destinées à préparer l'audit interne et ne remplacent pas les factures ou relevés officiels.
    </p>

    <h2>4. Plan d'action recommandé</h2>
    <ul class="recommendations">
      <li>Désigner ou confirmer le référent énergie interne avant le dépôt du dossier.</li>
      <li>Archiver les factures CIE, bons de livraison gasoil et relevés mensuels correspondant à la période auditée.</li>
      <li>Prioriser la climatisation, les chambres froides et les heures de groupe électrogène si le taux dépasse 70% du seuil.</li>
      <li>Préparer le dépôt du rapport avant le ${escapeHtml(adminThreshold.reportingDeadline)}.</li>
    </ul>

    <section class="signatures">
      <div class="signature">Responsable de l'établissement<br /><strong>${escapeHtml(userProfile.name)}</strong></div>
      <div class="signature">Référent énergie / contrôle interne<br /><strong>${escapeHtml(userProfile.energyChampionName || "À désigner")}</strong></div>
    </section>

    <div class="footer">
      Document généré par Souverain Énergie. Export HTML imprimable en PDF depuis le navigateur. Les montants sont exprimés en FCFA.
    </div>
  </main>
</body>
</html>`;
  };

  const handleDownloadDGEReport = () => {
    const html = buildDGEReportHtml();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `Rapport_DGE_${userProfile.companyName.replace(/[^a-z0-9]/gi, "_")}_${new Date().getFullYear()}.html`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSystemNotifications(prev => [
      `Rapport DGE professionnel généré pour ${userProfile.companyName}. Ouvrez le fichier HTML puis imprimez-le en PDF pour dépôt.`,
      ...prev
    ]);
  };

  // Onboarding Slides definitions
  const onboardingSlides = [
    {
      title: "Consolidation CIE & Gasoil",
      description: "L'Arrêté 156 exige l'addition de vos consommations électriques (moyenne tension CIE) et thermiques (groupes de secours gasoil). Plus besoin de cahier perdu au poste de garde !",
      image: "⚡"
    },
    {
      title: "Halte aux 5 000 000 FCFA d'Amende",
      description: "Désignez un Référent Énergie en 2 clics et gardez un œil constant grâce à notre jauge de conformité tricolore intégrée.",
      image: "🚨"
    },
    {
      title: "Rapport de conformité en 1-Clic",
      description: "Générez instantanément le fichier officiel d'homologation au format DGE attendu par l'État de Côte d'Ivoire avant le 31 janvier.",
      image: "📋"
    }
  ];

  // Quick input action
  const meterFileInputRef = useRef<HTMLInputElement>(null);
  const [isScanningMeter, setIsScanningMeter] = useState(false);

  const handleMeterPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setIsScanningMeter(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Lecture de l'image impossible"));
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/scan-meter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type || "image/jpeg" }),
      });
      const data = await response.json();

      if (data?.error || !data) {
        throw new Error(data?.error || "Réponse vide du scan");
      }

      let fieldsFilled = 0;
      if (typeof data.cieKWh === "number" && data.cieKWh > 0) { setNewCieKWh(String(data.cieKWh)); fieldsFilled++; }
      if (typeof data.cieFCFA === "number" && data.cieFCFA > 0) { setNewCieFCFA(String(data.cieFCFA)); fieldsFilled++; }
      if (typeof data.gasoilLitres === "number" && data.gasoilLitres > 0) { setNewGasoilLitres(String(data.gasoilLitres)); fieldsFilled++; }
      if (typeof data.gasoilFCFA === "number" && data.gasoilFCFA > 0) { setNewGasoilFCFA(String(data.gasoilFCFA)); fieldsFilled++; }

      setSystemNotifications(prev => [
        fieldsFilled > 0
          ? `Photo analysée : ${fieldsFilled} champ(s) pré-rempli(s) automatiquement. Vérifiez les valeurs avant d'enregistrer.`
          : "Photo analysée, mais aucune valeur claire détectée. Merci de saisir manuellement.",
        ...prev
      ]);
    } catch (err: any) {
      setSystemNotifications(prev => [
        "Scan indisponible pour cette photo (éclairage, cadrage ou clé IA manquante). Saisissez les valeurs manuellement.",
        ...prev
      ]);
    } finally {
      setIsScanningMeter(false);
    }
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const cieVal = parseFloat(newCieKWh) || 0;
    const cieCostVal = parseFloat(newCieFCFA) || 0;
    const gasoilVal = parseFloat(newGasoilLitres) || 0;
    const gasoilCostVal = parseFloat(newGasoilFCFA) || 0;

    // 1 Litre gasoil = 10 kWh thermal conversion factors
    const combinedMWh = (cieVal + (gasoilVal * 10)) / 1000;

    const newRecord: EnergyRecord = {
      id: Math.random().toString(),
      month: newMonth,
      year: newYear,
      cieKWh: cieVal,
      cieCostFCFA: cieCostVal,
      gasoilLitres: gasoilVal,
      gasoilCostFCFA: gasoilCostVal,
      totalMWh: combinedMWh
    };

    setEnergyRecords(prev => [newRecord, ...prev]);
    
    // Clear forms and scroll to dashboard
    setNewCieKWh("");
    setNewCieFCFA("");
    setNewGasoilLitres("");
    setNewGasoilFCFA("");
    
    // Add success toast/notification
    setSystemNotifications(prev => [
      `Index de ${newMonth} ${newYear} enregistré avec succès. (+${combinedMWh.toFixed(1)} MWh cumulés)`,
      ...prev
    ]);
  };

  // Sign up simulation
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const customProfile: UserProfile = {
        id: "vierge",
        name: authEmail.split("@")[0] || "Dirigeant",
        email: authEmail || "contact@pme.ci",
        role: "Gérant Principal",
        energyChampionName: "",
        phone: "",
        companyName: authCompanyName || "Ma PME Ivoirienne",
        industry: "office",
        location: authLocation,
        employeeCount: 0
      };
      setUserProfile(customProfile);
      setChatMessages(initialChatsByProfile["vierge"]);
      setEnergyRecords(vergeEnergyRecords); // Un vrai compte doit démarrer sans données fictives
      setSelectedPersona("vierge");
    }
    startTwoFactorChallenge();
  };

  const handleVerifyTwoFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorInput.trim() !== twoFactorCode) {
      setTwoFactorError("Code invalide. Vérifiez les 6 chiffres reçus et réessayez.");
      return;
    }
    setTwoFactorError("");
    setSystemNotifications(prev => [
      `Connexion sécurisée par double authentification pour ${userProfile.companyName}.`,
      ...prev
    ]);
    setCurrentScreen("app");
  };

  const handleResendTwoFactor = () => {
    startTwoFactorChallenge();
  };

  // Post on regulatory local forum
  const handleAddForumPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForumText.trim()) return;

    const newPost: ForumPost = {
      id: Math.random().toString(),
      author: userProfile.name,
      company: userProfile.companyName,
      role: userProfile.role,
      content: newForumText,
      likes: 1,
      commentsCount: 0,
      tags: newForumTags ? newForumTags.split(",").map(t => t.trim()) : ["Général"],
      date: "À l'instant"
    };

    setForumPosts([newPost, ...forumPosts]);
    setNewForumText("");
    setNewForumTags("");
  };

  // Handle DGE Admin updates
  const handleUpdateGEThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    setSystemNotifications(prev => [
      `DGE: Les nouveaux seuils énergétiques sont parus sous décret. Limite définie à ${adminThreshold.mwhLimit} MWh. Applicable à l'actuel Arrêté 156.`,
      ...prev
    ]);
  };

  // Add global sensitisation message
  const handleSendDGECampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDGEAnnouncement.trim()) return;
    setSystemNotifications(prev => [
      `DGE - Message Important d'Utilité Publique : "${newDGEAnnouncement}"`,
      ...prev
    ]);
    setNewDGEAnnouncement("");
  };

  // Join challenge
  const toggleJoinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        return {
          ...c,
          joined: !c.joined,
          participantsCount: c.joined ? c.participantsCount - 1 : c.participantsCount + 1
        };
      }
      return c;
    }));
  };

  // Send message to Seka AI advisor
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          userContext: {
            companyName: userProfile.companyName,
            role: userProfile.role,
            location: userProfile.location,
            ytdTotalMWh: totalMWh.toFixed(1),
            cieCostFCFA: totalCieCostFCFA.toString(),
            gasoilFCFA: totalGasoilCostFCFA.toString(),
            complianceStatus: complianceStatus,
          },
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.reply || "Désolé, je n'ai pas pu répondre. Réessayez.",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: "Connexion au serveur impossible. Vérifiez que le backend est démarré avec `npm run dev`.",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* GLOBAL TELEMETRY HEADER WARNINGS REMOVED: ARCHITECTURAL HONESTY COMPLIANT */}

      {/* RENDER SPLASH SCREEN OR MAIN CONTENT */}
      {currentScreen === "splash" && (
        <div id="splash_screen" className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-6 relative overflow-hidden">
          {/* Ivory Coast thematic warm aesthetic back glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="max-w-md w-full text-center space-y-8 z-10">
            <div className="inline-flex p-4 rounded-3xl bg-slate-800 border border-slate-700 shadow-xl text-emerald-400 text-4xl mb-4 font-bold tracking-wider">
              🇨🇮 <span className="text-white ml-2">SOUVERAIN</span>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight">Souverain Énergie</h1>
              <p className="text-emerald-400 font-medium tracking-wide">L'homologation 100% logicielle - Arrêté 156 DGE</p>
              <p className="text-slate-400 text-sm">
                Conçu pour libérer les PME ivoiriennes des contraintes administratives, éviter l'amende de 5 000 000 FCFA et réduire les factures d'électricité à Abidjan.
              </p>
            </div>

            <div className="pt-8 space-y-4">
              <button
                id="btn_onboarding_start"
                onClick={() => setCurrentScreen("onboarding")}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
              >
                Commencer l'expérience
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="btn_skip_to_app"
                onClick={() => setCurrentScreen("auth")}
                className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium py-3 px-6 rounded-2xl border border-slate-700 transition"
              >
                Passer Onboarding & Se Connecter
              </button>
            </div>

            <div className="pt-12 text-slate-500 text-xs flex justify-center items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Conforme aux directives du Ministère de l'Énergie</span>
            </div>
          </div>
        </div>
      )}

      {currentScreen === "onboarding" && (
        <div id="onboarding_screen" className="flex-1 flex flex-col bg-slate-900 text-white p-6 justify-between relative">
          <div className="max-w-md mx-auto w-full pt-12 text-center">
            <span className="text-xs font-bold tracking-widest text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-3 py-1.5 rounded-full">
              FONCTIONNALITÉS CLÉS ({onboardingStep + 1}/3)
            </span>

            {/* Carousel Item */}
            <div className="mt-12 space-y-6">
              <div className="text-9xl filter drop-shadow">{onboardingSlides[onboardingStep].image}</div>
              <h2 className="text-2xl font-bold pt-4">{onboardingSlides[onboardingStep].title}</h2>
              <p className="text-slate-400 text-base leading-relaxed px-4">
                {onboardingSlides[onboardingStep].description}
              </p>
            </div>

            {/* Stepper Dots */}
            <div className="flex justify-center gap-2 mt-12">
              {onboardingSlides.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2.5 rounded-full transition-all duration-300 ${onboardingStep === i ? 'w-8 bg-emerald-500' : 'w-2.5 bg-slate-700'}`} 
                />
              ))}
            </div>
          </div>

          <div className="max-w-md mx-auto w-full pb-8 pt-4 space-y-3">
            {onboardingStep < 2 ? (
              <button
                id="btn_onboarding_next"
                onClick={() => setOnboardingStep(prev => prev + 1)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
              >
                Suivant
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                id="btn_onboarding_finish"
                onClick={() => setCurrentScreen("auth")}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
              >
                Entrer dans l'unification DGE
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={() => setCurrentScreen("auth")}
              className="w-full py-2.5 text-slate-500 hover:text-slate-300 text-sm font-medium transition"
            >
              Ignorer l'onboarding
            </button>
          </div>
        </div>
      )}

      {currentScreen === "auth" && (
        <div id="auth_screen" className="flex-1 flex flex-col md:flex-row bg-slate-900 text-white">
          
          {/* Informational left section */}
          <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-950 p-12 border-r border-slate-800 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 pointer-events-none" />
            
            <div className="z-10">
              <div className="text-2xl font-bold tracking-wider text-emerald-400">
                🇨🇮 SOUVERAIN ÉNERGIE
              </div>
            </div>

            <div className="z-10 space-y-6 max-w-lg">
              <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                PME, évitez les lourdeurs de l'Arrêté 156.
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                Rejoignez 18 PME pionnières à Abidjan qui ont rejeté les capteurs IoT importés chers et instables au profit d'une déclaration mensuelle simplifiée en devises locales.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Sans investissement matériel</h3>
                    <p className="text-slate-500 text-sm">Pas de capteurs coûteux qui grillent avec les coupures locales.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Calcul en temps réel FCFA et MWh</h3>
                    <p className="text-slate-500 text-sm">Gérez la conversion thermique simplifiée de votre gasoil en kWh administratifs.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="z-10 text-slate-500 text-xs">
              © 2026 Hackathon WeCode ESG • Ministère de l'Énergie Côte d'Ivoire
            </div>
          </div>

          {/* Form and Persona Switcher right section */}
          <div className="flex-1 flex flex-col justify-center p-6 md:p-12">
            <div className="max-w-md w-full mx-auto space-y-8">
              
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight">Accès à l'application</h2>
                <p className="text-slate-400 text-sm">
                  Sélectionnez un profil pré-paramétré (personas du projet) pour tester l'intégralité des parcours ou créez votre compte.
                </p>
              </div>

              {/* Persona Selector with Ivory Coast Badges */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Simuler un Profil (Recommandé)</span>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    id="persona_kofi"
                    onClick={() => handlePersonaSwitch("kofi")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${selectedPersona === "kofi" ? "bg-emerald-950 border-emerald-500 shadow-emerald-500/10 shadow-lg text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        Kofi Amon <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">Zone 4</span>
                      </div>
                      <div className="text-xs text-slate-400">Gérant, Hôtel Le Grand Sud (Alerte Risque 5M FCFA)</div>
                    </div>
                    <Zap className={`w-5 h-5 ${selectedPersona === "kofi" ? "text-emerald-400" : "text-slate-500"}`} />
                  </button>

                  <button
                    id="persona_mariame"
                    onClick={() => handlePersonaSwitch("mariame")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${selectedPersona === "mariame" ? "bg-emerald-950 border-emerald-500 shadow-emerald-500/10 shadow-lg text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        Mariame Tanoh <span className="text-xs bg-red-500/25 text-red-400 px-2 py-0.5 rounded-full font-medium">Marcory</span>
                      </div>
                      <div className="text-xs text-slate-400">Facility Manager, Marcory Business Center (Seuil Dépassé !)</div>
                    </div>
                    <AlertTriangle className={`w-5 h-5 ${selectedPersona === "mariame" ? "text-emerald-400" : "text-slate-500"}`} />
                  </button>

                  <button
                    id="persona_newuser"
                    onClick={() => handlePersonaSwitch("newuser")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${selectedPersona === "newuser" ? "bg-emerald-950 border-emerald-500 shadow-emerald-500/10 shadow-lg text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        Nouveau Profil <span className="text-xs bg-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Cocody</span>
                      </div>
                      <div className="text-xs text-slate-400">Propriétaire PME, Grand Bazar (Prêt à décoller)</div>
                    </div>
                    <PlusCircle className={`w-5 h-5 ${selectedPersona === "newuser" ? "text-emerald-400" : "text-slate-500"}`} />
                  </button>

                  <button
                    id="persona_vierge"
                    onClick={() => handlePersonaSwitch("vierge")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${selectedPersona === "vierge" ? "bg-emerald-950 border-emerald-500 shadow-emerald-500/10 shadow-lg text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        Compte Vierge <span className="text-xs bg-slate-500/25 text-slate-300 px-2 py-0.5 rounded-full font-medium">Vide</span>
                      </div>
                      <div className="text-xs text-slate-400">Profil et historique totalement vides, à remplir vous-même</div>
                    </div>
                    <User className={`w-5 h-5 ${selectedPersona === "vierge" ? "text-emerald-400" : "text-slate-500"}`} />
                  </button>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-500 font-semibold tracking-wider uppercase">Ou s'inscrire manuellement</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Conventional Form Inputs */}
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 tracking-wider mb-1">NOM DE VOTRE PME</label>
                    <input
                      type="text"
                      value={authCompanyName}
                      onChange={(e) => setAuthCompanyName(e.target.value)}
                      placeholder="Ex: Hôtel Royal Abidjan"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 tracking-wider mb-1">IDENTIFIANT / EMAIL</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    placeholder="kofi.amon@grandsud.ci"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 tracking-wider mb-1">MOT DE PASSE</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 tracking-wider mb-1">LOCALISATION (ABIDJAN)</label>
                    <select
                      value={authLocation}
                      onChange={(e) => setAuthLocation(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      <option value="Zone 4, Marcory">Zone 4, Marcory</option>
                      <option value="Cocody Deux-Plateaux">Cocody Deux-Plateaux</option>
                      <option value="Bietry, Marcory">Bietry, Marcory</option>
                      <option value="Plateau, Abidjan">Plateau, Abidjan</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-emerald-400 hover:underline font-medium"
                  >
                    {isSignUp ? "Déjà membre ? Se connecter" : "Créer un compte d'entreprise"}
                  </button>
                  <span className="text-slate-500">Mot de passe oublié ?</span>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition text-sm cursor-pointer"
                  >
                    Accès Espace Réf.
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen("admin");
                    }}
                    className="border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-3 px-4 rounded-xl transition text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    Accès Admin DGE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {currentScreen === "twoFactor" && (
        <div id="two_factor_screen" className="flex-1 flex flex-col md:flex-row bg-slate-900 text-white">
          <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-950 p-12 border-r border-slate-800 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="z-10 text-2xl font-bold tracking-wider text-emerald-400">
              🇨🇮 SOUVERAIN ÉNERGIE
            </div>

            <div className="z-10 space-y-5 max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950/50 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300">
                <LockKeyhole className="h-4 w-4" />
                Double authentification
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                Sécurisez l'accès aux données énergie.
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                Les bilans CIE, les volumes de gasoil et les rapports réglementaires DGE restent protégés avant l'ouverture de l'espace référent.
              </p>
            </div>

            <div className="z-10 text-slate-500 text-xs">
              Vérification locale de démonstration • Code à 6 chiffres
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center p-6 md:p-12">
            <div className="max-w-md w-full mx-auto space-y-8">
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">Vérification 2FA</h2>
                <p className="text-slate-400 text-sm">
                  Un code a été envoyé à <span className="text-slate-200 font-semibold">{authEmail || userProfile.email}</span>.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Code de démonstration</p>
                    <p className="text-xs text-slate-400 mt-1">À remplacer par SMS/email côté backend en production.</p>
                  </div>
                  <div className="font-mono text-2xl font-black tracking-[0.35em] text-white">
                    {twoFactorCode}
                  </div>
                </div>
                {twoFactorSentAt && (
                  <p className="mt-3 text-[11px] text-slate-500">Dernier envoi simulé à {twoFactorSentAt}</p>
                )}
              </div>

              <form onSubmit={handleVerifyTwoFactor} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 tracking-wider mb-1">CODE 2FA</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={twoFactorInput}
                    onChange={(e) => {
                      setTwoFactorInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setTwoFactorError("");
                    }}
                    placeholder="000000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-mono text-2xl tracking-[0.35em]"
                    autoFocus
                    required
                  />
                  {twoFactorError && (
                    <p className="mt-2 text-xs font-semibold text-red-400">{twoFactorError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition text-sm cursor-pointer"
                  >
                    Valider 2FA
                  </button>
                  <button
                    type="button"
                    onClick={handleResendTwoFactor}
                    className="border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-3 px-4 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    Renvoyer
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorInput("");
                    setTwoFactorError("");
                    setCurrentScreen("auth");
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition"
                >
                  Revenir à la connexion
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RENDER ACTIVE FULL APP */}
      {currentScreen === "app" && (
        <div id="main_app_workspace" className="flex-1 flex flex-col md:flex-row">
          {isMobileMenuOpen && (
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 z-40 md:hidden"
            />
          )}
          
          {/* Main vertical sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 transform transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-extrabold text-lg tracking-wider">🇨🇮 SOUVERAIN</span>
                <p className="text-[10px] text-slate-500 font-mono">DGE CONFORME 2026</p>
              </div>
              <div className="flex md:hidden gap-2">
                <button 
                  onClick={() => handlePersonaSwitch(selectedPersona === "kofi" ? "mariame" : "kofi")}
                  className="bg-slate-800 px-2 py-1.5 rounded text-xs"
                >
                  Switch
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-slate-800 p-1.5 rounded text-slate-300"
                  aria-label="Fermer le menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick user snapshot on sidebar */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 m-3 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {userProfile.name.split(" ")[0][0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-xs truncate leading-tight">{userProfile.name}</p>
                  <p className="text-[10px] text-slate-400 truncate leading-none">{userProfile.companyName}</p>
                </div>
              </div>
              
              <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-800">
                <span className="text-slate-500">Seuil DGE :</span>
                <span className="font-bold text-white">12 mois {totalMWh.toFixed(1)} / {criticalLimit} MWh</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${complianceStatus === "En infraction" ? 'bg-red-500' : complianceStatus === "Alerte de niveau critique" ? 'bg-orange-500' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(percentageOfLimit, 100)}%` }}
                />
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1">
              <button
                id="sidebar_tab_dashboard"
                onClick={() => handleTabChange("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${currentTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 bg-slate-950/20" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Tableau de Bord</span>
              </button>

              <button
                id="sidebar_tab_stats"
                onClick={() => handleTabChange("stats")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${currentTab === "stats" ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 bg-slate-950/20" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Statistiques & Bilan</span>
              </button>

              <button
                id="sidebar_tab_calculator"
                onClick={() => handleTabChange("calculator")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${currentTab === "calculator" ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 bg-slate-950/20" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                <Calculator className="w-4 h-4 shrink-0" />
                <span>Calculateur par site</span>
              </button>

              <button
                id="sidebar_tab_alerts"
                onClick={() => handleTabChange("alerts")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${currentTab === "alerts" ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 bg-slate-950/20" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                <div className="relative">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {complianceStatus !== "Conforme" && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                <span>Seuils & Alertes DGE</span>
              </button>

              <button
                id="sidebar_tab_advisor"
                onClick={() => handleTabChange("advisor")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer ${currentTab === "advisor" ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 bg-slate-950/20" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                <Lightbulb className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="flex items-center gap-1">
                  Conseils ciblés
                  <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 py-0.5 rounded font-mono font-bold uppercase">AUTO</span>
                </span>
              </button>

              <button
                id="sidebar_tab_community"
                onClick={() => handleTabChange("community")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${currentTab === "community" ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 bg-slate-950/20" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Communauté & Défis</span>
              </button>

              <button
                id="sidebar_tab_seka"
                onClick={() => handleTabChange("seka")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${currentTab === "seka" ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 bg-slate-950/20" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="flex items-center gap-1">
                  Seka — Conseiller IA
                  <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 py-0.5 rounded font-mono font-bold uppercase">IA</span>
                </span>
              </button>

              <button

                id="sidebar_tab_settings"
                onClick={() => handleTabChange("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${currentTab === "settings" ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 bg-slate-950/20" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Profil & Éco-gérance</span>
              </button>
            </nav>

            {/* Sticky regulatory advisor / help widget inside sidebar */}
            <div className="p-3 bg-gradient-to-br from-slate-950 to-slate-900 border-t border-slate-800 py-4">
              <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                <p className="font-bold text-white flex items-center gap-1">
                  <span className="text-emerald-400">⚖️</span> Législatif Côte d'Ivoire
                </p>
                <p className="text-[11px] leading-relaxed">
                  L'amende directe de <strong>5 000 000 FCFA</strong> sanctionne le manque d'un dossier de conformité technique DGE.
                </p>
                <button
                  onClick={() => handleTabChange("alerts")} 
                  className="text-xs text-emerald-400 hover:underline font-bold block"
                >
                  Lire les obligations &rarr;
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Profil: {selectedPersona.toUpperCase()}</span>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setCurrentScreen("auth");
                  }}
                  className="text-red-400 hover:underline font-semibold"
                >
                  Changer de profil
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT PORT */}
          <main className="flex-grow flex flex-col min-w-0 bg-slate-50">
            
            {/* Header elements */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">{userProfile.companyName}</h1>
                  <span className="text-xs bg-slate-100 font-semibold px-2 py-1 rounded text-slate-600 uppercase tracking-wide">
                    {userProfile.industry === "hotel" ? "🏨 Hôtellerie" : userProfile.industry === "supermarket" ? "🛒 Commerce" : "🏢 Quartier d'Affaire"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Établissement tertiaire à <strong>{userProfile.location}, Abidjan</strong> • Responsable: {userProfile.name}
                </p>
                </div>
              </div>

              {/* Status & Actions top pill bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${statusColor}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${badgePulse}`} />
                  <span>Statut DGE : {complianceStatus}</span>
                </div>

                <button
                  id="btn_download_dge_report"
                  onClick={handleDownloadDGEReport}
                  className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Rapport DGE pro</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentScreen("admin");
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-2 px-3 rounded-xl transition"
                >
                  Console DGE Admin
                </button>
              </div>
            </header>

            {/* NOTIFICATION FLASHER BANNER */}
            {systemNotifications.length > 0 && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 p-3.5 px-6 flex items-start gap-3">
                <Bell className="w-4 animate-bounce h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-amber-800 font-medium">
                  <strong>Alerte administrative :</strong> {systemNotifications[0]}
                </div>
                <button 
                  onClick={() => setSystemNotifications(prev => prev.slice(1))}
                  className="text-xs text-amber-900 underline hover:no-underline font-bold"
                >
                  Ignorer
                </button>
              </div>
            )}

            {/* SCREEN CONDITIONAL BRANCHING */}
            
            {/* TAB 1: USER DASHBOARD */}
            {currentTab === "dashboard" && (
              <div id="tab_dashboard" className="p-6 space-y-6 flex-1 overflow-y-auto">
                
                {/* 3 Metric Card widgets row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Cumulated rolling compliance indicator */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs md:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Considération d'Arrêté 156</span>
                        <span title="Calcul réglementaire exigeant : kWh CIE + Litres de Gasoil * 10">
                          <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer" />
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mt-1">Consommation énergétique sur 12 mois glissants</h3>
                    </div>

                    <div className="my-4 flex flex-col sm:flex-row items-center gap-6">
                      {/* Premium circular SVG meter */}
                      <div className="relative w-28 h-28 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="56" cy="56" r="48" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                          <circle 
                            cx="56" 
                            cy="56" 
                            r="48" 
                            fill="transparent" 
                            stroke={complianceStatus === "En infraction" ? "#ef4444" : complianceStatus === "Alerte de niveau critique" ? "#f97316" : complianceStatus === "Alerte modérée" ? "#eab308" : "#10b981"} 
                            strokeWidth="10" 
                            strokeDasharray={2 * Math.PI * 48}
                            strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(percentageOfLimit, 100) / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col justify-center items-center">
                          <span className="text-2xl font-black text-slate-900">{totalMWh.toFixed(1)}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">MWh / 12 mois</span>
                        </div>
                      </div>

                      <div className="space-y-2 flex-grow">
                        <div>
                          <div className="flex justify-between items-baseline text-xs text-slate-400">
                            <span>Progression</span>
                            <span className="font-extrabold text-slate-800">{percentageOfLimit.toFixed(0)}% du seuil</span>
                          </div>
                          <div className="text-xl font-extrabold text-slate-900">
                            {totalMWh.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 1 000 MWh</span>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-slate-500">
                          Seuil de tolérance légale : <span className="text-slate-950">1 000.0 MWh</span> par année civile.
                        </div>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border text-xs font-medium ${statusColor}`}>
                      {actionAdvice}
                    </div>
                  </div>

                  {/* Estimation Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projection Annuelle</span>
                        <Flame className="w-4 h-4 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mt-1 uppercase text-slate-400">Bilan Estimé de Fin d'Année</h3>
                    </div>

                    <div className="my-3">
                      <span className="text-3xl font-black tracking-tight text-slate-900">
                        {projectedAnnualMWh.toFixed(1)} MWh
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        Sur la base des {currentMonthsCount} derniers relevés mensuels.
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Risque amende 2026 :</span>
                        <span className={projectedAnnualMWh >= criticalLimit ? "text-red-600 font-extrabold" : "text-emerald-600 font-bold"}>
                          {projectedAnnualMWh >= criticalLimit ? "TRÈS ÉLEVÉ (99%)" : "RISQUE FAIBLE"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${projectedAnnualMWh >= criticalLimit ? 'bg-red-500' : 'bg-emerald-400'}`} 
                          style={{ width: `${Math.min((projectedAnnualMWh/criticalLimit)*100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cost Summary card with CIE and Gasoil */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coût global FCFA</span>
                        <Coins className="w-4 h-4 text-slate-400 text-amber-500" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mt-1">Facturation énergétique sur 12 mois</h3>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl font-black text-rose-600 tracking-tight">
                        {(totalCieCostFCFA + totalGasoilCostFCFA).toLocaleString('fr-FR')} FCFA
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Cumulé électricité + gasoil</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> CIE MT :
                        </span>
                        <span className="font-bold text-slate-800">{totalCieCostFCFA.toLocaleString('fr-FR')} F</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Gasoil :
                        </span>
                        <span className="font-bold text-slate-800">{totalGasoilCostFCFA.toLocaleString('fr-FR')} F</span>
                      </div>
                    </div>
                  </div>

                  {/* ROI & Savings card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ROI & Économies</span>
                        <TrendingDown className={`w-4 h-4 ${savingsFCFA >= 0 ? "text-emerald-500" : "text-red-500"}`} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mt-1">Vs mois précédent</h3>
                    </div>

                    <div className="my-2">
                      <div className={`text-2xl font-black tracking-tight ${savingsFCFA >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {savingsFCFA >= 0 ? "-" : "+"}{Math.abs(savingsFCFA).toLocaleString('fr-FR')} FCFA
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {previousRecord
                          ? `${savingsFCFA >= 0 ? "Économisé" : "Surcoût"} (${Math.abs(savingsPercent).toFixed(1)}%) grâce à la maîtrise de conso`
                          : "Ajoutez un second relevé pour comparer"}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dernier relevé :</span>
                        <span className="font-bold text-slate-800">{latestRecord ? `${latestRecord.month} ${latestRecord.year}` : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Coût facturé :</span>
                        <span className="font-bold text-slate-800">{latestTotalCostFCFA.toLocaleString('fr-FR')} F</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Dashboard Main layout: Left Entry form & Right Analytics chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Side: Declarative Quick Entry form */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <PlusCircle className="text-emerald-500 w-5 h-5 shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-sm">Déclaration Assistée Mensuelle</h3>
                        <p className="text-[10px] text-slate-500">Aucun IoT requis • Saisie manuelle de relevé</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={meterFileInputRef}
                        onChange={handleMeterPhotoSelected}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => meterFileInputRef.current?.click()}
                        disabled={isScanningMeter}
                        className="shrink-0 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-2 rounded-xl border border-emerald-200 transition disabled:opacity-60 cursor-pointer"
                        title="Prendre en photo le compteur CIE ou la facture pour pré-remplir les champs"
                      >
                        {isScanningMeter ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Analyse...
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5" />
                            Scanner
                          </>
                        )}
                      </button>
                    </div>

                    {/* Saisie assists */}
                    <form onSubmit={handleAddRecord} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">MOIS À DÉCLARER</label>
                          <select 
                            value={newMonth}
                            onChange={(e) => setNewMonth(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-2.5 py-2 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="Janvier">Janvier</option>
                            <option value="Février">Février</option>
                            <option value="Mars">Mars</option>
                            <option value="Avril">Avril</option>
                            <option value="Mai">Mai</option>
                            <option value="Juin">Juin</option>
                            <option value="Juillet">Juillet</option>
                            <option value="Août">Août</option>
                            <option value="Septembre">Septembre</option>
                            <option value="Octobre">Octobre</option>
                            <option value="Novembre">Novembre</option>
                            <option value="Décembre">Décembre</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">ANNÉE</label>
                          <input 
                            type="number" 
                            value={newYear}
                            onChange={(e) => setNewYear(parseInt(e.target.value) || 2026)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-2.5 py-2 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* CIE Medium voltage electrical inputs */}
                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/60 space-y-2">
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest block">Compteur électrique CIE (basse ou moyenne tension)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 mb-0.5">Consommation (kWh)</label>
                            <input 
                              type="number"
                              placeholder="ex: 72000"
                              value={newCieKWh}
                              onChange={(e) => setNewCieKWh(e.target.value)}
                              className="w-full bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg text-slate-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 mb-0.5">Montant Facture (FCFA)</label>
                            <input 
                              type="number"
                              placeholder="ex: 7200000"
                              value={newCieFCFA}
                              onChange={(e) => setNewCieFCFA(e.target.value)}
                              className="w-full bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg text-slate-950"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Gasoil thermal backup inputs */}
                      <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/60 space-y-2">
                        <span className="text-[10px] font-bold text-orange-900 uppercase tracking-widest block">Gasoil groupe électrogène de secours</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 mb-0.5">Volume Livré (Litres)</label>
                            <input 
                              type="number"
                              placeholder="ex: 1200"
                              value={newGasoilLitres}
                              onChange={(e) => setNewGasoilLitres(e.target.value)}
                              className="w-full bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg text-slate-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 mb-0.5">Coût Gasoil (FCFA)</label>
                            <input 
                              type="number"
                              placeholder="ex: 960000"
                              value={newGasoilFCFA}
                              onChange={(e) => setNewGasoilFCFA(e.target.value)}
                              className="w-full bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg text-slate-950"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-100 rounded-lg text-[10px] text-slate-500 leading-normal flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                        <span><strong>Formule DGE d'Unification</strong> : 1L de Gasoil = 10 kWh cumulatifs thermiques administratifs.</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-emerald-400" />
                        Mettre à jour mon rapport DGE
                      </button>
                    </form>
                  </div>

                  {/* Right Side: Graph of Energy evolution */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Évolution Consolidée de la Consommation</h3>
                          <p className="text-[10px] text-slate-500">CIE Énergie (kWh) + Énergie Gasoil équivalent compilés par mois (MWh)</p>
                        </div>
                        <div className="flex gap-1.5 text-[10px] font-bold">
                          <span className="flex items-center gap-1 text-blue-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Compteur CIE
                          </span>
                          <span className="flex items-center gap-1 text-orange-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Gasoil Secours
                          </span>
                        </div>
                      </div>

                      {/* Custom SVG Responsive interactive Chart representation */}
                      <div className="h-60 w-full mt-6 flex items-end justify-between relative border-b border-l border-slate-100 pb-2 pl-2">
                        {/* Y-Axis guide grid-lines */}
                        <div className="absolute left-0 right-0 top-0 border-t border-slate-100" />
                        <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100" />
                        <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100" />
                        <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100 font-mono text-[9px] text-slate-300">
                          Seuil d'Alerte (70%)
                        </div>

                        {/* Chart Bars loop */}
                        {chartRecords.map((r) => {
                          const ciePart = (r.cieKWh / 1000);
                          const thermalPart = (r.gasoilLitres * 10 / 1000);
                          const totalThisMonth = r.totalMWh;
                          
                          // max peak normalization ~120MWh
                          const maxPeak = 120;
                          const ciePercentHeight = (ciePart / maxPeak) * 100;
                          const thermalPercentHeight = (thermalPart / maxPeak) * 100;

                          return (
                            <div key={r.id} className="flex-1 flex flex-col items-center group relative px-1 h-full justify-end">
                              {/* Hover tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-950 text-white text-[10px] p-2 rounded-lg pointer-events-none transition-all duration-150 shadow-xl z-20 w-32 font-medium">
                                <p className="font-bold border-b border-slate-800 pb-1 mb-1">{r.month} {r.year}</p>
                                <p className="text-blue-400">⚡ CIE: {r.cieKWh.toLocaleString()} kWh</p>
                                <p className="text-orange-400">⛽ Gasoil: {r.gasoilLitres.toLocaleString()} L</p>
                                <p className="text-emerald-400 font-bold border-t border-slate-800 pt-1 mt-1 text-xs">Total: {totalThisMonth.toFixed(1)} MWh</p>
                              </div>

                              {/* Stacked visually clean bars */}
                              <div className="w-full text-center space-y-0.5 justify-end flex flex-col h-full max-w-[28px] sm:max-w-[40px]">
                                {/* Gasoil thermal stack */}
                                <div 
                                  className="bg-orange-500 rounded-t-xs hover:opacity-90 transition-opacity" 
                                  style={{ height: `${thermalPercentHeight}%` }}
                                />
                                {/* CIE electric stack */}
                                <div 
                                  className="bg-blue-500 rounded-b-xs hover:opacity-90 transition-opacity" 
                                  style={{ height: `${ciePercentHeight}%` }}
                                />
                              </div>

                              <span className="text-[10px] text-slate-500 font-medium mt-2">{r.month.substring(0, 4)}.</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs pt-4 border-t border-slate-100 text-slate-500 font-medium">
                      <div className="flex gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span>Moyenne tension cumulée: <strong>{totalCieKWh.toLocaleString()} kWh</strong></span>
                      </div>
                      <div className="flex gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>Gasoil secours cumulé: <strong>{totalGasoilLitres.toLocaleString()} Litres</strong></span>
                      </div>
                      <div className="flex gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span>Efficacité: <strong>16% d'économie d'énergie</strong></span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Targeted advice fast call box */}
                <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none text-9xl font-black italic select-none">
                    CONSEIL
                  </div>
                  <div className="max-w-2xl space-y-4">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 tracking-widest uppercase">
                      Recommandations automatiques
                    </span>
                    <h2 className="text-xl font-bold">Des conseils ciblés selon votre infrastructure</h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Le calculateur analyse votre site, la climatisation, le froid et le groupe électrogène pour afficher les actions prioritaires.
                    </p>
                    <div className="flex pt-2">
                      <button
                        onClick={() => {
                          setCurrentTab("advisor");
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-extrabold text-xs py-2 px-5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        Voir mes conseils
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: DETAILED STATS & HISTORY */}
            {currentTab === "stats" && (
              <div id="tab_stats" className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">Historique Réglementaire & Unification</h2>
                    <p className="text-xs text-slate-500">Tous vos relevés archivés pour prouver votre bonne foi aux contrôleurs de la DGE</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + "Mois,Annee,CIE_kWh,CIE_FCFA,Gasoil_Litres,Gasoil_FCFA,Somme_MWh\n"
                          + energyRecords.map(r => `${r.month},${r.year},${r.cieKWh},${r.cieCostFCFA},${r.gasoilLitres},${r.gasoilCostFCFA},${r.totalMWh}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `Bilan_DGE_${userProfile.companyName.replace(/ /g,"_")}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-500" />
                      Exporter en format CSV (Assise Excel)
                    </button>
                  </div>
                </div>

                {/* Conversion Info card row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-blue-900 text-xs">Cumul Électricité</h4>
                      <p className="text-xl font-black text-blue-950 mt-1">{totalCieKWh.toLocaleString()} kWh</p>
                      <p className="text-[10px] text-slate-500 font-medium">Facture totale payée : {totalCieCostFCFA.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>

                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex items-start gap-3">
                    <Flame className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-orange-900 text-xs">Cumul Gasoil de Secours</h4>
                      <p className="text-xl font-black text-orange-950 mt-1">{totalGasoilLitres.toLocaleString()} Litres</p>
                      <p className="text-[10px] text-slate-500 font-medium">Facture totale payée : {totalGasoilCostFCFA.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-900 text-xs">Equivalent Unifié Réglementaire</h4>
                      <p className="text-xl font-black text-emerald-950 mt-1">{totalMWh.toFixed(1)} MWh</p>
                      <p className="text-[10px] text-slate-500 font-medium">Calcul unifié conforme : Total = (CIE_kWh + Gasoil_L * 10) / 1000</p>
                    </div>
                  </div>
                </div>

                {/* Desktop and mobile robust table elements */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 px-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">RELEVÉS HISTORIQUES ENREGISTRÉS</span>
                    <span className="text-[10px] text-slate-500">Moyenne mensuelle: {(currentMonthsCount ? totalMWh / currentMonthsCount : 0).toFixed(1)} MWh</span>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500 font-semibold border-b border-slate-200">
                          <th className="p-3.5 px-6">Mois / Année</th>
                          <th className="p-3.5">CIE (kWh)</th>
                          <th className="p-3.5">CIE Facture (FCFA)</th>
                          <th className="p-3.5">Gasoil (Litres)</th>
                          <th className="p-3.5">Gasoil Coût (FCFA)</th>
                          <th className="p-3.5">Total Équivalent</th>
                          <th className="p-3.5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {energyRecords.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/80">
                            <td className="p-3.5 px-6 font-bold text-slate-900">{r.month} {r.year}</td>
                            <td className="p-3.5 font-mono text-blue-700">{r.cieKWh.toLocaleString()} kWh</td>
                            <td className="p-3.5 font-semibold text-slate-700">{r.cieCostFCFA.toLocaleString()} FCFA</td>
                            <td className="p-3.5 font-mono text-orange-700">{r.gasoilLitres.toLocaleString()} Litres</td>
                            <td className="p-3.5 font-semibold text-slate-700">{r.gasoilCostFCFA.toLocaleString()} FCFA</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded font-bold ${r.totalMWh > 95 ? 'bg-red-100 text-red-700' : r.totalMWh > 80 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                {r.totalMWh.toFixed(1)} MWh
                              </span>
                            </td>
                            <td className="p-3.5">
                              <button 
                                onClick={() => {
                                  if (confirm("Supprimer ce relevé mensuel ?")) {
                                    setEnergyRecords(prev => prev.filter(item => item.id !== r.id));
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Subcounter division warning visual for Office Building */}
                {userProfile.industry === "office" && (
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 space-y-3">
                    <h3 className="font-bold text-blue-900 text-sm">Gestion des Locataires et Sous-Compteurs (Mariame's Case)</h3>
                    <p className="text-xs text-blue-950 leading-relaxed">
                      L'immeuble regroupe plusieurs locataires indépendants dotés de sous-compteurs divisionnaires. La loi 156 stipule que le syndic / facility manager est légalement garant du seuil global combiné de l'infrastructure de Marcory. Vous devez répertorier l'addition de tous les compteurs pour la DGE d'ici le 31 Janvier.
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert("Simulation d'ajout de compteur locataire. Enregistrement ok !")}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl"
                      >
                        Associer un nouveau sous-compteur locataire (+2)
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: INFRASTRUCTURE SITE CALCULATOR */}
            {currentTab === "calculator" && (
              <div id="tab_calculator" className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">Calculateur MWh par endroit</h2>
                    <p className="text-xs text-slate-500">Estimez la consommation annuelle selon l'infrastructure réelle de chaque site</p>
                  </div>

                  <div className={`px-4 py-2 rounded-xl border text-xs font-bold ${allSitesAnnualMWh >= criticalLimit ? "bg-red-50 text-red-700 border-red-200" : allSitesAnnualMWh >= criticalLimit * 0.7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                    Total simulé : {allSitesAnnualMWh.toFixed(1)} MWh/an
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs xl:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Calculator className="w-5 h-5 text-emerald-500" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Paramètres du site</h3>
                        <p className="text-[10px] text-slate-500">Surface, usage, climatisation, froid et groupe</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">NOM DE L'ENDROIT</label>
                        <input
                          type="text"
                          value={siteName}
                          onChange={(e) => setSiteName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          placeholder="Ex: Hôtel Zone 4, Boutique Cocody"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">TYPE D'INFRASTRUCTURE</label>
                        <select
                          value={infrastructureType}
                          onChange={(e) => handleInfrastructureTypeChange(e.target.value as InfrastructureType)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        >
                          {Object.entries(infrastructureProfiles).map(([key, profile]) => (
                            <option key={key} value={key}>{profile.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">SURFACE M²</label>
                          <input
                            type="number"
                            min={50}
                            value={siteAreaM2}
                            onChange={(e) => setSiteAreaM2(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">HEURES / JOUR</label>
                          <input
                            type="number"
                            min={1}
                            max={24}
                            value={operatingHoursPerDay}
                            onChange={(e) => setOperatingHoursPerDay(Math.min(24, Math.max(1, Number(e.target.value))))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">CLIMS</label>
                          <input
                            type="number"
                            min={0}
                            value={acUnits}
                            onChange={(e) => setAcUnits(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-blue-50 border border-blue-100 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">CHAMBRES FROIDES</label>
                          <input
                            type="number"
                            min={0}
                            value={coldRooms}
                            onChange={(e) => setColdRooms(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-cyan-50 border border-cyan-100 text-slate-800 text-xs px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">GROUPE ÉLECTROGÈNE</label>
                          <span className="text-[10px] font-bold text-orange-600">{generatorHoursPerMonth} h/mois</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={120}
                          value={generatorHoursPerMonth}
                          onChange={(e) => setGeneratorHoursPerMonth(Number(e.target.value))}
                          className="w-full accent-orange-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveSiteEstimate}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        Enregistrer cet endroit
                      </button>
                    </div>
                  </div>

                  <div className="xl:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs md:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Résultat estimé</span>
                          <Gauge className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-4xl font-black text-slate-950">{estimatedAnnualSiteMWh.toFixed(1)}</span>
                          <span className="text-sm font-bold text-slate-400 pb-1">MWh/an</span>
                        </div>
                        <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${siteLimitPercentage >= 100 ? "bg-red-500" : siteLimitPercentage >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(siteLimitPercentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {siteLimitPercentage.toFixed(0)}% du seuil DGE de {criticalLimit} MWh pour ce seul endroit.
                        </p>
                      </div>

                      <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">CIE</span>
                          <Lightbulb className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black text-blue-950 mt-3">{estimatedAnnualCieMWh.toFixed(1)}</p>
                        <p className="text-[10px] text-blue-700 font-semibold">MWh/an estimés</p>
                      </div>

                      <div className="bg-orange-50/70 p-5 rounded-2xl border border-orange-100 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-orange-700 uppercase tracking-widest">Gasoil</span>
                          <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-black text-orange-950 mt-3">{estimatedAnnualGasoilMWh.toFixed(1)}</p>
                        <p className="text-[10px] text-orange-700 font-semibold">{estimatedGeneratorLitres.toFixed(0)} L/an convertis</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Décomposition de l'infrastructure</h3>
                          <p className="text-[10px] text-slate-500">Hypothèse locale: base bâtiment + climatisation + froid + gasoil converti à 10 kWh/L</p>
                        </div>
                        <MapPin className="w-5 h-5 text-emerald-500" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-500 uppercase text-[10px]">Bâtiment</p>
                          <p className="text-lg font-black text-slate-900 mt-1">{(estimatedBaseKWh / 1000).toFixed(1)} MWh</p>
                          <p className="text-[10px] text-slate-500">{siteAreaM2.toLocaleString('fr-FR')} m² • {activeInfrastructure.baseKWhPerM2Year} kWh/m²/an</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="font-bold text-blue-700 uppercase text-[10px]">Climatisation</p>
                          <p className="text-lg font-black text-blue-950 mt-1">{(estimatedAcKWh / 1000).toFixed(1)} MWh</p>
                          <p className="text-[10px] text-blue-700">{acUnits} unités • {operatingHoursPerDay} h/jour</p>
                        </div>
                        <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                          <p className="font-bold text-cyan-700 uppercase text-[10px]">Froid</p>
                          <p className="text-lg font-black text-cyan-950 mt-1">{(estimatedColdKWh / 1000).toFixed(1)} MWh</p>
                          <p className="text-[10px] text-cyan-700">{coldRooms} chambres froides</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                          <p className="font-bold text-orange-700 uppercase text-[10px]">Secours</p>
                          <p className="text-lg font-black text-orange-950 mt-1">{estimatedAnnualGasoilMWh.toFixed(1)} MWh</p>
                          <p className="text-[10px] text-orange-700">Groupe: {generatorHoursPerMonth} h/mois</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="p-4 px-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-xs">ENDROITS SIMULÉS</span>
                        <span className="text-[10px] text-slate-500">{siteEstimates.length} site(s)</span>
                      </div>

                      {siteEstimates.length === 0 ? (
                        <div className="p-6 text-xs text-slate-500 flex items-start gap-3">
                          <Info className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Enregistrez un premier endroit pour comparer plusieurs infrastructures: site principal, annexe, cuisine, boutique, entrepôt ou bureaux.</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-100 text-slate-500 font-semibold border-b border-slate-200">
                                <th className="p-3.5 px-6">Endroit</th>
                                <th className="p-3.5">Infrastructure</th>
                                <th className="p-3.5">Surface</th>
                                <th className="p-3.5">CIE</th>
                                <th className="p-3.5">Gasoil</th>
                                <th className="p-3.5">Total</th>
                                <th className="p-3.5">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-medium">
                              {siteEstimates.map((site) => (
                                <tr key={site.id} className="hover:bg-slate-50/80">
                                  <td className="p-3.5 px-6 font-bold text-slate-900">{site.siteName}</td>
                                  <td className="p-3.5 text-slate-600">{infrastructureProfiles[site.infrastructureType].label}</td>
                                  <td className="p-3.5 font-mono text-slate-700">{site.areaM2.toLocaleString('fr-FR')} m²</td>
                                  <td className="p-3.5 font-mono text-blue-700">{site.annualCieMWh.toFixed(1)} MWh</td>
                                  <td className="p-3.5 font-mono text-orange-700">{site.annualGasoilMWh.toFixed(1)} MWh</td>
                                  <td className="p-3.5">
                                    <span className={`px-2.5 py-1 rounded font-bold ${site.totalAnnualMWh >= criticalLimit ? "bg-red-100 text-red-700" : site.totalAnnualMWh >= criticalLimit * 0.7 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                      {site.totalAnnualMWh.toFixed(1)} MWh
                                    </span>
                                  </td>
                                  <td className="p-3.5">
                                    <button
                                      onClick={() => setSiteEstimates(prev => prev.filter(item => item.id !== site.id))}
                                      className="text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                                    >
                                      Retirer
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Snowflake className="w-5 h-5 text-cyan-300 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-bold text-sm">Lecture professionnelle du résultat</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Si un seul endroit dépasse 700 MWh/an, priorisez la climatisation, le froid commercial et les heures de groupe. Si plusieurs sites cumulés approchent 1 000 MWh/an, le dossier DGE doit être préparé avant l'échéance.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentTab("alerts")}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Comparer au seuil DGE
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ALERTS, LIMITS & DGE REQUIREMENTS */}
            {currentTab === "alerts" && (
              <div id="tab_alerts" className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">Seuils et Infractions - Arrêté Ministériel 156</h2>
                  <p className="text-xs text-slate-500">Guide de calcul légal de l'État de Côte d'Ivoire et de la Direction Générale de l'Énergie</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Critical legal rules layout */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm pb-2 border-b">L'Échelle Réglementaire d'Alerte</h3>
                    
                    <div className="space-y-4">
                      {/* Step 1: 70% Alert */}
                      <div className="flex gap-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                        <div className="w-10 h-10 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                          70%
                        </div>
                        <div className="text-xs leading-relaxed space-y-1">
                          <h4 className="font-bold text-yellow-900">Niveau d'Alerte : Modérée (Seuil à 700 MWh)</h4>
                          <p className="text-slate-700">Déclenché pour {userProfile.companyName} à {userProfile.location}. Obligation d'activer un audit interne volontaire.</p>
                          <p className="font-semibold text-yellow-950">Indicateur : Jauge passe au jaune. Nettoyage trimestriel obligatoire de la climatisation.</p>
                        </div>
                      </div>

                      {/* Step 2: 90% Alert */}
                      <div className="flex gap-4 p-4 rounded-xl bg-orange-50 border border-orange-200">
                        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black shrink-0">
                          90%
                        </div>
                        <div className="text-xs leading-relaxed space-y-1">
                          <h4 className="font-bold text-orange-900">Niveau d'Alerte : Critique (Seuil à 900 MWh)</h4>
                          <p className="text-slate-700">Désignation obligatoire et immédiate de l'<strong>Energy Champion (Référent Énergie)</strong> interne sous peine de mise en demeure.</p>
                          <p className="font-semibold text-orange-950">Statut Référent Actuel : {userProfile.energyChampionName ? `OUI (${userProfile.energyChampionName})` : "NON RENSEIGNÉ - AJOUTER AU PROFIL"}</p>
                        </div>
                      </div>

                      {/* Step 3: 100% Alert */}
                      <div className="flex gap-4 p-4 rounded-xl bg-red-50 border border-red-200">
                        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black shrink-0">
                          100%
                        </div>
                        <div className="text-xs leading-relaxed space-y-1">
                          <h4 className="font-bold text-red-900">Palier Obligatoire Arrêté 156 (Seuil à {adminThreshold.mwhLimit} MWh)</h4>
                          <p className="text-slate-700">Obligation légale de télédéclarer le rapport de conformité thermique/électrique avant le <strong>{adminThreshold.reportingDeadline}</strong> chaque année.</p>
                          <p className="font-bold text-red-700">Amende Administrative direct de {adminThreshold.fineAmountFCFA.toLocaleString('fr-FR')} FCFA applicable au premier contrôle surprise.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Mini checklist planner */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm pb-2 border-b">Éviter la sanction : Vos Obligations</h3>
                    
                    <div className="space-y-3.5 text-xs font-semibold text-slate-700">
                      <label className="flex items-start gap-2.5 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-500" />
                        <div>
                          <span>Unifier CIE moyenne tension + gasoil</span>
                          <p className="text-[10px] text-slate-400 font-normal">Fait automatiquement via le widget de saisie</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" checked={!!userProfile.energyChampionName} readOnly className="mt-0.5 rounded text-emerald-500" />
                        <div>
                          <span>Désigner un Référent Énergie interne</span>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {userProfile.energyChampionName ? `Nommé : ${userProfile.energyChampionName}` : "Aucun référent nommé (Allez sur Paramètres)"}
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" defaultChecked={complianceStatus === "Conforme"} className="mt-0.5 rounded text-emerald-500" />
                        <div>
                          <span>Maintenir l'estimation annuelle sous {criticalLimit} MWh</span>
                          <p className="text-[10px] text-slate-400 font-normal">Projection courante : {projectedAnnualMWh.toFixed(0)} MWh</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-500" />
                        <div>
                          <span>Générer et archiver le rapport annuel avant 31 Janvier</span>
                          <p className="text-[10px] text-slate-400 font-normal">Fichier DGE disponible en téléchargement 1-clic</p>
                        </div>
                      </label>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg text-[10px] text-amber-800 border border-amber-200">
                      📌 <strong>Conseil DGE :</strong> utilisez l'onglet Conseils ciblés après chaque simulation d'infrastructure pour prioriser climatisation, froid commercial et groupe électrogène.
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 4: TARGETED SITE ADVICE */}
            {currentTab === "advisor" && (
              <div id="tab_advisor" className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">Conseils ciblés par infrastructure</h2>
                    <p className="text-xs text-slate-500">
                      Recommandations automatiques basées sur le calculateur par site, les MWh estimés et le seuil DGE.
                    </p>
                  </div>

                  <button
                    onClick={() => setCurrentTab("calculator")}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    Ajuster le calculateur
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Site analysé</span>
                      <MapPin className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-black text-slate-950 mt-3">{referenceSiteName}</h3>
                    <p className="text-xs text-slate-500 mt-1">{referenceSiteType}</p>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-4xl font-black text-slate-950">{referenceSiteMWh.toFixed(1)}</span>
                      <span className="text-sm font-bold text-slate-400 pb-1">MWh/an</span>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${referenceSiteMWh >= criticalLimit ? "bg-red-500" : referenceSiteMWh >= criticalLimit * 0.7 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min((referenceSiteMWh / criticalLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {Math.min((referenceSiteMWh / criticalLimit) * 100, 999).toFixed(0)}% du seuil réglementaire de {criticalLimit} MWh/an.
                    </p>
                  </div>

                  <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Clim</span>
                      <Snowflake className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-black text-blue-950 mt-3">{(estimatedAcKWh / 1000).toFixed(1)}</p>
                    <p className="text-[10px] text-blue-700 font-semibold">MWh/an estimés sur le site courant</p>
                  </div>

                  <div className="bg-orange-50/70 p-5 rounded-2xl border border-orange-100 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-700 uppercase tracking-widest">Groupe</span>
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-2xl font-black text-orange-950 mt-3">{estimatedAnnualGasoilMWh.toFixed(1)}</p>
                    <p className="text-[10px] text-orange-700 font-semibold">MWh/an gasoil sur le site courant</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Actions recommandées</h3>
                      <p className="text-xs text-slate-500">Classées selon l'impact probable sur votre consommation annuelle.</p>
                    </div>

                    {targetedAdvice.map((advice) => {
                      const AdviceIcon = advice.icon;
                      const colorClass = advice.tone === "red"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : advice.tone === "orange"
                          ? "bg-orange-50 border-orange-200 text-orange-700"
                          : advice.tone === "blue"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : advice.tone === "cyan"
                              ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                              : advice.tone === "emerald"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-slate-50 border-slate-200 text-slate-700";

                      return (
                        <div key={advice.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                          <div className="flex items-start gap-4">
                            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}>
                              <AdviceIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h4 className="font-extrabold text-slate-950 text-sm">{advice.title}</h4>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${colorClass}`}>
                                  {advice.impact}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed mt-2">{advice.detail}</p>
                              <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700">
                                <strong>À faire :</strong> {advice.action}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">Résumé opérationnel</h3>
                      <div className="space-y-3 text-xs mt-4">
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">Infrastructure courante</span>
                          <span className="font-bold text-slate-900 text-right">{activeInfrastructure.label}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">Surface</span>
                          <span className="font-bold text-slate-900">{siteAreaM2.toLocaleString('fr-FR')} m²</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">Climatisation</span>
                          <span className="font-bold text-slate-900">{acUnits} unités</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">Chambres froides</span>
                          <span className="font-bold text-slate-900">{coldRooms}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">Groupe</span>
                          <span className="font-bold text-slate-900">{generatorHoursPerMonth} h/mois</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-bold text-sm">Conseil de méthode</h3>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Modifiez un paramètre dans le calculateur, revenez ici, puis observez quel conseil change. C'est le moyen le plus rapide de décider quoi corriger en premier.
                          </p>
                        </div>
                      </div>
                    </div>

                    {siteEstimates.length > 0 && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">Sites enregistrés</h3>
                        <div className="space-y-2 mt-4">
                          {siteEstimates.slice(0, 4).map((site) => (
                            <div key={site.id} className="flex items-center justify-between gap-3 text-xs p-2 rounded-lg bg-slate-50">
                              <span className="font-bold text-slate-700 truncate">{site.siteName}</span>
                              <span className="font-mono text-slate-500 shrink-0">{site.totalAnnualMWh.toFixed(1)} MWh</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: COMMUNAUTÉ & DEFIS D'EFFICACITÉ */}
            {currentTab === "community" && (
              <div id="tab_community" className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">Espace Collaboratif Tertiaire</h2>
                    <p className="text-xs text-slate-500">Mutualisez les astuces locales et participez aux défis d'économie des quartiers d'Abidjan</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Challenges cards map */}
                  <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm pb-2 border-b">Défis Éco-Énergie d'Abidjan</h3>

                    {challenges.map((c) => (
                      <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-slate-950 font-mono tracking-wider">{c.rewardBadge}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold font-mono">
                              -{c.targetReduction}% CIE
                            </span>
                          </div>
                          
                          <h4 className="font-extrabold text-slate-900 text-sm mt-2">{c.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400">{c.participantsCount} participants</span>
                          <button
                            onClick={() => toggleJoinChallenge(c.id)}
                            className={`font-bold py-1.5 px-3 rounded-lg transition text-xs ${c.joined ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                          >
                            {c.joined ? "Participé ! ✓" : "S'inscrire"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Forum feed */}
                  <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm pb-2 border-b">Fil de discussion de la communauté</h3>

                    {/* New post creation */}
                    <form onSubmit={handleAddForumPost} className="bg-slate-50 p-4 rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Partager une astuce ou poser une question</span>
                      <textarea
                        value={newForumText}
                        onChange={(e) => setNewForumText(e.target.value)}
                        placeholder="Quels sont vos retours sur la clim à l'Hôtel ou l'utilisation d'ampoules LED à Marcory Zone 4 ?"
                        maxLength={400}
                        rows={3}
                        className="w-full bg-white border border-slate-200 text-xs p-2.5 rounded-lg text-slate-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <div className="flex gap-2 text-xs">
                        <input
                          type="text"
                          value={newForumTags}
                          onChange={(e) => setNewForumTags(e.target.value)}
                          placeholder="climatisation, Côte d'Ivoire, LED (séparer par des virgules)"
                          className="flex-1 bg-white border border-slate-200 p-2 rounded-lg text-slate-950"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 rounded-lg cursor-pointer"
                        >
                          Publier
                        </button>
                      </div>
                    </form>

                    {/* Forum posts map */}
                    <div className="space-y-4 divide-y">
                      {forumPosts.map((post) => (
                        <div key={post.id} className="pt-4 space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                              {post.author[0]}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 leading-tight">
                                {post.author} • <span className="font-normal text-slate-400">{post.role} à {post.company}</span>
                              </p>
                              <p className="text-[10px] text-slate-400">{post.date}</p>
                            </div>
                          </div>

                          <p className="text-slate-800 leading-relaxed font-normal">{post.content}</p>

                          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                            <div className="flex gap-2">
                              {post.tags.map((tag, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded font-mono">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-4">
                              <button 
                                onClick={() => {
                                  setForumPosts(prev => prev.map(p => p.id === post.id ? {...p, likes: p.likes + 1} : p));
                                }}
                                className="hover:text-amber-500 font-bold"
                              >
                                👍 {post.likes} J'aime
                              </button>
                              <span>💬 {post.commentsCount} Commentaires</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* TAB 6: SETTINGS & TARGET CONFORMCITY */}
            {currentTab === "settings" && (
              <div id="tab_settings" className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">Profil de l'Entreprise et Éco-gérance</h2>
                  <p className="text-xs text-slate-500">Mettez à jour les paramètres de l'Arrêté 156 pour l'établissement</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-6">
                  
                  {/* Designated Energy champion selection */}
                  <div className="space-y-4">
                    <div className="pb-2 border-b">
                      <h3 className="font-extrabold text-slate-900 text-sm">Référent Énergie désigné (Animateur des Éco-gestes)</h3>
                      <p className="text-xs text-slate-500">Pour être en conformité avec la réglementation DGE, tout établissement affichant plus de 700 MWh brut par an doit impérativement désigner un Référent Énergie.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">NOM DU RÉFÉRENT ÉNERGIE</label>
                        <input
                          type="text"
                          value={userProfile.energyChampionName}
                          onChange={(e) => {
                            setUserProfile({
                              ...userProfile,
                              energyChampionName: e.target.value
                            });
                          }}
                          placeholder="ex: Alex Yao, Resp. Climatisation"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-950 text-xs px-3 py-2 rounded-xl focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">NUMÉRO DE PORTABLE DE CONTACT</label>
                        <input
                          type="text"
                          value={userProfile.phone}
                          onChange={(e) => {
                            setUserProfile({
                              ...userProfile,
                              phone: e.target.value
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-950 text-xs px-3 py-2 rounded-xl focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* General parameters */}
                  <div className="space-y-4">
                    <div className="pb-2 border-b">
                      <h3 className="font-extrabold text-slate-900 text-sm">Propriétés de la Structure</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">ENTREPRISE</label>
                        <input
                          type="text"
                          value={userProfile.companyName}
                          onChange={(e) => {
                            setUserProfile({
                              ...userProfile,
                              companyName: e.target.value
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-950 text-xs px-3 py-2 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">SECTEUR</label>
                        <select
                          value={userProfile.industry}
                          onChange={(e) => {
                            setUserProfile({
                              ...userProfile,
                              industry: e.target.value
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-950 text-xs px-3 py-2 rounded-xl"
                        >
                          <option value="hotel">🏨 Hôtellerie / Tourisme</option>
                          <option value="supermarket">🛒 Supermarché / Commerce</option>
                          <option value="office">🏢 Bureaux Complexes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">EMPLOYÉS</label>
                        <input
                          type="number"
                          value={userProfile.employeeCount}
                          onChange={(e) => {
                            setUserProfile({
                              ...userProfile,
                              employeeCount: parseInt(e.target.value) || 0
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-950 text-xs px-3 py-2 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuration Notifications */}
                  <div className="space-y-4">
                    <div className="pb-2 border-b">
                      <h3 className="font-extrabold text-slate-900 text-sm font-medium">Préférences de Rappel Réglementaires</h3>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-500" />
                        <span>M'avertir par SMS de toute nouvelle directive de la Direction Générale de l'Énergie</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-500" />
                        <span>Alerte hebdomadaire de rappel lorsque la jauge annuelle approche 95%</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-500" />
                        <span>Recevoir les défis communautaires d'Abidjan par WhatsApp</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => {
                        alert("Paramètres de l'Arrêté 156 enregistrés dans le localStorage temporaire !");
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs transition"
                    >
                      Enregistrer les préférences
                    </button>
                    
                    <button
                      onClick={() => {
                        setCurrentScreen("auth");
                      }}
                      className="border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs py-2.5 px-6 rounded-xl transition"
                    >
                      Se Déconnecter
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 7: SEKA AI ADVISOR CHATBOT */}
            {currentTab === "seka" && (
              <div id="tab_seka" className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-sm">Seka — Conseiller Énergie IA</h2>
                      <p className="text-[10px] text-slate-500">Spécialiste Arrêté 156 DGE • Réglementations ivoiriennes • PME Abidjan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      En ligne
                    </span>
                    <button
                      onClick={() => setChatMessages(initialChatsByProfile[selectedPersona] || initialChatsByProfile["newuser"])}
                      className="text-xs text-slate-400 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>

                {/* Context banner */}
                <div className="bg-emerald-950/40 border-b border-emerald-900/30 px-6 py-2.5 flex items-center gap-3">
                  <div className="text-[10px] text-emerald-300 font-medium flex flex-wrap gap-x-4 gap-y-1">
                    <span>📍 <strong>{userProfile.companyName}</strong> — {userProfile.location}</span>
                    <span>⚡ Cumul 12 mois : <strong className={totalMWh >= 1000 ? "text-red-400" : totalMWh >= 700 ? "text-amber-400" : "text-emerald-400"}>{totalMWh.toFixed(1)} MWh</strong></span>
                    <span>📊 Statut : <strong className={complianceStatus === "En infraction" ? "text-red-400" : complianceStatus === "Conforme" ? "text-emerald-400" : "text-amber-400"}>{complianceStatus}</strong></span>
                    <span>💰 Coût total : <strong>{(totalCieCostFCFA + totalGasoilCostFCFA).toLocaleString("fr-FR")} FCFA</strong></span>
                  </div>
                </div>

                {/* Messages area */}
                <div
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50"
                  style={{ maxHeight: "calc(100vh - 280px)" }}
                >
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      {msg.role === "assistant" ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-xs">
                          {userProfile.name.split(" ")[0][0]}
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={`max-w-[75%] space-y-1 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                        <div
                          className={`px-4 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            msg.role === "assistant"
                              ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                              : "bg-slate-900 text-white rounded-tr-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {chatLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                        <div className="flex gap-1.5 items-center h-4">
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested quick questions */}
                <div className="bg-white border-t border-slate-100 px-6 py-2 flex gap-2 overflow-x-auto">
                  {[
                    "Comment éviter l'amende de 5M FCFA ?",
                    "Comment réduire ma facture CIE ?",
                    "Que faire avec mon groupe électrogène ?",
                    "Comment générer mon rapport DGE ?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      className="shrink-0 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-full transition whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input area */}
                <div className="bg-white border-t border-slate-200 px-6 py-4">
                  <form onSubmit={handleSendChat} className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Posez votre question à Seka sur l'Arrêté 156, votre clim, votre gasoil…"
                      disabled={chatLoading}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      Envoyer
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    Seka utilise l'IA Gemini. Les réponses sont indicatives et ne remplacent pas un conseil juridique officiel.
                  </p>
                </div>
              </div>
            )}

            {/* Footer containing hackathon details */}
            <footer className="bg-white border-t border-slate-200 p-4 px-6 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
              <p>🇨🇮 <strong>Souverain Énergie</strong> • MVP Homologation Arrêté 156 DGE • Secteur Énergie & PME Tertiaires</p>
              <p className="font-mono">Date Prototype: Hackathon WeCode ESG - Juin 2026</p>
            </footer>

          </main>
        </div>
      )}

      {/* RENDER DGE ADMINISTRATIVE DASHBOARD VIEW */}
      {currentScreen === "admin" && (
        <div id="dge_admin_screen" className="flex-1 flex flex-col bg-slate-900 text-slate-100">
          
          {/* Admin Header Navbar */}
          <nav className="bg-slate-950 border-b border-slate-800 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-emerald-400 tracking-widest flex items-center gap-1.5">
                🇨🇮 <span className="text-white">CONTRÔLEUR GENERAL DGE</span>
              </span>
              <span className="text-[10px] bg-emerald-900/40 text-emerald-400 border border-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                Décret Arrêté 156
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentScreen("auth");
                }}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Quitter l'Admin
              </button>
            </div>
          </nav>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl w-full mx-auto">
            
            {/* Top row stats: administrative summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">ENTREPRISES SUIVIES (ABIDJAN)</span>
                <span className="text-3xl font-extrabold text-white mt-2 block">{pmeStatusList.length} PMEs</span>
                <p className="text-[11px] text-slate-400 mt-1">Zone 4, Marcory & Cocody</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">SEUIL DE DÉPASSEMENT</span>
                <span className="text-3xl font-extrabold text-amber-400 mt-2 block">{adminThreshold.mwhLimit} MWh</span>
                <p className="text-[11px] text-slate-400 mt-1">Arrêté 156 du 8 juin 2026</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">EN FRACTION IMMÉDIATE</span>
                <span className="text-3xl font-extrabold text-red-500 mt-2 block">
                  {pmeStatusList.filter(p => p.ytdTotalMWh >= adminThreshold.mwhLimit && !p.submittedReport).length} PMEs
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Risque de 5M FCFA d'amende</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">DOSSIERS DÉPOSÉS (CONFORMITÉ)</span>
                <span className="text-3xl font-extrabold text-emerald-400 mt-2 block">
                  {pmeStatusList.filter(p => p.submittedReport).length} Archivés
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Rapports générés valides</p>
              </div>
            </div>

            {/* Admin Grid: Left config center & Right User table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left sidebar: Adjust variables and announcements */}
              <div className="space-y-4 lg:col-span-1">
                
                {/* Variable Tweaker */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-sm pb-2 border-b border-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Paramètres de l'Arrêté 156
                  </h3>

                  <form onSubmit={handleUpdateGEThreshold} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">SEUIL CRITIQUE DE SATELLITE (MWh)</label>
                      <input
                        type="number"
                        value={adminThreshold.mwhLimit}
                        onChange={(e) => setAdminThreshold({...adminThreshold, mwhLimit: parseInt(e.target.value) || 1000})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">MONTANT DE L'AMENDE DIRECTE (FCFA)</label>
                      <input
                        type="number"
                        value={adminThreshold.fineAmountFCFA}
                        onChange={(e) => setAdminThreshold({...adminThreshold, fineAmountFCFA: parseInt(e.target.value) || 5000000})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold tracking-widest mb-1.5 uppercase">DATE BUTOIR DÉPÔT RAPPORTS</label>
                      <input
                        type="text"
                        value={adminThreshold.reportingDeadline}
                        onChange={(e) => setAdminThreshold({...adminThreshold, reportingDeadline: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl transition cursor-pointer"
                    >
                      Actualiser les seuils nationaux
                    </button>
                  </form>
                </div>

                {/* Campaign message center */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-sm pb-2 border-b border-slate-800">Sensibilisation d'Urgence (Campagnes)</h3>
                  
                  <form onSubmit={handleSendDGECampaign} className="space-y-3.5 text-xs">
                    <p className="text-slate-400">Envoyez une recommandation nationale visible par tous les dirigeants sur leur barre d'alerte.</p>
                    <textarea
                      value={newDGEAnnouncement}
                      onChange={(e) => setNewDGEAnnouncement(e.target.value)}
                      placeholder="Ex: Pensez à nommer votre Référent Énergie avant fin Juillet conformément au décret du Grand Abidjan."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
                      rows={3}
                    />
                    <button
                      type="submit"
                      className="w-full bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-800/40 font-bold py-2 px-4 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                      Diffuser l'alerte DGE
                    </button>
                  </form>
                </div>

              </div>

              {/* Right column: list of user companies and statuses */}
              <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-white text-sm">Registre d'Homologation des Établissements Tertiaires</h3>
                    <p className="text-xs text-slate-500">Statistiques temps réel basées sur les unifications mensuelles</p>
                  </div>

                  <input
                    type="text"
                    placeholder="Chercher une PME..."
                    value={adminSearchCompany}
                    onChange={(e) => setAdminSearchCompany(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
                  />
                </div>

                {/* Table containing all monitored hotels, supermarkets and office buildings */}
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-450 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3">Établissement</th>
                        <th className="py-3 px-3">Localisation</th>
                        <th className="py-3 px-3">Cumulé 12 mois</th>
                        <th className="py-3 px-3">Dossier</th>
                        <th className="py-3 px-3">Réf. Énergie</th>
                        <th className="py-3 px-3">Alerte / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {pmeStatusList
                        .filter(p => p.companyName.toLowerCase().includes(adminSearchCompany.toLowerCase()))
                        .map((p) => {
                          const crossedLimit = p.ytdTotalMWh >= adminThreshold.mwhLimit;
                          return (
                            <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                              <td className="py-3 px-3">
                                <div className="font-bold text-white">{p.companyName}</div>
                                <span className="text-[10px] text-slate-500">{p.industry.toUpperCase()} • {p.contactName}</span>
                              </td>
                              <td className="py-3 px-3 text-slate-350">{p.location}</td>
                              <td className="py-3 px-3 font-mono">
                                <span className={crossedLimit ? "text-red-400 font-bold" : "text-emerald-400"}>
                                  {p.ytdTotalMWh.toFixed(1)} MWh
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                {p.submittedReport ? (
                                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40">✓ Déposé</span>
                                ) : (
                                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Non soumis</span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                {p.designatedChampion ? (
                                  <span className="text-emerald-500 font-bold">Oui</span>
                                ) : (
                                  <span className="text-red-400">À nommer</span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setActiveAdminPME(p);
                                      // pre-fill helper
                                      setAdminReplies(prev => ({
                                        ...prev,
                                        [p.id]: `Madame/Monsieur ${p.contactName}, l'Arrêté 156 nécessite un dépôt immédiat sous peine d'une amende de ${adminThreshold.fineAmountFCFA.toLocaleString()} FCFA.`
                                      }));
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-2 py-1 rounded"
                                  >
                                    Inspecter
                                  </button>
                                  {crossedLimit && !p.submittedReport && (
                                    <button
                                      onClick={() => {
                                        alert(`Mise en demeure réglementaire envoyée par e-mail officiel à ${p.contactEmail}.\n\nAmende de ${adminThreshold.fineAmountFCFA.toLocaleString('fr-FR')} FCFA consignée en suspens.`);
                                        setPmeStatusList(prev => prev.map(item => item.id === p.id ? {...item, complianceState: "En infraction"} : item));
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded select-none cursor-pointer"
                                    >
                                      Sévir
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Inspect and write reply panel */}
                {activeAdminPME && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mt-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="font-bold text-white text-xs">Aide & Recommandation DGE pour: {activeAdminPME.companyName}</span>
                      <button 
                        onClick={() => setActiveAdminPME(null)} 
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        [Fermer x]
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 leading-normal font-normal space-y-1">
                      <p>Contact : **{activeAdminPME.contactName}** ({activeAdminPME.contactEmail})</p>
                      <p>Saisies cumulées de sa PME : **{activeAdminPME.ytdTotalMWh.toFixed(1)} MWh** (CIE: {(activeAdminPME.cieCostYTD/100).toLocaleString()} kWh, Gasoil: {(activeAdminPME.gasoilCostYTD/800).toLocaleString()} L)</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Message de Rappel à Envoyer</label>
                      <textarea
                        value={adminReplies[activeAdminPME.id] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminReplies(prev => ({ ...prev, [activeAdminPME.id]: val }));
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                        rows={2}
                      />
                      <button
                        onClick={() => {
                          alert(`Message envoyé à ${activeAdminPME.contactName} : "${adminReplies[activeAdminPME.id] || ""}"`);
                          setActiveAdminPME(null);
                        }}
                        className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
                      >
                        Transmettre Recommandation
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* DGE Legal and compliance report template downloader preview */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs font-normal">
              <h3 className="font-bold text-white text-sm">Canevas DGE National - Rapport d'homologation assistée</h3>
              <p className="text-slate-400 leading-relaxed">
                Ce prototype simule de manière fidèle le moteur d'homologation officiel du gouvernement ivoirien. Les managers d'Abidjan saisissent mensuellement l'index de leur facture d'électricité standard et le montant en litres de gasoil réapprovisionnés pour le groupe. Les algorithmes de conversion certifiés se chargent de projeter la consommation consolidée, évitant ainsi le recours coûteux à un expert externe ou à du matériel IoT inadapté.
              </p>
            </div>

          </div>

          {/* Admin simple footer */}
          <footer className="bg-slate-950 border-t border-slate-800 p-4 text-center text-[10px] text-slate-500">
            Hackathon WeCode ESG 2026 - Ministère de l'Énergie Côte d'Ivoire. Tous droits réservés.
          </footer>

        </div>
      )}

    </div>
  );
}
