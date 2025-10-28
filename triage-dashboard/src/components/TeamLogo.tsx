import React from "react";
import teamLogo from "../assets/team-logo.png";

interface TeamLogoProps {
  width?: number | string;
  height?: number | string;
  alt?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({
  width = 90,
  height = 90,
  alt = "Team Logo",
}) => {
  return (
    <img
      src={teamLogo}
      width={width}
      height={height}
      alt={alt}
      style={{
        cursor: "pointer",
        transition: "transform 0.3s ease", // smooth animation
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    />
  );
};

export default TeamLogo;
