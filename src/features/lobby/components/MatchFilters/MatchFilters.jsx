// src/components/MatchFilters.jsx
import React from "react";
import "./MatchFilters.css";

const MatchFilters = ({
  leagues,
  selectedLeague,
  onLeagueChange,
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <div className="match-filters-container">
      <div className="filter-group">
        <label htmlFor="league-filter">Championnat</label>
        <select
          id="league-filter"
          value={selectedLeague}
          onChange={(e) => onLeagueChange(e.target.value)}
        >
          <option value="all">Tous les championnats</option>
          {leagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-filter">Statut</label>
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Tous</option>
          <option value="SCHEDULED">À venir</option>
          <option value="FINISHED">Terminés</option>
          {/* On prépare le terrain pour le futur "Live" */}
        </select>
      </div>
    </div>
  );
};

export default MatchFilters;
