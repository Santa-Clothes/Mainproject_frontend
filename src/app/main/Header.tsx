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

/**
 * Header Component
 * 어플리케이션의 최상단 네비게이션 바입니다.
 * 테마 전환(Dark/Light), 인증 상태 관리, 페이지 이동 기능을 포함합니다.
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [authInfo, setAuthInfo] = useAtom(authUserAtom); // 전역 인증 상태 (Jotai)

  // [상태 관리]
  const [isProfileOpen, setIsProfileOpen] = useState(false); // 프로필 드롭다운 열림 여부
  const [isScrolled, setIsScrolled] = useState(false); // 스크롤 발생 여부 (UI 변화 트리거)
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크 모드 활성화 여부
  const profileRef = useRef<HTMLDivElement>(null);

  // 초기 테마 설정 확인
  useEffect(() => {
    const savedTheme = localStorage.getItem('atelier_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 전역 클릭 및 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (event: MouseEvent) => {
      // 프로필 영역 외부 클릭 시 드롭다운 닫기
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
   * 테마 전환 핸들러
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
   * 로그아웃 처리 핸들러
   */
  const handleLogout = async () => {
    if (!authInfo) return;
    try {
      await logoutAPI(authInfo);
      setAuthInfo(null); // 로컬 스토리지 정보도 자동 초기화됨
      setIsProfileOpen(false);
      alert("로그아웃 되었습니다.");
      router.push("/main");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 네비게이션 아이템 정의
  const navItems = [
    { id: 'home', label: 'Overview', icon: <FaHouse size={12} />, path: '/main' },
    { id: 'studio', label: 'Studio', icon: <FaMicrochip size={12} />, path: '/main/studio' },
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine size={12} />, path: '/main/dashboard' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 transition-all duration-300 ${isScrolled ? '-translate-y-1' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* 1. 좌측: 브랜드 로고 및 메인 네비게이션 */}
        <div className="flex items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-1.5 rounded-full border border-neutral-200 dark:border-white/5 shadow-xl">
          <Link href="/" className="flex flex-col items-center px-6 py-1 hover:opacity-70 transition-opacity">
            <h1 className="text-xl font-sans font-black tracking-[0.4em] uppercase text-neutral-900 dark:text-white leading-none">ATELIER</h1>
            <span className="text-[7px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-[0.3em] mt-2">Neural Archive</span>
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

        {/* 2. 우측: 테마 토글 및 유저 프로필(인증) */}
        <div className="flex items-center gap-4">
          {/* 테마 스위치: CSS 전용 로직을 포함하여 초기 렌더링 깜빡임 최소화 */}
          <button
            onClick={toggleTheme}
            type="button"
            suppressHydrationWarning
            className="relative w-24 h-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-white/5 
                          rounded-full shadow-lg cursor-pointer overflow-hidden hover:border-violet-400 outline-none"
          >
            <div className="absolute top-1 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white transition-transform duration-500 ease-in-out z-20 
                    translate-x-1 dark:translate-x-14.5"
            >
              <FaSun size={10} className="dark:hidden" />
              <FaMoon size={10} className="hidden dark:block" />
            </div>

            <div className="relative w-full h-full flex items-center justify-between px-3 z-10">
              <span className="text-[8px] font-bold uppercase tracking-widest transition-all duration-500 opacity-0 translate-x-2 dark:opacity-100 dark:translate-x-0 text-gray-400">
                Night
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest transition-all duration-500 opacity-100 translate-x-0 dark:opacity-0 dark:-translate-x-2 text-gray-500">
                Day
              </span>
            </div>
          </button>

          {!authInfo ? (
            /* 비로그인 상태: 로그인/회원가입 링크 */
            <div className="flex items-center gap-1 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-1.5 rounded-full border border-neutral-200 dark:border-white/5 shadow-lg">
              <Link href="/login" className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-violet-600 transition-colors">
                Log In
              </Link>
              <Link href="/signup" className="px-6 py-2.5 bg-violet-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-violet-700 transition-all flex items-center gap-2 shadow-md active:scale-95">
                Join <FaArrowRight size={8} />
              </Link>
            </div>
          ) : (
            /* 로그인 상태: 유저 프로필 드롭다운 */
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

              {/* 유저 메뉴 드롭다운 */}
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden py-2 z-50 border border-neutral-100 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-white/5 mb-1">
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Access Key</p>
                    <p className="text-[10px] font-bold text-neutral-900 dark:text-white truncate mt-1">{authInfo.name}</p>
                  </div>
                  <Link
                    href="/main/memberinfo"
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