import type { ReactNode } from "react";

type Discipline = {
  id: string;
  title: string;
  blurb: string;
  tools: string[];
  glyph: ReactNode;
};

// Line-drawn glyphs, one per discipline, drawn on a 64x64 drafting grid.
const glyphProps = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const PlanGlyph = (
  <svg {...glyphProps}>
    <rect x="8" y="10" width="48" height="44" />
    <path d="M8 32h20M36 32h20M30 10v14M30 40v14" />
    <path d="M28 32a8 8 0 0 1 8-8" strokeDasharray="2 3" />
    <path d="M14 4v4M50 4v4M14 6h36" opacity="0.6" />
  </svg>
);

const CurveGlyph = (
  <svg {...glyphProps}>
    <path d="M6 50C18 50 18 14 32 14s14 36 26 36" />
    <path d="M6 50h12M58 50H46M32 14l-10 0M32 14h10" opacity="0.6" />
    <circle cx="6" cy="50" r="2.5" fill="currentColor" />
    <circle cx="32" cy="14" r="2.5" fill="currentColor" />
    <circle cx="58" cy="50" r="2.5" fill="currentColor" />
    <circle cx="18" cy="50" r="1.8" />
    <circle cx="22" cy="14" r="1.8" />
    <circle cx="42" cy="14" r="1.8" />
    <circle cx="46" cy="50" r="1.8" />
  </svg>
);

const CodeGlyph = (
  <svg {...glyphProps}>
    <rect x="6" y="10" width="52" height="44" rx="4" />
    <path d="M6 20h52" />
    <circle cx="12" cy="15" r="1.2" fill="currentColor" />
    <circle cx="17" cy="15" r="1.2" fill="currentColor" />
    <path d="M24 30l-7 7 7 7M40 30l7 7-7 7M35 27l-6 20" />
  </svg>
);

const NetworkGlyph = (
  <svg {...glyphProps}>
    <path d="M10 16l22 6M10 16l22 26M10 48l22-26M10 48l22 -6M32 22l22 10M32 42l22-10" opacity="0.55" />
    <circle cx="10" cy="16" r="4" />
    <circle cx="10" cy="48" r="4" />
    <circle cx="32" cy="22" r="4" />
    <circle cx="32" cy="42" r="4" />
    <circle cx="54" cy="32" r="5" fill="currentColor" />
  </svg>
);

const DISCIPLINES: Discipline[] = [
  {
    id: "architecture",
    title: "Architectural Design",
    blurb: "Technical drawing, BIM modeling, 3D modeling and rendering for built projects.",
    tools: ["AutoCAD", "ArchiCAD", "Revit", "3ds Max", "Blender", "Lumion", "Illustrator", "Photoshop"],
    glyph: PlanGlyph,
  },
  {
    id: "parametric",
    title: "Parametric Design",
    blurb: "Rule-based form finding and design variants instead of one-off models.",
    tools: ["Rhino", "Grasshopper", "Blender Geometry Nodes"],
    glyph: CurveGlyph,
  },
  {
    id: "software",
    title: "Software Development",
    blurb: "Revit, Blender and Rhino plugins, ACC automations and 3D web apps built around the design process.",
    tools: [
      "Python",
      "Autodesk Platform Services",
      "ACC automation",
      "IFC / BIM data",
      "Next.js",
      "TypeScript",
      "Three.js",
    ],
    glyph: CodeGlyph,
  },
  {
    id: "ai",
    title: "AI Development",
    blurb: "Assistants wired into BIM tools and project data.",
    tools: ["LLM APIs", "LangChain", "LangGraph", "RAG", "MCP servers"],
    glyph: NetworkGlyph,
  },
];

export default function SkillsMap() {
  return (
    <section id="skills" className="section section--alt skills-map-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow mono">Skills</p>
            <h2 className="title">Architecture meets computation.</h2>
          </div>
          <p className="subtitle">
            Four disciplines, one workflow: from the drawing board to the tools
            that generate, automate and reason about it.
          </p>
        </div>

        <div className="skills-map">
          <div className="skills-map__axis mono" aria-hidden="true">
            <span>Architecture</span>
            <span>Computation</span>
          </div>
          <ol className="skills-map__lanes">
            {DISCIPLINES.map((discipline, index) => (
              <li
                key={discipline.id}
                className="skill-lane"
                style={{ ["--lane-mix" as string]: `${25 + index * 25}%` }}
              >
                <span className="skill-lane__node" aria-hidden="true" />
                <div className="skill-lane__head">
                  <span className="skill-lane__index mono">0{index + 1}</span>
                  <span className="skill-lane__glyph">{discipline.glyph}</span>
                </div>
                <h3 className="skill-lane__title">{discipline.title}</h3>
                <p className="skill-lane__blurb">{discipline.blurb}</p>
                <ul className="skill-lane__tools">
                  {discipline.tools.map((tool) => (
                    <li key={tool} className="skill-lane__tool mono">
                      {tool}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
