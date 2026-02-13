'use client';

import { useMemo, useState } from 'react';
import ConfiguratorShell from './ConfiguratorShell';
import ModelSwitcher from './ModelSwitcher';
import { configuratorModels } from './models';
import ViewerIntroOverlay from '../viewers/ViewerIntroOverlay';

export default function ConfiguratorSection() {
  const models = useMemo(() => configuratorModels, []);
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
      >
        <ConfiguratorShell model={activeModel} />
      </ViewerIntroOverlay>
    </div>
  );
}
