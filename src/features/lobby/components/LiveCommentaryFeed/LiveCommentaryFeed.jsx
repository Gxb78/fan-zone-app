import React, { useMemo } from "react";
// 👇 Import corrigé avec l'alias
import { calculateCommentHeatScore } from "@/utils/helpers";
import "./LiveCommentaryFeed.css";

const LiveCommentaryFeed = ({ matches, onSelectMatch }) => {
  // ... (le reste du composant est identique)
  const hotComments = useMemo(() => {
    const allComments = matches.flatMap((match) =>
      (match.polls || []).flatMap((poll) =>
        (poll.seedComments || []).map((comment) => {
          const heatScore = calculateCommentHeatScore(comment);
          return { ...comment, match, heatScore };
        })
      )
    );
    return allComments.sort((a, b) => b.heatScore - a.heatScore).slice(0, 6);
  }, [matches]);

  if (hotComments.length === 0) return null;

  return (
    <div className="live-feed-container">
      <h3 className="list-title">🎙️ La Voix du Stade</h3>
      <div className="live-feed-grid">
        {hotComments.map((comment, index) => (
          <div
            key={`${comment.match.id}-${index}`}
            className="live-comment-card"
            onClick={() => onSelectMatch(comment.match, comment.match.sportKey)}
          >
            <p className="comment-text">"{comment.text}"</p>
            <div className="comment-footer">
              <span className="comment-author">- {comment.author}</span>
              <span className="comment-heat">🔥 {comment.heatScore}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveCommentaryFeed;
