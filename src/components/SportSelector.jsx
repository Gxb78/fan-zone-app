// src/components/SportSelector.jsx
import React from "react";
// 👇 On importe le nouveau CSS qu'on va créer juste après
import "./SportSelector.css";

const SportSelector = ({ selectedSport, onSelectSport }) => {
  // 👇 On ajoute nos nouveaux sports à la liste
  const sports = [
    { key: "football", name: "Football", icon: "⚽" },
    { key: "basketball", name: "Basketball", icon: "🏀" },
    { key: "tennis", name: "Tennis", icon: "🎾" },
    { key: "f1", name: "Formule 1", icon: "🏎️" },
  ];

  return (
    <div className="sport-selector-container">
      {sports.map((sport) => (
        <button
          key={sport.key}
          className={`sport-selector-btn ${
            selectedSport === sport.key ? "active" : ""
          }`}
          onClick={() => onSelectSport(sport.key)}
        >
          {sport.icon} {sport.name}
        </button>
      ))}
    </div>
  );
};

export default SportSelector;
