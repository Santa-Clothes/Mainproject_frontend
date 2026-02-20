'use client';

import React from 'react';
import DashboardCard from './DashboardCard';
import { SiNaver } from 'react-icons/si';

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
    className?: string;
}

/**
 * SearchRankCard: 사용자 검색량 기준 상위 5개 트렌드를 순위 리스트 형태로 표시합니다.
 * 수치를 배제하고 명칭과 순위 위주의 깔끔한 UI를 제공합니다.
 */
const SearchRankCard: React.FC<Props> = ({ trends, isLoading, error, onRetry, className = "" }) => {
    return (
        <DashboardCard
            title="Search Rank"
            subtitle="Naver Top 5 Trends"
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            lgColSpan={1}
            className={`${className} min-h-72`}
            topRight={

                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm shadow-lg transform group-hover:scale-110 transition-transform bg-emerald-500 shadow-emerald-100 dark:shadow-none">
                    <SiNaver size={15} />
                </div>

            }
        >
            <div className="flex flex-col h-full space-y-2">
                {/* 분석 완료: 검색 순위 리스트 표시 (수치 제외) */}
                {trends.slice(0, 5).map((trend, i) => (
                    <div
                        key={i}
                        className="flex items-center p-2 rounded-2xl border border-neutral-100 dark:border-white/5 bg-white dark:bg-neutral-900/10 hover:border-violet-300 dark:hover:border-violet-800 transition-all hover:translate-x-1 group shadow-sm"
                    >
                        <div className="flex items-center gap-2">
                            {/* 순위 인덱스 */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-normal italic text-sm shadow-sm transition-colors bg-violet-600 text-white`}>
                                {i + 1}
                            </div>

                            {/* 스타일 명칭 */}
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest group-hover:text-violet-600 transition-colors">
                                    {trend?.style || 'Analysis Pending'}
                                </span>
                                {/* <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Style DNA Matrix</span> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

export default SearchRankCard;
