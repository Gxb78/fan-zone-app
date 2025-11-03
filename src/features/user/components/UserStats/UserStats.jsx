import React from "react";
import { useUserStats } from "../../hooks/useUserStats";
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
              {/* 👇 MODIFICATION : Le conteneur de l'icône est maintenant DANS le h3 */}
              <div className="badges-section-header">
                <h3>
                  🎖️ Mes Badges
                  <div className="badge-info">
                    <div className="badge-info-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="12"
                        height="12"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="badge-tooltip">
                      <h4>Tous les Badges</h4>
                      <ul className="badge-tooltip-list">
                        {Object.values(BADGE_DEFINITIONS).map((badge) => (
                          <li key={badge.id} className="badge-tooltip-item">
                            <span className="badge-tooltip-name">
                              {badge.name}
                            </span>
                            <span className="badge-tooltip-desc">
                              {badge.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </h3>
              </div>

              {stats.badges && stats.badges.length > 0 ? (
                <div className="badges-grid">
                  {stats.badges.map((badgeId) => {
                    const badge = BADGE_DEFINITIONS[badgeId];
                    if (!badge) return null;
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
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStats;
