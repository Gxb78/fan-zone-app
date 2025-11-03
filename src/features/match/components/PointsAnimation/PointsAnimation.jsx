import React, { useState, useEffect } from "react";
import "./PointsAnimation.css";

const PointsAnimation = ({ points }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1500); // L'animation dure 1.5s

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return <div className="points-animation-floater">+{points} pts</div>;
};

export default PointsAnimation;
