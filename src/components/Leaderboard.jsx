// src/components/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../services/firebase";

/**
 * Composant qui affiche le classement (top 10) des meilleurs utilisateurs
 * Basé sur les points totaux
 */
const Leaderboard = ({ isOpen, onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== RÉCUPÉRATION DU LEADERBOARD =====
  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(10);
        setLeaderboardData(data);
      } catch (error) {
        console.error("Erreur leaderboard:", error);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="leaderboard-modal-overlay" onClick={onClose}>
      <div className="leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="leaderboard-header">
          <h2>🏆 Leaderboard</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement du classement...</div>
        ) : leaderboardData.length === 0 ? (
          <div className="no-data">
            Pas encore de données. Sois le premier ! 🚀
          </div>
        ) : (
          <div className="leaderboard-content">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="rank-col">Rang</th>
                  <th className="name-col">Joueur</th>
                  <th className="points-col">Points</th>
                  <th className="streak-col">Streak</th>
                  <th className="accuracy-col">Précision</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((user, index) => (
                  <tr key={user.userId} className={index < 3 ? "top-rank" : ""}>
                    <td className="rank-col">
                      <div className="rank-badge">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && `#${index + 1}`}
                      </div>
                    </td>
                    <td className="name-col">
                      <span className="user-name">
                        User {user.userId.substring(0, 8)}
                      </span>
                    </td>
                    <td className="points-col">
                      <span className="points-value">
                        ⭐ {user.points || 0}
                      </span>
                    </td>
                    <td className="streak-col">
                      <span className="streak-value">
                        🔥 {user.streak || 0} jours
                      </span>
                    </td>
                    <td className="accuracy-col">
                      <span className="accuracy-value">
                        🎯 {user.accuracy || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
