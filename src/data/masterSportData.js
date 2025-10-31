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
        teamA: "Paris SG",
        teamB: "Marseille",
        logoA:
          "https://upload.wikimedia.org/wikipedia/fr/8/86/Paris_Saint-Germain_Logo.svg",
        logoB:
          "https://upload.wikimedia.org/wikipedia/fr/d/d8/Olympique_de_Marseille_logo.svg",
        bgImage:
          "https://media.gqmagazine.fr/photos/63511e63344b58962cbc55b0/16:9/w_2560%2Cc_limit/GettyImages-1244002778.jpg",
        usersEngaged: 12847,
        sportKey: "football", // Très important d'avoir le sportKey ici
        // On définit ici les sondages qu'on veut voir si ce match local est chargé
        polls: [
          {
            id: "vainqueur_match",
            title: "Résultat du Classique",
            polarizingQuestion:
              "Paris va-t-il faire respecter son statut ou l'OM va créer la surprise ?",
            options: {
              teamA: "Paris SG",
              draw: "Match Nul",
              teamB: "Marseille",
            },
            seedVotes: { teamA: 6231, draw: 2301, teamB: 5412 },
          },
          {
            id: "possession",
            title: "Bataille du milieu",
            polarizingQuestion: "Quelle équipe aura la possession du ballon ?",
            options: { teamA: "Paris SG", teamB: "Marseille" },
            seedVotes: { teamA: 8100, teamB: 3500 },
          },
        ],
      },
    ],
  },
  basketball: {
    name: "Basketball",
    icon: "🏀",
    matches: [
      {
        id: "LAL_GSW_2025_11_05",
        competition: "NBA",
        time: "02:00",
        timeUntilMatch: "2j 2h",
        teamA: "Lakers",
        teamB: "Warriors",
        logoA:
          "https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg",
        logoB:
          "https://upload.wikimedia.org/wikipedia/fr/0/01/Golden_State_Warriors_logo.svg",
        bgImage:
          "https://media.gq.com/photos/63518a2556a4387588b56033/16:9/w_2560%2Cc_limit/GettyImages-1244049611.jpg",
        // 🔥 AUGMENTÉ
        usersEngaged: 4897,
        polls: [
          {
            id: "resultat_final_lal_gsw",
            title: "Vainqueur du match",
            polarizingQuestion:
              "LeBron peut-il encore rivaliser avec Curry en 2025 ? La réponse ce soir !",
            options: {
              teamA: "Lakers - LeBron pour la gloire",
              teamB: "Warriors - La machine Curry",
            },
          },
        ],
      },
      // ✨ NOUVEAU MATCH AJOUTÉ
      {
        id: "BOS_MIL_2025_11_06",
        competition: "NBA - Conférence Est",
        time: "01:30",
        timeUntilMatch: "3j 1h",
        teamA: "Celtics",
        teamB: "Bucks",
        logoA:
          "https://upload.wikimedia.org/wikipedia/fr/4/44/Celtics_de_Boston_logo.svg",
        logoB:
          "https://upload.wikimedia.org/wikipedia/fr/3/34/Milwaukee_Bucks_logo.svg",
        bgImage:
          "https://www.basketusa.com/wp-content/uploads/2023/03/giannis-tatum-celtics-bucks-1.jpg",
        usersEngaged: 3109,
        polls: [
          {
            id: "mvp_duel",
            title: "Qui va dominer le duel ?",
            polarizingQuestion:
              "Tatum ou Giannis : qui plantera le plus de points ?",
            options: {
              tatum: "Jayson Tatum",
              giannis: "Giannis Antetokounmpo",
            },
          },
        ],
      },
    ],
  },
};

export default masterSportData;
