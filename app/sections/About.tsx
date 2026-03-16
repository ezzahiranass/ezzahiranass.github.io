"use client";

import { useEffect, useRef, useState } from "react";
import CutoutHero from "../components/CutoutHero";
import ParticleGrid from "../components/ParticleGrid";
import { assetPath } from "../lib/assetPath";

export default function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="about"
      className={`section section--deep about-section ${
        isVisible ? "about-section--visible" : ""
      }`}
      ref={sectionRef}
    >
      <img
        alt=""
        className="paper-border paper-border--about"
        src={assetPath("/images/paper-border.png")}
      />
      <ParticleGrid className="about-shell">
        <div className="hero-overlay-grid" aria-hidden="true" />
        <CutoutHero anchorId="about" enableMotion={false} />

        <div className="container about-content">
          <div className="section-heading about-heading-reveal">
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
              <p className="about-copy__line about-copy__line--1">
                As an architect and self-taught software developer specializing
                in the intersection of design and technology, I create custom
                plugins, automations, and digital solutions for 3D software to
                streamline architectural Visualization and 3D design workflows.
                Passionate about leveraging cutting-edge technology to enhance
                conceptualization and elevate the design process. I aim to
                combine my architectural expertise with programming skills to
                drive efficiency and push creative boundaries in the field.
              </p>
              <p className="about-copy__line about-copy__line--2">
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
