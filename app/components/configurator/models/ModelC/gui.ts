'use client';

import type GUI from 'lil-gui';
import type { ParamValues } from '../../types';

type Params = ParamValues & {
  floors: number;
  floorHeight: number;
  groundFloorHeight: number;
  roofHeight: number;
  totalHeight?: number;
  overhang: number;
  roofWallHeight: number;
  slabThickness: number;
  balconyLeft: boolean;
  balconyRight: boolean;
  balconyWidth: number;
  balconyWall: boolean;
  balconyRailing: string;
  windowWidth: number;
  balconyCoating: string;
  windowCoating: string;
  groundSurface?: number;
  floorSurface?: number;
  totalSurface?: number;
  floorsCount?: number;
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
  const overhangCtrl = controls.add(state, 'overhang', 0, 3, 0.1).name('Overhang');
  const roofWallHeightCtrl = controls.add(state, 'roofWallHeight', 0.2, 2.5, 0.1).name('Roof Wall Height');
  const slabCtrl = controls.add(state, 'slabThickness', 0.05, 0.5, 0.05).name('Slab Thickness');
  const windowWidthCtrl = controls.add(state, 'windowWidth', 0.5, 3, 0.1).name('Window Width');

  const computeTotalHeight = () => (
    state.groundFloorHeight
    + state.floors * state.floorHeight
    + (state.floors + 1) * state.slabThickness
    + state.roofHeight
  );
  const sizeX = 17.5;
  const sizeZ = 13.1;
  const computeStats = () => {
    state.floorsCount = state.floors;
    state.groundSurface = Number((sizeX * sizeZ).toFixed(2));
    state.floorSurface = Number((sizeX * (sizeZ + state.overhang)).toFixed(2));
    state.totalSurface = Number(
      (state.groundSurface + state.floors * state.floorSurface).toFixed(2)
    );
  };
  state.totalHeight = Number(computeTotalHeight().toFixed(2));
  computeStats();
  controls.open();

  const balcony = gui.addFolder('Balcony');
  const balconyLeftCtrl = balcony.add(state, 'balconyLeft').name('Balcony Left');
  const balconyRightCtrl = balcony.add(state, 'balconyRight').name('Balcony Right');
  const balconyWidthCtrl = balcony.add(state, 'balconyWidth', 0.5, 6, 0.1).name('Balcony Width');
  const balconyWallCtrl = balcony.add(state, 'balconyWall').name('Balcony Wall');
  const balconyRailingCtrl = balcony.add(state, 'balconyRailing', ['Glass', 'Metal']).name('Balcony Railing');
  balcony.open();

  const coating = gui.addFolder('Coating');
  const balconyCoatingCtrl = coating.add(state, 'balconyCoating', ['Arch', 'None']).name('Balcony Coating');
  const windowCoatingCtrl = coating.add(state, 'windowCoating', ['Arch', 'None']).name('Window Coating');
  coating.open();

  const sync = () => {
    state.totalHeight = Number(computeTotalHeight().toFixed(2));
    computeStats();
    onChange({ ...state });
  };

  floorsCtrl.onChange(sync);
  floorHeightCtrl.onChange(sync);
  groundHeightCtrl.onChange(sync);
  roofHeightCtrl.onChange(sync);
  overhangCtrl.onChange(sync);
  roofWallHeightCtrl.onChange(sync);
  slabCtrl.onChange(sync);
  windowWidthCtrl.onChange(sync);
  balconyLeftCtrl.onChange(sync);
  balconyRightCtrl.onChange(sync);
  balconyWidthCtrl.onChange(sync);
  balconyWallCtrl.onChange(sync);
  balconyRailingCtrl.onChange(sync);
  balconyCoatingCtrl.onChange(sync);
  windowCoatingCtrl.onChange(sync);
}
