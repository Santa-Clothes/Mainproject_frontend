'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import DashboardCard from './DashboardCard';
import { FaTriangleExclamation } from 'react-icons/fa6';

interface ProductVectorInfo {
    productId: string;
    productName: string;
    style: string;
    xcoord: number;
    ycoord: number;
    score?: number;
}

interface Props {
    data: ProductVectorInfo[];
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}

/**
 * AestheticDistributionCard: 전체 스타일 비중을 도넛 차트(PieChart)로 시각화합니다.
 * Recharts를 사용하여 데이터를 렌더링하며, 상세 범례를 포함합니다.
 */
const AestheticDistributionCard: React.FC<Props> = ({ data, isLoading, error, onRetry }) => {
    // 차트 각 섹션에 순차적으로 적용될 컬러 팔레트
    const CHART_COLORS = [
        '#8B5CF6', '#3B82F6', '#EC4899', '#818CF8',
        '#2DD4BF', '#60A5FA', '#F472B6', '#A78BFA'
    ];

    // 범례(Legend) 아이콘에 적용될 배경색 클래스
    const legendColors = [
        'bg-[#8B5CF6]', 'bg-[#3B82F6]', 'bg-[#EC4899]', 'bg-[#818CF8]',
        'bg-[#2DD4BF]', 'bg-[#60A5FA]', 'bg-[#F472B6]', 'bg-[#A78BFA]',
        'bg-gray-400', 'bg-gray-300', 'bg-gray-200', 'bg-gray-100'
    ];

    return (
        <DashboardCard
            title="Aesthetic"
            subtitle="Distribution"
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            lgColSpan={2}
            className="min-h-72"
        >
            <div className="flex flex-col md:flex-row items-center gap-4 h-full">
                {/* 차트 영역: 왼쪽 배치 (이전 상태 복구) */}
                <div className="relative w-48 h-48 shrink-0">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-36 h-36 rounded-full border-4 border-gray-100 dark:border-neutral-800 animate-pulse"></div>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <FaTriangleExclamation size={30} className="text-red-500" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.slice(0, 8).map(t => ({ score: t?.score || 0, name: t?.style || 'Unknown' }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={6}
                                    dataKey="score"
                                    nameKey="name"
                                    stroke="none"
                                >
                                    {data.slice(0, 8).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontSize: '8px',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-2xl font-serif italic text-black dark:text-white">DNA</span>
                    </div>
                </div>

                {/* 범례 영역: 오른쪽 그리드 배치 (이전 상태 복구) */}
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 shrink-0"></div>
                                <div className="h-2 w-16 bg-gray-100 dark:bg-neutral-800 rounded-full"></div>
                            </div>
                        ))
                    ) : (
                        data.slice(0, 10).map((trend, i) => (
                            <div key={i} className="flex items-center justify-between group px-2 py-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${legendColors[i % legendColors.length]}`}></div>
                                    <span className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest truncate max-w-28">
                                        {trend?.style || 'Unknown'}
                                    </span>
                                </div>
                                <span className="text-[10px] font-medium text-gray-400">{(trend?.score || 0).toFixed(0)}%</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>
        </DashboardCard>
    );
};

export default AestheticDistributionCard;
