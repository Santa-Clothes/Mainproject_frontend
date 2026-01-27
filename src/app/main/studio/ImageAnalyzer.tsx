"use client"

import React, { useState, useRef } from 'react';
import Image from 'next/image';

import {
  FaXmark,
  FaArrowUpFromBracket,
  FaRotateLeft
} from 'react-icons/fa6';
// import { analyzeImage } from '../services/geminiService';

interface ImageAnalyzerProps {
  onAction?: (data: any) => void;
  onReset?: () => void;
  isExternalLoading?: boolean;
}

export default function ImageAnalyzer({ onAction, onReset, isExternalLoading }: ImageAnalyzerProps) {
  const [preview, setPreview] = useState<string | null>(null); //사용자가 선택한 이미지의 URL담는거
  const [isUploading, setIsUploading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  //이미지 업로드 취소시 api 요청도 중지 비정상적 중복 요청 방지. 
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    // 진행 중인 요청이 있다면 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (preview) URL.revokeObjectURL(preview)
    setPreview(null);
    setIsUploading(false);
    setAnalysisData(null);

    if (fileInputRef.current) fileInputRef.current.value = '';

    // 부모 컴포넌트(Studio)의 결과값도 초기화
    if (onReset) onReset();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];// input-file을 이용해 받은 file객체
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setIsUploading(true);
    setAnalysisData(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      // 새로운 요청을 위한 AbortController 생성
      abortControllerRef.current = new AbortController();

      try {
        // 백엔드(Spring Boot)로 데이터 전달 시뮬레이션
        // const data = await analyzeImage(base64); //구현 예정이기 때문에 막아둠
        const data = null;
        // 만약 분석 도중 사용자가 취소(reset)했다면 결과 적용을 건너뜀
        if (abortControllerRef.current.signal.aborted) return;

        setAnalysisData(data);
        if (onAction) onAction(data);
      } catch (error) {
        console.error("Backend communication error:", error);
      } finally {
        setIsUploading(false);
        abortControllerRef.current = null;
      }

      reader.readAsDataURL(file);//파일의 이진(Binary) 데이터를 텍스트 형태인 Base64 문자열로 변환합니다. 비동기 작업
    }
  };

  const isLoading = isUploading || isExternalLoading;

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] w-full">
      {/* Left: Image Delivery Frame */}
      {/* 이미지 입력 박스   */}
      <div
        className={`w-full lg:w-[480px] bg-[#121212] p-16 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden transition-all duration-700 ${isLoading ? 'opacity-90' : 'opacity-100'}`}
        onClick={() => !isLoading && !preview && fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} accept="image/*" />

        {preview ? (
          <div className="relative w-full h-full animate-in fade-in zoom-in-95 duration-500">
            <Image src={preview} alt="Source Analysis" fill className="rounded-4xl shadow-2xl object-cover" />

            {/* Cancel/Reset Button - Always available when there is a preview */}
            <button
              onClick={handleReset}
              className="absolute top-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl z-30"
              title={isLoading ? "Cancel Upload" : "Clear Image"}
            >
              <FaXmark size={14} />
            </button>

            {/* 업로드중일때 */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-4xl flex flex-col items-center justify-center gap-4 z-20">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Transferring...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-8 z-10">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto transition-all group-hover:bg-white/20 group-hover:scale-110">
              <FaArrowUpFromBracket size={20} className="text-white opacity-40 group-hover:opacity-100" />
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-serif italic text-white tracking-widest uppercase">Imprint Vision</h4>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em]">Initialize Backend Handshake</p>
            </div>
          </div>
        )}
      </div>

      {/* Right: Response / Analysis Panel */}
      <div className="flex-1 p-16 lg:p-24 flex flex-col justify-center bg-white relative">
        <div className="absolute top-12 left-12 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-200">
          <span className="w-10 h-px bg-gray-100"></span>
          Intelligence Tunnel
        </div>

        {isLoading ? /* 로딩 */(
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-full h-full bg-black animate-progress-fast origin-left" />
              </div>
              <h4 className="text-4xl font-serif italic tracking-tight text-black">Decrypting <br /> Visual Data...</h4>
            </div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">
              Awaiting neural deconstruction from Spring Boot Core <br />
              Syncing metadata with the global archive
            </p>
          </div>
        ) : analysisData ? /* 결과 */(
          <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700">
            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Taxonomy</span>
                <div className="text-3xl font-serif italic text-black border-b border-gray-50 pb-3">{analysisData.category}</div>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Tactility</span>
                <div className="text-3xl font-serif italic text-black border-b border-gray-50 pb-3">{analysisData.texture}</div>
              </div>
              <div className="col-span-2 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Chromatic Identity</span>
                <div className="text-4xl font-serif italic text-black uppercase tracking-tighter">
                  {analysisData.color} <span className="text-gray-100 px-4 font-light">/</span> {analysisData.pattern}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-50">
              {analysisData.tags?.map((tag: string) => (
                <span key={tag} className="px-5 py-2 bg-[#FAF9F6] text-[9px] font-bold text-black uppercase tracking-widest border border-gray-100">
                  #{tag}
                </span>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="mt-4 flex items-center gap-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-black transition-colors"
            >
              <FaRotateLeft size={10} /> Reset Analysis
            </button>
          </div>
        ) : /* 기본 */(
          <div className="max-w-md space-y-8 animate-in fade-in duration-500">
            <h3 className="text-7xl font-serif leading-[0.9] italic tracking-tighter text-black">
              Neural <br /> Vision
            </h3>
            <p className="text-sm font-light text-gray-400 leading-relaxed">
              Bridge the physical and digital archive. Upload an image to trigger a backend-driven analysis of fashion DNA, material metrics, and styling logic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

