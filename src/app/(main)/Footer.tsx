'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    /* 1. pt-20 pb-10: 기존 28/16에서 줄여서 수직 넓이를 줄임
      2. bg-neutral-100/50: 라이트모드에서 배경 대비를 더 명확히 함
      3. dark:bg-black: 다크모드에서 확실히 더 깊은 검정색으로 분리
    */
    <footer className="relative border-t-2 border-neutral-200 bg-neutral-100/50 px-8 pt-3 pb-1 text-neutral-900 transition-colors duration-500 dark:border-white/10 dark:bg-black dark:text-white">

      {/* Footer Ambient Light: 크기를 줄여 영역 침범 최소화 */}
      <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-violet-600/5 blur-[100px] dark:bg-violet-600/10" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* 그리드 간격을 gap-16에서 gap-10으로 줄임 */}
        <div className="mb-3 grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand Section: col-span-2로 공간 확보 */}
          <div className="col-span-1 space-y-6 md:col-span-2">
            <Link href="/" className="group flex flex-col items-start">
              <h2 className="flex items-center gap-2 font-yangjin text-2xl font-black tracking-widest uppercase text-neutral-900 transition-colors group-hover:opacity-80 dark:text-white">
                <span className="text-yellow-400">WIZARD</span> of <span className='text-purple-700'>OUNCE</span>
              </h2>
              <span className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.5em] text-violet-500 dark:text-violet-600">
                The AI Fashion Archive
              </span>
            </Link>
            <p className="max-w-xs font-medium text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              의류 이미지를 AI로 분석하여 새로운 제품을 추천해주는 서비스 입니다.
            </p>
          </div>

          {/* System Links */}
          <div className="space-y-6">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-violet-600 dark:text-violet-500">System</h4>
            <ul className="space-y-3">
              {[
                { name: '프로젝트 개요', path: '/' },
                { name: '이미지 분석 기반 추천', path: '/uploadpage' },
                { name: '보유 상품 기반 추천', path: '/selectionpage' },
                { name: '대시보드', path: '/dashboard' }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-[12px] font-medium uppercase tracking-wider text-neutral-600 transition-colors hover:text-violet-600 dark:text-neutral-400 dark:hover:text-violet-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-neutral-200 pt-4 dark:border-white/10 md:flex-row">
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500 dark:text-violet-200/60">
              © 2026 Wizard of Ounce
            </span>
            <div className="flex items-center gap-4">
              <div className="h-1 w-1 animate-pulse rounded-full bg-violet-600"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}