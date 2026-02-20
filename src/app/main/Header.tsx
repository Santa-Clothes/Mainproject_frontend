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
  FaShirt,
  FaCamera,
  FaMagnifyingGlass
} from 'react-icons/fa6';
import { IoSettingsSharp } from "react-icons/io5";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { authUserAtom } from '@/jotai/loginjotai';
import { logoutAPI, getUserInfoAPI } from '../api/memberservice/memberapi';
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

  // 초기 마운트 및 테마 설정 확인
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('atelier_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 세션 유효성 검증 (Header에서 전역적으로 인가 실패 체크)
  useEffect(() => {
    if (isMounted && authInfo) {
      const verifySession = async () => {
        try {
          const userInfo = await getUserInfoAPI(authInfo.accessToken);
          if (!userInfo) {
            // 인가 실패 혹은 계정 삭제 시 로그아웃 처리
            setAuthInfo(null);
            router.push('/login');
          }
        } catch (error) {
          console.error("Session verification failed:", error);
        }
      };
      verifySession();
    }
  }, [isMounted, authInfo, setAuthInfo, router]);

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
      const result = await logoutAPI(authInfo);
      if (result) {
        setAuthInfo(null); // 로컬 스토리지 정보도 자동 초기화됨
        setIsProfileOpen(false);
        alert("로그아웃 되었습니다.");
        router.push("/main");
      } else
        alert("로그아웃에 실패했습니다.");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 네비게이션 아이템 정의
  const navItems = [
    { id: 'home', label: 'Overview', icon: <FaHouse size={20} />, path: '/main' },
    { id: 'studio', label: 'Studio', icon: <FaCamera size={20} />, path: '/main/studio' },
    { id: 'selection', label: 'Selection', icon: <FaMagnifyingGlass size={20} />, path: '/main/selectionpage' },
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine size={20} />, path: '/main/dashboard' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 transition-all duration-300 ${isScrolled ? '-translate-y-1' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto">
        {/* 단일 통합 헤더 바: w-full로 아래 카드들과 길이를 맞춤 */}
        <div className="w-full flex items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-1.5 rounded-full border-2 border-neutral-100 dark:border-white/10 shadow-xl transition-all">

          {/* 1. 좌측: 브랜드 로고 */}
          <Link href="/" className="flex flex-row gap-2 items-center px-3 py-1 hover:opacity-70 transition-opacity shrink-0">
            <div className="relative w-10 h-10 md:w-11 md:h-11">
              <Image src={Wizard} alt="Logo" fill className="object-contain" unoptimized />
            </div>
            <h1 className="hidden md:block text-lg lg:text-2xl font-sans font-black tracking-widest lg:tracking-[0.4em] uppercase text-neutral-900 dark:text-white leading-none">
              <span className="text-yellow-400"> Wizard</span> of <span className='text-purple-700'>Ounce</span>
            </h1>
          </Link>

          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 md:mx-4 shrink-0" />

          {/* 2. 중앙: 메인 네비게이션 */}
          <div className="flex items-center gap-0.5 md:gap-1 overflow-hidden">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  if (pathname === item.path) {
                    e.preventDefault();
                    window.location.href = item.path;
                  }
                }}
                className={`px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest md:tracking-[0.2em] flex items-center gap-2 transition-all shrink-0 ${pathname === item.path
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-white'
                  }`}
              >
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* 우측으로 밀어주기 위한 Spacer */}
          <div className="flex-1" />

          {/* 3. 우측: 설정 및 인증 상태 (통합 영역) */}
          <div className="flex items-center shrink-0 pr-1 md:pr-2" ref={profileRef}>

            {/* 로그인 상태 정보 (Desktop) */}
            {isMounted && authInfo && (() => {
              const profile = authInfo.profile;
              const hasValidUrl = typeof profile === 'string' && (profile.startsWith("http") || profile.startsWith("data:"));

              return (
                <div className="hidden sm:flex items-center gap-3 pl-3 pr-2 border-l border-gray-200 dark:border-white/10 mr-1 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col text-right font-sans shrink-0">
                    <span className="text-[10px] font-black leading-none uppercase tracking-wider text-neutral-900 dark:text-white">
                      {authInfo.name}
                    </span>
                  </div>
                  <div
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-transparent p-0.5 shadow-sm overflow-hidden shrink-0 cursor-pointer hover:ring-2 ring-violet-500 transition-all active:scale-95"
                  >
                    {hasValidUrl ? (
                      <Image
                        src={profile.startsWith('data:') ? profile : (profile.includes('?') ? `${profile}&t=${Date.now()}` : `${profile}?t=${Date.now()}`)}
                        alt="profile"
                        fill
                        className="object-cover rounded-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <FaUser size={12} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 모바일 전용 프로필 (로그인 시) */}
            {isMounted && authInfo && (() => {
              const profile = authInfo.profile;
              const hasValidUrl = typeof profile === 'string' && (profile.startsWith("http") || profile.startsWith("data:"));

              return (
                <div
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative sm:hidden w-8 h-8 rounded-full bg-violet-600 p-0.5 border-2 border-white/20 shadow-sm overflow-hidden flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0"
                >
                  {hasValidUrl ? (
                    <Image
                      src={profile.startsWith('data:') ? profile : (profile.includes('?') ? `${profile}&t=${Date.now()}` : `${profile}?t=${Date.now()}`)}
                      alt="profile"
                      fill
                      className="object-cover rounded-full"
                      unoptimized
                    />
                  ) : (
                    <FaUser size={10} className="text-white" />
                  )}
                </div>
              );
            })()}

            {/* 톱니바퀴 (최우측 고정) */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`p-2 sm:p-2.5 rounded-full transition-all group active:scale-95 shrink-0 ${isProfileOpen
                ? 'bg-violet-600 text-white rotate-90'
                : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              <IoSettingsSharp size={18} />
            </button>

            {/* 드롭다운 메뉴 */}
            {isProfileOpen && (
              <div className="absolute top-[calc(100%+12px)] right-0 w-64 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden z-50 border-2 border-neutral-100 dark:border-white/10 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                {/* 1. 테마 설정 섹션 */}
                <div className="p-5 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5">
                  <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Display Theme</p>
                  <button onClick={toggleTheme} className="relative w-full h-11 bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/5 rounded-2xl cursor-pointer overflow-hidden p-1 shadow-inner group">
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

                {/* 2. 계정 섹션 */}
                <div className="p-2">
                  {!authInfo ? (
                    <div className="p-3 space-y-2">
                      <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.3em] ml-2 mb-1">Access Control</p>
                      <Link href="/login" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-center w-full py-3 text-[9px] font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-2xl transition-colors">Log In</Link>
                      <Link href="/signup" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-center w-full py-3 bg-violet-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-2xl hover:bg-violet-700 transition-all shadow-lg active:scale-95">Join <FaArrowRight size={8} className="ml-2" /></Link>
                    </div>
                  ) : (
                    <div className="px-2 py-2 space-y-1">
                      <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.3em] ml-3 mb-2 pt-2">Account Actions</p>
                      <Link href="/main/memberinfo" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-violet-600 rounded-xl transition-colors">
                        <FaGear size={11} /> Configuration
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                        <FaArrowRightFromBracket size={11} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}