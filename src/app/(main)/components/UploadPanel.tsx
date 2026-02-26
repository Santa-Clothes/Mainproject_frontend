'use client';

import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { FaCloudArrowUp, FaXmark, FaMagnifyingGlass, FaCircleInfo, FaFileImage, FaArrowsRotate } from 'react-icons/fa6';
import Image from 'next/image';
import { RecommendList } from '@/types/ProductType';
import { imageAnalyze } from '@/app/api/imageservice/imageapi';
import sampleImg from '@/assets/sample.jpg';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 서버 전송 및 히스토리 저장용 이미지 리사이징 (최대 256px)
 * 분석 정확도를 유지하면서도 전송 속도와 저장 용량을 최적화합니다.
 */
export const resizeImage = (file: File, maxSize: number = 300): Promise<{ dataUrl: string; blob: Blob }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // 1. 미리보기 및 히스토리용 DataURL (JPEG 0.6)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

        // 2. 서버 전송용 Blob
        canvas.toBlob((blob) => {
          if (blob) resolve({ dataUrl, blob });
        }, 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface UploadPanelProps {
  onResultFound: (results: RecommendList | null) => void;
  onAnalysisStart: (imgUrl: string, name?: string) => void;
  onAnalysisCancel: () => void;
  isLoading: boolean;
  startTransition: React.TransitionStartFunction;
}

export interface UploadPanelRef {
  handleSearch: () => void;
}

/**
 * UploadPanel: 이미지를 직접 업로드하여 분석 대상을 설정하는 컴포넌트
 * Upload Studio 페이지(`/main/uploadpage`)에서 입력 대기 상태로 사용되며,
 * 로컬 파일 선택, 미리보기, 서버 전송 전 인터랙션을 담당합니다.
 */
const UploadPanel = forwardRef<UploadPanelRef, UploadPanelProps>(({ onResultFound, onAnalysisStart, onAnalysisCancel, isLoading, startTransition }, ref) => {
  const [preview, setPreview] = useState<string | null>(null); // 이미지 미리보기 URL
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 실제 서버로 보낼 파일 객체
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 부모(Studio)에서 호출할 수 있도록 handleSearch 노출
  useImperativeHandle(ref, () => ({
    handleSearch
  }));

  /**
   * 드래그 앤 드롭 핸들러
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  /**
   * 파일 처리 공통 로직
   */
  const processFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`파일 크기가 너무 큽니다. 10MB 이하의 이미지만 업로드 가능합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 1. 원본 미리보기용 (즉시 표시)
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 2. 서버 전송 및 히스토리용 리사이즈 이미지 생성 (최대 300px)
    const { dataUrl, blob } = await resizeImage(file, 300);

    // 서버 전송용은 Blob을 File 객체로 변환하여 저장
    const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
    setSelectedFile(resizedFile);

    // 히스토리 및 분석용 DataURL 전달
    onAnalysisStart(dataUrl, file.name);
  };

  /**
   * 파일 입력 값이 변경되었을 때 실행 (파일 선택 시)
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
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

    if (preview) {
      onAnalysisStart(preview, selectedFile.name);
    }

    startTransition(async () => {
      // 1. 즉시 로딩 화면으로 전환 (결과 그리드 초기화)
      // onResultFound(null); // Studio.tsx의 isAnalyzing 상태를 해제하지 않도록 주석 처리

      // try {
      // 2. 이미지 서버로 업로드 (Server Action 호출)
      //   const uploadResult = await searchByImage(selectedFile);
      //   console.log("Upload Success:", uploadResult);
      //   if (uploadResult /* && uploadResult.success */) {
      //     // 3. 분석 결과를 바탕으로 유사 상품 추천 리스트 조회
      //     const results: RecommendData[] = uploadResult.results.map((item) => {
      //       return {
      //         productId: item.product_id,
      //         title: item.title,
      //         price: item.price,
      //         productLink: '',
      //         imageUrl: item.image_url,
      //         similarityScore: item.score
      //       };
      //     });
      //     console.log("Upload Success:", uploadResult);
      //     onResultFound(results);
      //   } else {
      //     alert("이미지 업로드에 실패했습니다.");
      //     onResultFound(null);
      //   }
      // } catch (e) {
      //   console.error("검색 실패:", e);
      //   onResultFound(null); // 실패 시 초기 상태로
      // }

      try {
        // 2. 이미지 서버로 업로드 (Server Action 호출)
        const uploadResult: any = await imageAnalyze(selectedFile);

        if (uploadResult) {
          // 3. 분석 결과를 바탕으로 유사 상품 추천 리스트 조회 (Studio.tsx의 RecommendList 구조 맞춤)
          const legacyProducts = Array.isArray(uploadResult.similarProducts) ? uploadResult.similarProducts : uploadResult;

          if (Array.isArray(legacyProducts)) {
            onResultFound({
              internalProducts: legacyProducts,
              similarProducts: [] // UploadPanel은 외부 API 분석이 추후 연계될 시 점진적으로 추가
            } as any);
          } else {
            onResultFound(uploadResult);
          }
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
    <div className="h-full flex flex-col justify-center py-10 lg:py-0 p-6 lg:p-12 relative">
      {/* 스타일 분석 중 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-x-0 inset-y-0 z-50 flex flex-col items-center justify-center bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm rounded-[inherit] animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl flex items-center justify-center border border-neutral-100 dark:border-white/10">
              <FaArrowsRotate className="animate-spin text-violet-600" size={24} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[11px] font-black text-neutral-900 dark:text-white uppercase tracking-[0.3em]">Analyzing Style...</p>
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Finding matches in database</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalysisCancel();
              }}
              className="mt-4 px-6 py-2.5 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all shadow-xl"
            >
              분석 취소
            </button>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Side: Upload Interaction */}
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-left duration-700">
          {!preview ? (
            /* 파일 선택 전: 드롭존 형태의 UI */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group aspect-square lg:aspect-video border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all shadow-inner
                ${isDragging
                  ? 'border-violet-500 bg-violet-50/30 ring-8 ring-violet-500/10 scale-[0.98]'
                  : 'border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-violet-500 hover:bg-white dark:hover:bg-neutral-900/50 hover:ring-4 hover:ring-violet-500/10'
                }`}
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
            <div className="relative aspect-square lg:aspect-video rounded-[2.5rem] overflow-hidden border-2 border-violet-500 bg-neutral-50/50 dark:bg-neutral-900/50 shadow-2xl animate-in zoom-in-95 duration-500 ring-4 ring-violet-500/10">
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
            disabled={!preview || isLoading}
            className="w-full py-6 bg-violet-600 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-full disabled:opacity-20 flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl shadow-violet-600/20 hover:bg-violet-500"
          >
            {isLoading ? (
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
                  {/* <FaFileImage size={24} /> */}
                  <Image src={sampleImg} alt="sample" fill sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' className="object-cover" />
                </div>
                <div className="absolute inset-0 bg-violet-600/10 opacity-0 group-hover/ex:opacity-100 transition-opacity" />
              </div>

              {/* Right Side Info */}
              <div className="flex flex-col justify-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-violet-500 rounded-full" />
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">이미지 규격</h4>
                  </div>
                  <p className="text-[12px] text-neutral-500 dark:text-neutral-400 pl-3">300x300px이 분석에 최적화 되어 있습니다.</p>
                  <p className="text-[12px] text-neutral-500 dark:text-neutral-400 pl-3">300x300px 이상 1080x1080px 이하.</p>
                  <p className="text-[12px] text-neutral-500 dark:text-neutral-400 pl-3">해상도 72dpi~300dpi</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-violet-500 rounded-full" />
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">이미지 형태</h4>
                  </div>
                  <p className="text-[12px] text-neutral-500 dark:text-neutral-400 pl-3">얼굴 제외, 옷을 가리지 않게, 배경이 깔끔한 이미지</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-violet-500 rounded-full" />
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">파일 크기</h4>
                  </div>
                  <p className="text-[12px] text-neutral-500 dark:text-neutral-400 pl-3">10MB 이하.</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-violet-500 rounded-full" />
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">파일 형식</h4>
                  </div>
                  <p className="text-[12px] text-neutral-500 dark:text-neutral-400 pl-3">JPG, PNG</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default UploadPanel;