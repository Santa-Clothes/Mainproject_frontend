import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { RecommendData } from '@/types/ProductType';

export interface HistoryItem {
    id: string;
    type: 'imageInput' | 'imageSelection';
    sourceImage: string;
    productName?: string;
    timestamp: number;
    results: RecommendData[];
}

// 1. 히스토리 전체 목록 저장용 (로컬 스토리지에 자동 저장됨)
export const analysisHistoryAtom = atomWithStorage<HistoryItem[]>('wizard_analysis_history', []);

// 2. 현재 화면에 표시할 개별 히스토리 기록 (클릭 시 활성화 됨)
export const activeHistoryAtom = atom<HistoryItem | null>(null);
