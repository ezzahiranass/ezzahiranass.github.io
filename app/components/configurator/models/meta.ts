import type { ModelDefinition } from '../types';

// Lightweight model metadata for the switcher and intro overlay. Kept separate from
// the model definitions so the landing page doesn't import the renderers (and their
// module-level GLB preloads) until a configurator is opened.
export type ModelMeta = Pick<ModelDefinition, 'id' | 'name' | 'intro'>;

export const modelCMeta: ModelMeta = {
  id: 'model-c',
  name: 'Building Configurator',
  intro: {
    title: 'Building Configurator',
    description: 'Adjust massing, twist, bevels, and structural columns to explore tower variants.',
    buttonLabel: 'Open Model',
  },
};

export const modelSketchMeta: ModelMeta = {
  id: 'model-sketch',
  name: 'Sketch Configurator',
  intro: {
    title: 'Sketch Configurator',
    description: 'Draw a footprint to generate a tower and then refine floors, twist, and facade.',
    buttonLabel: 'Start Sketching',
  },
};

export const configuratorModelMeta: ModelMeta[] = [modelCMeta, modelSketchMeta];
