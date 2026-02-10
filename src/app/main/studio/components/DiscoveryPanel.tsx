'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FaArrowRotateLeft, FaArrowsRotate, FaCheck, FaFingerprint, FaMagnifyingGlass } from 'react-icons/fa6';
import { ProductData, RecommendData } from '@/types/ProductType';
import Image from 'next/image';
import { getProductList, getRecommendList } from '@/app/api/productService/productapi';
import { useRouter, useSearchParams } from 'next/navigation';

interface DiscoveryPanelProps {
  onResultFound: (results: RecommendData[] | null, category?: string) => void;
  onAnalysisStart: (imgUrl: string, name?: string) => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}

export default function DiscoveryPanel({
  onResultFound,
  onAnalysisStart,
  startTransition,
  isPending
}: DiscoveryPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isFetching, setIsFetching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [displayCount, setDisplayCount] = useState(24); // 초기 렌더링 개수 (배수 권장)

  const selectedCat = searchParams.get('cat') || null;
  const selectedProductId = searchParams.get('pid') || null;

  const categories = ['All', "블라우스", "블라우스나시", "가디건", "코트", "데님", "이너웨어", "자켓", "점퍼", "니트나시", "니트", "레깅스", "원피스", "바지", "스커트", "슬랙스", "세트", "티셔츠나시", "티셔츠", "베스트이너", "베스트", "남방"];

  // 1. 초기 데이터 로드
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

  // 2. 카테고리 변경 시 출력 개수 초기화
  useEffect(() => {
    setDisplayCount(24);
  }, [selectedCat]);

  // 3. 필터링 로직 (메모리 내 전체 결과)
  const filteredProducts = useMemo(() => {
    const results = !selectedCat || selectedCat === 'All'
      ? allProducts
      : allProducts.filter(p => p.categoryName === selectedCat);
    return results;
  }, [selectedCat, allProducts]);

  // 4. [핵심] 실제 화면에 보일 부분만 슬라이싱
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  // 5. 스크롤 이벤트 핸들러 (div에 연결됨)
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // 바닥에서 200px 정도 여유를 두고 다음 데이터 로드
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      if (displayCount < filteredProducts.length) {
        setDisplayCount(prev => prev + 24); // 24개씩 추가 렌더링
      }
    }
  }, [displayCount, filteredProducts.length]);

  const selectCategory = (cat: string) => {
    if (selectedCat === cat || isFetching) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('cat', cat);
    params.delete('pid');
    router.replace(`?${params.toString()}`, { scroll: false });

    setIsFiltering(true);
    onResultFound(null);
    setTimeout(() => setIsFiltering(false), 300);
  };

  const selectProduct = (product: ProductData) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedProductId === product.productId) {
      params.delete('pid');
    } else {
      params.set('pid', product.productId);
      onAnalysisStart(product.imageUrl, product.productName);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const startAnalysis = () => {
    if (!selectedProductId) return;
    startTransition(async () => {
      try {
        const results: RecommendData[] = await getRecommendList(selectedProductId);
        onResultFound(results, selectedCat || 'All');
      } catch (e) {
        console.error("검색 실패:", e);
      }
    });
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('cat');
    params.delete('pid');
    router.replace(`?${params.toString()}`, { scroll: false });
    onResultFound(null);
  };

  return (
    <div className="flex flex-col h-full gap-y-8 overflow-hidden">
      {/* 고정 영역: 카테고리 및 버튼 */}
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

        <button
          onClick={startAnalysis}
          disabled={!selectedProductId || isPending}
          className="w-full py-5 bg-violet-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full disabled:opacity-20 transition-all active:scale-[0.98] shadow-xl"
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-3">
              <FaArrowsRotate className="animate-spin" size={14} />
              <span>Analyzing Neural Patterns...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <FaMagnifyingGlass size={14} />
              <span>Scan Selected Reference</span>
            </div>
          )}
        </button>
      </div>

      {/* 스크롤 영역: onScroll 연결 필수 */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pr-4 custom-scrollbar min-h-0 border-t border-neutral-100 dark:border-white/5"
      >
        {isFetching || isFiltering ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <FaArrowsRotate className="animate-spin text-violet-600" size={32} />
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Caching Assets...</p>
          </div>
        ) : selectedCat ? (
          <div className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between pb-6">
              <span className="text-[9px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest">
                Reference: <span className="font-extrabold normal-case text-xs text-violet-500">{selectedCat}</span>
                <span className="ml-2 text-neutral-400 font-normal">({filteredProducts.length} items)</span>
              </span>
              <button onClick={handleReset} className="text-neutral-300 hover:text-violet-600 transition-colors">
                <FaArrowRotateLeft size={14} />
              </button>
            </div>

            {/* 그리드 영역: visibleProducts를 사용하여 렌더링 부하 감소 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-20">
              {visibleProducts.map(product => (
                <div
                  key={product.productId}
                  onClick={() => selectProduct(product)}
                  // 렌더링 최적화 속성 유지
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all 
                  ${selectedProductId === product.productId ? 'border-violet-600 shadow-2xl ring-4 ring-violet-600/10' : 'border-transparent hover:border-violet-200'}`}
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.productName}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {selectedProductId === product.productId && (
                    <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-violet-600 shadow-2xl">
                        <FaCheck size={18} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900/50 rounded-[3rem]">
            <div className="w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-300 mb-6 border border-neutral-100 shadow-inner">
              <FaFingerprint size={32} className="animate-pulse" />
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.15em] text-center leading-loose">
              Select a category above <br /> to initialize reference indexing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}