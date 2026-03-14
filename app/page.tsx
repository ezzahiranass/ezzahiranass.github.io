import About from "./sections/About";
import Contact from "./sections/Contact";
import CmsProjects from "./sections/CmsProjects";
import Footer from "./sections/Footer";
import Gallery from "./sections/Gallery";
import GifShowcase from "./sections/GifShowcase";
import Hero from "./sections/Hero";
import Navbar from "./sections/Navbar";
import PortfolioViewer from "./sections/PortfolioViewer";
import Roadmap from "./sections/Roadmap";
import SampleConfigurators from "./sections/SampleConfigurators";
import Skills from "./sections/Skills";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Skills />
      <PortfolioViewer />
      <CmsProjects />
      <Roadmap />
      <GifShowcase />
      <SampleConfigurators />
      <Gallery />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
