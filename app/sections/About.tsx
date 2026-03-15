import CutoutHero from "../components/CutoutHero";
import ParticleGrid from "../components/ParticleGrid";
import { assetPath } from "../lib/assetPath";

export default function About() {
  return (
    <section id="about" className="section section--deep about-section">
      <img
        alt=""
        className="paper-border paper-border--about"
        src={assetPath("/images/paper-border.png")}
      />
      <ParticleGrid className="about-shell">
        <div className="hero-overlay-grid" aria-hidden="true" />
        <CutoutHero anchorId="about" enableMotion={false} />

        <div className="container about-content">
          <div className="section-heading">
            <div>
              <p className="eyebrow mono">About</p>
              <h2 className="title">Architecture with a computational core.</h2>
            </div>
            <p className="subtitle">
              A practice that blends spatial design, computation, and production
              tooling.
            </p>
          </div>
          <div className="about-grid">
            <div className="about-copy">
              <p>
                As an architect and self-taught software developer specializing
                in the intersection of design and technology, I create custom
                plugins, automations, and digital solutions for 3D software to
                streamline architectural Visualization and 3D design workflows.
                Passionate about leveraging cutting-edge technology to enhance
                conceptualization and elevate the design process. I aim to
                combine my architectural expertise with programming skills to
                drive efficiency and push creative boundaries in the field.
              </p>
              <p>
                The portfolio is organized around built work, research studies,
                and automation projects that accelerate modeling,
                visualization, and documentation.
              </p>
            </div>
          </div>
        </div>
      </ParticleGrid>
    </section>
  );
}
