"use client"
import React, { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// 컴포넌트들
import ResultGrid from './components/ResultGrid';
import ModeTabs from './components/ModeTabs';
import DiscoveryPanel from './components/DiscoveryPanel';
import UploadPanel from './components/UploadPanel';
import AnalysisSection from './components/AnalysisSection';

import { ProductType, RecommendData } from '@/types/ProductType';

export type StudioMode = 'imageDiscovery' | 'imageInput';

export default function Studio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const mode: StudioMode = modeParam === 'imageInput' ? 'imageInput' : 'imageDiscovery';

  const [isPending, startTransition] = useTransition();

  // [핵심 데이터] 결과 데이터와 분석용 이미지 정보
  const [results, setResults] = useState<RecommendData[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [analysisName, setAnalysisName] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 결과 처리 핸들러
  const handleSearchResult = (data: RecommendData[] | null, category?: string) => {
    setResults(data);
    console.log("추천 데이터", data);

    if (category) setActiveCategory(category);
    setIsAnalyzing(false);
  };

  // 분석 시작 핸들러
  const handleAnalysisStart = (imgUrl: string, name?: string) => {
    setAnalysisImage(imgUrl);
    setAnalysisName(name);
    setIsAnalyzing(true);
  };

  // 결과 화면에서 다시 검색 화면으로 돌아가기
  const handleBackToSearch = () => {
    setResults(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto w-full">
      {!results && (
        <ModeTabs mode={mode} onModeChange={(newMode) => {
          setResults(null);
          router.push(`/main/studio?mode=${newMode}`, { scroll: false });
        }} />
      )}

      {/* 카드 컨테이너: 카드 자체의 높이를 크게 잡습니다. */}
      <div className="bg-white dark:bg-neutral-900/50 rounded-[2.5rem] border border-neutral-200 dark:border-white/5 shadow-xl overflow-hidden flex flex-col h-[1100px]">

        {/* 패딩을 조절한 내부 컨테이너 */}
        <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-hidden h-full">

          {results ? (
            /* 결과 화면도 내부 스크롤 적용 */
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-12 animate-in fade-in slide-in-from-right duration-500">
              <button
                onClick={handleBackToSearch}
                className="flex items-center gap-2 text-violet-600 font-bold text-xs uppercase tracking-widest hover:underline"
              >
                ← Back to Discovery
              </button>

              <AnalysisSection
                sourceImage={analysisImage}
                productName={analysisName}
                isLoading={isAnalyzing}
              />

              <ResultGrid
                isActive={true}
                isPending={isPending}
                products={results}
                title="Neural Recommendations"
                onProductClick={(product: any) => {
                  setAnalysisImage(product.imageUrl);
                  setAnalysisName(product.productName);
                }}
              />
            </div>
          ) : (
            /* 입력 패널: DiscoveryPanel 내부에서 스크롤을 제어하도록 넘깁니다. */
            mode === 'imageDiscovery' ? (
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
            )
          )}
        </div>
      </div>
    </div>
  );
}