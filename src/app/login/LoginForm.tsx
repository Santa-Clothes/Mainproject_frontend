"use client"
import { FaArrowRight, FaFingerprint } from "react-icons/fa6";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { loginAPI } from "../api/loginservice/loginapi";

export default function LoginForm() {
  const router = useRouter();
  const userName = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.current?.value) {
      alert("아이디를 입력하세요");
      return;
    }
    if (!password.current?.value) {
      alert("비밀번호를 입력하세요");
      return;
    }

    try {
      const result = await loginAPI(userName.current?.value || "", password.current?.value || "");
      if (result && result.success) {
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("userName", result.name);
        localStorage.setItem("profile", result.profile);
        console.log("Token saved to localStorage");

        router.push("/main");
      } else {
        alert("로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-10">
          <div className="group relative border-b border-white/10 focus-within:border-white transition-colors py-4">
            <label className="absolute -top-6 left-0 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Identifier</label>
            <input
              ref={userName}
              type="text"
              placeholder="Curator ID"
              className="w-full bg-transparent border-none outline-none text-white text-base font-light placeholder:text-neutral-800 tracking-[0.2em] py-2"
              required
            />
          </div>
          <div className="group relative border-b border-white/10 focus-within:border-white transition-colors py-4">
            <label className="absolute -top-6 left-0 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Access Key</label>
            <input
              ref={password}
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-transparent border-none outline-none text-white text-base font-light placeholder:text-neutral-800 tracking-[0.2em] py-2"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <button
            type="submit"
            className="w-full py-7 bg-white text-black text-[11px] font-bold uppercase tracking-[0.8em] hover:bg-neutral-200 transition-all flex items-center justify-center gap-6 group shadow-[0_30px_60px_-15px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Login <FaArrowRight className="group-hover:translate-x-3 transition-transform" />
          </button>

          <div className="flex flex-col items-center gap-6">
            <Link href="/signup" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
              New Curator? Request Registry
            </Link>
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
              <FaFingerprint size={14} className="opacity-40" /> Biometric Bridge Ready
            </div>
          </div>
        </div>
      </form>
    </>
  );
}