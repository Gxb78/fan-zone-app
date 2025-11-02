import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ onOpenStats, onOpenLeaderboard }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isMatchPage = location.pathname.startsWith("/match/");

  return (
    <div className="app-header">
      <div className="header-left">
        {isMatchPage && (
          <button className="header-btn-back" onClick={() => navigate(-1)}>
            ←
          </button>
        )}
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h1 className="header-logo">🔥 Fan Zone</h1>
        </Link>
      </div>
      <div className="header-right">
        <Link to="/admin" className="header-btn admin-link">
          Admin
        </Link>
        <button className="header-btn" onClick={onOpenStats}>
          📊 Mes Stats
        </button>
        <button className="header-btn" onClick={onOpenLeaderboard}>
          🏆 Leaderboard
        </button>
      </div>
    </div>
  );
};

export default Header;
