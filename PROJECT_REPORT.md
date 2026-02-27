# 📊 AI 패션 분석 대시보드 기술 명세 보고서 (Project Technical Report)

**프로젝트명**: Wizard of Ounce (The AI Fashion Archive)
**마지막 업데이트**: 2026년 2월 27일

본 보고서는 `mainproject_frontend` 코드베이스의 실제 구현체와 기술적 의결 사항을 기록한 공식 명세입니다. 일반적인 패러다임을 넘어, 복잡한 비동기 처리와 브라우저 제약 조건을 극복하기 위해 설계된 독자적인 해결 방식들을 중점적으로 설명합니다.

---

## 1. 🏗 시스템 아키텍처 및 데이터 흐름

### 1-1. 비동기 인퍼런스 파이프라인
사용자가 이미지를 업로드하거나 상품을 선택하면 다음의 정밀한 단계를 거칩니다.
1. **Normalization**: `canvas API`를 사용하여 업로드된 이미지를 300px로 리사이징하여 통신 트래픽 최적화 (`UploadPanel.tsx`)
2. **Context Switching**: `modelModeAtom`에 따라 `GCN (512d)` 또는 `CLIP (768d)` 전용 API 엔드포인트로 분기
3. **Execution ID Tracking**: 각 요청에 고유 ID를 부여하여 사용자가 로딩 중 취소 시 뒷단에서 들어오는 비정상 응답이 화면을 덮어쓰지 않도록 차단 (`analysisIdRef` 패턴)

### 1-2. 데이터 타입 일관성 (SelectionRecommendResult)
일반 이미지 분석과 특정 상품 기반 분석의 응답 구조 차이를 해결하기 위해 `SelectionRecommendResult` 인터페이스를 별도로 구축했습니다. 이를 통해 `Studio.tsx`는 수신된 데이터의 형태를 식별하여 상이한 레이더 차트 필드(`styles` vs `targetTop1Style`)를 동적으로 매핑합니다.

---

## 2. 🛡 기술적 도전 과제 및 해결 (Engineering Challenges)

### 2-1. 브라우저 스토리지 쿼터 초과 문제 (`QuotaExceededError`)解決
*   **문제**: 분석 결과(Base64 이미지 + 수백 개의 추천 상품 JSON)가 5MB를 초과하여 `sessionStorage` 저장 시 앱이 크래시되는 현상 발생.
*   **해결**: `jotai/utils`의 `createJSONStorage`를 커스터마이징한 **`safeSessionStorage`** 래퍼 구현. 
*   **작동 원리**: `setItem` 시 `try-catch`로 에러를 가로채고, 용량 초과 감지 시 리스트의 가장 오래된 항목들부터 삭제하여 **가장 최신 결과 1개는 반드시 보존**하는 자가 정제 로직 적용.

### 2-2. 스타일 네이밍 컨텍스트 동기화
*   **문제**: 백엔드 API에서 제공하는 `CAS`, `MAN`, `NAT` 등의 약값과 UI에서 보여야 할 `캐주얼`, `매니시`, `내추럴` 간의 한/영/약어 3단계 동기화 필요.
*   **해결**: `STYLE_KO_DICT`와 `RADAR_LABEL_DICT`를 통한 중앙 집중형 매퍼 구축. 특히 `AnalysisSection.tsx` 등의 시각화 컴포넌트에서 순환 참조(Circular Dependency)로 인한 HMR 크래시를 방지하기 위해 정적 매핑 로직을 컴포넌트 내부에 로컬화하여 엔진 안정성 확보.

### 2-3. 상태 관리 및 렌더링 최적화
*   **Hydration Mismatch**: 라이트/다크 모드의 동적 그래픽(태양/별 효과)이 SSR과 CSR 간의 차이로 에러를 유발하는 것을 `isMounted` 훅 패턴으로 해결.
*   **Canvas Performance**: 잦은 `getImageData` 호출로 인한 브라우저 성능 경고를 `willReadFrequently: true` 옵션 적용으로 해소.
*   **Atomic History**: Jotai를 사용하여 `History`와 `ActiveHistory`를 분리, 히스토리 클릭 시 즉각적인 뷰 복구(Zero-delay UI) 달성.

---

## 3. 🎨 UI/UX 디자인 시스템 명세

### 3-1. 다이내믹 테마 시각화
*   **Light Mode (Sunlight)**: 따뜻한 태양광 이펙트와 화이트 글래스모피즘(Glassmorphism) 적용.
*   **Dark Mode (Celestial)**: `Framer Motion`으로 제어되는 반짝이는 동적 별(Twinkling Stars) 이펙트와 바이올렛 포인트 컬러 중심의 딥 다크 테마.

### 3-2. 고도화된 시각화 차트
*   **Scatter Plot (UMAP)**: 스타일 벡터 공간을 Plotly.js를 이용해 2D 맵으로 시각화. 각 점 호버 시 스타일 정보를 상단에 강조 표시하고 중복 차트를 방지하기 위해 `hovertemplate` 정규화.
*   **Radar Chart**: AI가 판단한 Top 3 스타일 점수를 5각형 레이더 차트로 시각화하여 스타일의 강점과 약점을 한눈에 파악.

---

## 4. 📂 주요 폴더 구조 및 역할 (Detailed)

- `src/app/api`: 서버 액션이 아닌 정밀 제어가 가능한 Fetch API 서비스 레이어.
- `src/app/(main)/components`: 상호작용의 핵심인 `Studio` 컨테이너와 하위 패널들.
- `src/jotai`: 비즈니스 로직과 화면 상태를 연결하는 브릿지.
- `src/types/ProductType.ts`: 복잡한 추천 결과 물리학을 담은 단일 타입 정의서.

---
*본 보고서는 2026년 2월 27일 기준 프로젝트 코드베이스의 실제 구현 상태를 바탕으로 작성되었습니다.*
