// src/components/PollCard.jsx
import React from "react";
import { votePoll, cancelVotePoll, getCurrentUser } from "../services/firebase";
import {
  calculateHeatScore,
  getHeatEmoji,
  getHeatClass,
  isControversialOpinion,
} from "../utils/helpers";
import CommentsSection from "./CommentsSection";
import "./PollCard.css";

const PollCard = ({ poll, match, onReply }) => {
  const user = getCurrentUser();

  // On construit le chemin DANS les fonctions, au moment où on en a besoin
  const getPollDbPath = () => ["matches", String(match.id), "polls", poll.id];

  if (!poll) return null; // Sécurité si les données n'ont pas encore chargé

  const totalVotes = Object.values(poll.votes || {}).reduce((a, b) => a + b, 0);
  const heatScore = calculateHeatScore(poll);
  const heatEmoji = getHeatEmoji(heatScore);
  const heatClass = getHeatClass(heatScore);
  const userVote = user ? poll.voters?.[user.uid] : null;

  async function handleSelectAndVote(optionKey) {
    if (!user || userVote === optionKey) return;
    // On doit appeler updateUserStreak après le vote
    await votePoll(getPollDbPath(), optionKey, user.uid);
  }

  async function handleCancelVote() {
    if (!user || !userVote) return;
    await cancelVotePoll(getPollDbPath(), user.uid);
  }

  return (
    <div className={`poll-card ${userVote ? "voted" : "can-vote"}`}>
      <div className="poll-header">
        {/* NOUVEAU: Ajout du contexte du match dans l'en-tête du sondage */}
        {match && (
          <div className="match-context-header">
            <span className="team-name-poll">{match.teamA}</span>
            <span className="vs-separator">VS</span>
            <span className="team-name-poll">{match.teamB}</span>
          </div>
        )}
        <div className="poll-title-section">
          <h3 className="poll-title">{poll.title}</h3>
          <div className={`heat-badge ${heatClass}`}>
            {heatEmoji} • {totalVotes} votes
          </div>
        </div>
        <div className="polarizing-question">"{poll.polarizingQuestion}"</div>
      </div>
      <div className="poll-options">
        {/* CORRECTION: On utilise Object.entries() pour garantir l'ordre
            des options tel qu'il a été défini initialement. */}
        {Object.entries(poll.options).map(([optionKey, optionText]) => {
          const optionVotes = poll.votes?.[optionKey] || 0;
          const percentage =
            totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
          const isControversial = isControversialOpinion(
            poll.votes || {},
            optionKey
          );
          const hasVotedForThis = userVote === optionKey;
          const optionClasses = [
            "poll-option",
            isControversial ? "controversial" : "",
            hasVotedForThis ? "voted-for" : "",
          ].join(" ");

          return (
            <div
              key={optionKey}
              className={optionClasses}
              onClick={() => handleSelectAndVote(optionKey)}
            >
              {/* 1. La barre de progression en fond (fine et moderne) */}
              <div className="option-bar" style={{ width: `${percentage}%` }} />

              {/* 2. Le texte et les stats en surcouche */}
              <div className="option-content-wrapper">
                <span className="option-text">{optionText}</span>

                <div className="option-stats">
                  {/* On n'affiche le badge qu'UNE SEULE fois */}
                  {isControversial && (
                    <span className="controversial-badge">⚡ Opinion rare</span>
                  )}
                  {/* Le pourcentage à droite */}
                  <span className="option-votes">{percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {userVote && (
        <div className="poll-footer">
          <button className="btn-cancel-vote" onClick={handleCancelVote}>
            Annuler mon vote
          </button>
        </div>
      )}
      {poll.seedComments && poll.seedComments.length > 0 && (
        <CommentsSection comments={poll.seedComments} onReply={onReply} />
      )}
    </div>
  );
};

export default PollCard;
