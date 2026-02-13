"use client";

import { FaArrowRight } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { SiNaver, SiKakaotalk } from "react-icons/si";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { loginAPI } from "@/app/api/memberService/memberapi";
import { useSetAtom } from "jotai";
import { authUserAtom } from "@/jotai/loginjotai";

export default function LoginForm() {
  // Jotai atom을 사용하여 전역 인증 상태 관리
  const setAuth = useSetAtom(authUserAtom);
  const router = useRouter();
  // 소셜 로그인 처리 중 로딩 상태를 관리하는 state
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // 입력 필드 참조를 위한 ref
  const userIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);



  /**
   * 일반 로그인 제출 핸들러
   * 사용자로부터 입력받은 ID와 비밀번호를 검증하고 loginAPI를 호출합니다.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = userIdRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    if (!userId || !password) {
      alert("ID와 Key를 모두 입력해주세요.");
      return;
    }

    setAuth(null); // 기존 인증 정보 초기화

    try {
      const result = await loginAPI(userId, password);
      if (result && result.success) {
        // 로그인 성공 시 Jotai atom 업데이트
        setAuth({
          accessToken: result.accessToken,
          userId: result.userId,
          name: result.name,
          profile: result.profile,
          success: result.success,
          provider: 'local'
        });
        router.push("/main");
      } else {
        alert("인증 정보가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  /**
   * 소셜 로그인 클릭 핸들러
   * 선택된 서비스(구글, 카카오, 네이버)의 백엔드 OAuth2 인증 엔드포인트로 이동합니다.
   * 인증 후 성공적으로 돌아올 redirect_uri를 쿼리 파라미터로 포함합니다.
   */
  const handleSocialLogin = (provider: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACK_API_URL;
    if (!backendUrl) {
      console.error("Backend API URL is not defined.");
      return;
    }

    // 프론트엔드로 돌아올 리다이렉트 주소를 동적으로 생성 (현재 도메인/main)
    const frontendRedirectUrl = encodeURIComponent(`${window.location.origin}/main`);

    let endpoint = "";
    switch (provider) {
      case "Google": endpoint = "/oauth2/authorization/google"; break;
      case "Kakao": endpoint = "/oauth2/authorization/kakao"; break;
      case "Naver": endpoint = "/oauth2/authorization/naver"; break;
    }

    if (endpoint) {
      window.location.href = `${backendUrl}${endpoint}?redirect_uri=${frontendRedirectUrl}`;
    }
  };

  return (
    <div className="relative">
      {/* 로딩 오버레이: 소셜 로그인 처리 중일 때 표시 */}
      {isAuthenticating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-neutral-950/80">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-violet-600">Syncing Protocol...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">
          {/* 아이디 입력 필드 */}
          <div className="group relative border-b-2 border-neutral-200 py-3 transition-all duration-500 focus-within:border-violet-500 dark:border-white/10">
            <label className="absolute -top-6 left-0 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-500 transition-colors group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400">
              Identifier
            </label>
            <input
              ref={userIdRef}
              type="text"
              placeholder="CURATOR_ID"
              className="w-full border-none bg-transparent py-2 text-sm font-light tracking-[0.3em] text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-600"
              required
            />
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="group relative border-b-2 border-neutral-200 py-3 transition-all duration-500 focus-within:border-violet-500 dark:border-white/10">
            <label className="absolute -top-6 left-0 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-500 transition-colors group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400">
              Security Key
            </label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="••••••••••••"
              className="w-full border-none bg-transparent py-2 text-sm font-light tracking-[0.3em] text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-600"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-6 bg-neutral-900 py-4 text-[10px] font-bold uppercase tracking-[0.8em] text-white shadow-xl transition-all active:scale-[0.98] hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            Authenticate <FaArrowRight className="transition-transform group-hover:translate-x-2" />
          </button>

          {/* 소셜 로그인 구분선 */}
          <div className="relative flex items-center justify-center py-2 gap-4">
            <div className="flex-1 border-t-2 border-neutral-200 dark:border-white/10"></div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 shrink-0">
              Or Access With
            </span>
            <div className="flex-1 border-t-2 border-neutral-200 dark:border-white/10"></div>
          </div>

          {/* 소셜 로그인 버튼 그룹 */}
          <div className="flex justify-center gap-6 pt-2">
            <button type="button" onClick={() => handleSocialLogin('Google')} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-100 bg-white text-neutral-800 shadow-sm transition-all hover:scale-110 hover:border-violet-200 dark:border-white/10 dark:bg-neutral-900 dark:hover:bg-neutral-800">
              <FcGoogle size={24} />
            </button>
            <button type="button" onClick={() => handleSocialLogin('Naver')} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#03C75A] text-white transition-transform hover:scale-110">
              <SiNaver size={16} />
            </button>
            <button type="button" onClick={() => handleSocialLogin('Kakao')} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE500] text-[#3c1e1e] transition-transform hover:scale-110">
              <SiKakaotalk size={20} />
            </button>
          </div>

          {/* 회원가입 페이지 이동 링크 (경로 보정: /signup) */}
          <div className="flex flex-col items-center gap-3 pt-1">
            <Link href="/signup" className="border-b border-transparent pb-1 text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-500 transition-colors hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
              Registry New Curator
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}