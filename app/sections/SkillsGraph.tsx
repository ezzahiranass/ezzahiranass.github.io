"use client";

import { useEffect, useRef } from "react";

const VW = 1400;
const VH = 700;

type NodeDef = {
  id: string;
  lines: string[];
  desc: string;
  bx: number;
  by: number;
  r: number;
  speed: number;
  phase: number;
  ampX: number;
  ampY: number;
};

const NODES: NodeDef[] = [
  { id: "parametric",  lines: ["Parametric", "Design"],  desc: "Rhino + Grasshopper",  bx: 240,  by: 400, r: 60, speed: 0.35, phase: 0.7,  ampX: 16, ampY: 20 },
  { id: "software",    lines: ["Software", "Dev"],        desc: "Python + TypeScript",  bx: 580,  by: 330, r: 58, speed: 0.45, phase: 3.4,  ampX: 18, ampY: 14 },
  { id: "modeling",    lines: ["3D Modeling"],            desc: "Blender + 3ds Max",    bx: 415,  by: 158, r: 56, speed: 0.40, phase: 1.0,  ampX: 14, ampY: 18 },
  { id: "rendering",   lines: ["3D Rendering"],           desc: "Lumion + Blender",     bx: 762,  by: 188, r: 52, speed: 0.55, phase: 2.1,  ampX: 12, ampY: 16 },
  { id: "webgl",       lines: ["WebGL"],                  desc: "Three.js + GLSL",      bx: 1005, by: 390, r: 50, speed: 0.50, phase: 2.8,  ampX: 16, ampY: 18 },
  { id: "comp",        lines: ["Computational"],          desc: "Algorithms + systems", bx: 892,  by: 262, r: 50, speed: 0.38, phase: 5.1,  ampX: 14, ampY: 15 },
  { id: "drawing",     lines: ["2D Drawing"],             desc: "AutoCAD + Archicad",   bx: 142,  by: 192, r: 48, speed: 0.48, phase: 0.0,  ampX: 20, ampY: 14 },
  { id: "bim",         lines: ["BIM"],                    desc: "Revit + coordination", bx: 1102, by: 195, r: 44, speed: 0.42, phase: 1.5,  ampX: 10, ampY: 14 },
  { id: "fabrication", lines: ["Fabrication"],            desc: "CNC + laser cutting",  bx: 512,  by: 528, r: 44, speed: 0.48, phase: 4.2,  ampX: 14, ampY: 12 },
  { id: "shaders",     lines: ["GLSL Shaders"],           desc: "GPU + materials",      bx: 802,  by: 548, r: 40, speed: 0.60, phase: 1.8,  ampX: 12, ampY: 10 },
  { id: "animation",   lines: ["Animation"],              desc: "Motion + rigging",     bx: 1172, by: 512, r: 38, speed: 0.44, phase: 3.0,  ampX: 10, ampY: 12 },
  { id: "dataviz",     lines: ["Data Viz"],               desc: "Interactive charts",   bx: 302,  by: 572, r: 40, speed: 0.52, phase: 0.3,  ampX: 12, ampY: 10 },
];

const EDGES = [
  { from: "drawing",     to: "modeling",    accent: true,  delay: 0.0 },
  { from: "modeling",    to: "rendering",   accent: true,  delay: 0.5 },
  { from: "modeling",    to: "parametric",  accent: false, delay: 1.0 },
  { from: "rendering",   to: "bim",         accent: false, delay: 1.5 },
  { from: "rendering",   to: "webgl",       accent: true,  delay: 2.0 },
  { from: "rendering",   to: "comp",        accent: false, delay: 0.3 },
  { from: "parametric",  to: "software",    accent: true,  delay: 0.8 },
  { from: "parametric",  to: "fabrication", accent: false, delay: 1.3 },
  { from: "parametric",  to: "drawing",     accent: false, delay: 1.8 },
  { from: "software",    to: "webgl",       accent: true,  delay: 0.6 },
  { from: "software",    to: "comp",        accent: false, delay: 1.1 },
  { from: "software",    to: "shaders",     accent: false, delay: 1.6 },
  { from: "webgl",       to: "shaders",     accent: true,  delay: 2.1 },
  { from: "webgl",       to: "animation",   accent: true,  delay: 0.4 },
  { from: "comp",        to: "bim",         accent: false, delay: 0.9 },
  { from: "comp",        to: "dataviz",     accent: false, delay: 1.4 },
  { from: "fabrication", to: "dataviz",     accent: false, delay: 1.9 },
  { from: "shaders",     to: "animation",   accent: false, delay: 0.7 },
  { from: "bim",         to: "modeling",    accent: false, delay: 1.2 },
  { from: "software",    to: "fabrication", accent: false, delay: 2.4 },
];

const STARS = [
  { bx: 55,   by: 52,  r: 2.0, speed: 0.30, phase: 0.00, ampX: 5, ampY: 4, delay: 0.0 },
  { bx: 168,  by: 308, r: 1.5, speed: 0.36, phase: 1.20, ampX: 4, ampY: 6, delay: 0.4 },
  { bx: 342,  by: 60,  r: 2.5, speed: 0.42, phase: 2.50, ampX: 7, ampY: 5, delay: 0.8 },
  { bx: 688,  by: 70,  r: 1.5, speed: 0.35, phase: 3.10, ampX: 5, ampY: 6, delay: 1.2 },
  { bx: 958,  by: 84,  r: 2.0, speed: 0.45, phase: 0.80, ampX: 6, ampY: 4, delay: 1.6 },
  { bx: 1298, by: 100, r: 1.5, speed: 0.40, phase: 4.20, ampX: 4, ampY: 5, delay: 2.0 },
  { bx: 90,   by: 480, r: 1.5, speed: 0.30, phase: 1.50, ampX: 5, ampY: 6, delay: 0.3 },
  { bx: 1255, by: 348, r: 2.0, speed: 0.50, phase: 2.20, ampX: 6, ampY: 5, delay: 0.7 },
  { bx: 655,  by: 620, r: 1.5, speed: 0.45, phase: 5.00, ampX: 5, ampY: 4, delay: 1.1 },
  { bx: 1050, by: 580, r: 2.0, speed: 0.38, phase: 0.50, ampX: 4, ampY: 6, delay: 1.5 },
  { bx: 200,  by: 645, r: 1.5, speed: 0.42, phase: 3.80, ampX: 5, ampY: 5, delay: 1.9 },
  { bx: 1352, by: 640, r: 2.0, speed: 0.35, phase: 1.80, ampX: 4, ampY: 4, delay: 2.3 },
  { bx: 480,  by: 80,  r: 1.5, speed: 0.48, phase: 2.80, ampX: 6, ampY: 5, delay: 0.6 },
  { bx: 1150, by: 440, r: 2.5, speed: 0.52, phase: 4.50, ampX: 5, ampY: 7, delay: 1.0 },
  { bx: 735,  by: 640, r: 1.5, speed: 0.40, phase: 0.20, ampX: 4, ampY: 5, delay: 1.4 },
  { bx: 365,  by: 480, r: 2.0, speed: 0.45, phase: 3.50, ampX: 5, ampY: 6, delay: 1.8 },
  { bx: 1280, by: 240, r: 1.5, speed: 0.55, phase: 1.00, ampX: 6, ampY: 4, delay: 2.2 },
  { bx: 60,   by: 620, r: 2.0, speed: 0.38, phase: 5.50, ampX: 4, ampY: 6, delay: 0.5 },
  { bx: 920,  by: 630, r: 1.5, speed: 0.42, phase: 2.00, ampX: 5, ampY: 5, delay: 0.9 },
  { bx: 120,  by: 378, r: 2.0, speed: 0.35, phase: 4.80, ampX: 6, ampY: 5, delay: 1.3 },
  { bx: 700,  by: 455, r: 1.5, speed: 0.44, phase: 2.60, ampX: 5, ampY: 6, delay: 1.7 },
  { bx: 450,  by: 270, r: 1.5, speed: 0.32, phase: 3.90, ampX: 6, ampY: 4, delay: 2.1 },
  { bx: 1380, by: 420, r: 2.0, speed: 0.46, phase: 0.60, ampX: 3, ampY: 7, delay: 0.2 },
  { bx: 30,   by: 140, r: 1.5, speed: 0.38, phase: 5.20, ampX: 4, ampY: 5, delay: 2.5 },
  { bx: 1020, by: 148, r: 2.0, speed: 0.50, phase: 1.40, ampX: 5, ampY: 5, delay: 0.1 },
];

export default function SkillsGraph() {
  const nodeRefs = useRef(new Map<string, SVGGElement>());
  const edgeRefs = useRef<SVGLineElement[]>([]);
  const starRefs = useRef<SVGCircleElement[]>([]);
  const rafRef = useRef(0);
  const t0Ref = useRef(0);

  useEffect(() => {
    const pos = new Map<string, [number, number]>();

    const tick = (ts: number) => {
      if (!t0Ref.current) t0Ref.current = ts;
      const t = (ts - t0Ref.current) / 1000;

      for (const node of NODES) {
        const cx = node.bx + Math.sin(t * node.speed + node.phase) * node.ampX;
        const cy = node.by + Math.cos(t * node.speed * 1.3 + node.phase + 1.2) * node.ampY;
        pos.set(node.id, [cx, cy]);
        const el = nodeRefs.current.get(node.id);
        if (el) el.setAttribute("transform", `translate(${cx.toFixed(1)},${cy.toFixed(1)})`);
      }

      for (let i = 0; i < STARS.length; i++) {
        const s = STARS[i];
        const cx = s.bx + Math.sin(t * s.speed + s.phase) * s.ampX;
        const cy = s.by + Math.cos(t * s.speed * 1.1 + s.phase) * s.ampY;
        const el = starRefs.current[i];
        if (el) { el.setAttribute("cx", cx.toFixed(1)); el.setAttribute("cy", cy.toFixed(1)); }
      }

      for (let i = 0; i < EDGES.length; i++) {
        const edge = EDGES[i];
        const from = pos.get(edge.from);
        const to = pos.get(edge.to);
        if (!from || !to) continue;
        const el = edgeRefs.current[i];
        if (el) {
          el.setAttribute("x1", from[0].toFixed(1));
          el.setAttribute("y1", from[1].toFixed(1));
          el.setAttribute("x2", to[0].toFixed(1));
          el.setAttribute("y2", to[1].toFixed(1));
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section id="skills" className="section section--alt skills-graph">
      <div className="container">
        <div className="section-heading skills-section__heading">
          <div>
            <p className="eyebrow mono">Skills</p>
            <h2 className="title">Architecture meets computation.</h2>
          </div>
          <p className="subtitle">
            A skill map of architectural thinking, computational systems, and web-native
            experimentation.
          </p>
        </div>
      </div>

      <svg
        aria-hidden="true"
        className="skills-graph__svg"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="sg-fill" cx="38%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1e3580" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0b0e18" stopOpacity="0.97" />
          </radialGradient>
          <filter id="sg-blur-sm" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
          <filter id="sg-blur-lg" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" />
          </filter>
        </defs>

        {/* Stars */}
        {STARS.map((s, i) => (
          <circle
            key={`s${i}`}
            ref={(el) => { if (el) starRefs.current[i] = el; }}
            cx={s.bx} cy={s.by} r={s.r}
            className="sg-star"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}

        {/* All edges — rendered once, ref by EDGES index so tick stays in sync */}
        {EDGES.map((edge, i) => {
          const fn = NODES.find(n => n.id === edge.from);
          const tn = NODES.find(n => n.id === edge.to);
          return (
            <line
              key={`e${i}`}
              ref={(el) => { if (el) edgeRefs.current[i] = el; }}
              x1={fn?.bx ?? 0} y1={fn?.by ?? 0}
              x2={tn?.bx ?? 0} y2={tn?.by ?? 0}
              className={edge.accent ? "sg-edge sg-edge--accent" : "sg-edge sg-edge--soft"}
              style={{ animationDelay: `${edge.delay}s` }}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((node, i) => (
          <g
            key={node.id}
            ref={(el) => { if (el) nodeRefs.current.set(node.id, el); }}
            transform={`translate(${node.bx},${node.by})`}
            className="sg-node"
            style={{ animationDelay: `${i * 0.28}s` }}
          >
            <circle r={node.r + 28} fill="#1a40e8" filter="url(#sg-blur-lg)" className="sg-node__halo" />
            <circle r={node.r + 6}  fill="#1a40e8" filter="url(#sg-blur-sm)" className="sg-node__glow" />
            <circle r={node.r} fill="url(#sg-fill)" />
            <circle r={node.r} fill="none" className="sg-node__ring" />
            <circle r={node.r + 2} fill="none" className="sg-node__pulse" style={{ animationDelay: `${i * 0.28}s` }} />

            {node.lines.length === 1 ? (
              <>
                <text className="sg-node__title" textAnchor="middle" y={-8}>{node.lines[0]}</text>
                <text className="sg-node__desc"  textAnchor="middle" y={9}>{node.desc}</text>
              </>
            ) : (
              <>
                <text className="sg-node__title" textAnchor="middle" y={-15}>{node.lines[0]}</text>
                <text className="sg-node__title" textAnchor="middle" y={1}>{node.lines[1]}</text>
                <text className="sg-node__desc"  textAnchor="middle" y={18}>{node.desc}</text>
              </>
            )}
          </g>
        ))}
      </svg>
    </section>
  );
}
