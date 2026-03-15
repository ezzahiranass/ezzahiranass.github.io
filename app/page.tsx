import About from "./sections/About";
import CmsProjects from "./sections/CmsProjects";
import Footer from "./sections/Footer";
import Gallery from "./sections/Gallery";
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
      <Gallery />
      <PortfolioViewer />
      <CmsProjects />
      <Roadmap />
      <SampleConfigurators />
      <Skills />
      <About />
      <Footer />
    </main>
  );
}
