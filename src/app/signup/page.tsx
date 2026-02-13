'use client';

import { FaArrowLeft, FaCompass, FaMoon, FaSun } from 'react-icons/fa6';
import Link from 'next/link';
import Image from 'next/image';
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
    <main className="relative flex min-h-screen w-full flex-col bg-[#EBEBEF] transition-colors duration-700 dark:bg-[#0D0C12] lg:flex-row lg:h-screen lg:overflow-hidden">

      {/* 테마 토글 버튼 */}
      <div className="absolute top-10 right-10 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          /* 버튼 배경도 너무 희지 않게 조정 */
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

      {/* 1. 좌측: 비주얼 아카이브 섹션 */}
      {/* border-r 색상을 투명도 있는 검정/흰색으로 처리하여 자연스럽게 경계 형성 */}
      <div className="relative hidden h-full w-1/2 overflow-hidden border-r border-black/5 dark:border-white/5 lg:block">

        {/* [핵심 변경] 이미지 톤 유지 전략 */}
        {/* 라이트 모드라고 해서 이미지를 밝게(opacity-80) 만들지 않고, 
            오히려 약간 어둡게(opacity-60) 눌러주어 우측의 밝은 폼과 '대비'를 줍니다. 
            이렇게 해야 이미지가 희뿌옇게 뜨지 않고 선명해 보입니다. */}
        <Image
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976&auto=format&fit=crop"
          alt="Registry Aesthetic"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          priority
          className="scale-105 object-cover transition-all duration-[20s] hover:scale-100 opacity-60 dark:opacity-50"
        />

        {/* 오버레이: 흰색 그라데이션 제거. 
            대신 '검은색' 그라데이션의 농도만 조절하여 깊이감을 유지합니다. */}
        <div className="absolute inset-0 bg-linear-to-r from-black/10 to-black/40 dark:from-violet-950/20 dark:to-neutral-950" />

        <div className="absolute bottom-24 left-24 right-24 space-y-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-4xl border border-white/20 bg-black/10 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <FaCompass className="text-white/80 dark:text-violet-400/50" size={24} />
          </div>
          <div className="space-y-6">
            {/* 왼쪽 텍스트는 이미지 위에 있으므로 항상 밝은색(White) 유지 */}
            <h2 className="flex flex-col font-serif text-7xl italic leading-[0.9] tracking-tighter text-white">
              <span>Initialize</span>
              <span className="ml-12 text-violet-300 dark:text-violet-400">Archive Access</span>
            </h2>
            <p className="max-w-sm text-[11px] font-bold uppercase leading-relaxed tracking-[0.4em] text-white/60 dark:text-neutral-500">
              Join the neural curation protocol. <br />
              Access the future of visual DNA indexing.
            </p>
          </div>
          <div className="flex items-center gap-4 pt-6">
            <div className="h-1.5 w-1.5 animate-ping rounded-full bg-violet-400 dark:bg-violet-500" />
            <span className="font-mono text-[8px] uppercase tracking-[0.6em] text-violet-300 dark:text-violet-800">Registry Node: Active</span>
          </div>
        </div>
      </div>

      {/* 2. 우측: 회원가입 폼 섹션 */}
      {/* 배경색: 상위 main 태그의 색상(#EBEBEF)을 그대로 따라가도록 투명하게 두거나, 명시적으로 같은 색 사용 */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 md:p-8 transition-colors duration-500 lg:p-24 min-h-screen lg:min-h-0">

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

        <div className="w-full max-w-md space-y-14 pt-32 pb-20 lg:py-0">
          <header className="space-y-6 border-b-2 border-neutral-200 pb-10 dark:border-white/10">
            {/* 텍스트 색상: 완전 검정(#000) 대신 #1A1A1A 정도의 부드러운 블랙 사용 */}
            <h1 className="translate-x-[0.25em] font-serif text-4xl italic uppercase tracking-[0.5em] text-neutral-800 dark:text-white">Registry</h1>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-violet-700 dark:text-violet-500">New Curator Application</span>
              <div className="h-px flex-1 bg-violet-300 dark:bg-violet-900/30" />
            </div>
          </header>

          <SignupForm />

        </div>
      </div>
    </main>
  );
}