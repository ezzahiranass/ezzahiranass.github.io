import ConfiguratorSection from "../components/configurator/ConfiguratorSection";

export default function SampleConfigurators() {
  return (
    <section id="configurators" className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow mono">Live Configurators</p>
            <h2 className="title">Building + tower sketch viewers are back.</h2>
          </div>
          <p className="subtitle">
            Switch between the Building Configurator and Sketch Configurator,
            both with full `lil-gui` controls.
          </p>
        </div>
        <ConfiguratorSection />
      </div>
    </section>
  );
}
