import { atomWithStorage } from 'jotai/utils';

export type ModelMode = 'normal' | '768';
export const modelModeAtom = atomWithStorage<ModelMode>('modelMode', 'normal');
