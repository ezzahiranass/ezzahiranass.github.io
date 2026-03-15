"use client";

import { useEffect, useMemo, useRef } from "react";
import skillsData from "../../public/data/skills.json";

type SkillCard = {
  id: string;
  title: string;
  description: string;
  details: string[];
  image: string | null;
};

export default function Skills() {
  const skills = skillsData as SkillCard[];
  const railRef = useRef<HTMLDivElement | null>(null);
  const isResettingRef = useRef(false);

  const loopedSkills = useMemo(() => {
    if (skills.length === 0) return [];
    return [...skills, ...skills, ...skills];
  }, [skills]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const segment = rail.scrollWidth / 3;
    if (segment > 0) rail.scrollLeft = segment;
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let rafId = 0;
    let isPaused = false;

    const handleEnter = () => {
      isPaused = true;
    };

    const handleLeave = () => {
      isPaused = false;
    };

    rail.addEventListener("mouseenter", handleEnter);
    rail.addEventListener("mouseleave", handleLeave);

    const step = () => {
      if (!isPaused) rail.scrollLeft += 0.5;
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(rafId);
      rail.removeEventListener("mouseenter", handleEnter);
      rail.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const handleScroll = () => {
    const rail = railRef.current;
    if (!rail || isResettingRef.current) return;
    const segment = rail.scrollWidth / 3;
    if (segment === 0) return;

    if (rail.scrollLeft < segment * 0.55) {
      isResettingRef.current = true;
      rail.scrollLeft += segment;
      isResettingRef.current = false;
    }

    if (rail.scrollLeft > segment * 1.45) {
      isResettingRef.current = true;
      rail.scrollLeft -= segment;
      isResettingRef.current = false;
    }
  };

  return (
    <section id="skills" className="section section--alt skills-section">
      <div className="container">
        <div className="section-heading skills-section__heading">
          <div>
            <p className="eyebrow mono">Skills</p>
            <h2 className="title">Architecture meets computation.</h2>
          </div>
          <p className="subtitle">
            A hybrid toolkit spanning architecture, computational workflows,
            and design technology systems.
          </p>
        </div>
      </div>

      <div
        className="gallery-scroller hide-scrollbar"
        ref={railRef}
        onScroll={handleScroll}
      >
        {loopedSkills.map((skill, index) => (
          <div key={`${skill.id}-${index}`} className="gallery-card">
            <div className="gallery-media">
              {skill.image ? (
                <img src={skill.image} alt={skill.title} loading="lazy" />
              ) : null}
            </div>
            <div className="gallery-caption">
              <div className="mono">{skill.title}</div>
              <p>{skill.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
