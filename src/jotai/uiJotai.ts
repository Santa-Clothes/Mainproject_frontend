import { atom } from 'jotai';

/**
 * UI 상태 관리용 Jotai Atoms
 * - isFullScreenModalOpenAtom: 특정 컴포넌트(예: ScatterPlot)가 전체 화면 모달로 전환되었는지 여부를 관리합니다.
 *   이 값이 true일 때 FloatingHistory 등 주변 UI 요소들이 자동으로 숨겨집니다.
 */
export const isFullScreenModalOpenAtom = atom(false);
