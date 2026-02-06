'use client';

import type GUI from 'lil-gui';
import type { ParamValues } from '../../types';

type Params = ParamValues & {
  width: number;
  height: number;
  depth: number;
  elevation: number;
  segments: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  wireframe: boolean;
  showShadow: boolean;
  color: string;
  roughness: number;
  metalness: number;
};

export function buildModelCubeGui(
  gui: GUI,
  params: ParamValues,
  onChange: (next: ParamValues) => void
) {
  const state = params as Params;

  const dimensions = gui.addFolder('Dimensions');
  const widthCtrl = dimensions.add(state, 'width', 2, 60, 0.5).name('Width');
  const heightCtrl = dimensions.add(state, 'height', 2, 60, 0.5).name('Height');
  const depthCtrl = dimensions.add(state, 'depth', 2, 60, 0.5).name('Depth');
  const elevationCtrl = dimensions.add(state, 'elevation', -10, 20, 0.25).name('Lift');
  const segmentsCtrl = dimensions.add(state, 'segments', 1, 12, 1).name('Segments');
  dimensions.open();

  const transform = gui.addFolder('Transform');
  const rotationXCtrl = transform.add(state, 'rotationX', -Math.PI, Math.PI, 0.01).name('Rotation X');
  const rotationYCtrl = transform.add(state, 'rotationY', -Math.PI, Math.PI, 0.01).name('Rotation Y');
  const rotationZCtrl = transform.add(state, 'rotationZ', -Math.PI, Math.PI, 0.01).name('Rotation Z');
  transform.open();

  const style = gui.addFolder('Style');
  const colorCtrl = style.addColor(state, 'color').name('Color');
  const wireframeCtrl = style.add(state, 'wireframe').name('Wireframe');
  const shadowCtrl = style.add(state, 'showShadow').name('Shadow');
  const roughnessCtrl = style.add(state, 'roughness', 0, 1, 0.01).name('Roughness');
  const metalnessCtrl = style.add(state, 'metalness', 0, 1, 0.01).name('Metalness');
  style.open();

  const sync = () => onChange({ ...state });
  widthCtrl.onChange(sync);
  heightCtrl.onChange(sync);
  depthCtrl.onChange(sync);
  elevationCtrl.onChange(sync);
  segmentsCtrl.onChange(sync);
  rotationXCtrl.onChange(sync);
  rotationYCtrl.onChange(sync);
  rotationZCtrl.onChange(sync);
  colorCtrl.onChange(sync);
  wireframeCtrl.onChange(sync);
  shadowCtrl.onChange(sync);
  roughnessCtrl.onChange(sync);
  metalnessCtrl.onChange(sync);
}
