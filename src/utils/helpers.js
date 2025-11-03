// src/utils/helpers.js

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

// 👇 NOUVEAU : Fonction spécifique pour calculer la chaleur d'un SONDAGE (POLL)
// C'est cette fonction qui manquait.
export function calculatePollHeatScore(poll) {
  if (!poll) return 0;
  const votes = poll.votes || {};
  const comments = poll.seedComments || []; // Les commentaires sont dans seedComments
  const lastActivity = poll.lastActivity || 0;

  const totalVotes = Object.values(votes).reduce((sum, val) => sum + val, 0);
  const votesScore = Math.min(totalVotes / 50, 50); // Score basé sur le volume

  const commentsCount = comments.length;
  const commentsScore = Math.min(commentsCount * 5, 20);

  let diversityScore = 0;
  if (totalVotes > 10) {
    const percentages = Object.values(votes).map((v) => (v / totalVotes) * 100);
    const maxPercent = Math.max(...percentages);
    // Plus le vote est partagé, plus le score est élevé
    diversityScore = (100 - maxPercent) * 0.3;
  }

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const recencyScore =
    Math.max(0, (oneHour - (now - lastActivity)) / oneHour) * 10; // Bonus si activité récente

  const heatScore = votesScore + commentsScore + diversityScore + recencyScore;
  return Math.min(Math.round(heatScore), 100);
}

// 👇 MODIFICATION : Renommage de ma fonction précédente pour plus de clarté
export function calculateMatchHeat(match) {
  if (!match || !match.usersEngaged) return 0;
  const engagementScore = Math.min(match.usersEngaged / 100, 80);
  const statusScore = match.status === "LIVE" ? 20 : 0;
  let recencyScore = 0;
  const matchDate = new Date(match.date).getTime();
  const now = Date.now();
  const diffHours = (matchDate - now) / (1000 * 60 * 60);
  if (diffHours > 0 && diffHours < 3) {
    recencyScore = 15;
  }
  const heatScore = engagementScore + statusScore + recencyScore;
  return Math.min(Math.round(heatScore), 100);
}

export function getHeatEmoji(score) {
  if (score >= 80) return "🔥🔥🔥";
  if (score >= 60) return "🔥🔥";
  if (score >= 30) return "🔥";
  return "❄️";
}

export function getHeatClass(score) {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

export function isControversialOpinion(votes, chosenOption) {
  const totalVotes = Object.values(votes).reduce((sum, val) => sum + val, 0);
  if (totalVotes < 10) return false; // Ne pas marquer si peu de votes
  const optionVotes = votes[chosenOption] || 0;
  const percentage = (optionVotes / totalVotes) * 100;
  return percentage > 0 && percentage < 25; // Seuil ajusté
}

export function formatMatchDate(dateString) {
  if (!dateString) return "Date inconnue";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(date);
}

export function getMatchTimeStatus(match) {
  const { status, scoreA, scoreB, date } = match || {};

  if (status === "FINISHED") {
    return `Terminé: ${scoreA ?? "-"} - ${scoreB ?? "-"}`;
  }

  const matchDate = new Date(date);
  if (isNaN(matchDate.getTime())) {
    return "À venir";
  }

  const now = new Date();
  const diffMinutes = (now.getTime() - matchDate.getTime()) / (1000 * 60);

  if (diffMinutes > 0 && diffMinutes < 120) {
    return `${scoreA ?? "0"} - ${scoreB ?? "0"} | LIVE`;
  }

  if (diffMinutes < 0) {
    return formatMatchDate(date);
  }

  return `Terminé: ${scoreA ?? "-"} - ${scoreB ?? "-"}`;
}

export function calculateCommentHeatScore(comment) {
  const likes = comment.likes || 0;
  const totalReactions = Object.values(comment.reactions || {}).reduce(
    (sum, count) => sum + count,
    0
  );
  return likes + totalReactions * 2;
}
