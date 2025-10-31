// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import AddMatchForm from "../components/AddMatchForm";
import AddPollForm from "../components/AddPollForm";
// 👇 On importe notre nouvelle fonction de suppression
import { getAllMatches, deleteMatch } from "../services/firebase";

const Admin = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");

  // Cet effet charge les matchs au chargement de la page
  useEffect(() => {
    const fetchMatches = async () => {
      const allMatches = await getAllMatches();
      setMatches(allMatches);
      // On s'assure qu'un match est présélectionné dans le dropdown s'il y en a
      if (allMatches.length > 0) {
        setSelectedMatchId(allMatches[0].id);
      }
    };
    fetchMatches();
  }, []);

  // 👇 La fonction qui sera appelée au clic sur le bouton "Supprimer"
  const handleDeleteMatch = async (matchIdToDelete) => {
    // On demande toujours confirmation pour une action aussi dangereuse !
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer ce match ?\nToutes les données (sondages, chats) seront perdues à jamais !`
      )
    ) {
      try {
        await deleteMatch(matchIdToDelete);
        // On met à jour la liste des matchs dans l'état pour que la page se rafraîchisse
        setMatches(matches.filter((match) => match.id !== matchIdToDelete));
        alert("Match supprimé avec succès !");
      } catch (error) {
        console.error("Erreur lors de la suppression du match:", error);
        alert("Une erreur est survenue pendant la suppression.");
      }
    }
  };

  return (
    <div>
      <h2
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid #4a5568",
          paddingBottom: "10px",
        }}
      >
        Dashboard Admin
      </h2>

      <AddMatchForm />

      <div className="admin-section">
        <h2>Ajouter un sondage à un match existant</h2>
        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          className="match-selector"
        >
          <option value="">-- Choisis un match --</option>
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.teamA} vs {match.teamB} (ID:{" "}
              {String(match.id).substring(0, 8)}...)
            </option>
          ))}
        </select>
        {selectedMatchId && <AddPollForm matchId={selectedMatchId} />}
      </div>

      {/* 👇 NOTRE NOUVELLE SECTION DE GESTION DES MATCHS 👇 */}
      <div className="admin-section">
        <h2>Gérer les Matchs Existants</h2>
        <div className="admin-match-list">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div key={match.id} className="admin-match-item">
                <span>
                  {match.teamA} vs {match.teamB}
                </span>
                <button
                  className="btn-delete-match"
                  onClick={() => handleDeleteMatch(match.id)}
                >
                  🗑️ Supprimer
                </button>
              </div>
            ))
          ) : (
            <p>Aucun match dans la base de données pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
