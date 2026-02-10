'use client';

import React from 'react';
import { FaLayerGroup, FaMagnifyingGlass, FaWaveSquare } from 'react-icons/fa6';
import ProductCard from './ProductCard';
import { ProductType, RecommendData } from '@/types/ProductType';

interface ResultGridProps {
    title?: string;
    subtitle?: string;
    isActive?: boolean;
    isPending?: boolean; // AI 분석 진행 여부
    products?: RecommendData[] | null;
    onProductClick?: (product: RecommendData) => void;
}

/**
 * ResultGrid: Studio 페이지에서 검색 결과나 추천 상품들을 그리드 형태로 표시합니다.
 * AI 분석 중인 경우 로딩 상태를 시각화합니다.
 */
const ResultGrid: React.FC<ResultGridProps> = ({
    title = "Archive Selection",
    subtitle = "Inventory Scan",
    isActive = false,
    isPending = false,
    products = null,
    onProductClick
}) => {
    /**
     * [AI Vector Analysis Messages]
     * 2048차원의 잠재 벡터를 추출하고 백엔드 DB와 비교하는 동안 
     * 사용자에게 진행 상황을 시각적으로 알리기 위한 메시지 셋입니다.
     */
    const loadingMessages = [
        "Extracting Latent Vector (2048 dims)...",
        "Encoding Visual DNA Patterns...",
        "Querying Neural Archive Database...",
        "Matching Semantic Style Projections...",
        "Synthesizing Similarity Scores..."
    ];

    const [messageIndex, setMessageIndex] = React.useState(0);

    React.useEffect(() => {
        if (!isPending) {
            setMessageIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [isPending]);

    return (
        <div className="space-y-10 py-10">
            {/* Header Section: 경계선을 명확히 하여 영역 분리 */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-neutral-200 pb-8 dark:border-white/5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                        <FaLayerGroup size={10} className="text-violet-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{subtitle}</span>
                    </div>
                    <h3 className="font-serif text-4xl italic tracking-tighter text-neutral-900 dark:text-white">
                        {title}
                    </h3>
                </div>

                {/* AI Similarity Badge: 보라색 포인트 유지 */}
                {isActive && (
                    <div className="flex items-center gap-3 rounded-full border border-violet-100 bg-violet-50 px-6 py-2.5 transition-colors hover:bg-violet-600 hover:text-white dark:border-violet-800 dark:bg-violet-900/10 dark:hover:bg-violet-700 group shadow-sm">
                        {/* animate-pulse는 Tailwind 기본 내장 기능입니다 */}
                        <FaWaveSquare size={10} className="text-violet-400 group-hover:text-white animate-pulse" />
                        <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-violet-700 group-hover:text-white dark:text-violet-400">
                            DNA Similarity:
                            <span className="font-serif text-[10px] italic">98.2%</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Content Area: 로딩 상태, 결과 존재 여부에 따른 조건부 렌더링 */}
            {isPending ? (
                /* [1. 버퍼 처리 및 로딩 상태] AI 분석 중 (2048 벡터 추출 및 DB 비교) */
                <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-gray-50/50 dark:bg-white/5 py-32 border border-violet-100/50 dark:border-violet-500/10 backdrop-blur-sm">
                    <div className="relative mb-10">
                        {/* 프리미엄 로딩 링 애니메이션 */}
                        <div className="h-24 w-24 rounded-full border-t-2 border-r-2 border-violet-600 animate-spin"></div>
                        <div className="h-24 w-24 rounded-full border-b-2 border-l-2 border-indigo-400 animate-spin absolute inset-0 [animation-direction:reverse] [animation-duration:1.5s] opacity-30"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FaWaveSquare className="text-violet-500 animate-pulse" size={20} />
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <p className="text-[11px] font-bold text-black dark:text-white uppercase tracking-[0.3em] h-4">
                            {loadingMessages[messageIndex]}
                        </p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest animate-pulse font-medium">
                            Neural Processing in progress
                        </p>
                    </div>
                </div>
            ) : (isActive || products) && products ? (
                /* [2. 결과 출력 상태] 분석 완료 후 데이터 렌더링 */
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((item, idx) => (
                        <ProductCard
                            key={item.productId}
                            product={item}
                            index={idx}
                            onClick={() => onProductClick?.(item)}
                        />
                    ))}
                </div>
            ) : (
                /* [3. 대기 상태] 사용자의 입력을 기다리는 기본 상태 */
                <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-neutral-200 bg-white dark:bg-neutral-900/50 py-24 transition-colors hover:bg-neutral-100 dark:border-white/5 dark:hover:bg-white/10 group">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-neutral-100 bg-white text-neutral-200 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:text-violet-500 dark:border-white/5 dark:bg-neutral-800 dark:text-neutral-700">
                        <FaMagnifyingGlass size={20} className="animate-pulse" />
                    </div>
                    <p className="max-w-xs text-center text-[10px] font-bold uppercase tracking-widest leading-loose text-neutral-400 transition-colors group-hover:text-violet-600 dark:text-neutral-600">
                        Awaiting parameters <br /> to initialize curation engine
                    </p>
                </div>
            )}
        </div>
    );
};

export default ResultGrid;
