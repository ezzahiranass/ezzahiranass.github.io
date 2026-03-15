"use client";

import { Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import SocialLinks from "../components/SocialLinks";

const links = [
  { label: "Skills", href: "#skills" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const STORAGE_KEY = "portfolio-theme";

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
            <SocialLinks className="contact-popup__links" />
          </div>
        </div>
      ) : null}
    </>
  );
}
