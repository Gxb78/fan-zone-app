// src/components/LiveCommentaryFeed.jsx
import React, { useMemo } from "react";
import { calculateCommentHeatScore } from "../utils/helpers"; // On importe notre calculateur
import "./LiveCommentaryFeed.css";

const LiveCommentaryFeed = ({ matches, onSelectMatch }) => {
  const hotComments = useMemo(() => {
    const allComments = matches.flatMap((match) =>
      (match.polls || []).flatMap((poll) =>
        (poll.seedComments || []).map((comment) => {
          // On ajoute le heat score à chaque commentaire
          const heatScore = calculateCommentHeatScore(comment);
          return { ...comment, match, heatScore };
        })
      )
    );
    // On trie par heat score et on prend les 6 meilleurs !
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
