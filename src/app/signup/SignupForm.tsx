"use client";
import Link from "next/link";
import { FaArrowRight, FaShieldHalved } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { signupAPI } from "@/app/api/memberService/memberapi";
import { useRef } from "react";
import { useSetAtom } from "jotai";
import { authUserAtom } from "@/jotai/loginjotai";

export default function SignupForm() {
  const setAuth = useSetAtom(authUserAtom);
  const router = useRouter();

  // Ref 연결을 위해 변수명 확인
  const userIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);

  /**
   * 회원가입 제출 핸들러
   * 사용자 입력을 검증한 후 signupAPI를 호출하여 신규 유저를 등록합니다.
   * 가입 성공 시 로그인 페이지(/login)로 이동합니다.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const id = (userIdRef.current?.value || "").trim();
    const nickname = (nicknameRef.current?.value || "").trim();
    const password = (passwordRef.current?.value || "").trim();

    if (!nickname) {
      alert("공식 명칭(Official Name)을 입력하세요");
      return;
    }
    if (!id) {
      alert("아이디를 입력하세요");
      return;
    }
    if (!password) {
      alert("비밀번호를 입력하세요");
      return;
    }

    setAuth(null);

    try {
      await signupAPI({
        id: id,
        nickname: nickname,
        password: password
      });
      router.push("/login"); // 가입 성공 시 로그인 페이지로 이동
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">

          {/* 1. 닉네임 (nickname) 입력 */}
          {/* border-neutral-300: 라이트모드에서 뚜렷한 회색 선 */}
          {/* dark:border-white/10: 다크모드에서 은은한 흰색 선 */}
          <div className="group relative border-b-2 border-neutral-200 py-3 transition-all duration-500 focus-within:border-violet-500 dark:border-white/10">
            <label className="absolute -top-6 left-0 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-500 transition-colors group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400">
              닉네임
            </label>
            <input
              ref={nicknameRef}
              type="text"
              placeholder="Nick Name"
              /* text-neutral-900: 라이트모드 글자색 (진한 회색) */
              /* dark:text-white: 다크모드 글자색 (흰색) */
              className="w-full border-none bg-transparent py-2 text-sm font-light tracking-[0.3em] text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-white dark:placeholder:text-neutral-500"
              required
            />
          </div>

          {/* 2. 사용자 ID 입력 */}
          <div className="group relative border-b-2 border-neutral-200 py-3 transition-all duration-500 focus-within:border-violet-500 dark:border-white/10">
            <label className="absolute -top-6 left-0 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-500 transition-colors group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400">
              아이디
            </label>
            <input
              ref={userIdRef}
              type="text"
              placeholder="CHOOSE_IDENTIFIER"
              className="w-full border-none bg-transparent py-2 text-sm font-light tracking-[0.3em] text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-white dark:placeholder:text-neutral-500"
              required
            />
          </div>

          {/* 3. 비밀번호 입력 */}
          <div className="group relative border-b-2 border-neutral-200 py-3 transition-all duration-500 focus-within:border-violet-500 dark:border-white/10">
            <label className="absolute -top-6 left-0 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-500 transition-colors group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400">
              비밀번호
            </label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="••••••••••••"
              className="w-full border-none bg-transparent py-2 text-sm font-light tracking-[0.3em] text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-white dark:placeholder:text-neutral-500"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-10">
          {/* Register 버튼 스타일 보정 */}
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-6 bg-neutral-900 py-6 text-[10px] font-bold uppercase tracking-[0.8em] text-white shadow-xl transition-all active:scale-[0.98] hover:bg-violet-600 dark:bg-white dark:text-black dark:hover:bg-violet-600 dark:hover:text-white"
          >
            Register Account <FaArrowRight className="transition-transform group-hover:translate-x-2" />
          </button>

          <div className="flex flex-col items-center gap-6">
            <Link href="/login" className="border-b border-transparent pb-1 text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-500 transition-colors hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
              Existing Curator? Log In
            </Link>
          </div>
        </div>
      </form>
    </>
  );
}