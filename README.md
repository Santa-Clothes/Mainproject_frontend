# Neural Interface - Analytic Dashboard Frontend

A modern, high-performance web application built with **Next.js 16 (App Router)** for visualizing fashion trend data, managing inventory, and handling AI-powered style analysis. This project features a premium UI design with glassmorphism effects, dynamic interactive charts, and a sophisticated AI discovery system.

## 🛠 Tech Stack

- **Framework**: [Next.js 16.1.6](https://nextjs.org/) (App Router & Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Jotai](https://jotai.org/) (Atomic state management)
- **Visualizations**: 
  - [Plotly.js](https://plotly.com/javascript/react-plotly.js/) (t-SNE Neural Map) via dynamic import
  - [Recharts](https://recharts.org/) (Style DNA Analysis & Market Trends)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (FontAwesome 6, Simple Icons)

## 🚀 Key Features

### 1. AI Style Discovery (Studio)
An integrated system for analyzing fashion styles and discovering similar products.
- **Dual Modes**: 
  - **Upload Mode (`/main/uploadpage`)**: Direct image upload with drag-and-drop support and real-time preview.
  - **Discovery Mode (`/main/selectionpage`)**: Search by selecting products from the internal curated catalog.
- **Deep Style Analysis**:
  - **Style DNA Matrix**: Visualizes the style distribution (Casual, Contemporary, etc.) using interactive bar charts via Recharts.
  - **Market Trend Comparison**: Real-time integration with Naver shopping trends to compare current style popularity.
- **UX Excellence**:
  - **Direct Re-analysis**: Upload or drag a new image directly onto the results page image slot for instant re-comparison.
  - **Safe UI**: Loading overlays with "Cancel" capability and a 30-second watchdog timeout to prevent hanging requests.
  - **Analysis History**: Keeps track of recent analysis results using global atomic state (Jotai).

### 2. Analytics Dashboard (`/main/dashboard`)
- **Real-time Metrics**: Displays internal inventory and Naver shopping product counts using async polling with retry logic.
- **Trend Analysis**: Visualizes shopping trends with custom style distribution cards.
- **Interactive t-SNE Map**: A 2D projection of high-dimensional style vectors using `react-plotly.js`. Supports zoom, pan, and interactive tooltips.
- **Sales Ranking**: Best-selling items tracking with sorting capabilities.

### 3. Member Management & Profiles
- **Profile Customization**: Update nickname, password (local auth), and profile image with real-time preview.
- **OAuth2 Integration**: Seamless identity management for social login users (Google, Naver, Kakao).
- **Bookmarks**: Save and manage discovered products for future reference.

## 📂 Project Structure

```bash
src/
├── app/
│   ├── api/             # API Service Layer (fetch wrappers for backend)
│   ├── (main)/          # Main dashboard area (grouped)
│   │   ├── dashboard/   # Analytics overview
│   │   ├── uploadpage/  # AI Upload interface
│   │   ├── selectionpage/ # AI Selection interface
│   │   ├── bookmark/    # Bookmarked items
│   │   └── components/  # Page-specific items (Studio, AnalysisSection, Panels)
│   ├── login/           # Auth entrance
│   └── layout.tsx       # Root Layout (Theme & Global Styles)
├── components/          # Shared Reusable UI Components
├── jotai/               # Global State Atoms (Auth, History, Analysis)
└── types/               # TypeScript Interfaces (API Responses, ProductData)
```

## 🏗 Architecture & Build Strategy

- **Static Shell + Client Hydration**: Pre-rendered layout for speed, with dynamic JS hydration for interactive charts and private data.
- **Dynamic Imports**: Plotly and other heavy visualization libraries are loaded on-demand to maintain core performance and avoid SSR errors.
- **Responsive & Atmospheric**: Support for Dark/Light modes with dynamic lighting effects (Sunlight/Stars) across all main pages.

## 📦 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access the app at [http://localhost:3000](http://localhost:3000).

3. **Build for Production**
   ```bash
   npm run build
   ```

## 📝 License

This project is proprietary software. All rights reserved.
