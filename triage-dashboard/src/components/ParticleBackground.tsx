import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useCallback } from "react";

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        particles: {
          number: { value: 60 },
          size: { value: { min: 2, max: 6 } },
          move: { enable: true, speed: 1.5 },
          links: { enable: true, distance: 120, color: "#ffffff", opacity: 0.2 },
          color: { value: ["#ffffff", "#ff7f50", "#00ffff"] },
        },
        interactivity: {
          events: { onHover: { enable: true, mode: "repulse" } },
        },
        detectRetina: true,
      }}
    />
  );
}
