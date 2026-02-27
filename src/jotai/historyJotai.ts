import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { BookmarkData, RecommendList512, RecommendResult768, SelectionRecommendResult } from '@/types/ProductType';

export interface HistoryItem {
    id: string;
    type: 'imageInput' | 'imageSelection';
    sourceImage: string;
    productName?: string;
    timestamp: number;
    results?: RecommendList512 | RecommendResult768 | SelectionRecommendResult;
}

// 1. 히스토리 전체 목록 저장용 (localStorage 용량 제한 회피를 위해 sessionStorage 사용 권장)
// QuotaExceededError 방지를 위한 안전한 스토리지 래퍼
const safeSessionStorage = typeof window !== 'undefined' ? {
    getItem: (key: string) => {
        try { return sessionStorage.getItem(key); } catch (e) { return null; }
    },
    setItem: (key: string, value: string) => {
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {
            console.warn("Storage quota exceeded. History won't be saved.");
            // 용량 초과 시 오래된 데이터 강제 삭제 후 최신 데이터만 저장 시도
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed.length > 1) {
                    // 가장 최신 항목 1개만 남기고 다시 저장 시도
                    sessionStorage.setItem(key, JSON.stringify([parsed[0]]));
                }
            } catch (retryErr) {
                console.error("Failed to recover storage quota:", retryErr);
            }
        }
    },
    removeItem: (key: string) => {
        try { sessionStorage.removeItem(key); } catch (e) { }
    }
} : {
    getItem: (key: string) => null,
    setItem: (key: string, value: string) => { },
    removeItem: (key: string) => { }
};

export const analysisHistoryAtom = atomWithStorage<HistoryItem[]>(
    'wizard_analysis_history',
    [],
    createJSONStorage(() => safeSessionStorage)
);

// 2. 현재 화면에 표시할 개별 히스토리 기록 (클릭 시 활성화 됨)
export const activeHistoryAtom = atom<HistoryItem | null>(null);

// 3. 사용자가 찜한 결과(북마크) 상태 저장 애텀 (메모리 관리, 백엔드 동기화 기반)
export const bookmarkAtom = atom<BookmarkData[]>([]);
