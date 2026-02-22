# Project Rules & Guidelines: mainproject_frontend

## 🛠 Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Jotai
- **Visualizations**: Plotly.js, Recharts
- **Animations**: Framer Motion
- **Icons**: React Icons (react-icons)

## 📂 Directory Structure
- `src/app/`: App Router based pages and layout
- `src/components/`: Reusable UI components
- `src/jotai/`: Jotai Atoms definitions
- `src/types/`: TypeScript interface/type definitions
- `src/app/api/`: API service layer for backend communication (e.g., `productService`, `memberService`, `imageService`)

## 💻 Coding Standards
- **Naming Conventions**: 
  - Components: PascalCase (e.g., `DashboardCard.tsx`)
  - Functions/Variables: camelCase (e.g., `fetchProductData`)
  - Types/Interfaces: PascalCase (e.g., `ProductData`)
- **Components**: 
  - Use Functional Components with hooks
  - Leverage Framer Motion for smooth transitions and interactions
- **State Management**: Use Jotai for global state and `useState` for component-level state

## 🎨 UI/UX Design System
- **Theme**: Support for both Dark and Light modes with atmospheric lighting effects
- **Visual Excellence**: Use premium aesthetics (gradients, glassmorphism, micro-animations)
- **Responsiveness**: Ensure layouts are responsive and visually balanced across different screen sizes
- **Visualization**: Use `recharts` and `plotly.js` for data visualization, ensuring they follow the overall theme

## ⚠️ Special Instructions
- Always define API response types in `src/types` before implementation.
- Maintain consistency with the existing dashboard layout in `Dashboard.tsx`.
- Follow the established pattern for API services in `src/app/api/`.
- **File/Folder Modification Protocol (Windows)**: Due to Windows file locking issues with VS Code and dev servers (`npm run dev`), the AI agent should **NOT** use terminal commands to delete, rename, or move files and folders. Instead, clearly instruct the USER to perform these structural changes manually via the VS Code GUI, and ask the USER to notify the agent once completed so the agent can update the code accordingly.
