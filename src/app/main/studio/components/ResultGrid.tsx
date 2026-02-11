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
    products?: RecommendData[] | null; // 추천 상품 리스트
    onProductClick?: (product: RecommendData) => void;
}

/**
 * ResultGrid: AI 스타일 분석 결과를 그리드 형태로 표시하는 컴포넌트
 * 분석 중일 때는 세련된 로딩 애니메이션을 보여주고, 완료 후 결과 카드를 나열합니다.
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
     * [AI 심리적 시각화 메시지]
     * 실제 분석 과정(2048차원 벡터 추출 등)을 사용자에게 전문적으로 보여주기 위한 텍스트 리스트
     */
    const loadingMessages = [
        "Extracting Latent Vector (2048 dims)...",
        "Encoding Visual DNA Patterns...",
        "Querying Neural Archive Database...",
        "Matching Semantic Style Projections...",
        "Synthesizing Similarity Scores..."
    ];

    const [messageIndex, setMessageIndex] = React.useState(0);

    // 로딩 메시지 순환 타이머
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
        <div className="flex flex-col h-full min-h-0">
            {/* 1. 고정 헤더 영역: 검색 통계 및 제목 */}
            <div className="flex-none flex flex-col md:flex-row justify-between items-end gap-6 border-b border-neutral-100 dark:border-white/5 pb-6 mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                        <FaLayerGroup size={10} className="text-violet-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{subtitle}</span>
                    </div>
                    <h3 className="font-serif text-3xl lg:text-4xl italic tracking-tighter text-neutral-900 dark:text-white">
                        {title}
                    </h3>
                </div>

                {/* AI Similarity Badge: 분석 신뢰도를 시각적으로 표현 */}
                {isActive && (
                    <div className="flex items-center gap-3 rounded-full border border-violet-100 bg-violet-50 px-6 py-2.5 hover:bg-violet-600 hover:text-white dark:border-violet-800 dark:bg-violet-900/10 dark:hover:bg-violet-700 group shadow-sm transition-all">
                        <FaWaveSquare size={10} className="text-violet-400 group-hover:text-white animate-pulse" />
                        <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-violet-700 group-hover:text-white dark:text-violet-400">
                            DNA Similarity:
                            <span className="font-serif text-[10px] italic">98.2%</span>
                        </span>
                    </div>
                )}
            </div>

            {/* 2. 스크롤 가능한 결과 영역 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                {isPending ? (
                    /* [상태 1] AI 분석 및 로딩 중 */
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-gray-50/50 dark:bg-white/5 py-32 border border-violet-100/50 dark:border-violet-500/10 backdrop-blur-sm">
                        <div className="relative mb-10">
                            {/* 이중 링 스핀 애니메이션 */}
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
                    /* [상태 2] 분석 완료 및 상품 리스트 노출 */
                    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 pb-12">
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
                    /* [상태 3] 분석 대기 중 (기본 상태) */
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
        </div>
    );
};

export default ResultGrid;
