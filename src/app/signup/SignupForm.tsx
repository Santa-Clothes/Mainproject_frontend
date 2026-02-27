"use client";
import Link from "next/link";
import { FaArrowRight, FaCamera } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { signupAPI } from "@/app/api/memberservice/memberapi";
import { useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { authUserAtom } from "@/jotai/loginjotai";
import Image from "next/image";

export default function SignupForm() {
  const setAuth = useSetAtom(authUserAtom);
  const router = useRouter();

  // 상태 관리
  const DEFAULT_IMAGE = "https://fjoylosbfvojioljibku.supabase.co/storage/v1/object/public/profileimage/default.svg";
  const [profileImage, setProfileImage] = useState<string>(DEFAULT_IMAGE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref 연결
  const userIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);


  // 프로필 이미지 변경 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const id = (userIdRef.current?.value || "").trim();
    const nickname = (nicknameRef.current?.value || "").trim();
    const password = (passwordRef.current?.value || "").trim();

    if (!nickname) {
      alert("닉네임을 입력하세요");
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

    if (!selectedFile) {
      const proceed = confirm("프로필 이미지를 선택하지 않았습니다. 기본 프로필 이미지로 가입하시겠습니까?");
      if (!proceed) return;
    }

    setIsSubmitting(true);
    setAuth(null);

    try {
      console.log("selectedFile:", selectedFile);

      const result = await signupAPI({
        id: id,
        nickname: nickname,
        password: password,
        profileImg: selectedFile || DEFAULT_IMAGE // 선택하지 않았다면 기본 이미지 URL 전송
      });
      if (result)
        router.push("/login");
      else
        alert("회원가입에 실패했습니다. 입력 정보를 다시 확인하거나 서버 상태를 점검해주세요.");
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-12">
      {/* 로딩 오버레이: 회원가입 처리 중일 때 표시 */}
      {isSubmitting && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-neutral-950/80">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent mx-auto"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-violet-600">회원가입 중...</p>
          </div>
        </div>
      )}

      {/* 1. 프로필 이미지 업로드 섹션 (MemberInfo 재활용) */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative group w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-4 border-white dark:border-neutral-900 shadow-2xl transition-transform hover:scale-[1.05]">
          <Image
            src={profileImage}
            alt="Preview"
            fill
            className="object-cover"
            priority // 추가: LCP 에러(레이지 로딩 지연) 방지
          />
          <label className="absolute inset-0 z-10 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer">
            <FaCamera size={24} className="text-white mb-2" />
            <span className="text-[8px] font-bold text-white uppercase tracking-widest">프로필 업로드</span>
            <input
              type="file"
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest underline decoration-violet-300 decoration-2 underline-offset-4">자신만의 아바타를 정하세요</p>
          <p className="text-[9px] text-neutral-400 font-medium">프로필을 업로드하려면 클릭하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">
          {/* 닉네임 입력 */}
          <div className="group relative border-b-2 border-neutral-200 py-3 transition-all duration-500 focus-within:border-violet-500 dark:border-white/10">
            <label className="absolute -top-6 left-0 text-[12px] font-bold uppercase tracking-[0.3em] text-neutral-500 transition-colors group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400">
              닉네임
            </label>
            <input
              ref={nicknameRef}
              type="text"
              placeholder="Curator Nickname"
              className="w-full border-none bg-transparent py-2 text-sm font-light tracking-[0.3em] text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-600"
              required
            />
          </div>

          {/* 아이디 입력 */}
          <div className="group relative border-b-2 border-neutral-200 py-3 transition-all duration-500 focus-within:border-violet-500 dark:border-white/10">
            <label className="absolute -top-6 left-0 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-500 transition-colors group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400">
              아이디
            </label>
            <input
              ref={userIdRef}
              type="text"
              placeholder="Curator ID"
              className="w-full border-none bg-transparent py-2 text-sm font-light tracking-[0.3em] text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-white dark:placeholder:text-neutral-500"
              required
            />
          </div>

          {/* 비밀번호 입력 */}
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

        <div className="flex flex-col gap-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full items-center justify-center gap-6 bg-neutral-900 py-4 text-[16px] font-bold uppercase tracking-[0.8em] text-white shadow-xl transition-all active:scale-[0.98] hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500 disabled:opacity-50"
          >
            {isSubmitting ? '회원가입 중...' : '회원 가입'}
            {!isSubmitting && <FaArrowRight className="transition-transform group-hover:translate-x-2" />}
          </button>

          <div className="flex flex-col items-center gap-3 pt-1">
            <Link href="/login" className="border-b border-transparent pb-1 text-[12px] font-bold uppercase tracking-[0.4em] text-neutral-500 transition-colors hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
              이미 가입하셨다면 로그인 페이지로
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}