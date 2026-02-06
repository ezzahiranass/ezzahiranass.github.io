'use client';

import type GUI from 'lil-gui';
import type { ParamValues } from '../../types';
type Params = ParamValues & {
  towerType: string;
  bevel: number;
  ghostSubdivisions: number;
  floorHeight: number;
  floors: number;
  twist: number;
  scale: number;
};

export function buildModelSketchGui(
  gui: GUI,
  params: ParamValues,
  onChange: (next: ParamValues) => void
) {
  const state = params as Params;
  const drawAction = {
    draw: () => window.dispatchEvent(new CustomEvent('sketch:draw')),
  };

  gui.add(drawAction, 'draw').name('Draw');
  const typeCtrl = gui
    .add(state, 'towerType', ['Twist', 'Voxel', 'Shanghai'])
    .name('Tower Type');

  const extrusion = gui.addFolder('Extrusion');
  const roundedCtrl = extrusion
    .add(state, 'bevel', 0, 1, 0.01)
    .name('Bevel');
  const ghostCtrl = extrusion
    .add(state, 'ghostSubdivisions', 0, 20, 1)
    .name('Ghost Subdivisions');
  const heightCtrl = extrusion
    .add(state, 'floorHeight', 2.5, 10, 0.1)
    .name('Floor Height');
  const floorsCtrl = extrusion
    .add(state, 'floors', 2, 30, 1)
    .name('Number of Floors');
  const twistCtrl = extrusion
    .add(state, 'twist', 0, 1, 0.01)
    .name('Twist');
  const scaleCtrl = extrusion
    .add(state, 'scale', 0, 1, 0.01)
    .name('Scale');
  extrusion.open();

  const tools = gui.addFolder('Tools');
  tools.add({ edit: () => window.dispatchEvent(new CustomEvent('sketch:edit')) }, 'edit').name('Edit');
  tools.add({ clear: () => window.dispatchEvent(new CustomEvent('sketch:delete')) }, 'clear').name('Delete');
  tools.open();

  const sync = () => onChange({ ...state });
  typeCtrl.onChange(sync);
  roundedCtrl.onChange(sync);
  ghostCtrl.onChange(sync);
  heightCtrl.onChange(sync);
  floorsCtrl.onChange(sync);
  twistCtrl.onChange(sync);
  scaleCtrl.onChange(sync);
}
