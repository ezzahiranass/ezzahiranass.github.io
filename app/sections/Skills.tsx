"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import skillsData from "../../public/data/skills.json";

type Skill = {
  id: string;
  title: string;
  description: string;
  details: string[];
  image: string | null;
};



export default function Skills() {
  const skills = skillsData as Skill[];
  const loopedSkills = useMemo(() => [...skills, ...skills, ...skills], [skills]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isAdjustingRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const setWidth = scroller.scrollWidth / 3;
    if (setWidth > 0) {
      scroller.scrollLeft = setWidth;
    }
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let rafId = 0;

    const step = () => {
      if (!paused) {
        scroller.scrollLeft += 0.6;
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(rafId);
  }, [paused]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || isAdjustingRef.current) return;

    const setWidth = scroller.scrollWidth / 3;
    if (setWidth === 0) return;

    if (scroller.scrollLeft <= setWidth * 0.5) {
      isAdjustingRef.current = true;
      scroller.scrollLeft += setWidth;
      isAdjustingRef.current = false;
    } else if (scroller.scrollLeft >= setWidth * 1.5) {
      isAdjustingRef.current = true;
      scroller.scrollLeft -= setWidth;
      isAdjustingRef.current = false;
    }
  };

  return (
    <section id="skills" className="section skills-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow mono">Skills</p>
            <h2 className="title">Architecture meets computation.</h2>
          </div>
          <p className="subtitle">
            A hybrid toolkit spanning architecture, computational workflows, and
            design technology systems.
          </p>
        </div>
        <div
          className="skills-scroller hide-scrollbar"
          ref={scrollerRef}
          onScroll={handleScroll}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {loopedSkills.map((skill, index) => (
            <div key={`${skill.id}-${index}`} className="skills-tile">
              {skill.image ? (
                <img src={skill.image} alt={skill.title} />
              ) : (
                <div className="skills-caption mono">{skill.title}</div>
              )}
              <div className="skills-caption mono">{skill.title}</div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
