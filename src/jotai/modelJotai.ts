import { atom } from 'jotai';

export type ModelMode = 'normal' | '768';
export const modelModeAtom = atom<ModelMode>('normal');
