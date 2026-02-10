'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

  // URL 상태와 동기화
  const selectedCat = searchParams.get('cat') || null;
  const selectedProductId = searchParams.get('pid') || null;

  const [allProducts, setAllProducts] = useState<ProductData[]>([]);

  const categories = ['All', "블라우스", "블라우스나시", "가디건", "코트", "데님", "이너웨어", "자켓", "점퍼", "니트나시", "니트", "레깅스", "원피스", "바지", "스커트", "슬랙스", "세트", "티셔츠나시", "티셔츠", "베스트이너", "베스트", "남방"];

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

  const filteredProducts = useMemo(() => {
    if (!selectedCat || selectedCat === 'All') return allProducts;
    return allProducts.filter(p => p.categoryName === selectedCat);
  }, [selectedCat, allProducts]);

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

  // [중요 수정] 이제 결과를 찾으면 부모 상태를 업데이트하고 끝냅니다.
  const startAnalysis = () => {
    if (!selectedProductId) return;

    startTransition(async () => {
      try {
        const results: RecommendData[] = await getRecommendList(selectedProductId);
        // 부모인 Studio 컴포넌트의 setResults를 호출하게 됩니다.
        // Studio는 results가 생기면 자동으로 Results 화면을 보여줄 것입니다.
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
    <div className="space-y-12">
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

      {/* 실행 버튼의 위치를 리스트 위로 올려 가독성을 확보했습니다. */}
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

      <div className="min-h-[500px] flex flex-col">
        {isFetching || isFiltering ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in duration-300">
            <FaArrowsRotate className="animate-spin text-violet-600" size={32} />
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {isFetching ? 'Caching Assets...' : 'Filtering Library...'}
            </p>
          </div>
        ) : selectedCat ? (
          <div className="space-y-6 pt-6 border-t border-neutral-200 dark:border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between pb-4">
              <span className="text-[9px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest">
                Reference: <span className="italic font-serif normal-case text-xs text-violet-500">{selectedCat}</span>
                <span className="ml-2 text-neutral-400 font-normal">({filteredProducts.length} items)</span>
              </span>
              <button onClick={handleReset} className="text-neutral-300 hover:text-violet-600 transition-colors">
                <FaArrowRotateLeft size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.productId}
                  onClick={() => selectProduct(product)}
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
          <div className="flex-1 py-24 flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-white/5 rounded-[3rem] bg-white dark:bg-neutral-900/50">
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