// src/components/HotPolls.jsx
import React, { useMemo } from "react";
import "./HotPolls.css";

const HotPolls = ({ matches, onSelectMatch }) => {
  const hotPolls = useMemo(() => {
    const allPolls = matches.flatMap((match) =>
      (match.polls || []).map((poll) => ({ ...poll, match: match }))
    );
    return allPolls
      .sort(
        (a, b) => (b.match?.usersEngaged || 0) - (a.match?.usersEngaged || 0)
      )
      .slice(0, 4); // On en garde 4
  }, [matches]);

  if (hotPolls.length === 0) return null;

  return (
    <div className="hot-polls-container">
      <h3 className="list-title">🔥 Les Débats du Moment</h3>
      <div className="hot-polls-grid">
        {hotPolls.map((poll, index) => {
          if (!poll || !poll.match) return null;

          const totalVotes =
            poll.match.usersEngaged > 100
              ? Math.floor(poll.match.usersEngaged / 2)
              : poll.match.usersEngaged;
          const options = Array.isArray(poll.options) ? poll.options : [];

          return (
            <div
              key={`${poll.id}-${poll.match.id}`}
              className="hot-poll-card"
              onClick={() => onSelectMatch(poll.match, poll.match.sportKey)}
            >
              <div className="hot-poll-card-inner">
                <div className="poll-context">
                  {poll.match.teamA} vs {poll.match.teamB}
                </div>
                <h4 className="hot-poll-title">{poll.polarizingQuestion}</h4>
                <div className="hot-poll-options-simple">
                  {options.map((opt) => opt.text).join(" / ")}
                </div>
                <div className="total-votes">{totalVotes} fans sur le coup</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotPolls;
