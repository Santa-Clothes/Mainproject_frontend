import Header from '@/app/main/Header';
import Footer from './Footer';
import AuthHandler from './AuthHandler';
import { Suspense } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col relative overflow-hidden transition-colors duration-700 min-h-screen bg-background-light dark:bg-background-dark">
            <Suspense fallback={null}>
                <AuthHandler />
            </Suspense>
            {/* Background Ambient Layers */}
            <div className="relative w-full h-full overflow-hidden"> {/* 부모 요소 예시 */}

                {/* 1. 우측 상단 큰 보라색 빛 */}
                <div className="absolute -top-[10%] -right-[5%] w-[60%] h-[60%] bg-violet-200/20 dark:bg-violet-900/10 blur-[180px] rounded-full pointer-events-none z-0" />

                {/* 2. 좌측 하단 인디고 빛 */}
                <div className="absolute -bottom-[15%] -left-[10%] w-[70%] h-[70%] bg-indigo-100/30 dark:bg-indigo-900/10 blur-[200px] rounded-full pointer-events-none z-0" />

                {/* 3. 중앙 좌측 은은한 퍼플 빛 */}
                <div className="absolute top-[30%] left-[20%] w-[20%] h-[20%] bg-purple-100/10 dark:bg-purple-900/5 blur-[100px] rounded-full pointer-events-none z-0" />

            </div>

            {/* 상단 버튼으로 변경 */}
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto p-8 pt-32 relative">
                {children}
            </main>
            <Footer />
        </div>
    );
}