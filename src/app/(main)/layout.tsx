import Header from './Header';
import Footer from './Footer';
import AuthHandler from './AuthHandler';
import { Suspense } from 'react';
import FloatingHistory from './components/FloatingHistory';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col relative overflow-hidden min-h-screen bg-background-light dark:bg-background-dark">
            <Suspense fallback={null}>
                <AuthHandler />
            </Suspense>
            {/* 배경 분위기 효과 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* 라이트 모드: 좌측 상단 햇빛 효과 */}
                <div
                    className="absolute -top-20 -left-20 w-200 h-200 dark:opacity-0 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(254, 240, 138, 0.5) 0%, rgba(254, 215, 170, 0.3) 40%, transparent 70%)'
                    }}
                />
                <div className="absolute top-10 left-10 w-100 h-100 bg-yellow-100/60 dark:opacity-0 rounded-full blur-[100px]" />

                {/* 다크 모드: 우측 상단 달빛 효과 */}
                <div
                    className="absolute -top-10 -right-10 w-150 h-150 opacity-0 dark:opacity-100 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(191, 219, 254, 0.15) 0%, rgba(199, 210, 254, 0.08) 40%, transparent 70%)'
                    }}
                />
                <div className="absolute top-20 right-20 w-50 h-50 bg-blue-100/30 opacity-0 dark:opacity-100 rounded-full blur-[80px]" />

                {/* 다크 모드: 반짝이는 별 효과 */}
                <div className="absolute inset-0 opacity-0 dark:opacity-100">
                    {/* eslint-disable react-hooks/purity */}
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 6}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                                opacity: 0.1 + Math.random() * 0.9
                            }}
                        />
                    ))}
                    {/* eslint-enable react-hooks/purity */}
                </div>
            </div>

            {/* 상단 버튼으로 변경 */}
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto p-8 pt-32 relative">
                {children}
            </main>
            <Footer />
            <FloatingHistory />
        </div>
    );
}