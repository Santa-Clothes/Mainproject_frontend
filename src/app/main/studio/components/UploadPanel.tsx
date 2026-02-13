'use client';

import React, { useState, useRef } from 'react';
import { FaCloudArrowUp, FaXmark, FaMagnifyingGlass, FaCircleInfo, FaExpand, FaFileImage, FaLightbulb } from 'react-icons/fa6';
import Image from 'next/image';
import { RecommendData } from '@/types/ProductType';
import { getRecommendList } from '@/app/api/productService/productapi';
import { postImage } from '@/app/api/imageService/imageapi';

interface UploadPanelProps {
  onResultFound: (results: any[] | null) => void;
  onAnalysisStart: (imgUrl: string, name?: string) => void;
  onAnalysisCancel: () => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}

/**
 * UploadPanel: 이미지를 직접 업로드하여 분석을 요청하는 컴포넌트
 * 파일 선택, 미리보기, 서버 전송 및 분석 시작 로직을 포함합니다.
 */
export default function UploadPanel({ onResultFound, onAnalysisStart, onAnalysisCancel, isPending, startTransition }: UploadPanelProps) {
  const [preview, setPreview] = useState<string | null>(null); // 이미지 미리보기 URL
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 실제 서버로 보낼 파일 객체
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 파일 입력 값이 변경되었을 때 실행 (파일 선택 시)
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onAnalysisStart(result, file.name); // 부모에게 분석 시작 상태 알림
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * 업로드된 이미지 취소 및 상태 초기화
   */
  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    onAnalysisCancel();
    onResultFound(null); // 검색 결과 초기화
  };

  /**
   * [핵심] 분석 시작 버튼 클릭 시 서버로 전송 및 추천 리스트 조회
   */
  const handleSearch = () => {
    if (!selectedFile) return;

    startTransition(async () => {
      // 1. 즉시 로딩 화면으로 전환 (결과 그리드 초기화)
      onResultFound([]);

      try {
        // 2. 이미지 서버로 업로드 (Server Action 호출)
        const uploadResult = await postImage(selectedFile);
        console.log("Upload Success:", uploadResult);
        if (uploadResult && uploadResult.success) {
          // 3. 분석 결과를 바탕으로 유사 상품 추천 리스트 조회
          const results: RecommendData[] = await getRecommendList("AKA3CA001");

          onResultFound(results);
        } else {
          alert("이미지 업로드에 실패했습니다.");
          onResultFound(null);
        }
      } catch (e) {
        console.error("검색 실패:", e);
        onResultFound(null); // 실패 시 초기 상태로
      }
    });
  };

  return (
    <div className="h-full flex flex-col justify-center py-10 lg:py-0">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Side: Upload Interaction */}
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-left duration-700">
          {!preview ? (
            /* 파일 선택 전: 드롭존 형태의 UI */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group aspect-square lg:aspect-video border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition-all bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-white dark:hover:bg-neutral-900/50 shadow-inner"
            >
              <div className="w-20 h-20 rounded-full bg-white dark:bg-neutral-900 shadow-xl flex items-center justify-center text-gray-400 group-hover:text-violet-600 group-hover:scale-110 transition-all duration-500">
                <FaCloudArrowUp size={32} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-800 dark:text-neutral-200">
                  Drop Image
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                  Supported: JPG, PNG
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            /* 파일 선택 후: 선택 이미지 미리보기 UI */
            <div className="relative aspect-square lg:aspect-video rounded-[2.5rem] overflow-hidden border-2 border-violet-500/30 bg-white dark:bg-neutral-900/50 shadow-2xl animate-in zoom-in-95 duration-500">
              <Image
                src={preview}
                alt="Target"
                fill
                className="object-contain p-8"
                unoptimized
              />
              <button
                onClick={handleCancel}
                className="absolute top-6 right-6 w-12 h-12 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-all shadow-xl group"
              >
                <FaXmark size={18} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          )}

          {/* 동작 버튼 */}
          <button
            onClick={handleSearch}
            disabled={!preview || isPending}
            className="w-full py-6 bg-violet-600 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-full disabled:opacity-20 flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl shadow-violet-600/20 hover:bg-violet-500"
          >
            {isPending ? (
              <span className="animate-pulse">Style 분석 중...</span>
            ) : (
              <>
                <FaMagnifyingGlass size={14} />
                <span>Style 분석 시작</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Instructions & Requirements */}
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-right duration-700 delay-100">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
              <FaCircleInfo size={14} />
            </div>
            <h2 className="text-xl font-normal italic text-neutral-900 dark:text-white">이미지 업로드 유의사항</h2>
          </div>

          {/* Integrated Example & Specs */}
          <div className="space-y-4">
            <div className="flex gap-5">
              {/* Single Example Image Placeholder */}
              <div className="w-32 h-32 flex-none rounded-4xl bg-neutral-100 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-white/10 overflow-hidden relative group/ex">
                <div className="absolute inset-0 flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                  <FaFileImage size={24} />
                </div>
                <div className="absolute inset-0 bg-violet-600/10 opacity-0 group-hover/ex:opacity-100 transition-opacity" />
              </div>

              {/* Right Side Info */}
              <div className="flex flex-col justify-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-violet-500 rounded-full" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">이미지 규격</h4>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 pl-3">Under 800x800px optimization.</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-violet-500 rounded-full" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">이미지 형태</h4>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 pl-3">Centered & clear focus.</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-violet-500 rounded-full" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">파일 크기</h4>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 pl-3">Under 10MB.</p>
                </div>
              </div>
            </div>

            {/* Bottom Side Info */}
            <div className="p-5 rounded-3xl border-2 border-neutral-100 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">Formats & Quality</h4>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Standard JPG/PNG with clean backgrounds ensures maximum DNA fidelity and matching accuracy.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}