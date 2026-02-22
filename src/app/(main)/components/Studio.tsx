"use client"
import React, { useState, useTransition } from 'react';

// UI 컴포넌트 임포트
import ResultGrid from './ResultGrid';
import SelectionPanel from './SelectionPanel';
import UploadPanel from './UploadPanel';
import AnalysisSection from './AnalysisSection';

import { RecommendData } from '@/types/ProductType';

export type StudioMode = 'imageInput' | 'imageSelection';

/**
 * Studio: AI 기반 스타일 탐색 및 분석의 공통 페이지(컨테이너) 컴포넌트
 * 'Upload Studio' (이미지 직접 업로드) 및 'Explore Catalog' (기존 데이터 탐색) 
 * 두 가지 모드를 mode prop으로 주입받아 처리하며, 분석 완료 시 2-Card 레이아웃으로 상세 보고서와 추천 아이템을 표시합니다.
 */
export default function Studio({ mode }: { mode: StudioMode }) {
  // React 18 Transition을 사용한 매끄러운 상태 전환
  const [isPending, startTransition] = useTransition();

  // [상태 관리]
  const [results, setResults] = useState<RecommendData[] | null>(null); // 분석 결과 리스트
  const [analysisImage, setAnalysisImage] = useState<string | null>(null); // 현재 분석 대상 이미지
  const [analysisName, setAnalysisName] = useState<string | undefined>(undefined); // 현재 분석 대상 상품명
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석 중 로딩 상태

  /**
   * 결과 수신 핸들러: 분석이 완료되었을 때 호출
   */
  const handleSearchResult = (data: RecommendData[] | null) => {
    setResults(data);
    setIsAnalyzing(false);
  };

  /**
   * 분석 시작 핸들러: 분석을 위해 이미지가 선택되었을 때 호출
   */
  const handleAnalysisStart = (imgUrl: string, name?: string) => {
    setAnalysisImage(imgUrl);
    setAnalysisName(name);
    setIsAnalyzing(true);
  };

  /**
   * 초기 화면으로 돌아가기 핸들러
   */
  const handleBackToSearch = () => {
    setResults(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 lg:space-y-10 max-w-7xl mx-auto w-full px-4 lg:px-0">

      {/* 2. 메인 컨텐츠 영역 */}
      {results ? (
        /* [상태 A] 결과 표시 (분석 정보 + 결과 그리드 분리 레이아웃) */
        <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500 pb-20">

          {/* Card 1: 분석 보고서 섹션 (DNA Matrix) */}
          <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border-2 border-neutral-100 dark:border-white/10 shadow-xl p-6 lg:p-12">
            <button
              onClick={handleBackToSearch}
              className="flex items-center gap-2 text-violet-600 font-bold text-xs uppercase tracking-widest hover:underline mb-10 transition-all hover:gap-3"
            >
              ← Back to Discovery
            </button>
            <AnalysisSection
              sourceImage={analysisImage}
              productName={analysisName}
              isLoading={isAnalyzing}
            />
          </div>

          {/* Card 2: 추천 결과 그리드 섹션 */}
          <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border-2 border-neutral-100 dark:border-white/10 shadow-xl p-6 lg:p-12 h-200 lg:h-225 flex flex-col">
            <ResultGrid
              isActive={true}
              isPending={isPending}
              products={results}
              title="Recommendations"
              onProductClick={(product: RecommendData) => {
                // 추천 상품 클릭 시 상세 페이지(상품 링크)로 이동
                if (product.productLink) {
                  window.open(product.productLink, '_blank');
                }
              }}
            />
          </div>
        </div>
      ) : (
        /* [상태 B] 입력 대기 (탐색형 또는 업로드형 패널 노출) */
        <div className={`
          bg-white dark:bg-neutral-900/50 
          rounded-4xl lg:rounded-[2.5rem] 
          border-2 border-neutral-100 dark:border-white/10 
          shadow-xl overflow-hidden flex flex-col 
          transition-all duration-500 ease-in-out
          min-h-125
          ${mode === 'imageInput' ? 'lg:h-150' : 'lg:h-275'}
        `}>
          <div className="flex-1 flex flex-col p-6 lg:p-12 overflow-hidden h-full">
            {mode === 'imageSelection' ? (
              <SelectionPanel
                onResultFound={handleSearchResult}
                onAnalysisStart={handleAnalysisStart}
                isPending={isPending}
                startTransition={startTransition}
              />
            ) : (
              <UploadPanel
                onResultFound={handleSearchResult}
                onAnalysisStart={handleAnalysisStart}
                onAnalysisCancel={() => setAnalysisImage(null)}
                isPending={isPending}
                startTransition={startTransition}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}