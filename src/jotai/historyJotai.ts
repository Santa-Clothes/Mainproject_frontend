import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { BookmarkData, RecommendList } from '@/types/ProductType';

export interface HistoryItem {
    id: string;
    type: 'imageInput' | 'imageSelection';
    sourceImage: string;
    productName?: string;
    timestamp: number;
    results?: RecommendList;
}

// 1. 히스토리 전체 목록 저장용 (localStorage 용량 제한 회피를 위해 sessionStorage 사용 권장)
export const analysisHistoryAtom = atomWithStorage<HistoryItem[]>(
    'wizard_analysis_history',
    [],
    createJSONStorage(() => sessionStorage)
);

// 2. 현재 화면에 표시할 개별 히스토리 기록 (클릭 시 활성화 됨)
export const activeHistoryAtom = atom<HistoryItem | null>(null);

// 3. 사용자가 찜한 결과(북마크) 상태 저장 애텀 (메모리 관리, 백엔드 동기화 기반)
export const bookmarkAtom = atom<BookmarkData[]>([]);
