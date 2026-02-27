import React from 'react';
import { FaTag, FaGem, FaWaveSquare, FaBolt } from 'react-icons/fa6';

export default function Loading() {
    const skeletonMetrics = [
        { label: 'Metric One', icon: <FaBolt /> },
        { label: 'Metric Two', icon: <FaGem /> },
        { label: 'Metric Three', icon: <FaWaveSquare /> },
        { label: 'Metric Four', icon: <FaTag /> },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
            {/* 헤더 스켈레톤 */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="w-10 h-px bg-black/5 dark:bg-white/5"></span>
                    <div className="h-2 w-32 bg-gray-200 dark:bg-neutral-800 rounded-full"></div>
                </div>
                <div className="flex justify-between items-end">
                    <div className="h-14 w-96 bg-gray-200 dark:bg-neutral-800 rounded-2xl"></div>
                    <div className="space-y-2">
                        <div className="h-2 w-24 bg-gray-200 dark:bg-neutral-800 rounded-full ml-auto"></div>
                        <div className="h-2 w-32 bg-gray-100 dark:bg-neutral-900 rounded-full ml-auto"></div>
                    </div>
                </div>
            </div>

            {/* 지표 그리드 스켈레톤 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {skeletonMetrics.map((_, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-900/40 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-neutral-800"></div>
                            <div className="h-2 w-12 bg-gray-100 dark:bg-neutral-800 rounded-full"></div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-20 bg-gray-100 dark:bg-neutral-800 rounded-full"></div>
                            <div className="h-10 w-24 bg-gray-200 dark:bg-neutral-800 rounded-xl italic"></div>
                            <div className="h-2 w-28 bg-gray-50 dark:bg-neutral-900 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 메인 차트 영역 스켈레톤 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* 카테고리 분포 스켈레톤 */}
                <div className="lg:col-span-2 bg-white dark:bg-neutral-900/40 rounded-[3rem] border border-neutral-100 dark:border-white/5 p-12 space-y-12 shadow-sm">
                    <div className="flex justify-between items-end">
                        <div className="space-y-3">
                            <div className="h-2 w-32 bg-gray-100 dark:bg-neutral-800 rounded-full"></div>
                            <div className="h-10 w-64 bg-gray-200 dark:bg-neutral-800 rounded-xl"></div>
                        </div>
                        <div className="h-2 w-24 bg-gray-100 dark:bg-neutral-800 rounded-full"></div>
                    </div>
                    <div className="space-y-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between">
                                    <div className="h-2 w-20 bg-gray-100 dark:bg-neutral-800 rounded-full"></div>
                                    <div className="h-2 w-32 bg-gray-50 dark:bg-neutral-900 rounded-full"></div>
                                </div>
                                <div className="h-1 w-full bg-gray-50 dark:bg-neutral-900 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 인사이트 카드 스켈레톤 */}
                <div className="bg-neutral-900 dark:bg-neutral-900/80 rounded-[3rem] p-12 flex flex-col justify-between space-y-12">
                    <div className="space-y-8">
                        <div className="w-12 h-12 rounded-full bg-neutral-800"></div>
                        <div className="space-y-4">
                            <div className="h-8 w-40 bg-neutral-800 rounded-xl"></div>
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-neutral-800 rounded-full"></div>
                                <div className="h-2 w-full bg-neutral-800 rounded-full"></div>
                                <div className="h-2 w-2/3 bg-neutral-800 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5">
                        <div className="h-2 w-32 bg-neutral-800 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* 로딩 메시지 */}
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">데이터 동기화 중...</p>
            </div>
        </div>
    );
}
