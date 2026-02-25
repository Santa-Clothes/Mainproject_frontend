"use client"
import React, { useState, useTransition, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { analysisHistoryAtom, activeHistoryAtom, HistoryItem } from '@/jotai/historyJotai';

// UI 컴포넌트 임포트
import ResultGrid from './ResultGrid';
import SelectionPanel from './SelectionPanel';
import UploadPanel, { UploadPanelRef, resizeImage } from './UploadPanel';
import AnalysisSection from './AnalysisSection';
import { imageAnalyze } from '@/app/api/imageservice/imageapi';

import { RecommendData, RecommendList } from '@/types/ProductType';

export type StudioMode = 'imageInput' | 'imageSelection';

/**
 * Studio: AI 기반 스타일 탐색 및 분석의 공통 페이지(컨테이너) 컴포넌트
 * 'Upload Page' (이미지 직접 업로드) 및 'Selection Page' (기존 데이터 탐색) 
 * 두 가지 모드를 mode prop으로 주입받아 처리하며, 분석 완료 시 2-Card 레이아웃으로 상세 보고서와 추천 아이템을 표시합니다.
 */
export default function Studio({ mode }: { mode: StudioMode }) {
  // React 18 Transition을 사용한 매끄러운 상태 전환
  const [isPending, startTransition] = useTransition();

  // [상태 관리]
  const [results, setResults] = useState<RecommendList | null>(null); // 분석 결과 리스트
  const [analysisImage, setAnalysisImage] = useState<string | null>(null); // 현재 분석 대상 이미지
  const [analysisName, setAnalysisName] = useState<string | undefined>(undefined); // 현재 분석 대상 상품명
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석 중 로딩 상태

  const [history, setHistory] = useAtom(analysisHistoryAtom);
  const [activeHistory, setActiveHistory] = useAtom(activeHistoryAtom);
  const uploadRef = React.useRef<UploadPanelRef>(null);

  // [히스토리 로드] activeHistory 가 설정된 경우 해당 값을 화면에 곧바로 띄움
  useEffect(() => {
    if (activeHistory) {
      setAnalysisImage(activeHistory.sourceImage);
      setAnalysisName(activeHistory.productName);
      setResults(activeHistory.results || null);
      setIsAnalyzing(false);
    }
  }, [activeHistory]);

  // 브라우저 뒤로가기(popstate) 처리를 위한 Effect
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 뒤로가기를 눌렀을 때, 현재 URL에 view=result가 없다면 초기 화면으로 돌아간 것으로 간주
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('view')) {
        setResults(null);
        setIsAnalyzing(false);
        setActiveHistory(null);
      } else if (event.state && event.state.results) {
        // 앞으로 가기로 다시 view=result 에 접근한 경우, state 값으로 복원 (재분석 안함)
        setResults(event.state.results);
        setAnalysisImage(event.state.analysisImage);
        setAnalysisName(event.state.analysisName);
        setIsAnalyzing(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveHistory]);

  /**
   * 결과 수신 핸들러: 분석이 완료되었을 때 호출
   */
  const handleSearchResult = (data: RecommendList | null) => {
    setResults(data);
    setIsAnalyzing(false);

    // 데이터가 있고 분석 모드로 전환되는 경우 브라우저 히스토리 스택 추가
    if (data && (data.internalProducts?.length > 0 || data.naverProducts?.length > 0)) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('view', 'result');
      window.history.pushState({
        results: data,
        analysisImage: analysisImage,
        analysisName: analysisName
      }, '', newUrl.toString());

      if (analysisImage) {
        setHistory((prev) => {
          const newItem: HistoryItem = {
            id: Date.now().toString(),
            type: mode,
            sourceImage: analysisImage,
            productName: analysisName,
            timestamp: Date.now(),
            results: data,
          };
          return [newItem, ...prev].slice(0, 3);
        });
      }
    }
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
   * 분석 취소 핸들러
   */
  const handleCancelAnalysis = () => {
    setIsAnalyzing(false);
    setResults(null);
  };

  /**
   * 직접 파일 분석 처리 (AnalysisSection 등에서 호출)
   */
  const handleFileAnalysis = (file: File) => {
    startTransition(async () => {
      try {
        // 1. 초기 UI 상태 변경 (로딩 시작)
        setIsAnalyzing(true);
        setResults(null);

        // 2. 이미지 리사이징
        const { dataUrl, blob } = await resizeImage(file, 300);
        setAnalysisImage(dataUrl);
        setAnalysisName(file.name);

        // 3. 서버 분석 요청
        const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
        const uploadResult: any = await imageAnalyze(resizedFile);

        if (uploadResult) {
          handleSearchResult(uploadResult);
        } else {
          alert("분석에 실패했습니다.");
          handleCancelAnalysis();
        }
      } catch (e) {
        console.error("분석 중 오류:", e);
        alert("분석 중 오류가 발생했습니다.");
        handleCancelAnalysis();
      }
    });
  };

  // 분석 타임아웃 처리 (30초)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPending || isAnalyzing) {
      timer = setTimeout(() => {
        if (isPending || isAnalyzing) {
          alert('분석 시간이 너무 오래 소요되어 중단되었습니다. 다시 시도해주세요.');
          handleCancelAnalysis();
        }
      }, 30000); // 30초
    }
    return () => clearTimeout(timer);
  }, [isPending, isAnalyzing]);

  /**
   * 초기 화면으로 돌아가기 핸들러
   */
  const handleBackToSearch = () => {
    setResults(null);
    setActiveHistory(null);
    setIsAnalyzing(false);

    const url = new URL(window.location.href);
    if (url.searchParams.has('view')) {
      url.searchParams.delete('view');
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 max-w-7xl mx-auto w-full px-4 lg:px-0">
      <AnimatePresence mode="wait">
        {results ? (
          /* [상태 A] 결과 표시 (분석 정보 + 결과 그리드 분리 레이아웃) */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-10 pb-20 will-change-transform"
          >
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
                barData={results?.results?.[0]?.topk || []}
                isSelectionMode={mode === 'imageSelection'}
                onImageUpload={handleFileAnalysis}
              />
            </div>

            {/* Card 2: 첫 번째 추천 결과(내부 데이터) 그리드 섹션 */}
            <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border-2 border-neutral-100 dark:border-white/10 shadow-xl p-6 lg:p-12 h-200 lg:h-225 flex flex-col">
              <ResultGrid
                isActive={true}
                isPending={isPending}
                products={results.internalProducts || []}
                title="9oz 스타일 목록"
                showCartButton={false}
              />
            </div>

            {/* Card 3: 두 번째 추천 결과 그리드 섹션 (추가) */}
            <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border-2 border-neutral-100 dark:border-white/10 shadow-xl p-6 lg:p-12 h-200 lg:h-225 flex flex-col">
              <ResultGrid
                isActive={true}
                isPending={isPending}
                products={results.naverProducts || []}
                title="외부 상품 추천 목록"
                onProductClick={(product: RecommendData) => {
                  if (product.productLink) {
                    window.open(product.productLink, '_blank');
                  }
                }}
              />
            </div>
          </motion.div>
        ) : (
          /* [상태 B] 입력 대기 (탐색형 또는 업로드형 패널 노출) */
          <motion.div
            key="discovery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`
              bg-white dark:bg-neutral-900/50 
              rounded-4xl lg:rounded-[2.5rem] 
              border-2 border-neutral-100 dark:border-white/10 
              shadow-xl overflow-hidden flex flex-col 
              transition-all duration-500 ease-in-out
              min-h-125
              ${mode === 'imageInput' ? 'lg:h-150' : 'lg:h-275'}
            `}
          >
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              {mode === 'imageSelection' ? (
                <SelectionPanel
                  onResultFound={handleSearchResult}
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisCancel={handleCancelAnalysis}
                  isLoading={isPending && isAnalyzing}
                  startTransition={startTransition}
                />
              ) : (
                <UploadPanel
                  ref={uploadRef}
                  onResultFound={handleSearchResult}
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisCancel={handleCancelAnalysis}
                  isLoading={isPending && isAnalyzing}
                  startTransition={startTransition}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}