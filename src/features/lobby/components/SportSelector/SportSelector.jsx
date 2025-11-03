// src/components/SportSelector.jsx
import React from "react";
import "./SportSelector.css";

const SportSelector = ({ selectedSport, onSelectSport }) => {
  // On garde la liste complète, mais on va désactiver ceux qui ne sont pas prêts
  const sports = [
    { key: "football", name: "Football", icon: "⚽", enabled: true },
    { key: "basketball", name: "Basketball", icon: "🏀", enabled: false },
    { key: "tennis", name: "Tennis", icon: "🎾", enabled: false },
    { key: "f1", name: "Formule 1", icon: "🏎️", enabled: false },
  ];

  return (
    <div className="sport-selector-container">
      {sports.map((sport) => (
        <button
          key={sport.key}
          className={`sport-selector-btn ${
            selectedSport === sport.key ? "active" : ""
          }`}
          // On n'appelle la fonction que si le sport est activé
          onClick={() => sport.enabled && onSelectSport(sport.key)}
          // On désactive le bouton s'il n'est pas prêt
          disabled={!sport.enabled}
          // On ajoute un titre pour expliquer pourquoi c'est désactivé
          title={!sport.enabled ? "Bientôt disponible !" : ""}
        >
          {sport.icon} {sport.name}
        </button>
      ))}
    </div>
  );
};

export default SportSelector;
