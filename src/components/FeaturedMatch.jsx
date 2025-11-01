// src/components/FeaturedMatch.jsx
import React from "react";
// 👇 On importe notre fonction intelligente !
import { getMatchTimeStatus } from "../utils/helpers";
import "./FeaturedMatch.css";

const FeaturedMatch = ({ match, onSelectMatch }) => {
  if (!match) return null;

  return (
    <div
      className="featured-match-container"
      onClick={() => onSelectMatch(match, match.sportKey)}
    >
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
          <div className="team-featured">
            <img src={match.logoA} alt={match.teamA} />
            <span>{match.teamA}</span>
          </div>
          <div className="match-info-featured">
            <div className="vs-featured">VS</div>
            {/* ✅ LA CORRECTION MAGIQUE EST ICI ! On utilise notre helper. */}
            <div className="time-featured">{getMatchTimeStatus(match)}</div>
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
