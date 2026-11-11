'use client';

import type { ModelDefinition } from '../../types';
import { modelCMeta } from '../meta';
import { modelCDefaults } from './params';
import { ModelCRenderer } from './renderer';
import { buildModelCGui } from './gui';
import { buildModelCStats } from './stats';

export const modelC: ModelDefinition = {
  ...modelCMeta,
  defaults: modelCDefaults,
  camera: { position: [-30, 50, -30] },
  render: (params) => <ModelCRenderer params={params} />,
  buildGui: buildModelCGui,
  buildStats: buildModelCStats,
};
