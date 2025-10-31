// src/components/FeaturedMatch.jsx
import React from "react";
import "./FeaturedMatch.css";

const FeaturedMatch = ({ match, onSelectMatch }) => {
  if (!match) return null;

  return (
    // On garde le onClick sur le conteneur principal
    <div
      className="featured-match-container"
      onClick={() => onSelectMatch(match, match.sportKey)}
    >
      {/* 👇 On ajoute un conteneur intérieur pour l'animation 👇 */}
      <div className="featured-match-inner">
        <div className="featured-header">
          <h2>LE MATCH À LA UNE</h2>
          <div className="live-badge">
            🔥 {match.usersEngaged} fans en direct
          </div>
        </div>
        <div
          className="featured-body"
          style={{ backgroundImage: `url('${match.bgImage}')` }}
        >
          {/* Le reste du contenu ne change pas */}
          <div className="team-featured">
            <img src={match.logoA} alt={match.teamA} />
            <span>{match.teamA}</span>
          </div>
          <div className="match-info-featured">
            <div className="vs-featured">VS</div>
            <div className="time-featured">{match.time}</div>
            <div className="competition-featured">{match.competition}</div>
          </div>
          <div className="team-featured">
            <img src={match.logoB} alt={match.teamB} />
            <span>{match.teamB}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedMatch;
