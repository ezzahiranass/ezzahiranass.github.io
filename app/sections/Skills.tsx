"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import skillsData from "../../public/data/skills.json";
import { fetchSanityProjects, type SanityProject } from "../lib/sanity";

type SkillCard = {
  id: string;
  title: string;
  description: string;
  details: string[];
  image: string | null;
};

type SkillMedia =
  | { type: "image"; url: string }
  | { type: "video"; url: string; mimeType?: string };

type SkillCardWithMedia = SkillCard & {
  media: SkillMedia | null;
};

function normalizeSkillKey(value: string) {
  return value.trim().toLowerCase();
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export default function Skills() {
  const skillMetadata = skillsData as SkillCard[];
  const railRef = useRef<HTMLDivElement | null>(null);
  const isResettingRef = useRef(false);
  const [projects, setProjects] = useState<SanityProject[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetchSanityProjects(controller.signal)
      .then((result) => {
        setProjects(result);
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, []);

  const skills = useMemo<SkillCardWithMedia[]>(() => {
    const metadataByKey = new Map(
      skillMetadata.map((skill) => [normalizeSkillKey(skill.title), skill])
    );
    const skillMediaMap = new Map<string, { title: string; media: SkillMedia[] }>();

    const pushMedia = (
      rawTitle: string | undefined,
      media: SkillMedia | null
    ) => {
      const title = rawTitle?.trim();
      if (!title || !media) return;

      const key = normalizeSkillKey(title);
      const existing = skillMediaMap.get(key);
      if (existing) {
        if (!existing.media.some((item) => item.url === media.url)) {
          existing.media.push(media);
        }
        return;
      }

      skillMediaMap.set(key, {
        title,
        media: [media],
      });
    };

    projects.forEach((project) => {
      project.imageGallery?.forEach((item) => {
        const media = item.asset?.url
          ? ({ type: "image", url: item.asset.url } as const)
          : null;
        item.skills?.forEach((skill) =>
          pushMedia(
            typeof skill?.title === "string" ? skill.title : undefined,
            media
          )
        );
      });

      project.mediaGallery?.forEach((item) => {
        if (item.mediaType !== "image" || !item.image?.asset?.url) return;

        const media = { type: "image", url: item.image.asset.url } as const;
        item.skills?.forEach((skill) =>
          pushMedia(
            typeof skill?.title === "string" ? skill.title : undefined,
            media
          )
        );
      });

      project.videoGallery?.forEach((item) => {
        if (!item.asset?.url) return;

        const media = {
          type: "video",
          url: item.asset.url,
          mimeType: item.asset.mimeType,
        } as const;
        item.skills?.forEach((skill) =>
          pushMedia(
            typeof skill?.title === "string" ? skill.title : undefined,
            media
          )
        );
      });
    });

    const orderedKeys = [
      ...skillMetadata
        .map((skill) => normalizeSkillKey(skill.title))
        .filter((key) => skillMediaMap.has(key)),
      ...Array.from(skillMediaMap.keys())
        .filter(
          (key) =>
            !skillMetadata.some(
              (skill) => normalizeSkillKey(skill.title) === key
            )
        )
        .sort((left, right) => {
          const leftTitle = skillMediaMap.get(left)?.title ?? left;
          const rightTitle = skillMediaMap.get(right)?.title ?? right;
          return leftTitle.localeCompare(rightTitle);
        }),
    ];

    return orderedKeys.map((key) => {
      const source = skillMediaMap.get(key);
      const metadata = metadataByKey.get(key);
      const pickedMedia =
        source && source.media.length > 0
          ? source.media[hashString(source.title) % source.media.length] ?? null
          : null;

      return {
        id: metadata?.id ?? key.replace(/\s+/g, "-"),
        title: metadata?.title ?? source?.title ?? key,
        description:
          metadata?.description ??
          `Selected work tagged with ${source?.title ?? key}.`,
        details: metadata?.details ?? [],
        image:
          pickedMedia?.type === "image" ? pickedMedia.url : metadata?.image ?? null,
        media: pickedMedia,
      };
    });
  }, [projects, skillMetadata]);

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
        className="skills-scroller hide-scrollbar"
        ref={railRef}
        onScroll={handleScroll}
      >
        {loopedSkills.map((skill, index) => (
          <div key={`${skill.id}-${index}`} className="gallery-card">
            <div className="gallery-media">
              {skill.media?.type === "video" ? (
                <video
                  autoPlay
                  className="gallery-media__video"
                  loop
                  muted
                  playsInline
                  preload="metadata"
                >
                  <source src={skill.media.url} type={skill.media.mimeType ?? "video/mp4"} />
                </video>
              ) : skill.image ? (
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
