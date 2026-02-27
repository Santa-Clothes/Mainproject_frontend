# 🎩 Wizard of Ounce: AI Fashion Archive & Analytics

**Next.js 16 (App Router)**와 **Tailwind CSS 4**를 기반으로 구축된 고성능 AI 패션 트렌드 분석 및 스타일 큐레이션 플랫폼입니다. 고도화된 머신러닝 인퍼런스를 통해 사용자 이미지를 분석하고, 글로벌 패션 트렌드 데이터와 실시간으로 매칭하여 최적화된 인사이트를 제공합니다.

---

## 🛠 Tech Stack (Core Architecture)

- **Frontend Framework**: `Next.js 16+` (App Router, Turbopack)
- **Programming Language**: `TypeScript` (Strictly typed interfaces)
- **Styling Engine**: `Tailwind CSS 4` (Next-gen utility-first styling)
- **State Orchestration**: `Jotai` (Atomic state management with Persistence)
- **Data Visualization**: 
  - **Plotly.js**: High-dimensional `Style Vector Spaces` projection (UMAP/t-SNE)
  - **Recharts**: Style distribution analytics & performance metrics
- **Visual Continuity**: `Framer Motion` (Advanced layout transitions & micro-animations)
- **Design System**: Custom Glassmorphism UI with Dynamic Theming (Sunlight-Solar / Dark-Celestial)

---

## 🚀 Key Engineering Features

### 1. Dual-Core AI Analysis Studio
사용자의 니즈에 따라 두 가지 방식의 지능형 분석 엔진을 제공합니다.
- **Image Input Engine (Upload)**: 사용자의 실제 이미지를 직접 분석하여 스타일 가공 및 추천 (최대 10MB 고정밀 업로드 지원)
- **Catalog Selection Engine (Curation)**: 마스터 데이터베이스 내 검증된 카테고리별 베스트 상품을 선택하여 스타일 전이 및 매칭
- **Multi-Model Support**: 
  - **GCN (Gated Convolutional Network)**: 512차원 기반의 빠르고 정확한 계층적 스타일 분석
  - **CLIP (Contrastive Language-Image Pre-training)**: 768차원 고해상성 인코딩을 통한 텍스트-이미지 교차 정밀 분석

### 2. Universal Style Harmonizer (Intelligent Translation)
API 응답의 정규화된 스타일 약어와 실제 UI의 사용자 경험 간의 간극을 메우는 지능형 매핑 시스템입니다.
- **Shortkey System**: `CAS`(Casual), `CNT`(Contemporary), `ETH`(Ethnic) 등 API 최적화 약어 지원
- **Cross-Lingual Dictionary**: 영어-한글-약어 간 실시간 변환을 통해 대시보드 시각화와 북마크 데이터의 일관성 보장

### 3. Asynchronous Lifecycle Management (Reliability)
비동기 통신 중 발생할 수 있는 부작용(Side Effect)을 원천 차단하는 견고한 아키텍처를 구현했습니다.
- **Task-ID Tracker**: 분석 로직에 고유 식별자(Execution ID)를 부여하여, 사용자의 **취소 버튼 클릭 시 이미 진행 중인 API 응답을 자동으로 폐기**하여 화면 전환 오류를 방지합니다.
- **Timeout Watchdog**: GPU 서버 등의 인퍼런스 지연에 대비한 30초 데드라인 설정으로 브라우저 행(Hang) 현상을 예방합니다.

### 4. Smart Storage Quota Defense (Persistence)
브라우저의 엄격한 Storage Quota(5MB) 제한을 극복하기 위한 커스텀 저장소 정책을 적용했습니다.
- **Safe Storage Wrapper**: `QuotaExceededError` 발생 시 즉시 최신 기록 1개만 남기고 이전 데이터를 자동 정제(Purging)하여 앱의 영속성을 보장합니다.
- **Stale Closure Mitigation**: `useRef`를 활용한 비동기 클로저 캡처 방지 로직으로, 긴 연산 후에도 최신 분석 결과가 유실 없이 히스토리에 기록됩니다.

---

## 📂 System Architecture (Directory Structure)

```bash
src/
├── app/
│   ├── api/             # API Service Abstraction (member, product, image, sales)
│   ├── (main)/          # Shared-Layout Application Area
│   │   ├── dashboard/   # Multi-Dimensional Data Visualization (Plotly-map, Stats)
│   │   ├── uploadpage/  # Image-to-Style Analysis Core
│   │   ├── selectionpage/ # Database-driven Product Curation
│   │   └── memberinfo/  # Profile & Credential Management
│   └── components/      # UI Atoms & Molecules (Studio, AnalysisSection, ResultGrid)
├── jotai/               # Global Atoms (State, History, Model-Mode)
├── types/               # Single Source of Truth for TS Interfaces
└── assets/              # Static SVG Assets & Brand Icons
```

---

## 💻 Technical Overview (Development)

1. **Dependency Setup**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   `.env.local` 파일에 백엔드 API 엔드포인트 및 OAuth 클라이언트 정보를 설정하십시오.

3. **Runtime**:
   ```bash
   npm run dev
   ```

---
*© 2026 Wizard of Ounce. Advanced Generative Fashion Analytics.*
