import { Linkedin, Mail } from "lucide-react";

type SocialLinksProps = {
  className?: string;
  iconOnly?: boolean;
};

const socials = [
  {
    href: "https://www.linkedin.com/in/anass-ezzahir-a4b2a2182/",
    icon: Linkedin,
    label: "LinkedIn",
    external: true,
  },
  {
    href: "mailto:anassezzahir@gmail.com",
    icon: Mail,
    label: "Email",
    external: false,
  },
];

export default function SocialLinks({
  className = "",
  iconOnly = false,
}: SocialLinksProps) {
  return (
    <div className={`social-links${className ? ` ${className}` : ""}`}>
      {socials.map(({ href, icon: Icon, label, external }) => (
        <a
          key={label}
          className={`social-link${iconOnly ? " social-link--icon" : ""}`}
          href={href}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          <Icon aria-hidden="true" size={18} />
          {iconOnly ? <span className="sr-only">{label}</span> : <span>{label}</span>}
        </a>
      ))}
    </div>
  );
}
