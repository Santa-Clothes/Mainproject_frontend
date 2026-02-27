# 📊 프로젝트 명세 보고서 (Project Specification Report)

**프로젝트명**: Wizard of Ounce (The AI Fashion Archive)
**작성 일자**: 2026년 2월 27일

본 보고서는 어떠한 추측이나 예측을 배제하고, 현재 프론트엔드 작업 폴더(`mainproject_frontend`)에 작성된 소스 코드 파일 시스템과 구현체만을 직관적으로 분석하여 작성한 프로젝트 현황 보고서입니다.

---

## 1. 🛠 기술 스택 (Tech Stack)
소스 코드에 포함된 설정과 패키지를 기반으로 확인된 프론트엔드 기술 환경입니다.

* **프레임워크**: Next.js (App Router 구조 적용)
* **언어**: TypeScript
* **스타일링**: Tailwind CSS
* **상태 관리**: Jotai (전역 상태 및 로컬 스토리지 연동)
* **데이터 시각화**: Plotly.js (`react-plotly.js`), Recharts
* **애니메이션 & UI**: Framer Motion, `react-icons`

## 2. 📂 프로젝트 폴더 구조 및 역할
`src/` 디렉토리를 중심으로 구성된 폴더별 핵심 역할은 다음과 같습니다.

* **`src/app/`**: Next.js App Router 기반의 페이지 및 레이아웃을 담고 있습니다.
  * `(main)/`: 메인 레이아웃(헤더, 푸터 적용)을 공유하는 내부 서비스 페이지 그룹
  * `login/` & `signup/`: 다크/라이트 모드 배경 이펙트를 독자적으로 사용하는 인증 관련 클라이언트 컴포넌트 페이지
  * `api/`: 백엔드 통신을 위한 Fetch API 래퍼 함수들 (`memberapi`, `productapi`, `bookmarkapi`, `salesapi` 등)
* **`src/components/`**: 재사용 가능한 UI 컴포넌트들
* **`src/jotai/`**: Jotai를 이용한 전역 상태 선언부 (`loginjotai.ts`, `historyJotai.ts`, `modelJotai.ts` 등)
* **`src/types/`**: TypeScript 타입 및 인터페이스 명세서 (`AuthTypes.ts`, `ProductType.ts` 등)

## 3. 🎯 핵심 서비스 모듈 (구현 기능)
코드 베이스 내에 작성된 페이지 뷰와 API 연결 구조를 통해 확인되는 실제 서비스 모듈들입니다.

### 1) 통합 인증 모듈 (Auth & Member)
* **구현 위치**: `login`, `signup`, `(main)/AuthHandler.tsx`, `memberapi.ts`
* **기능 요약**: 
  * 일반 로그인 및 회원가입 폼 제공
  * OAuth2 기반의 소셜 로그인 (Google, Naver, Kakao) 통신 규격 구현
  * 클라이언트 측 토큰 생명주기(6시간) 및 인증 인터셉트 처리
  * 프로필 이미지 업로드(Multipart) 및 수정 기능

### 2) 이미지 분석 기반 추천 (Image Analyze Module)
* **구현 위치**: `(main)/uploadpage`, `UploadPanel.tsx`
* **기능 요약**: 
  * 사용자가 의류 이미지를 드래그 앤 드롭 형태로 업로드하는 스튜디오 환경 제공
  * 이미지를 백엔드로 전송하여 AI 분석을 거친 뒤 결과를 추천받는 플로우 구현

### 3) 보유 상품 기반 추천 (Inventory Module)
* **구현 위치**: `(main)/selectionpage`, `SelectionPanel.tsx`
* **기능 요약**: 
  * 데이터베이스에 존재하는 카테고리별 최고의 제품 중에서 특정 상품을 선택함
  * 해당 상품의 속성(스타일)을 기반으로 사용자에게 제품을 매칭해주는 기능 구현

### 4) 시각화 대시보드 (Analytics Module)
* **구현 위치**: `(main)/dashboard`, `ScatterPlot.tsx`, `dashboard/page.tsx`
* **기능 요약**: 
  * 지점(Store)별 매출 통계 현황 데이터를 요청 및 UI로 표시
  * AI가 분석한 잠재 공간 벡터(Latent Vectors) 데이터들을 HSL 컬러 코드로 분류하여 2차원(WebGL 지원 산점도) 인터랙티브 맵으로 투영하는 시각화 기능 제공

### 5) 사용자 편의 기능 및 인터페이스 세팅
* **구현 위치**: `Header.tsx`, `layout.tsx`, 글로벌 CSS
* **기능 요약**:
  * 라이트 모드(Sunlight)와 다크 모드(Moonlight/Stars)가 전환되는 글로벌 테마 토글
  * AI 분석 관련 히스토리 및 관심 상품 저장(북마크) 등을 관리하는 내비게이션 바
  * '768 차원 분석' 여부를 선택할 수 있는 모델 모드 스위치(`modelModeAtom`) 지원

---
*해당 문서는 작성 시점까지의 로컬 소스코드(c:\workspace\work_mainproject\mainproject_frontend)에 존재하는 컴포넌트, 경로, 변수명만을 기반으로 작성되었습니다.*
