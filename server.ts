import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const VITE_HMR_PORT = Number(process.env.VITE_HMR_PORT || 24679);

// API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

// API: Chat with Seka - Côte d'Ivoire Energy AI Advisor
app.post("/api/chat", async (req, res) => {
  const { messages, userContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const systemInstruction = `Tu es "Seka", un conseiller expert en efficacité énergétique spécialisé dans les réglementations ivoiriennes, notamment l'Arrêté 156 de la DGE (Direction Générale de l'Énergie) qui encadre les établissements tertiaires (PME, hôtels, supermarchés, complexes de bureaux) à Abidjan (Cocody, Marcory, Zone 4, etc.) dont la consommation combinée dépasse 1000 MWh/an (compteurs CIE électriques MT + gasoil de groupe électrogène).

Ton objectif est de répondre aux questions en français impeccable, convivial et pratique, pour aider les utilisateurs à éviter l'amende de 5 000 000 FCFA, réduire leur facture CIE, optimiser leurs groupes électrogènes (gasoil), et préparer leur rapport officiel (rapport DGE à déposer avant le 31 janvier).

Règles:
1. Parle en Francs CFA (FCFA). 1 kWh CIE MT ≈ 100 FCFA, 1 litre de gasoil ≈ 800 FCFA.
2. Le seuil légal est 1000 MWh/an (= 1 000 000 kWh/an).
3. Formule DGE : Total MWh = (kWh CIE + Litres gasoil × 10) / 1000
4. Réponds de façon concrète, avec des chiffres, des listes d'actions pratiques et des calculs simples.
5. Ton professionnel, pragmatique, encourageant et respectueux.

Contexte utilisateur actuel:
- Entreprise: ${userContext?.companyName || "PME Ivoirienne"}
- Rôle: ${userContext?.role || "Gérant"}
- Localisation: ${userContext?.location || "Abidjan, Côte d'Ivoire"}
- Consommation 12 mois glissants: ${userContext?.ytdTotalMWh || "N/A"} MWh
- Coût électricité CIE: ${userContext?.cieCostFCFA ? parseInt(userContext.cieCostFCFA).toLocaleString("fr-FR") : "N/A"} FCFA
- Coût gasoil: ${userContext?.gasoilFCFA ? parseInt(userContext.gasoilFCFA).toLocaleString("fr-FR") : "N/A"} FCFA
- Statut de conformité: ${userContext?.complianceStatus || "Inconnu"}`;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (GEMINI_API_KEY && GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      const lastMessage = messages[messages.length - 1];
      const chatHistory = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const contents = [
        ...chatHistory,
        { role: "user", parts: [{ text: lastMessage.content }] },
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      const data = await response.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Désolé, je n'ai pas pu générer de recommandations.";
      return res.json({ reply });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      // Fall through to rule-based fallback
    }
  }

  // Rule-based expert fallback (works without API key)
  console.log("Mode local activé — pas de clé GEMINI_API_KEY, utilisation du conseiller intégré.");
  const lastText = messages[messages.length - 1].content.toLowerCase();
  let reply = `Bonjour, je suis Seka, votre conseiller énergie. (Mode local — ajoutez votre clé GEMINI_API_KEY dans le fichier .env pour des réponses IA dynamiques).\n\nPour **${userContext?.companyName || "votre PME"}** à ${userContext?.location || "Abidjan"} — Consommation actuelle : **${userContext?.ytdTotalMWh || "N/A"} MWh** :\n`;

  if (lastText.includes("amende") || lastText.includes("arrêté") || lastText.includes("156") || lastText.includes("dge") || lastText.includes("infraction")) {
    reply += `\n**L'Arrêté 156 en résumé :**\n\n1. Tout établissement tertiaire consommant plus de **1 000 MWh/an** (CIE + gasoil × 10 kWh/L) doit déposer un rapport avant le **31 janvier**.\n2. Désignation obligatoire d'un **Référent Énergie** interne.\n3. Amende directe de **5 000 000 FCFA** en cas de non-conformité ou de non-dépôt.\n\n✅ **Action immédiate :** Cliquez sur "Rapport DGE pro" en haut à droite pour générer votre fichier officiel en 1 clic.`;
  } else if (lastText.includes("facture") || lastText.includes("cie") || lastText.includes("réduire") || lastText.includes("économiser") || lastText.includes("facture")) {
    reply += `\n**3 actions prioritaires pour réduire votre facture CIE :**\n\n1. 🌡️ **Climatisation à 24°C minimum** — chaque degré de moins en dessous coûte +7% de facture en climat tropical.\n2. 💡 **Passage aux LED** — réduction de 65% des coûts d'éclairage.\n3. 🔌 **Extinction totale la nuit** — multiprises à interrupteur pour bureaux, enseignes et vitrines. Les veilles = 5-10% de la facture.\n\n**Gain estimé : 15 à 25% sur votre facture CIE.**`;
  } else if (lastText.includes("gasoil") || lastText.includes("groupe") || lastText.includes("coupure") || lastText.includes("électrogène")) {
    reply += `\n**Optimisation groupe électrogène :**\n\n1. 📋 **Registre heures/litres** — notez chaque démarrage et volume de carburant dans l'onglet "Statistiques".\n2. 🔧 **Entretien préventif** — filtre air encrassé = +12% de consommation de gasoil.\n3. ⚡ **Isolation des circuits** — pendant les coupures, coupez la climatisation de confort. Gardez uniquement l'essentiel (réfrigération, éclairage de sécurité).\n\n⚠️ **Rappel légal :** 1 litre de gasoil = 10 kWh dans le calcul DGE. Votre gasoil s'additionne à votre consommation CIE !`;
  } else if (lastText.includes("rapport") || lastText.includes("déclaration") || lastText.includes("dépôt") || lastText.includes("générer")) {
    reply += `\n**Générer votre rapport DGE officiel :**\n\n1. ✅ Assurez-vous d'avoir saisi tous vos relevés mensuels dans l'onglet **Statistiques**.\n2. 📄 Cliquez sur le bouton **"Rapport DGE pro"** dans la barre du haut.\n3. 🖨️ Un fichier HTML s'ouvre — imprimez-le en PDF depuis votre navigateur (Ctrl+P → Enregistrer en PDF).\n4. 📬 Déposez le PDF à la **Direction Générale de l'Énergie** avant le **31 janvier**.\n\n📌 N'oubliez pas de renseigner votre **Référent Énergie** dans l'onglet "Profil & Éco-gérance".`;
  } else if (lastText.includes("seuil") || lastText.includes("mwh") || lastText.includes("consommation") || lastText.includes("calculer")) {
    reply += `\n**Formule de calcul DGE :**\n\n\`Total MWh = (kWh CIE + Litres gasoil × 10) / 1000\`\n\n📊 Votre situation actuelle : **${userContext?.ytdTotalMWh || "N/A"} MWh** sur 12 mois glissants (seuil = 1 000 MWh).\n\nUtilisez l'onglet **"Calculateur par site"** pour estimer votre consommation par infrastructure (surface, climatiseurs, chambres froides, groupe).`;
  } else {
    reply += `\nJe suis disponible pour vous aider sur :\n\n🔴 **Réglementation** — Arrêté 156, amende de 5M FCFA, obligations légales.\n⚡ **Facture CIE** — Comment réduire votre consommation électrique à Abidjan.\n⛽ **Gasoil & groupe** — Optimiser votre groupe électrogène.\n📄 **Rapport DGE** — Générer et déposer votre déclaration officielle.\n🧮 **Calculs MWh** — Comprendre et surveiller votre seuil.\n\nQue puis-je faire pour vous ?`;
  }

  return res.json({ reply });
});

// API: Scan a meter/invoice photo and extract readings via Gemini Vision
app.post("/api/scan-meter", async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Image (base64) requise" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    return res.status(200).json({
      error: "Scan IA indisponible : ajoutez votre clé GEMINI_API_KEY dans le fichier .env pour activer la lecture automatique des compteurs.",
    });
  }

  const prompt = `Tu analyses une photo d'un compteur électrique CIE (Côte d'Ivoire) ou d'une facture d'électricité/gasoil pour une PME à Abidjan.
Extrait UNIQUEMENT les valeurs suivantes si elles sont clairement visibles sur l'image, sinon mets null :
- cieKWh : consommation électrique en kWh (nombre)
- cieFCFA : montant de la facture électricité en Francs CFA (nombre)
- gasoilLitres : volume de gasoil livré en litres, si visible (nombre)
- gasoilFCFA : coût du gasoil en FCFA, si visible (nombre)
- meterNumber : numéro du compteur, si visible (texte)
- period : période/mois de la facture, si visible (texte)

Réponds STRICTEMENT en JSON valide, sans texte autour, sans balises markdown, selon ce format exact :
{"cieKWh": number|null, "cieFCFA": number|null, "gasoilLitres": number|null, "gasoilFCFA": number|null, "meterNumber": string|null, "period": string|null}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } },
              ],
            },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512, responseMimeType: "application/json" },
        }),
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(200).json({ error: "Aucune donnée extraite de la photo." });
    }

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Vision (scan-meter) Error:", error);
    return res.status(200).json({ error: "Échec de l'analyse de la photo. Réessayez ou saisissez manuellement." });
  }
});

// Setup Vite Dev server or Serve build assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🚀 Démarrage en mode DÉVELOPPEMENT avec Vite...");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: VITE_HMR_PORT },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Démarrage en mode PRODUCTION...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Souverain Énergie — http://localhost:${PORT}`);
    console.log(`   Mode IA : ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" ? "Gemini AI activé ✨" : "Mode local (ajoutez GEMINI_API_KEY dans .env pour l'IA)"}`);
  });
}

startServer();
