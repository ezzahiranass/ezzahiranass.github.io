"use client";

import ParticleGrid from "../components/ParticleGrid";
import HeroCubeViewer from "../components/viewers/HeroCubeViewer";

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <ParticleGrid className="hero-shell">
        <div className="hero-overlay-grid" aria-hidden="true" />
        <div className="container hero-grid">
        <HeroCubeViewer />
          <div className="hero-content">
            <span className="eyebrow mono">PORTFOLIO</span>
            <h1 className="hero-title">
              Design Through Technology.
            </h1>
            <p className="hero-copy">
              Computational Architecture, Crafted for Real World Impact.
            </p>
            <div className="hero-actions">
              <a className="btn btn--primary" href="#projects">
                View Projects
              </a>
              <a className="btn" href="mailto:anassezzahir@gmail.com">
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </ParticleGrid>
    </section>
  );
}
