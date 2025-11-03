import React from "react";
import { useUserStats } from "../../hooks/useUserStats";
// 👇 NOUVEAU : On importe nos définitions de badges centralisées
import { BADGE_DEFINITIONS } from "@/data/badgeData";
import "./UserStats.css";

const UserStats = ({ isOpen, onClose }) => {
  const { stats, loading } = useUserStats(isOpen);

  if (!isOpen) return null;

  return (
    <div className="user-stats-modal-overlay" onClick={onClose}>
      <div className="user-stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-stats-header">
          <h2>📊 Mes Stats</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading || !stats ? (
          <div className="loading">Chargement...</div>
        ) : (
          <div className="user-stats-content">
            <div className="stats-row">
              {/* Streak & Points & Accuracy */}
              <div className="stat-card streak-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats.streak || 0}</div>
                <div className="stat-label">Jours de Streak</div>
              </div>
              <div className="stat-card points-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{stats.points || 0}</div>
                <div className="stat-label">Points Totaux</div>
              </div>
              <div className="stat-card accuracy-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{stats.accuracy || 0}%</div>
                <div className="stat-label">Précision</div>
              </div>
            </div>

            <div className="badges-section">
              <h3>🎖️ Mes Badges</h3>
              {stats.badges && stats.badges.length > 0 ? (
                <div className="badges-grid">
                  {/* 👇 MODIFICATION : On utilise BADGE_DEFINITIONS */}
                  {stats.badges.map((badgeId) => {
                    const badge = BADGE_DEFINITIONS[badgeId];
                    if (!badge) return null; // Sécurité si un badge n'est pas défini
                    return (
                      <div
                        key={badgeId}
                        className="badge-item"
                        style={{ borderColor: badge.color }}
                        title={badge.description}
                      >
                        <div className="badge-name">{badge.name}</div>
                        <div className="badge-desc">{badge.description}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-badges">
                  Pas encore de badges. Continue à voter ! 🚀
                </div>
              )}
            </div>
            {/* ... autres sections de stats ... */}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStats;
