import React, { Suspense } from "react";
import Studio from "../components/Studio";

export default function UploadPage() {

  return (
    <div className="max-w-7xl mx-auto space-y-12" suppressHydrationWarning>
      {/* Header Section */}
      <div className="space-y-4">
        {/* 상단 장식 라인 및 레이블 */}
        <div className="flex items-center gap-4">
          <span className="w-10 h-px bg-neutral-200 dark:bg-neutral-800"></span>
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            Image Analyze Module
          </span>
        </div>

        {/* 타이틀 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <h2 className="text-5xl md:text-6xl font-normal italic tracking-tighter text-neutral-900 dark:text-white">
            이미지 분석 기반 추천
          </h2>
        </div>
      </div>

      <Suspense fallback={<div className="h-125 animate-pulse bg-gray-50/10 rounded-[2.5rem]" />}>
        <Studio mode="imageInput" />
      </Suspense>
    </div>
  );
}