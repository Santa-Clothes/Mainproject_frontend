'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FaArrowRotateLeft, FaArrowsRotate, FaCheck, FaFingerprint, FaMagnifyingGlass, FaChartLine, FaCalendarDays, FaShirt } from 'react-icons/fa6';
import { ProductData, RecommendData, RecommendList } from '@/types/ProductType';
import Image from 'next/image';
import ProductCard from './ProductCard';
import { getProductList, getRecommendList } from '@/app/api/productservice/productapi';
import { useRouter, useSearchParams } from 'next/navigation';

interface SelectionPanelProps {
  onResultFound: (results: RecommendList | null, category?: string) => void;
  onAnalysisStart: (imgUrl: string, name?: string) => void;
  onAnalysisCancel: () => void;
  isLoading: boolean; // isPending 대신 제어 가능한 isLoading 사용
  startTransition: React.TransitionStartFunction;
}

/**
 * SelectionPanel: 기존 데이터베이스 내 카테고리별 상품을 탐색하고, 특정 상품을 선택하여 비슷한 스타일을 검색하는 컴포넌트
 * Explore Catalog 페이지(`/main/selectionpage`)에서 입력 대기 상태로 사용되며,
 * 카테고리 필터링과 무한 스크롤 형태의 상품 탐색을 제공합니다.
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

  // 상태 관리
  const [isFetching, setIsFetching] = useState(false);  // 전체 데이터 로딩 상태
  const [isFiltering, setIsFiltering] = useState(false); // 필터링 시각적 피드백 상태
  const [allProducts, setAllProducts] = useState<ProductData[]>([]); // 원본 상품 데이터
  const [displayCount, setDisplayCount] = useState(24); // 현재 화면에 렌더링할 상품 개수 (무한 스크롤)

  // URL 쿼리 파라미터에서 현재 선택된 정보 추출
  const selectedCat = searchParams.get('cat') || 'All';
  const selectedProductId = searchParams.get('pid') || null;

  // 프로젝트에서 사용하는 카테고리 목록
  const categories = /* ['테스트 용 버튼'] //테스트용 임시로 버튼하나만 */
    ['All', "블라우스", "블라우스나시", "가디건", "코트", "데님", "이너웨어", "자켓", "점퍼", "니트나시", "니트", "레깅스", "원피스", "바지", "스커트", "슬랙스", "세트", "티셔츠나시", "티셔츠", "베스트이너", "베스트", "남방"];

  /**
   * 1. 초기 데이터 로드 (컴포넌트 마운트 시 1회 실행)
   */
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

  /**
   * 2. 카테고리 변경 시 출력 개수 초기화 (성능 최적화)
   */
  useEffect(() => {
    setDisplayCount(24);
  }, [selectedCat]);

  /**
   * 3. 필터링 로직 (메모리 내 전체 결과에서 카테고리 필터링)
   */
  const filteredProducts = useMemo(() => {
    const results = !selectedCat || selectedCat === 'All'
      ? allProducts
      : allProducts.filter(p => p.categoryName === selectedCat);
    return results;
  }, [selectedCat, allProducts]);

  /**
   * 4. [핵심] 실제 화면에 보일 부분만 슬라이싱하여 렌더링 부하 감소
   */
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  /**
   * 5. 무한 스크롤 핸들러 (리스트 바닥 감지 시 렌더링 개수 증가)
   */
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      if (displayCount < filteredProducts.length) {
        setDisplayCount(prev => prev + 24);
      }
    }
  }, [displayCount, filteredProducts.length]);

  /**
   * 카테고리 선택 처리
   */
  const selectCategory = (cat: string) => {
    if (selectedCat === cat || isFetching) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('cat', cat);
    params.delete('pid'); // 카테고리 변경 시 선택 상품 해제
    router.replace(`?${params.toString()}`, { scroll: false });

    setIsFiltering(true);
    onResultFound(null); // 이전 결과 초기화
    setTimeout(() => setIsFiltering(false), 300);
  };

  /**
   * 개별 상품 선택 처리
   */
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

  /**
   * [핵심] 특정 상품으로 유사 스타일 검색 시작
   */
  const startAnalysis = (product?: ProductData) => {
    const targetId = product?.productId || selectedProductId;
    if (!targetId) return;

    startTransition(async () => {
      try {
        // [수정] 새로고침 직후 등 onAnalysisStart가 누락되어 회색박스(No Image)가 뜨는 현상 방지
        const targetProduct = product || allProducts.find(p => p.productId === targetId);
        if (targetProduct) {
          const safeImageUrl = targetProduct.imageUrl || (targetProduct as any).image_url || (targetProduct as any).image || '';
          const safeName = targetProduct.productName || (targetProduct as any).name || 'Unknown Product';
          onAnalysisStart(safeImageUrl, safeName);
        }

        const result: RecommendList | null = await getRecommendList(targetId);

        onResultFound(result, selectedCat || 'All');
      } catch (e) {
        console.error("검색 실패:", e);
      }
    });
  };

  /**
   * 필터 및 선택 초기화
   */
  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('cat');
    params.delete('pid');
    router.replace(`?${params.toString()}`, { scroll: false });
    onResultFound(null);
  };

  return (
    <div className="flex flex-col h-full gap-y-8 overflow-hidden relative p-6 lg:p-12">
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
      <div className="flex-none space-y-6">
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
          <span className="ml-2 text-neutral-400 font-normal">({filteredProducts.length} items)</span>
        </span>
        {/* Data Insights Badges */}
        <div className="flex flex-wrap gap-2.5">
          <div className="px-4 py-2 flex flex-row items-center gap-2.5">
            <FaChartLine size={10} className="text-neutral-500 dark:text-neutral-400" />
            <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">최근 1년 기준 판매량 순위</span>
          </div>
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
              <div className="flex items-center justify-end">
                <button onClick={handleReset} className="text-neutral-500 hover:text-violet-600 transition-colors">
                  <FaArrowRotateLeft size={14} />
                </button>
              </div>


            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 pb-20">
              {visibleProducts.map((product, idx) => (
                <div
                  key={product.productId}
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
                    selected={selectedProductId === product.productId}
                    onAnalyzeClick={() => startAnalysis(product)}
                    isAnalyzing={isLoading && selectedProductId === product.productId}
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