// src/components/HotComments.jsx
import React from "react";
import "./HotComments.css";

const HotComments = ({ matches }) => {
  // On récupère les commentaires "featured" qu'on a mis dans nos données
  const comments = matches
    .map((match) =>
      match.featuredComment
        ? {
            ...match.featuredComment,
            matchContext: `${match.teamA} vs ${match.teamB}`,
          }
        : null
    )
    .filter(Boolean); // On retire les matchs qui n'en ont pas

  if (comments.length === 0) {
    return null;
  }

  return (
    // Ce conteneur sera notre colonne de droite
    <div className="hot-comments-container">
      <h3>💬 Les Fans s'enflamment</h3>
      <div className="hot-comments-list">
        {comments.map((comment, index) => (
          <div key={index} className="hot-comment-card">
            <p className="comment-text">"{comment.text}"</p>
            <div className="comment-author">
              - {comment.author} <span>sur {comment.matchContext}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotComments;
