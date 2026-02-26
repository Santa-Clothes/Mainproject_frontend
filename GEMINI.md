# Project Rules & Guidelines: mainproject_frontend

## 🛠 Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Jotai
- **Visualizations**: Plotly.js (2D/3D t-SNE & Latent Space), Recharts
- **Animations**: Framer Motion
- **Icons**: React Icons (react-icons)

## 📂 Directory Structure
- `src/app/`: App Router based pages and layout
- `src/components/`: Reusable UI components
- `src/jotai/`: Jotai Atoms definitions for global state management
- `src/types/`: TypeScript interface/type definitions (e.g., `ProductVectorInfo`, `ProductData`)
- `src/app/api/`: API service layer for backend communication (e.g., `productService`, `memberService`, `imageService`, `salesapi`)

## 💻 Coding Standards
- **Naming Conventions**: 
  - Components: PascalCase (e.g., `TSNEPlotCard.tsx`, `DashboardCard.tsx`)
  - Functions/Variables: camelCase (e.g., `fetchProductData`)
  - Types/Interfaces: PascalCase (e.g., `ProductData`)
- **Imports & Case Sensitivity**: Vercel (Linux distribution) is strictly case-sensitive. Always ensure identical case matching between the physical file name and the import path (e.g., carefully check `Imageapi.ts` vs `ImageApi.ts`) to prevent Vercel build failures.
- **State & Navigation**: Ensure internal state (e.g., Jotai) handles back button routing correctly to preserve continuous user experience between input/search pages and results pages.
- **Components**: 
  - Use Functional Components with hooks
  - Leverage Framer Motion for smooth transitions and interactions
- **State Management**: Use Jotai for global state and `useState` for component-level state

## 🎨 UI/UX Design System
- **Theme**: Support for both Dark and Light modes with atmospheric lighting effects (sunlight effects in light mode, dynamic twinkling stars in dark mode).
- **Visual Excellence**: Use premium aesthetics (gradients, glassmorphism, micro-animations)
- **Responsiveness**: Ensure layouts are responsive and visually balanced across different screen sizes
- **Visualization**: Use `recharts` and `plotly.js` for data visualization. Assign diverse and aesthetically pleasing colors for distinct data clusters (e.g., visual layout maps for CSV vector datasets).

## ⚠️ Special Instructions
- Always define API response types in `src/types` before implementation.
- Maintain consistency with the existing dashboard layout in `Dashboard.tsx`.
- Follow the established pattern for API services in `src/app/api/`.
- Local Dummy Data (e.g., `.csv`, `.pkl`, `.npy` files for t-SNE and machine learning model vectors) is utilized locally for component functionality testing and development validation.
- **File/Folder Modification Protocol (Windows)**: Due to Windows file locking issues with VS Code and dev servers (`npm run dev`), the AI agent should **NOT** use terminal commands to delete, rename, or move files and folders. Instead, clearly instruct the USER to perform these structural changes manually via the VS Code GUI, and ask the USER to notify the agent once completed so the agent can update the code accordingly.
- **App Router Navigation**: Use `useRouter` and `useSearchParams` from `next/navigation` instead of native `window.history.pushState` to ensure React state and browser history remain in sync (especially when handling browser 'Back/Forward' events).
- **Hydration Mismatches**: When using random values (e.g., `Math.random()`) in Client Components for visual effects, always wrap the rendering with a boolean `isMounted` state controlled by `useEffect` to prevent React hydration mismatch errors between SSR and CSR.
