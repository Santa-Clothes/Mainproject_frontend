'use client';

import React from 'react';
import { FaSliders, FaImage } from 'react-icons/fa6';
interface ModeTabsProps {
  mode: string;
  onModeChange: (newMode: string) => void;
}

/**
 * [ModeTabs]
 * 알약 형태의 탭 메뉴입니다. 
 * v4 표준에 따라 transition-all 대신 목적에 맞는 transition-colors를 사용합니다.
 */
export default function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-white dark:bg-neutral-900/50 rounded-full w-fit mx-auto border-2 border-neutral-100 dark:border-white/10 shadow-inner">
      {/* Image Upload 버튼 */}
      <button
        onClick={() => onModeChange('imageInput')}
        type="button"
        className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 outline-none ${mode === 'imageInput'
          ? 'bg-violet-600 text-white shadow-md'
          : 'text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400'
          }`}
      >
        <FaImage size={12} />
        <span>이미지 업로드</span>
      </button>

      {/* Visual Discovery 버튼 */}
      <button
        onClick={() => onModeChange('imageSelection')}
        type="button"
        className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 outline-none ${mode === 'imageSelection'
          ? 'bg-violet-600 text-white shadow-md'
          : 'text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400'
          }`}
      >
        <FaSliders size={12} />
        <span>이미지 선택</span>
      </button>
    </div>
  );
}