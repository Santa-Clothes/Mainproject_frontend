import { atomWithStorage } from 'jotai/utils';

export type ModelMode = '512' | '768';
export const modelModeAtom = atomWithStorage<ModelMode>('modelMode', '512');
