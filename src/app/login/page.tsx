"use client";
import { FaArrowLeft, FaKey, FaMoon, FaSun } from 'react-icons/fa6';
import Link from 'next/link';
import LoginForm from './LoginForm';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [isDarkMode, setIsDarkMode] = useState(true); // 기본 다크 고정이었으므로 true

  useEffect(() => {
    const savedTheme = localStorage.getItem('atelier_theme');
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
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
    /* bg-neutral-100/50: 너무 생하얀색이 아닌 차분한 미색 배경 적용 */
    <main className="relative flex min-h-screen w-full items-center justify-center bg-neutral-100/50 transition-colors duration-500 p-6 md:p-10 dark:bg-neutral-950 overflow-y-auto">

      {/* 1. 테마 토글 버튼: 위치를 살짝 아래로 내려 텍스트 가독성 확보 */}
      <div className="absolute top-10 right-10 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          className="relative w-24 h-10 bg-white/80 dark:bg-neutral-900/40 backdrop-blur-xl border border-neutral-200 dark:border-white/10 rounded-full shadow-lg cursor-pointer overflow-hidden transition-colors hover:border-violet-400 outline-none"
        >
          <div className={`absolute top-1 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white transition-transform duration-500 ease-in-out z-20 shadow-md ${isDarkMode ? 'translate-x-14.5' : 'translate-x-1'
            }`}>
            {isDarkMode ? <FaMoon size={10} /> : <FaSun size={10} />}
          </div>
          <div className="relative w-full h-full flex items-center justify-between px-3 z-10">
            <span className={`text-[8px] font-bold uppercase tracking-widest transition-all duration-500 ${isDarkMode ? 'opacity-100 text-violet-300' : 'opacity-0 translate-x-2'
              }`}>Night</span>
            <span className={`text-[8px] font-bold uppercase tracking-widest transition-all duration-500 ${!isDarkMode ? 'opacity-100 text-violet-600' : 'opacity-0 -translate-x-2'
              }`}>Day</span>
          </div>
        </button>
      </div>

      {/* 2. 배경 아트워크: 라이트 모드에서는 불투명도를 낮춰 눈 피로도 감소 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent opacity-50 dark:from-violet-900/20 dark:via-neutral-950 dark:to-neutral-950 dark:opacity-90" />
      <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-violet-600/5 blur-[150px] dark:bg-violet-600/10" />

      {/* 4. 뒤로 가기 네비게이션 */}
      <div className="absolute top-6 left-6 z-20 md:top-10 md:left-10">
        <Link
          href="/"
          className="group flex flex-col items-start gap-1 text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400 transition-all hover:text-violet-600 dark:text-neutral-500 dark:hover:text-white"
        >
          <span className="opacity-0 transition-all -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 whitespace-nowrap">
            Back to overview
          </span>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-100 bg-white transition-all group-hover:border-violet-500/50 group-hover:bg-violet-500/5 dark:border-white/10 dark:bg-transparent">
            <FaArrowLeft className="text-neutral-400 transition-transform group-hover:-translate-x-1 group-hover:text-violet-600 dark:text-white/40 dark:group-hover:text-violet-400" size={14} />
          </div>
        </Link>
      </div>

      {/* 5. 로그인 카드: 
          - bg-white: 라이트모드에서 명확한 흰색 배경 
          - border-neutral-200: 라이트모드에서 테두리 명확화
      */}
      <div className="relative z-10 w-full max-w-lg rounded-[3.5rem] border-2 border-neutral-100 bg-white p-8 md:p-12 shadow-2xl backdrop-blur-3xl lg:p-20 my-20 space-y-16 dark:border-white/10 dark:bg-neutral-900/50 dark:shadow-none">
        <div className="space-y-6 text-center">
          <div className="mb-4 inline-flex rounded-3xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-600/10">
            <FaKey className="text-violet-600 dark:text-violet-500/50" size={18} />
          </div>
        </div>
        <LoginForm />
      </div>

      {/* 6. 푸터 */}
      <div className="absolute bottom-10 left-10 hidden opacity-40 lg:block dark:opacity-20">
        <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-violet-600 dark:text-violet-400">© 2026 ATELIER NEURAL SYSTEMS</p>
      </div>
    </main>
  );
}
