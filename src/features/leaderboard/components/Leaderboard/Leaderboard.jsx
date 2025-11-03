import React from "react";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import "./Leaderboard.css"; // Assurez-vous d'avoir un fichier CSS

const Leaderboard = ({ isOpen, onClose }) => {
  const { leaderboardData, loading } = useLeaderboard(isOpen);

  if (!isOpen) return null;

  return (
    <div className="leaderboard-modal-overlay" onClick={onClose}>
      <div className="leaderboard-modal" onClick={(e) => e.stopPropagation()}>
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
                        Fan_{user.userId.substring(0, 8)}
                      </span>
                    </td>
                    <td className="points-col">
                      <span className="points-value">
                        ⭐ {user.points || 0}
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
