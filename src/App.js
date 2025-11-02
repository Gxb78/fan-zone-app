import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import Lobby from "@/features/lobby/components/Lobby/Lobby";
import FanZone from "./components/FanZone";
import UserStats from "./components/UserStats";
import Leaderboard from "./components/Leaderboard";
import Admin from "./pages/Admin";
import ErrorBoundary from "./components/ui/ErrorBoundary";
// 👇 On importe notre nouveau composant Header en utilisant les alias !
import Header from "@/components/layout/Header";
import { useAuth } from "@/features/auth/hooks/useAuth";
import "./App.css";

// On importe le nouveau CSS pour le Header
import "@/components/layout/Header.css";

export const AppContent = () => {
  const [userStatsOpen, setUserStatsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  return (
    <div className="App">
      <div className="app-container">
        {/* On remplace toute la navbar par notre composant Header */}
        <Header
          onOpenStats={() => setUserStatsOpen(true)}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
        />

        <div className="app-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Lobby />} />
              <Route path="/match/:sportKey/:matchId" element={<FanZone />} />
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

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="loading">Chargement de la Fan Zone...</div>;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
