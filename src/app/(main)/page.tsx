import React from 'react';
import { FaArrowRight, FaChartLine, FaCloudArrowUp, FaShirt } from 'react-icons/fa6';
import Link from 'next/link';

/**
 * [MainPage]
 * 모든 카드를 아이콘 기반의 통일된 디자인으로 변경하고 한글화를 적용했습니다.
 */
export default function MainPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-500 uppercase tracking-widest">Overview</span>
            <div className="h-px w-12 bg-violet-200 dark:bg-violet-800"></div>
          </div>
          <h2 className="text-6xl font-normal italic tracking-tighter text-neutral-900 dark:text-white">프로젝트 개요</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Card 1: Upload Studio (이미지 분석) */}
        <Link
          href="/uploadpage"
          className="relative flex flex-col justify-between overflow-hidden rounded-[3rem] border-2 border-neutral-100 bg-white p-10 dark:border-white/10 dark:bg-neutral-900/50 md:p-14 group shadow-sm transition-all duration-300 hover:border-violet-500/40 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="relative z-10 h-full flex flex-col justify-end min-h-60">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-4xl md:text-5xl font-normal italic text-neutral-900 dark:text-white tracking-tighter leading-none">이미지 분석 <br /> 기반 추천</h3>
                <p className="text-sm md:text-base text-neutral-500 dark:text-violet-100/60 leading-relaxed font-normal">
                  본인의 스타일을 업로드하여 <br /> AI 기반 분석을 시작하세요.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest transition-all group-hover:gap-6">
                분석 시작하기 <FaArrowRight className="text-violet-600 dark:text-violet-400 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 pointer-events-none opacity-10 dark:opacity-15 transition-transform duration-1000 group-hover:scale-110 text-neutral-900 dark:text-white">
            <FaCloudArrowUp size={380} />
          </div>
        </Link>

        {/* Card 2: Selection Studio (제품 매칭) */}
        <Link
          href="/selectionpage"
          className="relative flex flex-col justify-between overflow-hidden rounded-[3rem] border-2 border-neutral-100 bg-white p-10 dark:border-white/10 dark:bg-neutral-900/50 md:p-14 group shadow-sm transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="relative z-10 h-full flex flex-col justify-end min-h-60">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-4xl md:text-5xl font-normal italic text-neutral-900 dark:text-white tracking-tighter leading-none">보유 상품 <br /> 기반 추천</h3>
                <p className="text-sm md:text-base text-neutral-500 dark:text-blue-100/60 leading-relaxed font-normal">
                  카테고리별 최고의 제품 중에서 <br /> 당신에게 맞는 스타일을 추천합니다.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest transition-all group-hover:gap-6">
                제품 선택하기 <FaArrowRight className="text-blue-600 dark:text-blue-400 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 pointer-events-none opacity-10 dark:opacity-15 transition-transform duration-1000 group-hover:scale-110 text-neutral-900 dark:text-white">
            <FaShirt size={380} />
          </div>
        </Link>

        {/* Card 3: Analytics Dashboard (분석 대시보드) */}
        <Link
          href="/dashboard"
          suppressHydrationWarning
          className="relative flex flex-col justify-between overflow-hidden rounded-[3rem] border-2 border-neutral-100 bg-white p-10 dark:border-white/10 dark:bg-neutral-900/50 md:p-14 group shadow-sm transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="relative z-10 h-full flex flex-col justify-end min-h-60">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-4xl md:text-5xl font-normal italic text-neutral-900 dark:text-white tracking-tighter leading-none">대시보드</h3>
                <p className="text-sm md:text-base text-neutral-500 dark:text-emerald-100/60 leading-relaxed font-normal">
                  지점별 매출 통계를 <br /> 시각적으로 확인하세요.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest transition-all group-hover:gap-6">
                데이터 확인하기 <FaArrowRight className="text-emerald-600 dark:text-emerald-400 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 pointer-events-none opacity-10 dark:opacity-15 transition-transform duration-1000 group-hover:scale-110 text-neutral-900 dark:text-white">
            <FaChartLine size={380} />
          </div>
        </Link>
      </div>
    </div>
  );
}