'use client';

import React, { useState, useRef } from 'react';
import { FaCloudArrowUp, FaXmark, FaMagnifyingGlass } from 'react-icons/fa6';
import Image from 'next/image';
import { RecommendData } from '@/types/ProductType';
import { getRecommendList } from '@/app/api/productService/productapi';
import { postImage } from '@/app/api/imageService/Imageapi';

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

        // 3. 분석 결과를 바탕으로 유사 상품 추천 리스트 조회
        // TODO: 실제 연동 시 uploadResult에서 상품 ID 또는 임베딩 정보를 추출하여 전달
        const results: RecommendData[] = await getRecommendList("AKA3CA001");

        onResultFound(results);
      } catch (e) {
        console.error("검색 실패:", e);
        onResultFound(null); // 실패 시 초기 상태로
      }
    });
  };

  return (
    <div className="h-full flex flex-col justify-center py-10 lg:py-0">
      <div className="max-w-2xl mx-auto w-full">
        {!preview ? (
          /* 파일 선택 전: 드롭존 형태의 UI */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group aspect-video border-2 border-dashed border-neutral-200 dark:border-white/5 rounded-4xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-900/50 flex items-center justify-center text-gray-400 group-hover:text-violet-600 transition-colors">
              <FaCloudArrowUp size={24} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Upload reference for indexing
            </p>
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
          <div className="relative aspect-video rounded-4xl overflow-hidden border border-neutral-200 dark:border-white/5 bg-white dark:bg-neutral-900/50">
            <Image
              src={preview}
              alt="Target"
              fill
              className="object-contain p-4"
              unoptimized
            />
            <button
              onClick={handleCancel}
              className="absolute top-6 right-6 w-10 h-10 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
            >
              <FaXmark size={14} />
            </button>
          </div>
        )}

        {/* 하단 동작 버튼 */}
        <div className="mt-8">
          <button
            onClick={handleSearch}
            disabled={!preview || isPending}
            className="w-full py-5 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full disabled:opacity-30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg"
          >
            {isPending ? (
              <span className="animate-pulse">Processing DNA...</span>
            ) : (
              <>
                <FaMagnifyingGlass size={12} />
                <span>Scan Reference</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}