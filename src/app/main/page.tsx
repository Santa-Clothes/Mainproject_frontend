import React from 'react';
import { FaArrowRight, FaMicrochip, FaChartLine, FaShieldHalved } from 'react-icons/fa6';
import Link from 'next/link';
import Image from 'next/image';

/**
 * [MainPage]
 * 서버 컴포넌트로 전환하여 초기 진입 시 카드 이미지 깜빡임을 해결합니다.
 */
export default function MainPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-16">

      {/* Header: justify-between은 이미 flex를 포함하므로 block 제거 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 dark:border-violet-900/20 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-500 uppercase tracking-widest">Central Console</span>
            <div className="h-px w-12 bg-violet-200 dark:bg-violet-800"></div>
          </div>
          <h2 className="text-6xl font-serif italic tracking-tighter text-neutral-900 dark:text-white">Overview</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Card 1: Archive Studio */}
        <Link
          href="/main/studio"
          className="lg:col-span-2 group relative h-[560px] bg-neutral-900 rounded-[3rem] overflow-hidden border-2 border-neutral-100 dark:border-white/10 transition-shadow hover:shadow-xl"
        >
          <div className="absolute inset-0 bg-neutral-900 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop"
              alt="Studio Background"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 850px"
              priority
              placeholder="blur"
              /* 중립적인 어두운 색상의 플레이스홀더를 사용하여 파란색 톤 왜곡을 방지합니다. */
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              className="opacity-50 object-cover group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-90" />

          <div className="absolute bottom-12 left-12 right-12 space-y-8">
            <div className="space-y-4">
              <h3 className="text-5xl md:text-7xl font-serif italic text-white tracking-tighter leading-none">Archive Studio</h3>
              <p className="text-lg md:text-xl font-light text-violet-100/60 max-w-lg leading-relaxed font-serif italic">
                {/* Neural indexing for aesthetic curation. */}
              </p>
            </div>
            {/* transition-all은 기본 제공 클래스입니다. */}
            <div className="flex items-center gap-6 text-[11px] font-bold text-white uppercase tracking-widest transition-all group-hover:gap-10">
              Initialize Recommender <FaArrowRight className="text-violet-400 transition-transform group-hover:translate-x-2" />
            </div>
          </div>
        </Link>

        {/* Card 2: Statistics Dashboard */}
        <Link
          href="/main/statistics"
          suppressHydrationWarning
          className="relative flex flex-col justify-between overflow-hidden rounded-[3rem] border-2 border-neutral-100 bg-white p-10 dark:border-white/10 dark:bg-neutral-900/50 md:p-14 group shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:border-violet-500/40"
        >
          <div className="relative z-10 space-y-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-600 shadow-lg group-hover:bg-violet-500">
              <FaChartLine className="text-white text-2xl" />
            </div>
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-violet-500">Dashboard</h4>
              <p className="text-7xl font-serif italic tracking-tighter text-neutral-900 dark:text-white"></p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">statistics</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-6 border-t border-neutral-200 pt-12 dark:border-white/5">
            <div className="flex items-center gap-4">
              {/* animate-pulse는 Tailwind 공식 기본 클래스입니다. (완전 제거를 원하시면 이 줄의 animate-pulse만 지우세요) */}
              <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"></div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest dark:text-violet-700">Sync Active</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-neutral-900 uppercase tracking-widest dark:text-violet-100">
              View Analytics <FaArrowRight className="transition-transform group-hover:translate-x-2" />
            </div>
          </div>

          <div className="absolute -right-24 -bottom-24 pointer-events-none opacity-5 transition-transform duration-1000 group-hover:rotate-12 dark:text-white">
            <FaChartLine size={400} />
          </div>
        </Link>
      </div>
    </div>
  );
}