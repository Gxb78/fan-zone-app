import React from "react";
import "./MatchFilters.css";

const MatchFilters = ({ selectedStatus, onStatusChange }) => {
  return (
    <div className="match-filters-container">
      <div className="filter-group">
        <label htmlFor="status-filter">Statut du Match</label>
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Tous</option>
          <option value="SCHEDULED">À venir</option>
          <option value="LIVE">En direct</option>
          <option value="FINISHED">Terminés</option>
        </select>
      </div>
    </div>
  );
};

// 👇 VERIFICATION CRUCIALE : Le composant est bien exporté par défaut.
export default MatchFilters;
