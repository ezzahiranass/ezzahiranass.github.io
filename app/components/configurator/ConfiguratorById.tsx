'use client';

import ConfiguratorShell from './ConfiguratorShell';
import { configuratorModels } from './models';

// Entry point of the lazily-loaded configurator chunk (see ConfiguratorSection).
export default function ConfiguratorById({ modelId }: { modelId: string }) {
  const model = configuratorModels.find((item) => item.id === modelId) ?? configuratorModels[0];
  if (!model) return null;
  return <ConfiguratorShell model={model} />;
}
