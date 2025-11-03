// src/data/badgeData.js

export const BADGE_DEFINITIONS = {
  // --- BADGES D'ACTIVITÉ ---
  votant_bronze: {
    id: "votant_bronze",
    name: "🥉 Votant Bronze",
    description: "A participé à 10 votes",
    color: "#CD7F32",
  },
  votant_argent: {
    id: "votant_argent",
    name: "🥈 Votant Argent",
    description: "A participé à 50 votes",
    color: "#C0C0C0",
  },
  votant_or: {
    id: "votant_or",
    name: "🥇 Votant Or",
    description: "A participé à 200 votes",
    color: "#FFD700",
  },

  // --- BADGES D'EXPERTISE (pour le futur) ---
  oracle: {
    id: "oracle",
    name: "🔮 Oracle",
    description: "10 prédictions justes",
    color: "#9b59b6",
  },

  // --- BADGES DE COMMUNAUTÉ (pour le futur) ---
  piment: {
    id: "piment",
    name: "🌶️ Piment",
    description: "5 opinions minoritaires validées",
    color: "#e74c3c",
  },
};

// Logique pour déterminer quel badge débloquer en fonction des stats
export const checkNewBadges = (stats) => {
  const newBadges = [];
  const { totalVotes, badges = [] } = stats;

  if (totalVotes >= 10 && !badges.includes("votant_bronze")) {
    newBadges.push("votant_bronze");
  }
  if (totalVotes >= 50 && !badges.includes("votant_argent")) {
    newBadges.push("votant_argent");
  }
  if (totalVotes >= 200 && !badges.includes("votant_or")) {
    newBadges.push("votant_or");
  }

  return newBadges;
};
