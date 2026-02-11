"use client"
import React, { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// UI 컴포넌트 임포트
import ResultGrid from './components/ResultGrid';
import ModeTabs from './components/ModeTabs';
import DiscoveryPanel from './components/DiscoveryPanel';
import UploadPanel from './components/UploadPanel';
import AnalysisSection from './components/AnalysisSection';

import { RecommendData } from '@/types/ProductType';

export type StudioMode = 'imageDiscovery' | 'imageInput';

/**
 * Studio: AI 기반 스타일 탐색 및 분석의 메인 페이지 컨테이너
 * 두 가지 모드(기존 데이터 탐색 / 이미지 직접 업로드)를 관리하며,
 * 분석 결과 발생 시 세련된 2-Card 레이아웃으로 결과를 표시합니다.
 */
export default function Studio() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터를 통한 모드 관리
  const modeParam = searchParams.get('mode');
  const mode: StudioMode = modeParam === 'imageInput' ? 'imageInput' : 'imageDiscovery';

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

      {/* 1. 모드 전환 탭 (결과 화면이 아닐 때만 노출) */}
      {!results && (
        <ModeTabs mode={mode} onModeChange={(newMode) => {
          setResults(null);
          router.push(`/main/studio?mode=${newMode}`, { scroll: false });
        }} />
      )}

      {/* 2. 메인 컨텐츠 영역 */}
      {results ? (
        /* [상태 A] 결과 표시 (분석 정보 + 결과 그리드 분리 레이아웃) */
        <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500 pb-20">

          {/* Card 1: 분석 보고서 섹션 (DNA Matrix) */}
          <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border border-neutral-200 dark:border-white/5 shadow-xl p-6 lg:p-12">
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
          <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border border-neutral-200 dark:border-white/5 shadow-xl p-6 lg:p-12 h-200 lg:h-225 flex flex-col">
            <ResultGrid
              isActive={true}
              isPending={isPending}
              products={results}
              title="Neural Recommendations"
              onProductClick={(product: RecommendData) => {
                // 특정 추천 상품 클릭 시 해당 상품을 기준으로 상단 분석표 갱신
                setAnalysisImage(product.imageUrl);
                setAnalysisName(product.title);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      ) : (
        /* [상태 B] 입력 대기 (탐색형 또는 업로드형 패널 노출) */
        <div className={`
          bg-white dark:bg-neutral-900/50 
          rounded-4xl lg:rounded-[2.5rem] 
          border border-neutral-200 dark:border-white/5 
          shadow-xl overflow-hidden flex flex-col 
          transition-all duration-500 ease-in-out
          min-h-125
          ${mode === 'imageInput' ? 'lg:h-150' : 'lg:h-275'}
        `}>
          <div className="flex-1 flex flex-col p-6 lg:p-12 overflow-hidden h-full">
            {mode === 'imageDiscovery' ? (
              <DiscoveryPanel
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