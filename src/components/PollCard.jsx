// src/components/PollCard.jsx
import React from "react";
import confetti from "canvas-confetti"; // 👈 On importe la magie !
import { votePoll, cancelVotePoll, getCurrentUser } from "../services/firebase";
import {
  calculateHeatScore,
  getHeatEmoji,
  getHeatClass,
  isControversialOpinion,
} from "../utils/helpers";
import CommentsSection from "./CommentsSection";
import "./PollCard.css";

// ✨ Quand l'utilisateur vote, on déclenche une animation !
const celebrateVote = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ff6b35", "#764ba2", "#ffffff"],
  });
};

const PollCard = ({ poll, match, onReply }) => {
  const user = getCurrentUser();

  const getPollDbPath = () => ["matches", String(match.id), "polls", poll.id];

  if (!poll) return null;

  const totalVotes = Object.values(poll.votes || {}).reduce((a, b) => a + b, 0);
  const heatScore = calculateHeatScore(poll);
  const heatEmoji = getHeatEmoji(heatScore);
  const heatClass = getHeatClass(heatScore);
  const userVote = user ? poll.voters?.[user.uid] : null;

  async function handleSelectAndVote(optionKey) {
    if (!user || userVote === optionKey) return;
    await votePoll(getPollDbPath(), optionKey, user.uid);
    celebrateVote(); // 👈 On appelle la fonction de célébration ici !
  }

  async function handleCancelVote() {
    if (!user || !userVote) return;
    await cancelVotePoll(getPollDbPath(), user.uid);
  }

  const sortedOptions = Array.isArray(poll.options)
    ? [...poll.options].sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className={`poll-card ${userVote ? "voted" : "can-vote"}`}>
      <div className="poll-header">
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
        {sortedOptions.map((option) => {
          const { key: optionKey, text: optionText } = option;
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
              <div className="option-bar" style={{ width: `${percentage}%` }} />
              <div className="option-content-wrapper">
                <span className="option-text">{optionText}</span>
                <div className="option-stats">
                  {isControversial && (
                    <span className="controversial-badge">⚡ Opinion rare</span>
                  )}
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
