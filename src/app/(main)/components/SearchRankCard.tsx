'use client';

import React from 'react';
import DashboardCard from '../dashboard/components/DashboardCard';
import { SiNaver } from 'react-icons/si';

interface Trend {
    percentStr: string;
    style: string;
    value: number;
}

interface RankProps {
    trends: Trend[];
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
    className?: string;
    highlightStyle?: string | null;
}

/**
 * SearchRankCard
 * 검색량 기반 인기 쇼핑 스타일 트렌드를 1위~5위까지의 순위 카드 형태로 표시합니다.
 */
const SearchRankCard: React.FC<RankProps> = ({ trends, isLoading, error, onRetry, className = "", highlightStyle }) => {
    const listRef = React.useRef<HTMLDivElement>(null);
    const highlightedRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (highlightedRef.current && listRef.current) {
            const container = listRef.current;
            const element = highlightedRef.current;

            // 컨테이너 중앙에 배치하도록 내부에서만 스크롤 위치 계산
            const elementTop = element.offsetTop;
            const elementHeight = element.clientHeight;
            const containerHeight = container.clientHeight;

            const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);

            container.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
        }
    }, [highlightStyle, trends, isLoading]);

    return (
        <DashboardCard
            title="검색어 순위"
            subtitle="네이버 쇼핑 트렌드"
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            lgColSpan={1}
            className={`${className}`}
            topRight={
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm shadow-lg transform group-hover:scale-110 transition-transform bg-emerald-500 shadow-emerald-100 dark:shadow-none">
                    <SiNaver size={15} />
                </div>
            }
        >
            {/* 스크롤 가능한 영역 설정: 부모의 aspect-3/4 높이에 맞게 가득 채움 */}
            <div
                ref={listRef}
                className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-2 h-full"
            >
                {/* 분석 완료: 검색 순위 리스트 표시 (수치 제외) */}
                {trends.map((trend, i) => {
                    const isHighlighted = highlightStyle && trend.style === highlightStyle;

                    return (
                        <div
                            key={i}
                            ref={isHighlighted ? highlightedRef : null}
                            className={`flex items-center py-3.5 px-5 rounded-2xl border transition-all hover:translate-x-1 group shadow-sm shrink-0 ${isHighlighted
                                ? "bg-violet-600 border-violet-500 ring-2 ring-violet-400/50 shadow-violet-200 dark:shadow-none"
                                : "bg-white dark:bg-neutral-900/10 border-neutral-100 dark:border-white/5 hover:border-violet-300 dark:hover:border-violet-800"
                                }`}
                        >
                            <div className="flex items-center gap-4 w-full">
                                {/* 순위 인덱스 */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-normal italic text-sm shadow-sm transition-colors shrink-0 ${isHighlighted ? "bg-white text-violet-600" : "bg-violet-600 text-white"
                                    }`}>
                                    {i + 1}
                                </div>

                                {/* 스타일 명칭 */}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className={`text-xs font-bold uppercase tracking-widest transition-colors truncate ${isHighlighted ? "text-white" : "text-neutral-900 dark:text-white group-hover:text-violet-600"
                                        }`}>
                                        {trend?.style || 'Analysis Pending'}
                                    </span>
                                </div>
                                {isHighlighted && (
                                    <div className="shrink-0 bg-white/20 px-2 py-0.5 rounded-full ml-1">
                                        <span className="text-[8px] font-black text-white uppercase tracking-tighter italic">Match</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </DashboardCard>
    );
};

export default SearchRankCard;
