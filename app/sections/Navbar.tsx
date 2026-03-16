"use client";

import { Linkedin, Mail, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { label: "Gallery", href: "#gallery" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Projects", href: "#projects" },
  { label: "CV", href: "#roadmap" },
  { label: "Playground", href: "#configurators" },
  { label: "Skills", href: "#skills" },
  { label: "About", href: "#about" },
];

const STORAGE_KEY = "portfolio-theme";
const LINKEDIN_URL = "https://www.linkedin.com/in/anass-ezzahir-a4b2a2182/";
const LINKEDIN_HANDLE = "Anass Ezzahir";
const EMAIL_ADDRESS = "anassezzahir@gmail.com";

type Theme = "light" | "dark";

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = root.dataset.theme;
    if (currentTheme === "light" || currentTheme === "dark") {
      setTheme(currentTheme);
      return;
    }

    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme: Theme = preferredDark ? "dark" : "light";
    root.dataset.theme = nextTheme;
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    if (!contactOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContactOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contactOpen]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  return (
    <>
      <header className="navbar">
        <div className="container nav-inner">
          <div className="nav-logo mono">ANASS EZZAHIR</div>
          <nav className="nav-links" aria-label="Primary">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="nav-cta">
            <button
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="theme-toggle"
              onClick={toggleTheme}
              type="button"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="btn btn--primary"
              onClick={() => setContactOpen(true)}
              type="button"
            >
              Contact Me
            </button>
          </div>
        </div>
      </header>

      {contactOpen ? (
        <div
          aria-hidden="true"
          className="contact-popup-backdrop"
          onClick={() => setContactOpen(false)}
        >
          <div
            aria-label="Contact links"
            aria-modal="true"
            className="contact-popup"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="contact-popup__header">
              <div>
                <p className="mono">Contact</p>
                <h3>Find me here</h3>
              </div>
              <button
                aria-label="Close contact popup"
                className="contact-popup__close"
                onClick={() => setContactOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <p className="contact-popup__copy">
              Reach out through LinkedIn or send me an email directly.
            </p>
            <div className="contact-popup__rows">
              <div className="contact-popup__row">
                <a
                  aria-label="Open LinkedIn profile"
                  className="social-link social-link--icon"
                  href={LINKEDIN_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Linkedin aria-hidden="true" size={18} />
                </a>
                <a
                  className="contact-popup__value mono"
                  href={LINKEDIN_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  {LINKEDIN_HANDLE}
                </a>
              </div>
              <div className="contact-popup__row">
                <a
                  aria-label="Send email"
                  className="social-link social-link--icon"
                  href={`mailto:${EMAIL_ADDRESS}`}
                >
                  <Mail aria-hidden="true" size={18} />
                </a>
                <a
                  className="contact-popup__value mono"
                  href={`mailto:${EMAIL_ADDRESS}`}
                >
                  {EMAIL_ADDRESS}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
