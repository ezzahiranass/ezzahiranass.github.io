import SocialLinks from "../components/SocialLinks";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="mono">ANASS EZZAHIR © 2026</p>
          <p>Computational architecture portfolio.</p>
        </div>
        <SocialLinks iconOnly />
      </div>
    </footer>
  );
}
