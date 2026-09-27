# 🇨🇮 Souverain Énergie — Application de conformité Arrêté 156

Application mobile-first de conformité énergétique pour les PME tertiaires d'Abidjan.

## 🚀 Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
```
Éditez `.env` et ajoutez votre clé Gemini (optionnel) :
```
GEMINI_API_KEY="votre_cle_ici"
```
Obtenez une clé gratuite sur : https://aistudio.google.com/app/apikey

### 3. Lancer l'application
```bash
npm run dev
```
Ouvrez http://localhost:3000

## ✨ Fonctionnalités

| Onglet | Description |
|--------|-------------|
| 📊 **Tableau de bord** | Jauge DGE, saisie mensuelle CIE + gasoil, graphique d'évolution |
| 📈 **Statistiques & Bilan** | Historique des relevés, export CSV, cumuls réglementaires |
| 🧮 **Calculateur** | Estimation MWh par infrastructure (surface, clims, froid, groupe) |
| 🚨 **Seuils & Alertes** | Obligations légales Arrêté 156, checklist de conformité |
| 💡 **Conseils ciblés** | Recommandations automatiques selon votre infrastructure |
| 👥 **Communauté** | Forum PME Abidjan, défis éco-énergie |
| ✨ **Seka — IA** | Conseiller IA Gemini spécialisé Arrêté 156 (mode local sans clé API) |
| ⚙️ **Profil** | Paramètres entreprise, référent énergie, préférences |

## 🤖 Conseiller Seka (IA)

Sans clé API : Seka fonctionne avec un moteur de règles intégré couvrant les questions fréquentes.
Avec clé Gemini : Seka répond de façon dynamique à toutes vos questions en tenant compte de votre contexte réel.

## 📦 Technologies

- **Frontend** : React 19 + TypeScript + Tailwind CSS v4 + Vite
- **Backend** : Node.js + Express
- **IA** : Google Gemini 1.5 Flash (via API REST)
- **PDF rapport** : Génération HTML imprimable en 1 clic

## 👤 Personas de démonstration

| Persona | Entreprise | Statut |
|---------|-----------|--------|
| **Kofi Amon** | Hôtel Le Grand Sud (Zone 4) | ⚠️ 882 MWh — Alerte critique |
| **Mariame Tanoh** | Marcory Business Center | 🔴 1052 MWh — En infraction |
| **M. Diallo** | Le Grand Bazar Cocody | ✅ 82 MWh — Conforme |

---
Hackathon WeCode ESG 2026 • Ministère de l'Énergie Côte d'Ivoire
