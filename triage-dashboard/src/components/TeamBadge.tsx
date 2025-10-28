// src/components/TeamBadge.tsx
import React, { useState } from "react";
import teamLogo from "../assets/teamLogo.png";
import "./TeamBadge.css"; // CSS animations

interface TeamBadgeProps {
  linkUrl?: string;
  width?: number | string;
  height?: number | string;
}

const TeamBadge: React.FC<TeamBadgeProps> = ({
  linkUrl = "https://github.com/<your-team-repo>",
  width = 55,
  height = 55,
}) => {
  const [rotate, setRotate] = useState(false);

  const handleClick = () => {
    setRotate(true);
    setTimeout(() => setRotate(false), 700);
    window.open(linkUrl, "_blank");
  };

  return (
    <img
      src={teamLogo}
      width={width}
      height={height}
      alt="Team Badge"
      className={rotate ? "team-badge rotate" : "team-badge"}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    />
  );
};

export default TeamBadge;
