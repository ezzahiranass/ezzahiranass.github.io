'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import ModelSwitcher from './ModelSwitcher';
import { configuratorModelMeta } from './models/meta';
import ViewerIntroOverlay from '../viewers/ViewerIntroOverlay';

const ShellPlaceholder = ({ label }: { label?: string }) => (
  <div className="configurator-shell configurator-shell--placeholder" aria-hidden="true">
    {label ? <span className="viewer-loading mono">{label}</span> : null}
  </div>
);

// The configurator (lil-gui, the model renderers and ~30 MB of GLB models they
// preload at module scope) is only fetched once the visitor opens it.
const ConfiguratorById = dynamic(() => import('./ConfiguratorById'), {
  ssr: false,
  loading: () => <ShellPlaceholder label="Loading configurator…" />,
});

export default function ConfiguratorSection() {
  const models = configuratorModelMeta;
  const [activeId, setActiveId] = useState(models[0]?.id ?? '');
  const activeModel = models.find((model) => model.id === activeId) ?? models[0];

  if (!activeModel) return null;

  return (
    <div className="configurator-stack">
      <ModelSwitcher models={models} activeId={activeId} onSelect={setActiveId} />
      <ViewerIntroOverlay
        key={activeModel.id}
        eyebrow="Interactive Configurator"
        title={activeModel.intro?.title ?? activeModel.name}
        description={
          activeModel.intro?.description ??
          'Adjust parameters in the panel and inspect the model directly in the viewport.'
        }
        buttonLabel={activeModel.intro?.buttonLabel ?? 'Open Viewer'}
        placeholder={<ShellPlaceholder />}
      >
        <ConfiguratorById modelId={activeModel.id} />
      </ViewerIntroOverlay>
    </div>
  );
}
