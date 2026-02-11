'use client';

import React from 'react';
import DashboardCard from './DashboardCard';
import { FaArrowTrendUp } from 'react-icons/fa6';

interface Trend {
    percentStr: string;
    style: string;
    value: number;
}

interface Props {
    trends: Trend[];
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}

/**
 * SearchRankCard: 사용자 검색량 기준 상위 5개 트렌드를 순위 리스트 형태로 표시합니다.
 * 수치를 배제하고 명칭과 순위 위주의 깔끔한 UI를 제공합니다.
 */
const SearchRankCard: React.FC<Props> = ({ trends, isLoading, error, onRetry }) => {
    return (
        <DashboardCard
            title="Search Rank"
            subtitle="Top 5 Trends"
            error={error}
            onRetry={onRetry}
            lgColSpan={1}
            className="min-h-72"
            topRight={
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-600 rounded-full shadow-md">
                    <FaArrowTrendUp size={9} className="text-white" />
                    <span className="text-[7px] font-bold text-white uppercase tracking-widest">Rank</span>
                </div>
            }
        >
            <div className="flex flex-col h-full space-y-2">
                {isLoading ? (
                    /* 로딩 중: 스켈레톤 행 표시 */
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center p-2 rounded-2xl bg-gray-50/50 dark:bg-neutral-800/20 animate-pulse">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 dark:bg-neutral-700 rounded-xl"></div>
                                <div className="space-y-1">
                                    <div className="h-2 w-24 bg-gray-100 dark:bg-neutral-700 rounded-full"></div>
                                    <div className="h-1.5 w-16 bg-gray-50 dark:bg-neutral-800 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    /* 분석 완료: 검색 순위 리스트 표시 (수치 제외) */
                    trends.slice(0, 5).map((trend, i) => (
                        <div
                            key={i}
                            className="flex items-center p-2 rounded-2xl border border-neutral-100 dark:border-white/5 bg-white dark:bg-neutral-900/10 hover:border-violet-300 dark:hover:border-violet-800 transition-all hover:translate-x-1 group shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                {/* 순위 인덱스 */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-serif italic text-sm shadow-sm transition-colors ${i === 0 ? 'bg-violet-600 text-white' : 'bg-gray-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'
                                    }`}>
                                    {i + 1}
                                </div>

                                {/* 스타일 명칭 */}
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest group-hover:text-violet-600 transition-colors">
                                        {trend?.style || 'Analysis Pending'}
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Style DNA Matrix</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardCard>
    );
};

export default SearchRankCard;
