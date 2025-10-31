// src/components/UserStats.jsx
import React, { useEffect, useState } from "react";
import { subscribeToUserStats } from "../services/firebase";
import { getCurrentUser } from "../services/firebase";

/**
 * Composant qui affiche les stats et badges de l'utilisateur
 * - Streaks (jours consécutifs de votes)
 * - Points totaux
 * - Badges obtenus
 * - Taux de réussite
 */
const UserStats = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState({
    totalVotes: 0,
    correctPredictions: 0,
    streak: 0,
    points: 0,
    badges: [],
    accuracy: 0,
  });
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  // ===== ABONNEMENT TEMPS RÉEL =====
  useEffect(() => {
    if (!user) return;

    const unsub = subscribeToUserStats(user.uid, (newStats) => {
      setStats(newStats);
      setLoading(false);
    });

    return () => unsub && unsub();
  }, [user]);

  if (!isOpen) return null;

  // ===== BADGES DÉFINITIONS =====
  const BADGE_DEFINITIONS = {
    oracle: {
      name: "🔮 Oracle",
      description: "10 prédictions justes",
      color: "#9b59b6",
    },
    piment: {
      name: "🌶️ Piment",
      description: "5 opinions minoritaires validées",
      color: "#e74c3c",
    },
    debatteur: {
      name: "💬 Débatteur",
      description: "50 commentaires postés",
      color: "#3498db",
    },
    early_bird: {
      name: "⚡ Early Bird",
      description: "Voter avant tout le monde",
      color: "#f39c12",
    },
    sniper: {
      name: "🎯 Sniper",
      description: "3 scores exacts prédits",
      color: "#2ecc71",
    },
    legende: {
      name: "🏆 Légende",
      description: "30 jours de streak",
      color: "#f1c40f",
    },
  };

  return (
    <div className="user-stats-modal-overlay" onClick={onClose}>
      <div className="user-stats-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="user-stats-header">
          <h2>📊 Mes Stats</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <div className="user-stats-content">
            {/* SECTION 1: Streak & Points */}
            <div className="stats-row">
              <div className="stat-card streak-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats.streak}</div>
                <div className="stat-label">Jours de Streak</div>
              </div>

              <div className="stat-card points-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{stats.points}</div>
                <div className="stat-label">Points Totaux</div>
              </div>

              <div className="stat-card accuracy-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{stats.accuracy}%</div>
                <div className="stat-label">Précision</div>
              </div>
            </div>

            {/* SECTION 2: Votes & Prédictions */}
            <div className="stats-row">
              <div className="stat-card votes-card">
                <div className="stat-icon">🗳️</div>
                <div className="stat-value">{stats.totalVotes}</div>
                <div className="stat-label">Votes Totaux</div>
              </div>

              <div className="stat-card correct-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.correctPredictions}</div>
                <div className="stat-label">Prédictions Justes</div>
              </div>
            </div>

            {/* SECTION 3: Badges */}
            <div className="badges-section">
              <h3>🎖️ Mes Badges</h3>

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

            {/* SECTION 4: Progression */}
            <div className="progression-section">
              <h3>🎯 Prochains Objectifs</h3>
              <div className="progression-item">
                <span>Oracle (10 bonnes prédictions)</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        (stats.correctPredictions / 10) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="progress-text">
                  {stats.correctPredictions}/10
                </span>
              </div>

              <div className="progression-item">
                <span>Légende (30 jours de streak)</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((stats.streak / 30) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="progress-text">{stats.streak}/30</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStats;
