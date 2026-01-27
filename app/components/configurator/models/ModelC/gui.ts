'use client';

import type GUI from 'lil-gui';
import type { ParamValues } from '../../types';

type Params = ParamValues & {
  floors: number;
  floorHeight: number;
  groundFloorHeight: number;
  roofHeight: number;
  totalHeight?: number;
};

export function buildModelCGui(
  gui: GUI,
  params: ParamValues,
  onChange: (next: ParamValues) => void
) {
  const state = params as Params;
  const controls = gui.addFolder('Building');
  const floorsCtrl = controls.add(state, 'floors', 1, 10, 1).name('Number of Floors');
  const floorHeightCtrl = controls.add(state, 'floorHeight', 2, 6, 0.1).name('Floor Height');
  const groundHeightCtrl = controls.add(state, 'groundFloorHeight', 2, 8, 0.1).name('Ground Floor Height');
  const roofHeightCtrl = controls.add(state, 'roofHeight', 0.5, 6, 0.1).name('Roof Height');

  const computeTotalHeight = () => state.groundFloorHeight + state.floors * state.floorHeight + state.roofHeight;
  state.totalHeight = computeTotalHeight();
  const totalHeightCtrl = controls
    .add(state, 'totalHeight')
    .name('Total Height')
    .listen()
    .disable();
  controls.open();

  const sync = () => {
    state.totalHeight = computeTotalHeight();
    totalHeightCtrl.updateDisplay();
    onChange({ ...state });
  };

  floorsCtrl.onChange(sync);
  floorHeightCtrl.onChange(sync);
  groundHeightCtrl.onChange(sync);
  roofHeightCtrl.onChange(sync);
}
