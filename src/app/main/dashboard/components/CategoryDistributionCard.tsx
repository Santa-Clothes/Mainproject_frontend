'use client';

import React from 'react';
import DashboardCard from './DashboardCard';

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
 * CategoryDistributionCard: 쇼핑몰의 카테고리 분포 데이터를 시각화하는 카드 컴포넌트입니다.
 * 상위 5개의 카테고리 분포를 프로그레스 바 형태로 표시합니다.
 */
const CategoryDistributionCard: React.FC<Props> = ({ trends, isLoading, error, onRetry }) => {
    return (
        <DashboardCard
            title="Category Distribution"
            subtitle="NineOz Inventory Mapping"
            error={error}
            onRetry={onRetry}
            lgColSpan={2}
            className="min-h-[450px]"
            topRight={<p className="text-[9px] font-bold text-violet-400 dark:text-violet-400 uppercase tracking-widest">Total: {trends.length} Categories</p>}
        >
            <div className="space-y-8">
                {isLoading ? (
                    // 로딩 상태: 5개의 스켈레톤 아이템 표시
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-3 animate-pulse">
                            <div className="flex justify-between items-end">
                                <div className="h-2 w-20 bg-gray-100 dark:bg-neutral-800 rounded-full"></div>
                                <div className="h-2 w-32 bg-gray-50 dark:bg-neutral-900 rounded-full"></div>
                            </div>
                            <div className="h-1 w-full bg-gray-50 dark:bg-neutral-800 rounded-full"></div>
                        </div>
                    ))
                ) : (
                    // 데이터 로드 완료: 카테고리별 점수를 바 형태로 렌더링
                    trends.slice(0, 5).map((trend, i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">{trend?.style || 'Unknown'}</span>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{trend?.percentStr || (trend?.value || 0) + '%'}</span>
                            </div>
                            {/* 커스텀 프로그레스 바: 데이터 비율 표시 */}
                            <div className="h-1 w-full bg-gray-50 dark:bg-neutral-800 overflow-hidden rounded-full">
                                <div
                                    className="h-full bg-linear-to-r from-violet-500 to-indigo-600 transition-all duration-1000 ease-out"
                                    // value가 100을 넘을 수 있으므로 적절히 조정하거나 max 100 처리
                                    style={{ width: `${Math.min(trend?.value || 0, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardCard>
    );
};

export default CategoryDistributionCard;
