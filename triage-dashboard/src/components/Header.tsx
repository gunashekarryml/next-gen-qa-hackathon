// src/components/Header.tsx
import React from "react";
import companyLogo from "../assets/logo.png";
import teamLogo from "../assets/teamLogo.png"; // Add your team logo PNG

const Header: React.FC = () => {
  return (
    <header style={styles.header}>
      {/* Left: Original Company Logo — no changes */}
      <img
        src={companyLogo}
        alt="Company Logo"
        style={styles.companyLogo}
      />

      {/* Right: Team Logo — clickable badge */}
      <a
        href="https://github.com/yourTeamRepo"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={teamLogo}
          alt="Team Logo"
          style={styles.teamLogo}
        />
      </a>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 22px",
    background: "transparent", // keep your UI theme intact
  },
  companyLogo: {
    width: "120px", // keep your original size or remove if already controlled globally
    height: "auto",
  },
  teamLogo: {
    width: "55px", // ✅ only team logo scaled down
    height: "auto",
    cursor: "pointer",
    borderRadius: "12px", // small badge feel
    transition: "transform 0.3s ease",
  },
};

export default Header;
