"use client"
import React, { useState, useTransition, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { analysisHistoryAtom, activeHistoryAtom, HistoryItem } from '@/jotai/historyJotai';

// UI 컴포넌트 임포트
import ResultGrid from './ResultGrid';
import SelectionPanel from './SelectionPanel';
import UploadPanel, { UploadPanelRef, resizeImage } from './UploadPanel';
import AnalysisSection from './AnalysisSection';
import { imageAnalyze, image768Analyze } from '@/app/api/imageservice/imageapi';
import { modelModeAtom } from '@/jotai/modelJotai';

import { RecommendData, RecommendList } from '@/types/ProductType';

export type StudioMode = 'imageInput' | 'imageSelection';

/**
 * Studio
 * AI 스타일 분석의 컨테이너를 담당하며 업로드 형식(mode="imageInput")과
 * 데이터 탐색 형식(mode="imageSelection")을 구분하여 내부 위젯과 분석 결과 레이아웃을 표출합니다.
 */
export default function Studio({ mode }: { mode: StudioMode }) {
  // 상태 전이 시 UI 끊김을 막기 위한 Transition Hook 적용
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResultView = searchParams.get('view') === 'result';

  // [상태 관리]
  const [results, setResults] = useState<RecommendList | null>(null); // 분석 결과 리스트
  const [analysisImage, setAnalysisImage] = useState<string | null>(null); // 현재 분석 대상 이미지
  const [analysisName, setAnalysisName] = useState<string | undefined>(undefined); // 현재 분석 대상 상품명
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석 중 로딩 상태

  const [history, setHistory] = useAtom(analysisHistoryAtom);
  const [activeHistory, setActiveHistory] = useAtom(activeHistoryAtom);
  const [modelMode] = useAtom(modelModeAtom);
  const uploadRef = React.useRef<UploadPanelRef>(null);

  // 현재 표시 화면 전환(view 파라미터 유무) 감지 및 화면 리셋
  useEffect(() => {
    if (!isResultView) {
      setResults(null);
      setIsAnalyzing(false);
      setActiveHistory(null);
    }
  }, [isResultView, setActiveHistory]);

  // 진입 시 가장 마지막에 조회했던 히스토리 데이터를 활성화 상태로 복원
  useEffect(() => {
    if (isResultView) {
      if (activeHistory) {
        setAnalysisImage(activeHistory.sourceImage);
        setAnalysisName(activeHistory.productName);
        setResults(activeHistory.results || null);
        setIsAnalyzing(false);
      } else if (history.length > 0 && !results) {
        // 최근 기록 탐색
        const recent = history[0];
        setAnalysisImage(recent.sourceImage);
        setAnalysisName(recent.productName);
        setResults(recent.results || null);
        setIsAnalyzing(false);
      }
    }
  }, [activeHistory, isResultView, history, results]);

  // 선택 모델(512 <-> 768) 변환을 감지하여 불일치 예방용 캐시 제거 및 화면 리셋
  const prevModelModeRef = React.useRef(modelMode);

  useEffect(() => {
    if (prevModelModeRef.current !== modelMode) {
      prevModelModeRef.current = modelMode;
      if (isResultView) {
        setResults(null);
        setActiveHistory(null);
        setIsAnalyzing(false);
        router.push(pathname, { scroll: false });
      }
    }
  }, [modelMode, isResultView, pathname, router, setActiveHistory]);

  // 분석 완료 후 데이터를 주입받아 표시 상태로 전환
  const handleSearchResult = (data: RecommendList | null) => {
    setResults(data);
    setIsAnalyzing(false);

    // 분석 완료 시 로컬 스토리지 등에 참조 히스토리 보관 및 주소창 포인터 동기화
    if (data) {
      if (!isResultView) {
        router.push(`${pathname}?view=result`, { scroll: false });
      }

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

  // 이미지 파일이 확정된 순간 분석 대기 화면으로 상태 변경
  const handleAnalysisStart = (imgUrl: string, name?: string) => {
    setAnalysisImage(imgUrl);
    setAnalysisName(name);
    setIsAnalyzing(true);
  };

  // 진행 중이던 요청 폐기 및 초기 화면 복원
  const handleCancelAnalysis = () => {
    setIsAnalyzing(false);
    setResults(null);
  };

  // 파일을 직접적으로 전달받는 AnalysisSection 내 이벤트 핸들링
  const handleFileAnalysis = (file: File) => {
    // 1. 초기 UI 상태 변경 (로딩 시작) - startTransition 외부에 두어 즉시 반영 (React 18 트랜지션 무시 방지)
    setIsAnalyzing(true);
    setResults(null);

    startTransition(async () => {
      try {

        // 2. 이미지 모바일 통신을 고려하여 경량 프로필 이미지로 리사이징
        const { dataUrl, blob } = await resizeImage(file, 300);
        setAnalysisImage(dataUrl);
        setAnalysisName(file.name);

        // 3. 엔진 선택에 따른 비동기 인퍼런스 호출
        const resizedFile = new File([blob], file.name, { type: file.type || 'image/jpeg' });
        const uploadResult: RecommendList = modelMode === '768'
          ? await image768Analyze(resizedFile)
          : await imageAnalyze(resizedFile);

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

  // 장시간 처리 오류(GPU 지연 등)에 대비한 안전 30초 데드라인 설정
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

  // 히스토리나 분석 화면에서 원본 메뉴로 탈출
  const handleBackToSearch = () => {
    setResults(null);
    setActiveHistory(null);
    setIsAnalyzing(false);
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="space-y-6 lg:space-y-10 max-w-7xl mx-auto w-full px-4 lg:px-0">
      <AnimatePresence mode="wait">
        {results ? (
          /* [뷰 전환 A] 분석이 종료되었고 정상적 응답이 반환된 경우 (보고서 표시 뷰) */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-10 pb-20"
          >
            {/* Card 1: 분석 보고서 섹션 (DNA Matrix) */}
            <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border-2 border-neutral-100 dark:border-white/10 shadow-xl p-6 lg:p-12">
              <button
                onClick={handleBackToSearch}
                className="flex items-center gap-2 text-violet-600 font-bold text-xs uppercase tracking-widest hover:underline mb-10 transition-all hover:gap-3"
              >
                ← 뒤로가기
              </button>
              <AnalysisSection
                sourceImage={analysisImage}
                productName={analysisName}
                isLoading={isAnalyzing}
                radarData={[
                  { styleName: results?.targetTop1Style || '', score: results?.targetTop1Score || 0 },
                  { styleName: results?.targetTop2Style || '', score: results?.targetTop2Score || 0 },
                  { styleName: results?.targetTop3Style || '', score: results?.targetTop3Score || 0 },
                ].filter(s => s.styleName)}
                isSelectionMode={mode === 'imageSelection'}
                onImageUpload={handleFileAnalysis}
              />
            </div>

            {/* Card 2: 첫 번째 추천 결과(내부 데이터) 그리드 섹션 */}
            <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border-2 border-neutral-100 dark:border-white/10 shadow-xl p-6 lg:p-12 h-200 lg:h-225 flex flex-col">
              <ResultGrid
                isActive={true}
                isLoading={isPending && isAnalyzing}
                products={results.internalProducts || []}
                title="9oz 스타일 목록"
                showCartButton={false}
              />
            </div>

            {/* Card 3: 두 번째 추천 결과 그리드 섹션 (추가) */}
            <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border-2 border-neutral-100 dark:border-white/10 shadow-xl p-6 lg:p-12 h-200 lg:h-225 flex flex-col">
              <ResultGrid
                isActive={true}
                isLoading={isPending && isAnalyzing}
                products={results.naverProducts || []}
                title="외부 상품 추천 목록"
                showCartButton={true}
                top1Style={results?.targetTop1Style}
                onProductClick={(product: RecommendData) => {
                  if (product.productLink) {
                    window.open(product.productLink, '_blank');
                  }
                }}
              />
            </div>
          </motion.div>
        ) : (
          /* [뷰 전환 B] 아직 실행된 적 없는 초기 접근 상태일 경우 (입력 대기 패널 뷰) */
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