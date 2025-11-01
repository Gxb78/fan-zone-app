// src/data/masterSportData.js

const masterSportData = {
  football: {
    name: "Football",
    icon: "⚽",
    matches: [
      {
        id: "PSG_OM_LOCAL_V4",
        competition: "Ligue 1 - Le Classique",
        time: "Ce soir 21:00",
        date: "2025-11-01T21:00:00", // On ajoute une date pour la cohérence
        status: "SCHEDULED",
        teamA: "Paris SG",
        teamB: "Marseille",
        logoA:
          "https://upload.wikimedia.org/wikipedia/fr/8/86/Paris_Saint-Germain_Logo.svg",
        logoB:
          "https://upload.wikimedia.org/wikipedia/fr/d/d8/Olympique_de_Marseille_logo.svg",
        bgImage:
          "https://media.gqmagazine.fr/photos/63511e63344b58962cbc55b0/16:9/w_2560%2Cc_limit/GettyImages-1244002778.jpg",
        usersEngaged: 12847,
        sportKey: "football",
        polls: [
          {
            id: "vainqueur_match",
            title: "Résultat du Classique",
            polarizingQuestion:
              "Paris va-t-il faire respecter son statut ou l'OM va créer la surprise ?",
            options: [
              { key: "teamA", text: "Paris SG", order: 0 },
              { key: "draw", text: "Match Nul", order: 1 },
              { key: "teamB", text: "Marseille", order: 2 },
            ],
            seedVotes: { teamA: 6231, draw: 2301, teamB: 5412 },
          },
          {
            id: "possession",
            title: "Bataille du milieu",
            polarizingQuestion: "Quelle équipe aura la possession du ballon ?",
            options: [
              { key: "teamA", text: "Paris SG", order: 0 },
              { key: "teamB", text: "Marseille", order: 1 },
            ],
            seedVotes: { teamA: 8100, teamB: 3500 },
          },
        ],
      },
    ],
  },
  // On laisse les clés pour Tennis et F1, mais vides, pour ne pas casser le sélecteur.
  tennis: {
    name: "Tennis",
    icon: "🎾",
    matches: [],
  },
  f1: {
    name: "Formule 1",
    icon: "🏎️",
    matches: [],
  },
};

export default masterSportData;
