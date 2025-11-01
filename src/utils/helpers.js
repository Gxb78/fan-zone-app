// src/utils/helpers.js

// Affiche "il y a 2min", etc. à partir d'un timestamp
export function timeAgo(timestamp) {
  // ... (cette partie ne change pas)
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

// ... (les autres helpers comme calculateHeatScore, etc. ne changent pas)
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
export function getHeatEmoji(score) {
  if (score >= 80) return "🔥🔥🔥 EN FEU";
  if (score >= 60) return "🔥🔥 CHAUD";
  if (score >= 40) return "🔥 DÉBAT";
  return "❄️ FROID";
}
export function getHeatClass(score) {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}
export function isControversialOpinion(votes, chosenOption) {
  const totalVotes = Object.values(votes).reduce((sum, val) => sum + val, 0);
  if (totalVotes === 0) return false;
  const optionVotes = votes[chosenOption] || 0;
  const percentage = (optionVotes / totalVotes) * 100;
  return percentage < 30;
}

// ============== 👇 NOUVELLES FONCTIONS CORRIGÉES 👇 ==============

// Affiche la date et l'heure en utilisant la timezone de Paris (beaucoup plus fiable !)
export function formatMatchDate(dateString) {
  if (!dateString) return "Date inconnue";
  const date = new Date(dateString);

  // ✅ La solution PRO de l'audit : on laisse le navigateur gérer la timezone.
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(date);
}

// Affiche le score, la minute ou la date selon le statut (version blindée)
export function getMatchTimeStatus(match) {
  const { status, scoreA, scoreB, liveMinute, date } = match || {};

  // Statut FINISHED
  if (status === "FINISHED") {
    // On utilise '??' pour afficher "-" si le score est null ou undefined
    const finalScore = `${scoreA ?? "-"} - ${scoreB ?? "-"}`;
    return `Terminé : ${finalScore}`;
  }

  // Statut LIVE
  if (status === "LIVE") {
    const score = `${scoreA ?? "-"} - ${scoreB ?? "-"}`;
    const minute = liveMinute || "LIVE";
    return `${score} | ${minute}`;
  }

  // Statut SCHEDULED (programmé) ou n'importe quel autre cas
  if (date) {
    return formatMatchDate(date);
  }

  // Fallback ultime si aucune date n'est fournie
  return match?.time || "À venir";
}
// Ajoute cette fonction à la fin de src/utils/helpers.js

export function calculateCommentHeatScore(comment) {
  const likes = comment.likes || 0;

  // On calcule le total des réactions emoji
  const totalReactions = Object.values(comment.reactions || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  // On donne plus de poids aux réactions qu'aux simples likes
  return likes + totalReactions * 2;
}
