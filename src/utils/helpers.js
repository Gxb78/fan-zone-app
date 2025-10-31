// src/utils/helpers.js

// Affiche "il y a 2min", etc. à partir d'un timestamp
export function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${days}j`;
}

// Score d'engagement d'un sondage (votes, diversité, activité récente)
export function calculateHeatScore(data) {
  if (!data) return 0;
  const votes = data.votes || {};
  const comments = data.comments || [];
  const lastActivity = data.lastActivity || 0;

  const totalVotes = Object.values(votes).reduce((sum, val) => sum + val, 0);
  const votesScore = Math.min(totalVotes * 5, 100);

  const commentsCount = comments.length;
  const commentsScore = Math.min(commentsCount * 10, 100);

  let diversityScore = 0;
  if (totalVotes > 0) {
    const percentages = Object.values(votes).map((v) => (v / totalVotes) * 100);
    const maxPercent = Math.max(...percentages);
    diversityScore = 100 - maxPercent;
  }

  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  const recencyScore = now - lastActivity < tenMinutes ? 20 : 0;

  const heatScore =
    votesScore * 0.3 +
    commentsScore * 0.4 +
    diversityScore * 0.2 +
    recencyScore * 0.1;
  return Math.round(heatScore);
}

// Emoji selon le heatScore
export function getHeatEmoji(score) {
  if (score >= 80) return "🔥🔥🔥 EN FEU";
  if (score >= 60) return "🔥🔥 CHAUD";
  if (score >= 40) return "🔥 DÉBAT";
  return "❄️ FROID";
}

// Classe CSS pour le heatScore
export function getHeatClass(score) {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

// Détecte si l'opinion est controversée (<30% des votes sur une option)
export function isControversialOpinion(votes, chosenOption) {
  const totalVotes = Object.values(votes).reduce((sum, val) => sum + val, 0);
  if (totalVotes === 0) return false;
  const optionVotes = votes[chosenOption] || 0;
  const percentage = (optionVotes / totalVotes) * 100;
  return percentage < 30;
}

// ============== NOUVELLES FONCTIONS DE STATUT DE MATCH ==============

// Affiche la date exacte (incluant la correction d'une heure locale demandée)
export function formatMatchDate(dateString) {
  if (!dateString) return "Date inconnue";

  const date = new Date(dateString);

  // FIX TIMEZONE : On ajoute 1 heure UTC pour le décalage souhaité (+1h).
  date.setUTCHours(date.getUTCHours() + 1);

  // Formatage: JJ/MM/AAAA à HH:MM
  const datePart = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${datePart} à ${timePart}`;
}

// Affiche le score, la minute ou la date selon le statut
export function getMatchTimeStatus(match) {
  const { status, scoreA, scoreB, liveMinute, date } = match || {};

  // Statut FINISHED
  if (status === "FINISHED") {
    // Affiche le score final
    const finalScore =
      scoreA != null && scoreB != null ? `${scoreA} - ${scoreB}` : "Terminé";
    return `Terminé : ${finalScore}`;
  }

  // Statut LIVE
  if (status === "LIVE") {
    // Affiche le score en direct et la minute/période
    const score =
      scoreA != null && scoreB != null ? `${scoreA} - ${scoreB}` : "En Direct";
    const minute = liveMinute ? liveMinute : "LIVE";
    return `${score} | ${minute}`;
  }

  // Statut SCHEDULED (Foot/Basket programmé)
  if (date) {
    return formatMatchDate(date);
  }

  // Fallback
  return match?.time || "Date inconnue";
}
