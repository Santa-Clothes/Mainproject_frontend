'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FaArrowRotateLeft, FaArrowsRotate, FaCheck, FaMagnifyingGlass, FaChartLine, FaCalendarDays, FaShirt } from 'react-icons/fa6';
import { ProductData, RecommendData, RecommendList512, RecommendResult768, SelectionRecommendResult } from '@/types/ProductType';
import Image from 'next/image';
import ProductCard from './ProductCard';
import { getProductList, getRecommendList, getRecommend768List } from '@/app/api/productservice/productapi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { modelModeAtom } from '@/jotai/modelJotai';

interface SelectionPanelProps {
  onResultFound: (results: SelectionRecommendResult | null, category?: string) => void;
  onAnalysisStart: (imgUrl: string, name?: string) => void;
  onAnalysisCancel: () => void;
  isLoading: boolean; // isPending 대신 제어 가능한 isLoading 사용
  startTransition: React.TransitionStartFunction;
}

/**
 * SelectionPanel
 * 미리 설정된 카테고리별 상품 데이터베이스를 탐색하고,
 * 특정 상품을 선택해 유사 스타일 분석을 시작할 수 있는 탐색 패널 컴포넌트입니다.
 */
export default function SelectionPanel({
  onResultFound,
  onAnalysisStart,
  onAnalysisCancel,
  startTransition,
  isLoading
}: SelectionPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modelMode] = useAtom(modelModeAtom); // 현재 분석 모드 (512 / 768) 가져오기

  // 상태 관리
  const [isFetching, setIsFetching] = useState(false);  // 전체 데이터 로딩 상태
  const [isFiltering, setIsFiltering] = useState(false); // 필터링 시각적 피드백 상태
  const [allProducts, setAllProducts] = useState<ProductData[]>([]); // 원본 상품 데이터
  const [displayCount, setDisplayCount] = useState(24); // 현재 화면에 렌더링할 상품 개수 (무한 스크롤)

  // URL 쿼리 파라미터에서 현재 선택된 정보 추출
  const selectedCat = searchParams.get('cat') || 'All';
  const selectedProductId = searchParams.get('pid') || null;

  // 카테고리 분류 목록
  const categories = ['All', "블라우스", "블라우스나시", "가디건", "코트", "데님", "이너웨어", "자켓", "점퍼", "니트나시", "니트", "레깅스", "원피스", "바지", "스커트", "슬랙스", "세트", "티셔츠나시", "티셔츠", "베스트이너", "베스트", "남방"];

  // 전체 데이터베이스 초도 페칭
  useEffect(() => {
    const initLoad = async () => {
      setIsFetching(true);
      try {
        const data = await getProductList();
        setAllProducts(data);
      } catch (e) {
        console.error("제품 리스트 로드 실패:", e);
      } finally {
        setIsFetching(false);
      }
    };
    initLoad();
  }, []);

  // 카테고리 전환 시 화면 표출 개수 초기화
  useEffect(() => {
    setDisplayCount(24);
  }, [selectedCat]);

  // 현재 선택된 카테고리에 맞는 상품 배열 정제
  const filteredProducts = useMemo(() => {
    const results = !selectedCat || selectedCat === 'All'
      ? allProducts
      : allProducts.filter(p => p.categoryName === selectedCat);
    return results;
  }, [selectedCat, allProducts]);

  // DOM 렌더링 부하 방지를 위한 가상 표출 배열 스플라이싱
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  // 리스트 스크롤 바닥 도달 시 표출 개수 동적 증가
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      if (displayCount < filteredProducts.length) {
        setDisplayCount(prev => prev + 24);
      }
    }
  }, [displayCount, filteredProducts.length]);

  const [analyzingTargetId, setAnalyzingTargetId] = useState<string | null>(null);

  // 카테고리 탭 클릭 시 이벤트 처리 및 라우터 매개변수 동기화
  const selectCategory = (cat: string) => {
    if (selectedCat === cat || isFetching) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('cat', cat);
    params.delete('pid'); // 카테고리 간 전환 시 선택 상태 해제
    router.replace(`?${params.toString()}`, { scroll: false });

    setIsFiltering(true);
    // onResultFound(null); Studio.tsx의 상태 초기화를 방지하기 위해 분석 시작/취소만 사용
    setTimeout(() => setIsFiltering(false), 300);
  };

  // 단일 상품 클릭 시 분석 대상 지정 프로세스
  const selectProduct = (product: ProductData) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedProductId === product.productId) {
      params.delete('pid'); // 이미 선택된 상품이면 해제
    } else {
      params.set('pid', product.productId);
      const safeImageUrl = product.imageUrl || (product as any).image_url || (product as any).image || '';
      const safeName = product.productName || (product as any).name || 'Unknown Product';
      onAnalysisStart(safeImageUrl, safeName); // 분석 미리보기용 데이터 전달
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const analysisIdRef = React.useRef(0);

  // 선택된 대상을 기준으로 스타일 유사 분석을 백엔드에 요청
  const startAnalysis = (product?: ProductData) => {
    const targetId = product?.productId || selectedProductId;
    if (!targetId) return;

    const currentAnalysisId = ++analysisIdRef.current;

    setAnalyzingTargetId(targetId);

    // 트랜지션 블록 외부에서 상태를 즉각 동기화해 React 18 UI 지연 블록 회피
    const targetProduct = product || allProducts.find(p => p.productId === targetId);
    if (targetProduct) {
      const safeImageUrl = targetProduct.imageUrl || (targetProduct as any).image_url || (targetProduct as any).image || '';
      const safeName = targetProduct.productName || (targetProduct as any).name || 'Unknown Product';
      onAnalysisStart(safeImageUrl, safeName);
    }

    startTransition(async () => {
      try {
        // 현재 모드에 따라 768 고정밀 분석 또는 일반 분석 호출
        const result: any = modelMode === '768'
          ? await getRecommend768List(targetId)
          : await getRecommendList(targetId);

        // 취소 버튼이 눌려 ID가 변경됐다면 화면 전환 스킵
        if (currentAnalysisId !== analysisIdRef.current) return;

        if (result && !Array.isArray(result)) {
          console.log("result:", result);
          onResultFound(result, selectedCat || 'All');
        } else {
          alert("스타일 분석에 실패했습니다.");
          onResultFound(null);
        }
      } catch (e) {
        console.error("검색 실패:", e);
        alert("스타일 분석 중 오류가 발생했습니다.");
        onResultFound(null);
      } finally {
        setAnalyzingTargetId(null);
      }
    });
  };

  // 모든 검색 필터 및 활성화 요소 해제
  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('cat');
    params.delete('pid');
    router.replace(`?${params.toString()}`, { scroll: false });
    onResultFound(null);
  };

  return (
    <div className="flex flex-col h-full gap-y-6 overflow-hidden relative p-4 md:p-8">
      {/* 전체 카드 로딩 오버레이 (초기 진입 시에만) */}
      {isFetching && (
        <div className="absolute inset-x-0 inset-y-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md rounded-[inherit]">
          <div className="w-20 h-20 bg-white dark:bg-black rounded-full shadow-2xl flex items-center justify-center border border-neutral-100 dark:border-white/10 mb-6">
            <FaArrowsRotate className="animate-spin text-violet-600" size={32} />
          </div>
          <p className="text-[12px] font-black text-neutral-800 dark:text-white uppercase tracking-widest">Syncing Catalog...</p>
          <p className="mt-2 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Please Wait</p>
        </div>
      )}

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
                analysisIdRef.current += 1; // 진행 중인 API 스킵
                onAnalysisCancel();
              }}
              className="mt-4 px-6 py-2.5 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all shadow-xl"
            >
              분석 취소
            </button>
          </div>
        </div>
      )}
      {/* 1. 고정 영역: 카테고리 칩 및 검색 시작 버튼 */}
      <div className="flex-none space-y-4">
        <div className={`flex flex-wrap justify-center gap-3 transition-all duration-500 ${isFetching ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => selectCategory(cat)}
              className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all
                ${selectedCat === cat
                  ? 'bg-violet-600 text-white border-violet-600 shadow-md scale-105'
                  : 'bg-transparent text-neutral-400 border-neutral-300 dark:border-white/10 hover:border-violet-400 hover:text-violet-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* 2. 스크롤 영역: 상품 그리드 리스트 */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest">
          Category: <span className="font-extrabold normal-case text-xs text-violet-500">{selectedCat}</span>
          <span className="ml-2 text-neutral-400 font-normal">({filteredProducts.length.toLocaleString()} items)</span>
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-4 py-2 flex flex-row items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
            <FaChartLine size={10} className="text-neutral-500 dark:text-neutral-400" />
            <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">최근 1년 판매량 기준 정렬</span>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-violet-600 transition-all hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg active:scale-95 group"
            title="필터 및 선택 초기화"
          >
            <FaArrowRotateLeft size={16} className="group-hover:-rotate-45 transition-transform duration-300" />
            <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
          </button>
        </div>
      </div>
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pr-4 custom-scrollbar min-h-0 border-t border-neutral-200 dark:border-white/10"
      >
        {isFiltering ? (
          /* 필터 갱신 중 표시 (하단 리스트 영역) */
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <FaArrowsRotate className="animate-spin text-violet-600" size={32} />
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Updating View...</p>
          </div>
        ) : selectedCat ? (
          /* 상품 리스트 노출 */
          <div className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-4 pb-8">
              {/* 상품 목록 */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 pb-20">
              {visibleProducts.map((product, idx) => (
                <div
                  key={`${product.productId}-${idx}`}
                  // 대량 렌더링 성능 최적화 속성 유지
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
                >
                  <ProductCard
                    product={{
                      productId: product.productId,
                      title: product.productName,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      productLink: "", // 리스트 탐색용이므로 링크는 비워둠
                      similarityScore: undefined // 탐색 단계이므로 유사도 점수 제외
                    }}
                    index={idx}
                    // onAnalyzeClick: Analyze trigger
                    onAnalyzeClick={() => startAnalysis(product)}
                    isAnalyzing={isLoading && analyzingTargetId === product.productId}
                    onClick={() => selectProduct(product)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 카테고리 선택 전 빈 화면 */
          <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900/50 rounded-[3rem] py-20">
            <div className="w-20 h-20 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-300 mb-8 border border-neutral-100 shadow-inner">
              <FaShirt size={40} className="animate-pulse" />
            </div>
            <p className="text-xl font-bold text-neutral-500 uppercase tracking-[0.2em] text-center leading-loose">
              상단의 카테고리를 선택해주세요.
            </p>
          </div>
        )}
      </div>
    </div >
  );
}