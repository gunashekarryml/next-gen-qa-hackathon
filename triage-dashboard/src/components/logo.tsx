import React from "react";
import logo from "../assets/logo.png"; // import your PNG file

interface LogoProps {
  width?: number | string;
  height?: number | string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 100, height = 100, alt = "Logo" }) => {
  return <img src={logo} width={width} height={height} alt={alt} />;
};

export default Logo;
