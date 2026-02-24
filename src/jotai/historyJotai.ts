import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { RecommendData, RecommendList } from '@/types/ProductType';

export interface HistoryItem {
    id: string;
    type: 'imageInput' | 'imageSelection';
    sourceImage: string;
    productName?: string;
    timestamp: number;
    results?: RecommendList;
}

// 1. 히스토리 전체 목록 저장용 (로컬 스토리지에 자동 저장됨)
export const analysisHistoryAtom = atomWithStorage<HistoryItem[]>('wizard_analysis_history', []);

// 2. 현재 화면에 표시할 개별 히스토리 기록 (클릭 시 활성화 됨)
export const activeHistoryAtom = atom<HistoryItem | null>(null);

// 3. 사용자가 찜한 결과(장바구니) 상태 저장 로컬 스토리지 애텀
export const cartAtom = atomWithStorage<RecommendData[]>('wizard_cart', []);
