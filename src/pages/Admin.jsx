import React, { useState, useEffect } from "react";
// 👇 Imports mis à jour
import AddMatchForm from "@/features/admin/components/AddMatchForm";
import AddPollForm from "@/features/admin/components/AddPollForm";
import { getAllMatches, deleteMatch } from "@/services/firebase";

// ... Le reste du composant est identique
const Admin = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      const allMatches = await getAllMatches();
      setMatches(allMatches);
      if (allMatches.length > 0) {
        setSelectedMatchId(allMatches[0].id);
      }
    };
    fetchMatches();
  }, []);

  const handleDeleteMatch = async (matchIdToDelete) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer ce match ? Toutes les données seront perdues !`
      )
    ) {
      try {
        await deleteMatch(matchIdToDelete);
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
            <p>Aucun match dans la base de données.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
