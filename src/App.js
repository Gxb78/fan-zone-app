// src/App.js
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import Lobby from "./components/Lobby";
import FanZone from "./components/FanZone";
import UserStats from "./components/UserStats";
import Leaderboard from "./components/Leaderboard";
import Admin from "./pages/Admin";
import { signInUser, initializeUserStats } from "./services/firebase";
import masterSportData from "./data/masterSportData";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import "./App.css";

// --- COMPOSANT POUR LE CONTENU DE L'APP ---
// On l'exporte pour pouvoir le tester séparément
export const AppContent = () => {
  const [userStatsOpen, setUserStatsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isMatchPage = location.pathname.startsWith("/match/");
  const allMatches = Object.values(masterSportData).flatMap(
    (sport) => sport.matches
  );

  return (
    <div className="App">
      <div className="app-container">
        <div className="app-navbar">
          <div className="navbar-left">
            {isMatchPage && (
              <button className="navbar-btn-back" onClick={() => navigate(-1)}>
                ←
              </button>
            )}
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <h1 className="navbar-logo">🔥 Fan Zone</h1>
            </Link>
          </div>
          <div className="navbar-right">
            <Link to="/admin" className="navbar-btn admin-link">
              Admin
            </Link>
            <button
              className="navbar-btn"
              onClick={() => setUserStatsOpen(true)}
            >
              📊 Mes Stats
            </button>
            <button
              className="navbar-btn"
              onClick={() => setLeaderboardOpen(true)}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>

        <div className="app-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Lobby />} />
              <Route
                path="/match/:sportKey/:matchId"
                element={<FanZone allMatches={allMatches} />}
              />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>

      <UserStats
        isOpen={userStatsOpen}
        onClose={() => setUserStatsOpen(false)}
      />
      <Leaderboard
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />
    </div>
  );
};

// --- COMPOSANT PRINCIPAL APP ---
function App() {
  useEffect(() => {
    signInUser((authenticatedUser) => {
      if (authenticatedUser) {
        initializeUserStats(authenticatedUser.uid);
      }
    });
  }, []);

  // Le Router est maintenant le parent unique de AppContent ici
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
