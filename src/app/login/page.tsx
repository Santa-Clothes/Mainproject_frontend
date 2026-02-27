"use client";
import { FaArrowLeft, FaKey, FaMoon, FaSun } from 'react-icons/fa6';
import Link from 'next/link';
import LoginForm from './LoginForm';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [stars, setStars] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setStars([...Array(30)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
      opacity: 0.1 + Math.random() * 0.9
    })));

    const savedTheme = localStorage.getItem('atelier_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('atelier_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('atelier_theme', 'light');
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-500 p-6 md:p-10 overflow-hidden">

      {/* 배경 분위기 효과 (MainLayout과 동기화) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-20 -left-20 w-200 h-200 dark:opacity-0 blur-3xl opacity-50"
          style={{
            background: 'radial-gradient(circle at center, rgba(254, 240, 138, 0.5) 0%, rgba(254, 215, 170, 0.3) 40%, transparent 70%)'
          }}
        />
        <div
          className="absolute -top-10 -right-10 w-150 h-150 opacity-0 dark:opacity-100 blur-3xl"
          style={{
            background: 'radial-gradient(circle at center, rgba(191, 219, 254, 0.15) 0%, rgba(199, 210, 254, 0.08) 40%, transparent 70%)'
          }}
        />
        <div className="absolute inset-0 opacity-0 dark:opacity-100">
          {isMounted && stars.map((style, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={style}
            />
          ))}
        </div>
      </div>

      {/* 테마 토글 버튼 (Header 스타일과 통합) */}
      <div className="absolute top-10 right-10 z-50">
        <button
          onClick={toggleTheme}
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-violet-500/50 backdrop-blur-xl transition-all duration-300 group overflow-hidden shadow-xl"
          title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <FaSun
              size={16}
              className={`absolute transition-all duration-500 transform ${isDarkMode ? 'translate-y-10 rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100 text-amber-500'}`}
            />
            <FaMoon
              size={16}
              className={`absolute transition-all duration-500 transform ${isDarkMode ? 'translate-y-0 rotate-0 opacity-100 text-violet-400' : '-translate-y-10 -rotate-90 opacity-0'}`}
            />
          </div>
          <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors duration-300" />
        </button>
      </div>

      {/* 4. 뒤로 가기 네비게이션 */}
      <div className="absolute top-6 left-6 z-20 md:top-10 md:left-10">
        <Link
          href="/"
          className="group flex flex-col items-start gap-1 text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400 transition-all hover:text-violet-600 dark:text-neutral-500 dark:hover:text-white"
        >
          <span className="opacity-0 transition-all -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 whitespace-nowrap">
            이전으로 돌아가기
          </span>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-100 bg-white transition-all group-hover:border-violet-500/50 group-hover:bg-violet-500/5 dark:border-white/10 dark:bg-transparent">
            <FaArrowLeft className="text-neutral-400 transition-transform group-hover:-translate-x-1 group-hover:text-violet-600 dark:text-white/40 dark:group-hover:text-violet-400" size={14} />
          </div>
        </Link>
      </div>

      {/* 로그인 폼 영역 */}
      <div className="relative z-10 w-full max-w-lg rounded-[3.5rem] border-2 border-neutral-100 bg-white p-8 md:p-12 shadow-2xl backdrop-blur-3xl lg:p-20 my-20 space-y-16 dark:border-white/10 dark:bg-neutral-900/50 dark:shadow-none">
        <div className="space-y-6 text-center">
          <div className="mb-4 inline-flex rounded-3xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-600/10">
            <FaKey className="text-violet-600 dark:text-violet-500/50" size={18} />
          </div>
        </div>
        <LoginForm />
      </div>

      {/* 하단 카피라이트 */}
      <div className="absolute bottom-10 left-10 hidden opacity-40 lg:block dark:opacity-20">
        <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-violet-600 dark:text-violet-400">© 2026 WIZARD OF OUNCE</p>
      </div>
    </main>
  );
}
