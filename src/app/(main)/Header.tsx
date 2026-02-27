'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FaArrowRightFromBracket,
  FaGear,
  FaArrowRight,
  FaChartLine,
  FaSun,
  FaMoon,
  FaUser,
  FaCloudArrowUp,
  FaShirt
} from 'react-icons/fa6';
import { IoSettingsSharp } from "react-icons/io5";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { authUserAtom } from '@/jotai/loginjotai';
import { logoutAPI, getUserInfoAPI } from '../api/memberservice/memberapi';
import { bookmarkAtom, analysisHistoryAtom, activeHistoryAtom } from '@/jotai/historyJotai';
import { getBookmarkAPI } from '../api/memberservice/bookmarkapi';
import { BookmarkData } from '@/types/ProductType';
import Image from 'next/image';
import Wizard from '@/assets/wizard.svg';
import { modelModeAtom } from '@/jotai/modelJotai';
import { FaWandMagicSparkles, FaCube } from 'react-icons/fa6';

/**
 * Header Component
 * 어플리케이션의 최상단 네비게이션 바입니다.
 * 테마 전환(Dark/Light), 인증 상태 관리, 페이지 이동 기능을 포함합니다.
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [authInfo, setAuthInfo] = useAtom(authUserAtom); // 전역 인증 상태 (Jotai)
  const [, setBookmark] = useAtom(bookmarkAtom);
  const [, setHistory] = useAtom(analysisHistoryAtom);
  const [, setActiveHistory] = useAtom(activeHistoryAtom);
  const [modelMode, setModelMode] = useAtom(modelModeAtom);

  // [상태 관리]
  const [isProfileOpen, setIsProfileOpen] = useState(false); // 프로필 드롭다운 열림 여부

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

  // 서비스 진입 시 혹은 로그인 시 북마크 리스트 동기화
  useEffect(() => {
    if (isMounted && authInfo) {
      const syncBookmarks = async () => {
        const currentToken = authInfo?.accessToken;
        if (!currentToken) return;
        try {
          const list = await getBookmarkAPI(currentToken);
          if (list) {
            // 최신 날짜순 정렬
            const sorted = [...list].sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setBookmark(sorted);
          }
        } catch (error) {
          console.error("Initial bookmark sync failed:", error);
        }
      };
      syncBookmarks();
    }
  }, [isMounted, authInfo, setBookmark]);

  // 세션 유효성 검증 및 로컬 시간 만료(6시간) 체크
  useEffect(() => {
    if (isMounted && authInfo) {
      // 프론트엔드 자체 만료 시간 방어 로직 (6시간 제한)
      if (authInfo.expiresAt && Date.now() > authInfo.expiresAt) {
        setAuthInfo(null);
        setBookmark([]);
        setHistory([]);
        setActiveHistory(null);
        alert('로그인 유효 시간(6시간)이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/login');
        return; // 하위의 백엔드 검증 로직 실행 방지
      }

      const verifySession = async () => {
        const currentToken = authInfo?.accessToken;
        if (!currentToken) return;
        try {
          const userInfo = await getUserInfoAPI(currentToken);
          if (userInfo?.error === 'unauthorized' && authInfo?.accessToken === currentToken) {
            // 인가 실패 일때만 로그아웃 처리 (단순 네트워크 장애/서버 오프라인 시에는 유지)
            setAuthInfo(null);
            setBookmark([]);
            setHistory([]);
            setActiveHistory(null);
            router.push('/login');
          }
        } catch (error) {
          console.error("Session verification failed:", error);
        }
      };
      verifySession();
    }
  }, [isMounted, authInfo, setAuthInfo, router]);

  // 전역 클릭 이벤트 리스너 등록
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 프로필 영역 외부 클릭 시 드롭다운 닫기
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
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
        setBookmark([]);
        setHistory([]);
        setActiveHistory(null);
        setIsProfileOpen(false);
        alert("로그아웃 되었습니다.");
        router.push("/");
      } else
        alert("로그아웃에 실패했습니다.");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const navItems = [
    { id: 'uploadpage', label: '이미지 분석 기반 추천', icon: <FaCloudArrowUp size={18} />, path: '/uploadpage', hoverTextClass: 'hover:text-violet-900 dark:hover:text-violet-400', activeClass: 'bg-violet-800 text-white shadow-lg shadow-violet-800/30' },
    { id: 'selectionpage', label: '보유 상품 기반 추천', icon: <FaShirt size={18} />, path: '/selectionpage', hoverTextClass: 'hover:text-violet-600 dark:hover:text-violet-400', activeClass: 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' },
    { id: 'dashboard', label: '대시보드', icon: <FaChartLine size={18} />, path: '/dashboard', hoverTextClass: 'hover:text-violet-400 dark:hover:text-violet-300', activeClass: 'bg-violet-400 text-white shadow-lg shadow-violet-400/30' },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 py-4 lg:py-6">
      <div className="max-w-7xl mx-auto">
        {/* 단일 통합 헤더 바: w-full로 아래 카드들과 길이를 맞춤 */}
        <div className="w-full flex items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-1.5 rounded-full border-2 border-neutral-100 dark:border-white/10 shadow-xl transition-all">

          {/* 1. 좌측: 브랜드 로고 (좌측 밀착) */}
          <Link href="/" className="flex flex-row gap-2 items-center pl-3 pr-1 md:pr-2 py-1 hover:opacity-70 transition-opacity shrink-0">
            <div className="relative w-6 h-6 md:w-7 md:h-7 opacity-90 drop-shadow-sm shrink-0">
              <Image src={Wizard} alt="Logo" fill className="object-contain" unoptimized />
            </div>
            <h1 className="hidden md:block text-base lg:text-xl font-yangjin font-black tracking-widest lg:tracking-[0.3em] uppercase text-neutral-900 dark:text-white leading-normal whitespace-nowrap mt-0.5">
              <span className="text-yellow-400"> Wizard</span> of <span className='text-purple-700'>Ounce</span>
            </h1>
          </Link>

          {/* 중앙 요소들과 로고 사이의 미세한 간격 및 시각적 구분선 */}
          <div className="hidden md:block w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 lg:mx-3 shrink-0" />

          {/* 2. 중앙: 메인 네비게이션 (로고 바로 옆에서 일정한 간격 유지) */}
          <div className="flex items-center gap-1 md:gap-2 ml-1 md:ml-0">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  // 네비게이션 시 항상 분석 기록 활성 상태 초기화
                  setActiveHistory(null);
                  if (pathname === item.path) {
                    e.preventDefault();
                    window.location.href = item.path;
                  }
                }}
                className={`px-2 sm:px-3 lg:px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider lg:tracking-[0.2em] flex items-center gap-1.5 md:gap-2 transition-all shrink-0 ${pathname === item.path
                  ? item.activeClass
                  : `text-gray-500 dark:text-gray-400 bg-transparent hover:bg-neutral-50 dark:hover:bg-white/5 ${item.hoverTextClass}`
                  }`}
              >
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* 톱니바퀴만 오른쪽 끝으로 밀어내기 위한 여백(Spacer) */}
          <div className="flex-1" />

          {/* 테마 설정 및 모델 선택 섹션 */}
          <div className="flex items-center px-1 md:px-2 gap-1 md:gap-2">
            {/* 분석 모델 스위치 */}
            <button
              onClick={() => {
                setModelMode(modelMode === '512' ? '768' : '512');
              }}
              className="relative flex items-center h-6 w-16 sm:h-8 sm:w-22 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 p-0.5 sm:p-1 overflow-hidden shadow-inner shrink-0"
              title={modelMode === '512' ? "gcn_resnet101" : "FashionCLIP"}
            >
              {/* 토글 배경 슬라이더 */}
              <div
                className={`absolute left-0.5 sm:left-1 top-1/2 -translate-y-1/2 w-7 h-5 sm:w-9.5 sm:h-6 bg-white dark:bg-neutral-600 rounded-full shadow-sm transition-transform duration-300 ease-in-out ${modelMode === '512' ? 'translate-x-0' : 'translate-x-8 sm:translate-x-10'}`}
              />

              <div className="relative z-10 flex w-full h-full items-center justify-between text-[8px] sm:text-[11px] font-black uppercase tracking-wider">
                <div className="w-1/2 flex justify-center">
                  <span className={`transition-colors duration-300 ${modelMode === '512' ? 'text-violet-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    GCN
                  </span>
                </div>
                <div className="w-1/2 flex justify-center">
                  <span className={`transition-colors duration-300 ${modelMode === '768' ? 'text-violet-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    CLIP
                  </span>
                </div>
              </div>
            </button>

            {/* 테마 토글 */}
            <button
              onClick={toggleTheme}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-violet-500/50 transition-all duration-300 group overflow-hidden"
              title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <FaSun
                  size={14}
                  className={`absolute transition-all duration-500 transform ${isDarkMode ? 'translate-y-10 rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100 text-amber-500'}`}
                />
                <FaMoon
                  size={14}
                  className={`absolute transition-all duration-500 transform ${isDarkMode ? 'translate-y-0 rotate-0 opacity-100 text-violet-400' : '-translate-y-10 -rotate-90 opacity-0'}`}
                />
              </div>
              {/* 호버 시 은은한 글로우 효과 */}
              <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors duration-300" />
            </button>
          </div>

          {/* 3. 우측: 설정 및 인증 상태 (오른쪽 끝에 고정) */}
          <div className="flex items-center justify-end shrink-0 pr-1 md:pr-2" ref={profileRef}>

            {/* 로그인 상태 정보 (Desktop) */}
            {isMounted && authInfo && (() => {
              const profile = authInfo.profile;
              const hasValidUrl = typeof profile === 'string' && (profile.startsWith("http") || profile.startsWith("data:"));

              return (
                <div className="hidden sm:flex items-center gap-3 pl-3 pr-2 border-l border-neutral-200 dark:border-white/10 mr-1 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col text-right font-sans shrink-0">
                    <span className="text-[10px] font-black leading-none uppercase tracking-wider text-neutral-900 dark:text-white">
                      {authInfo.name}
                    </span>
                  </div>
                  <div
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="relative w-8 h-8 md:w-9 md:h-9 rounded-full bg-violet-50 dark:bg-neutral-800 p-0.5 shadow-sm overflow-hidden shrink-0 cursor-pointer hover:ring-2 ring-violet-500 transition-all active:scale-95 flex items-center justify-center"
                  >
                    <FaUser size={12} className="absolute text-neutral-400 fallback-icon" style={{ display: 'none' }} />
                    <Image
                      src={hasValidUrl ? (profile.startsWith('data:') ? profile : (profile.includes('?') ? `${profile}&t=${Date.now()}` : `${profile}?t=${Date.now()}`)) : "https://fjoylosbfvojioljibku.supabase.co/storage/v1/object/public/profileimage/default.svg"}
                      alt="profile"
                      fill
                      className="relative z-10 object-cover rounded-full"
                      unoptimized
                      onError={(e) => {
                        const defaultImg = "https://fjoylosbfvojioljibku.supabase.co/storage/v1/object/public/profileimage/default.svg";
                        if (e.currentTarget.src !== defaultImg) {
                          e.currentTarget.srcset = "";
                          e.currentTarget.src = defaultImg;
                        } else {
                          e.currentTarget.style.display = "none";
                          const icon = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (icon) icon.style.display = "block";
                        }
                      }}
                    />
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
                  className="relative sm:hidden w-8 h-8 rounded-full bg-violet-50 dark:bg-neutral-800 p-0.5 border-2 border-neutral-200 dark:border-white/20 shadow-sm overflow-hidden flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0"
                >
                  <FaUser size={12} className="absolute text-neutral-400 fallback-icon" style={{ display: 'none' }} />
                  <Image
                    src={hasValidUrl ? (profile.startsWith('data:') ? profile : (profile.includes('?') ? `${profile}&t=${Date.now()}` : `${profile}?t=${Date.now()}`)) : "https://fjoylosbfvojioljibku.supabase.co/storage/v1/object/public/profileimage/default.svg"}
                    alt="profile"
                    fill
                    className="relative z-10 object-cover rounded-full"
                    unoptimized
                    onError={(e) => {
                      const defaultImg = "https://fjoylosbfvojioljibku.supabase.co/storage/v1/object/public/profileimage/default.svg";
                      if (e.currentTarget.src !== defaultImg) {
                        e.currentTarget.srcset = "";
                        e.currentTarget.src = defaultImg;
                      } else {
                        e.currentTarget.style.display = "none";
                        const icon = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                        if (icon) icon.style.display = "block";
                      }
                    }}
                  />
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
                {/* 2. 계정 섹션 */}
                <div className="p-2">
                  {!authInfo ? (
                    <div className="p-3 space-y-2">
                      <Link href="/login" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-center w-full py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-2xl transition-colors border-2 border-neutral-200 dark:border-white/30">로그인</Link>
                      <Link href="/signup" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-center w-full py-3 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-violet-700 transition-all shadow-lg active:scale-95">회원가입 <FaArrowRight size={8} className="ml-2" /></Link>
                    </div>
                  ) : (
                    <div className="px-2 py-2 space-y-1">
                      <Link href="/memberinfo" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[12px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-violet-600 rounded-xl transition-colors">
                        <FaGear size={11} /> 회원 정보 수정
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                        <FaArrowRightFromBracket size={11} /> 로그아웃
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