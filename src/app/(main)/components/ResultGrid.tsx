'use client';

import React from 'react';
import { FaLayerGroup, FaMagnifyingGlass, FaWaveSquare } from 'react-icons/fa6';
import ProductCard from './ProductCard';
import { ProductType, RecommendData } from '@/types/ProductType';

interface ResultGridProps {
    title?: string;
    subtitle?: string;
    isActive?: boolean;
    isLoading?: boolean; // 분석 진행 여부
    products?: RecommendData[] | null; // 추천 상품 리스트
    onProductClick?: (product: RecommendData) => void;
    showCartButton?: boolean; // 장바구니 버튼 표시 여부 제어
    top1Style?: string; // 가장 높은 확률의 스타일명 전달
}

/**
 * ResultGrid
 * AI 스타일 유사도 분석 결과를 상품 그리드 형태로 나열하여 표시하는 리스트 컴포넌트입니다.
 * 비동기 분석 대기, 로딩 스피너 및 완료 렌더링 상태 처리를 모두 포함합니다.
 */
const ResultGrid: React.FC<ResultGridProps> = ({
    title = "추천 목록",
    subtitle = "스타일 유사도 비교 결과",
    isActive = false,
    isLoading = false,
    products = null,
    showCartButton = true, // 기본적으로 분석 결과에서는 보이도록 설정
    top1Style,
    onProductClick
}) => {
    /**
     * 사용자의 지루함을 방지하기 위해 로딩 모달 내에서 순환 표출되는 분석 로딩 메시지 리스트
     */
    const loadingMessages = [
        "상품의 특징 데이터를 분석 중입니다...",
        "비슷한 스타일의 상품을 찾는 중입니다...",
        "데이터베이스 대조 작업 진행 중...",
        "분석된 스타일 결과 값을 매칭 중...",
        "최적의 추천 상품을 선별 중입니다..."
    ];

    const [messageIndex, setMessageIndex] = React.useState(0);
    // 지정된 간격으로 로딩 메시지 인덱스 순환
    React.useEffect(() => {
        if (!isLoading) {
            setMessageIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* 1. 고정 헤더 영역: 검색 통계 및 제목 */}
            <div className="flex-none flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-neutral-100 dark:border-white/10 pb-4 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                        <FaLayerGroup size={10} className="text-violet-500" />
                        <span className="text-[12px] font-bold uppercase tracking-widest">{subtitle}</span>
                    </div>
                    <h3 className="font-normal text-3xl lg:text-4xl italic tracking-tighter text-neutral-900 dark:text-white">
                        {title}
                    </h3>
                </div>

                {/* AI Similarity Badge: 분석 신뢰도를 시각적으로 표현 */}
                {/* {isActive && (
                    <div className="flex items-center gap-3 rounded-full border border-violet-100 bg-violet-50 px-6 py-2.5 hover:bg-violet-600 hover:text-white dark:border-violet-800 dark:bg-violet-900/10 dark:hover:bg-violet-700 group shadow-sm transition-all">
                        <FaWaveSquare size={10} className="text-violet-400 group-hover:text-white animate-pulse" />
                        <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-violet-700 group-hover:text-white dark:text-violet-400">
                            Latent Vector Similarity:
                            <span className="font-serif text-[10px] italic">98.2%</span>
                        </span>
                    </div>
                )} */}
            </div>

            {/* 2. 스크롤 가능한 결과 영역 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                {isLoading ? (
                    /* [상태 1] AI 분석 및 로딩 중 */
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-gray-50/50 dark:bg-white/5 py-32 border-2 border-violet-100 dark:border-violet-500/20 backdrop-blur-sm">
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
                                최적의 추천을 위해 스타일을 분석하고 있습니다
                            </p>
                        </div>
                    </div>
                ) : (isActive || products) && Array.isArray(products) ? (
                    /* [상태 2] 분석 완료 및 상품 리스트 노출 */
                    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 pb-12">
                        {products.map((item, idx) => (
                            <ProductCard
                                key={`${item.productId}-${idx}`}
                                product={item}
                                index={idx}
                                showCartButton={showCartButton}
                                top1Style={top1Style}
                                onClick={() => onProductClick?.(item)}
                            />
                        ))}
                    </div>
                ) : (
                    /* [상태 3] 분석 대기 중 (기본 상태) */
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-neutral-200 bg-white dark:bg-neutral-900/50 py-24 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:hover:bg-white/20 group">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-neutral-100 bg-white text-neutral-200 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:text-violet-500 dark:border-white/5 dark:bg-neutral-800 dark:text-neutral-700">
                            <FaMagnifyingGlass size={20} className="animate-pulse" />
                        </div>
                        <p className="max-w-xs text-center text-[10px] font-bold uppercase tracking-widest leading-loose text-neutral-400 transition-colors group-hover:text-violet-600 dark:text-neutral-600">
                            이미지를 업로드하거나 상품을 선택하여 <br /> 분석을 시작해보세요
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultGrid;
