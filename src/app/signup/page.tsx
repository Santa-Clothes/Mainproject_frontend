'use client';

import { FaArrowLeft, FaCompass, FaMoon, FaSun } from 'react-icons/fa6';
import Link from 'next/link';
import SignupForm from './SignupForm';
import { useEffect, useState } from 'react';

export default function SignupPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('atelier_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
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
    /* [전체 배경 톤 조정]
      라이트모드: bg-[#EBEBEF] -> 너무 희지 않은, 차분하고 묵직한 라이트 그레이 (콘크리트 톤)
      다크모드: bg-[#0D0C12] -> 깊은 블랙
    */
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#EBEBEF] transition-colors duration-700 dark:bg-[#0D0C12] p-6">

      {/* 테마 토글 버튼 */}
      <div className="absolute top-10 right-10 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          className="relative w-24 h-10 bg-neutral-200/50 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-lg cursor-pointer overflow-hidden transition-colors hover:border-violet-400 outline-none"
        >
          <div className={`absolute top-1 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white transition-transform duration-500 ease-in-out z-20 shadow-md ${isDarkMode ? 'translate-x-14.5' : 'translate-x-1'
            }`}>
            {isDarkMode ? <FaMoon size={10} /> : <FaSun size={10} />}
          </div>
          <div className="relative w-full h-full flex items-center justify-between px-3 z-10">
            <span className={`text-[8px] font-bold uppercase tracking-widest transition-all duration-500 ${isDarkMode ? 'opacity-100 text-violet-300' : 'opacity-0 translate-x-2'
              }`}>Night</span>
            <span className={`text-[8px] font-bold uppercase tracking-widest transition-all duration-500 ${!isDarkMode ? 'opacity-100 text-violet-700' : 'opacity-0 -translate-x-2'
              }`}>Day</span>
          </div>
        </button>
      </div>

      {/* 뒤로 가기 네비게이션 */}
      <div className="absolute top-6 left-6 z-20 md:top-10 md:left-10">
        <Link
          href="/main"
          className="group flex flex-col items-start gap-1 text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-500 transition-all hover:text-violet-600 dark:text-neutral-500 dark:hover:text-white"
        >
          <span className="opacity-0 transition-all -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 whitespace-nowrap">
            Cancel Registry
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-200 transition-all group-hover:border-violet-500/50 dark:border-white/10">
            <FaArrowLeft className="text-neutral-500 transition-transform group-hover:-translate-x-1 group-hover:text-violet-600 dark:text-white/30 dark:group-hover:text-violet-400" size={14} />
          </div>
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-10 pt-20 pb-10">
        <header className="space-y-6 text-center">
          <h1 className="font-serif text-5xl italic uppercase tracking-[0.5em] text-neutral-800 dark:text-white">Registry</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-violet-300 dark:bg-violet-900/30" />
            <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-violet-700 dark:text-violet-500">New Curator Application</span>
            <div className="h-px w-12 bg-violet-300 dark:bg-violet-900/30" />
          </div>
        </header>

        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/20 dark:border-white/5 shadow-2xl transition-all h-fit">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}