import React, { useRef, useState, useEffect, useCallback } from "react";
import "./LeagueSelector.css";

// 👇 NOUVEAU : Une icône de flèche simple et propre en SVG
const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    width="20"
    height="20"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const LeagueSelector = ({
  leagues,
  selectedLeague,
  onLeagueChange,
  isVisible,
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 👇 NOUVEAU : Logique pour vérifier si le scroll est possible
  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(
        hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1
      );
    }
  }, []);

  // 👇 NOUVEAU : Effet pour mettre à jour les flèches au scroll ou au redimensionnement
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el && isVisible) {
      checkScrollability();
      el.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);

      return () => {
        el.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [isVisible, leagues, checkScrollability]);

  // 👇 NOUVEAU : Fonctions pour faire défiler au clic
  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.8; // On scrolle de 80% de la largeur visible
      el.scrollTo({
        left:
          el.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`league-selector-container ${isVisible ? "visible" : ""}`}>
      {/* 👇 NOUVEAU : Flèche gauche */}
      <button
        className={`scroll-arrow left ${canScrollLeft ? "active" : ""}`}
        onClick={() => handleScroll("left")}
        aria-label="Faire défiler vers la gauche"
      >
        <ArrowIcon />
      </button>

      <div
        className="league-selector-wrapper"
        ref={scrollContainerRef}
        aria-hidden={!isVisible}
      >
        <div className="league-selector-inner">
          <button
            className={`league-btn ${selectedLeague === "all" ? "active" : ""}`}
            onClick={() => onLeagueChange("all")}
          >
            Toutes
          </button>
          {leagues.map((league) => (
            <button
              key={league}
              className={`league-btn ${
                selectedLeague === league ? "active" : ""
              }`}
              onClick={() => onLeagueChange(league)}
            >
              {league}
            </button>
          ))}
        </div>
      </div>

      {/* 👇 NOUVEAU : Flèche droite */}
      <button
        className={`scroll-arrow right ${canScrollRight ? "active" : ""}`}
        onClick={() => handleScroll("right")}
        aria-label="Faire défiler vers la droite"
      >
        <ArrowIcon />
      </button>
    </div>
  );
};

export default LeagueSelector;
