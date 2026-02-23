'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Image from 'next/image';
import DashboardCard from './DashboardCard';
import Wizard from '@/assets/wizard.svg';
import { InternalStyleCount } from '@/types/ProductType';

interface Props {
    data: InternalStyleCount[];
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
    className?: string;
}

/**
 * StyleDistributionCard: 전체 스타일 비중을 도넛 차트(PieChart)로 시각화합니다.
 * Recharts를 사용하여 데이터를 렌더링하며, 상세 범례를 포함합니다.
 */
const StyleDistributionCard: React.FC<Props> = ({ data, isLoading, error, onRetry, className = "" }) => {
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

    const totalCnt = data.reduce((acc, item) => acc + item.count, 0);

    return (
        <DashboardCard
            title="Style"
            subtitle="9oz Distribution"
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            lgColSpan={2}
            className={`${className} min-h-72`}
            topRight={`${totalCnt}ea`}
        >
            <div className="flex flex-col md:flex-row items-center gap-4 h-full">
                {/* 차트 영역: 왼쪽 배치 */}
                <div className="relative w-48 h-48 shrink-0">
                    <PieChart width={192} height={192}>
                        <Pie
                            data={data.slice(0, 8).map(t => ({ score: t?.count || 0, name: t?.styleName || 'Unknown' }))}
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <div className="relative w-20 h-20 opacity-50">
                            <Image src={Wizard} alt="Style Distribution" fill className="object-contain" />
                        </div>
                    </div>
                </div>

                {/* 범례 영역: 오른쪽 그리드 배치*/}
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3">
                    {data.slice(0, 10).map((item, i) => (
                        <div key={i} className="flex items-center justify-between group px-2 py-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${legendColors[i % legendColors.length]}`}></div>
                                <span className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest truncate max-w-28">
                                    {item.styleName || 'Unknown'}
                                </span>
                            </div>
                            <span className="text-[10px] font-medium text-gray-400">{((item.count / totalCnt) * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>
        </DashboardCard>
    );
};

export default StyleDistributionCard;
