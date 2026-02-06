'use client';

import type { ModelDefinition } from '../../types';
import { modelCubeDefaults } from './params';
import { ModelCubeRenderer } from './renderer';
import { buildModelCubeGui } from './gui';

export const modelCube: ModelDefinition = {
  id: 'model-cube',
  name: 'Cube Configurator',
  defaults: modelCubeDefaults,
  camera: { position: [24, 20, 24], fov: 50 },
  render: (params) => <ModelCubeRenderer params={params} />,
  buildGui: buildModelCubeGui,
};
