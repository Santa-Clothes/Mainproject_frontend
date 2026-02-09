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
            title="Full Aesthetic Distribution"
            subtitle="Style Proportion"
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            lgColSpan={3}
        >
            <div className="flex flex-col md:flex-row items-center gap-16">
                {/* 왼쪽 영역: Recharts 도넛 차트 */}
                <div className="relative w-72 h-72 shrink-0">
                    {isLoading ? (
                        // 로딩 중: 회전하는 원형 스켈레톤
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-48 rounded-full border-4 border-gray-100 dark:border-neutral-800 animate-pulse"></div>
                        </div>
                    ) : error ? (
                        // 에러 시: 경고 아이콘 표시
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <FaTriangleExclamation size={40} className="text-red-500" />
                        </div>
                    ) : (
                        // 데이터 정상: PieChart 렌더링
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.slice(0, 8).map(t => ({ score: t?.score || 0, name: t?.style || 'Unknown' }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={8}
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
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {/* 차트 중앙 텍스트 오버레이 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Style</span>
                        <span className="text-2xl font-serif italic text-black dark:text-white">DNA</span>
                    </div>
                </div>

                {/* 오른쪽 영역: 동적 범례 리스트 */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
                    {isLoading ? (
                        // 로딩 스켈레톤 아이템 8개
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-gray-100 dark:bg-neutral-800 shrink-0"></div>
                                <div className="space-y-1 w-full">
                                    <div className="h-2 w-16 bg-gray-100 dark:bg-neutral-800 rounded-full"></div>
                                    <div className="h-1.5 w-10 bg-gray-50 dark:bg-neutral-900 rounded-full"></div>
                                </div>
                            </div>
                        ))
                    ) : data.length > 0 ? (
                        // 스타일 리스트 렌더링
                        data.slice(0, 12).map((trend, i) => (
                            <div key={i} className="flex items-center gap-3 group transition-all hover:translate-x-1">
                                <div className={`w-2 h-2 rounded-full ${legendColors[i % legendColors.length]} shadow-sm`}></div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-black dark:text-white uppercase tracking-widest group-hover:text-violet-500 transition-colors truncate max-w-25">{trend?.style || 'Unknown'}</span>
                                    <span className="text-[8px] font-medium text-gray-400 dark:text-gray-500 uppercase">{(trend?.score || 0).toFixed(1)}%</span>
                                </div>
                            </div>
                        ))
                    ) : null}
                </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </DashboardCard>
    );
};

export default AestheticDistributionCard;
