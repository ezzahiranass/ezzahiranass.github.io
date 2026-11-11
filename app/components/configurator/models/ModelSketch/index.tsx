'use client';

import type { ModelDefinition } from '../../types';
import { modelSketchMeta } from '../meta';
import { modelSketchDefaults } from './params';
import { ModelSketchRenderer } from './renderer';
import { buildModelSketchGui } from './gui';

export const modelSketch: ModelDefinition = {
  ...modelSketchMeta,
  defaults: modelSketchDefaults,
  camera: { position: [25, 20, 25], fov: 50 },
  render: (params) => <ModelSketchRenderer params={params} />,
  buildGui: buildModelSketchGui,
};
