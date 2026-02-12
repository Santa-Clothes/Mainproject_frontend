'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FaHouse,
  FaArrowRightFromBracket,
  FaGear,
  FaArrowRight,
  FaChartLine,
  FaSun,
  FaMoon,
  FaUser,
  FaShirt
} from 'react-icons/fa6';
import { IoSettingsSharp } from "react-icons/io5";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { authUserAtom } from '@/jotai/loginjotai';
import { logoutAPI } from '../api/memberService/memberapi';
import Image from 'next/image';
import Wizard from '@/assets/wizard.svg';

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
  const [isMounted, setIsMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    { id: 'home', label: 'Overview', icon: <FaHouse size={20} />, path: '/main' },
    { id: 'studio', label: 'Studio', icon: <FaShirt size={20} />, path: '/main/studio' },
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine size={20} />, path: '/main/dashboard' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 transition-all duration-300 ${isScrolled ? '-translate-y-1' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">

        {/* 1. 좌측: 브랜드 로고 및 메인 네비게이션 */}
        <div className="flex items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-1.5 rounded-full border-2 border-neutral-100 dark:border-white/10 shadow-xl">
          <Link href="/" className="flex flex-row gap-2 items-center px-6 py-1 hover:opacity-70 transition-opacity">
            <Image src={Wizard} alt="Logo" width={50} height={50} />
            <h1 className="hidden sm:block text-[10px] sm:text-lg md:text-xl lg:text-2xl font-sans font-black tracking-widest sm:tracking-[0.4em] uppercase text-neutral-900 dark:text-white leading-none transition-all">
              <span className="text-yellow-400"> Wizard</span> of <span className='text-purple-700'>Ounce</span>
            </h1>
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

        {/* 2. 우측: 통합 설정 및 유저 프로필 (연결된 캡슐 형태) */}
        <div className="relative self-end md:self-auto" ref={profileRef}>
          <div className={`flex items-center p-1 rounded-full border transition-all shadow-lg backdrop-blur-xl ${isProfileOpen
            ? 'bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-300 dark:border-violet-700'
            : 'bg-white/80 dark:bg-neutral-900/80 border-2 border-neutral-100 dark:border-white/10'
            }`}>

            {/* 로그인 상태인 경우 프로필 정보를 버튼 내측 왼쪽에 표시 */}
            {isMounted && authInfo && (
              <div className="flex items-center gap-2.5 pl-3 pr-1 animate-in slide-in-from-right-2 duration-300">
                <div className="w-7 h-7 rounded-full bg-violet-600 p-0.5 border border-white/10 shadow-sm overflow-hidden shrink-0">
                  {authInfo.profile ? (
                    <img
                      src={authInfo.profile}
                      alt="profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <FaUser size={10} />
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left mr-2 font-sans">
                  <span className={`text-[10px] font-black leading-none uppercase tracking-wider ${isProfileOpen ? 'text-violet-700 dark:text-violet-300' : 'text-neutral-900 dark:text-white'}`}>
                    {authInfo.name}
                  </span>
                  {/* <span className="text-[6px] font-bold text-violet-500 uppercase tracking-widest mt-0.5">Member</span> */}
                </div>
                {/* 캡슐 내 구분선 */}
                <div className="w-px h-4 bg-neutral-200 dark:bg-white/10 mx-1" />
              </div>
            )}

            {/* 설정 트리거 (톱니바퀴) */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`p-2.5 rounded-full transition-all group active:scale-95 ${isProfileOpen
                ? 'bg-violet-600 text-white rotate-90'
                : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              <IoSettingsSharp size={18} />
            </button>
          </div>

          {/* 통합 설정 드롭다운 메뉴 */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-4 w-64 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden z-50 border-2 border-neutral-100 dark:border-white/10 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">

              {/* 테마 설정 섹션 */}
              <div className="p-5 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5">
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Display Theme</p>
                <button
                  onClick={toggleTheme}
                  className="relative w-full h-11 bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/5 rounded-2xl cursor-pointer overflow-hidden p-1 shadow-inner group"
                >
                  <div className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-xl bg-violet-600 shadow-lg shadow-violet-500/30 transition-all duration-500 ease-spring flex items-center justify-center text-white z-10 ${isDarkMode ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`}>
                    <FaSun size={12} className="dark:hidden" />
                    <FaMoon size={12} className="hidden dark:block" />
                  </div>
                  <div className="relative w-full h-full flex items-center justify-between px-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${!isDarkMode ? 'text-white' : 'text-gray-400'}`}>Light</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white' : 'text-gray-400'}`}>Dark</span>
                  </div>
                </button>
              </div>

              {/* 계정/인증 섹션 */}
              <div className="p-2">
                {!authInfo ? (
                  <div className="p-3 space-y-2">
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.3em] ml-2 mb-1">Access Control</p>
                    <Link
                      href="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center justify-center w-full py-3 text-[9px] font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-2xl transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center justify-center w-full py-3 bg-violet-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-2xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95"
                    >
                      Join <FaArrowRight size={8} className="ml-2" />
                    </Link>
                  </div>
                ) : (
                  <div className="px-2 py-2 space-y-1">
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.3em] ml-3 mb-2 pt-2">Account Actions</p>
                    <Link
                      href="/main/memberinfo"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-violet-600 rounded-xl transition-colors"
                    >
                      <FaGear size={11} /> Configuration
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <FaArrowRightFromBracket size={11} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}