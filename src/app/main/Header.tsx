'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FaHouse,
  FaMicrochip,
  FaArrowRightFromBracket,
  FaChevronDown,
  FaGear,
  FaArrowRight,
  FaChartLine,
  FaSun,
  FaMoon,
  FaUser
} from 'react-icons/fa6';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { authUserAtom } from '@/jotai/loginjotai';
import { logoutAPI } from '../api/memberService/memberapi';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [authInfo, setAuthInfo] = useAtom(authUserAtom);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  /**
   * 다크모드 설정 로직
   * 로컬 스토리지 또는 브라우저 설정을 확인하여 초기 테마를 결정합니다.
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('atelier_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 스크롤 및 외부 클릭 감지
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * 테마 토글 핸들러
   * 라이트 모드와 다크 모드를 전환하고 설정을 로컬 스토리지에 저장합니다.
   */
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

  /**
   * 로그아웃 핸들러
   * 서버 세션을 종료하고 클라이언트 측 인증 정보(Jotai/LocalStorage)를 초기화합니다.
   */
  const handleLogout = async () => {
    if (!authInfo) return;
    try {
      await logoutAPI(authInfo);
      setAuthInfo(null); // Jotai atomWithStorage에 의해 localStorage에서도 자동 제거됨
      setIsProfileOpen(false);
      alert("로그아웃 되었습니다.");
      router.push("/main");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const navItems = [
    { id: 'home', label: 'Overview', icon: <FaHouse size={12} />, path: '/main' },
    { id: 'studio', label: 'Studio', icon: <FaMicrochip size={12} />, path: '/main/studio' },
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine size={12} />, path: '/main/dashboard' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left: Brand & Nav Links */}
        <div className="flex items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-1.5 rounded-full border border-neutral-200 dark:border-white/5 shadow-xl">
          <Link href="/" className="flex flex-col items-center px-6 py-1 hover:opacity-70 transition-opacity">
            <h1 className="text-lg font-serif italic tracking-[0.3em] uppercase text-neutral-900 dark:text-white leading-none">ATELIER</h1>
            <span className="text-[7px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-[0.4em] mt-1.5">Neural Archive</span>
          </Link>

          <div className="w-px h-6 bg-gray-200 dark:bg-white/5 mx-2" />

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all ${pathname === item.path
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-white'
                  }`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            /* w-24로 너비를 고정하여 크기 변화를 방지합니다. */
            className="relative w-24 h-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-white/5 
                          rounded-full shadow-lg cursor-pointer overflow-hidden transition-colors duration-500 hover:border-violet-400 outline-none"
          >
            {/* 슬라이딩되는 아이콘 원형 뭉치 */}
            <div className={`absolute top-1 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white transition-transform duration-500 ease-in-out z-20 
                    ${isDarkMode ? 'translate-x-[58px]' : 'translate-x-1'}`}
            >
              {isDarkMode ? <FaMoon size={10} /> : <FaSun size={10} />}
            </div>

            {/* 버튼 내부 텍스트 레이어 */}
            <div className="relative w-full h-full flex items-center justify-between px-3 z-10">
              {/* Night 텍스트 (다크모드일 때 왼쪽에 나타남) */}
              <span className={`text-[8px] font-bold uppercase tracking-widest transition-all duration-500 
                  ${isDarkMode ? 'opacity-100 translate-x-0 text-gray-400' : 'opacity-0 translate-x-2'}`}
              >
                Night
              </span>

              {/* Day 텍스트 (라이트모드일 때 오른쪽에 나타남) */}
              <span className={`text-[8px] font-bold uppercase tracking-widest transition-all duration-500 
                    ${!isDarkMode ? 'opacity-100 translate-x-0 text-gray-500' : 'opacity-0 -translate-x-2'}`}
              >
                Day
              </span>
            </div>
          </button>

          {!authInfo ? (
            <div className="flex items-center gap-1 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-1.5 rounded-full border border-neutral-200 dark:border-white/5 shadow-lg">
              <Link href="/login" className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-violet-600 transition-colors">
                Log In
              </Link>
              <Link href="/signup" className="px-6 py-2.5 bg-violet-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-violet-700 transition-all flex items-center gap-2 shadow-md active:scale-95">
                Join <FaArrowRight size={8} />
              </Link>
            </div>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border transition-all shadow-lg active:scale-95 ${isProfileOpen
                  ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700'
                  : 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200 dark:border-white/5'
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-violet-600 overflow-hidden flex items-center justify-center border border-white/20">
                  {authInfo.profile ? (
                    <img src={authInfo.profile} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser size={12} className="text-white" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-900 dark:text-white leading-none">
                    {authInfo.name}
                  </span>
                  <span className="text-[6px] font-bold text-violet-500 uppercase tracking-widest mt-1">Authorized</span>
                </div>
                <FaChevronDown size={8} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden py-2 z-50">
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-white/5 mb-1">
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Access Key</p>
                    <p className="text-[10px] font-bold text-neutral-900 dark:text-white truncate mt-1">{authInfo.name}</p>
                  </div>
                  <Link
                    href="/main/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-violet-600 transition-colors"
                  >
                    <FaGear size={10} /> Configuration
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <FaArrowRightFromBracket size={10} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}