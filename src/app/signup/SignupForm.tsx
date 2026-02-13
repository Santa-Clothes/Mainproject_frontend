"use client";
import Link from "next/link";
import { FaArrowRight, FaCamera, FaUser } from "react-icons/fa6";
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
  const [profileImage, setProfileImage] = useState<string>('');
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

    let fileToUpload = selectedFile;

    if (!selectedFile) {
      const proceed = confirm("프로필 이미지를 선택하지 않았습니다. 기본 프로필 이미지(PNG)로 가입하시겠습니까?");
      if (!proceed) return;

      // FaUser 아이콘의 SVG 데이터를 PNG 이미지 파일로 변환 (Canvas 활용)
      const svgString = `<svg stroke="currentColor" fill="#D1D5DB" stroke-width="0" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" width="512" height="512"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>`;

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      const img = new window.Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const pngBlob = await new Promise<Blob | null>((resolve) => {
        img.onload = () => {
          ctx?.clearRect(0, 0, 512, 512); // 배경 투명 처리
          ctx?.drawImage(img, 0, 0, 512, 512);
          URL.revokeObjectURL(url);
          canvas.toBlob((blob) => resolve(blob), 'image/png');
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });

      if (pngBlob) {
        fileToUpload = new File([pngBlob], 'default_avatar01.png', { type: 'image/png' });
      }
    }

    setIsSubmitting(true);
    setAuth(null);

    try {
      const result = await signupAPI({
        id: id,
        nickname: nickname,
        password: password,
        profileImg: fileToUpload
      });
      if (result)
        router.push("/login");
      else
        alert("회원가입에 실패했습니다.");
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      {/* 1. 프로필 이미지 업로드 섹션 (MemberInfo 재활용) */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative group w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-4 border-white dark:border-neutral-900 shadow-2xl transition-transform hover:scale-[1.05]">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="Preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-700">
              <FaUser size={40} />
            </div>
          )}
          <label className="absolute inset-0 z-10 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer">
            <FaCamera size={24} className="text-white mb-2" />
            <span className="text-[8px] font-bold text-white uppercase tracking-widest">Upload Profile</span>
            <input
              type="file"
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest underline decoration-violet-300 decoration-2 underline-offset-4">Visual Identification</p>
          <p className="text-[9px] text-neutral-400 font-medium">Click to synchronize your avatar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">
          {/* 닉네임 입력 */}
          <div className="group relative border-b-2 border-neutral-200 py-3 transition-all duration-500 focus-within:border-violet-500 dark:border-white/10">
            <label className="absolute -top-6 left-0 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-500 transition-colors group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400">
              닉네임
            </label>
            <input
              ref={nicknameRef}
              type="text"
              placeholder="Visual Curator Name"
              className="w-full border-none bg-transparent py-2 text-sm font-light tracking-[0.3em] text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-white dark:placeholder:text-neutral-500"
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
              placeholder="ARCHIVE_KEY_ID"
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

        <div className="flex flex-col gap-10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full items-center justify-center gap-6 bg-neutral-900 py-6 text-[10px] font-bold uppercase tracking-[0.8em] text-white shadow-xl transition-all active:scale-[0.98] hover:bg-violet-600 dark:bg-white dark:text-black dark:hover:bg-violet-600 dark:hover:text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Initializing Node...' : 'Register Account'}
            {!isSubmitting && <FaArrowRight className="transition-transform group-hover:translate-x-2" />}
          </button>

          <div className="flex flex-col items-center gap-6">
            <Link href="/login" className="border-b border-transparent pb-1 text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-500 transition-colors hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
              Existing Curator? Log In
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}