'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
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
 * StyleDistributionCard: 전체 스타일 분포를 파이 차트 형태로 시각화합니다.
 * ScatterPlot과 동일한 색상 팔레트를 공유하여 컴포넌트 간 시각적 일관성을 유지하며,
 * API 유연성을 위해 한글 및 영문 키 값을 모두 매핑하여 처리합니다.
 */
const StyleDistributionCard: React.FC<Props> = ({ data, isLoading, error, onRetry, className = "" }) => {
    // ScatterPlot과 동일한 깊은 600 계열 컬러 팔레트 동기화
    const STYLE_COLOR_MAP: Record<string, string> = {
        '캐주얼': '#2563eb',        // Blue-600
        'casual': '#2563eb',
        'CAS': '#2563eb',
        '컨템포러리': '#059669',    // Emerald-600
        'contemporary': '#059669',
        'CNT': '#059669',
        '에스닉': '#d97706',        // Amber-600
        'ethnic': '#d97706',
        'ETH': '#d97706',
        '페미닌': '#db2777',        // Pink-600
        'feminine': '#db2777',
        'FEM': '#db2777',
        '젠더리스': '#0284c7',      // Sky-600
        'genderless': '#0284c7',
        'GNL': '#0284c7',
        '매니시': '#4f46e5',        // Indigo-600
        'mannish': '#4f46e5',
        'MAN': '#4f46e5',
        '내추럴': '#65a30d',        // Lime-600
        'natural': '#65a30d',
        'NAT': '#65a30d',
        '스포츠': '#dc2626',        // Red-600
        'sporty': '#dc2626',
        'SPT': '#dc2626',
        '서브컬처': '#9333ea',      // Purple-600
        'subculture': '#9333ea',
        'SUB': '#9333ea',
        '트레디셔널': '#ca8a04',    // Yellow-600
        'traditional': '#ca8a04',
        'TRD': '#ca8a04',
    };

    const getColor = (style: string) => {
        if (STYLE_COLOR_MAP[style]) return STYLE_COLOR_MAP[style];
        const keyLower = style.toLowerCase();
        return STYLE_COLOR_MAP[keyLower] || '#94a3b8'; // 기본값 slate-400
    };

    const totalCnt = data.reduce((acc, item) => acc + item.count, 0);

    return (
        <DashboardCard
            title="스타일 차트"
            subtitle="스타일별 비율 통계"
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            lgColSpan={2}
        >
            <div className="flex items-center gap-4 h-full min-h-0">
                {/* 차트 시각화 영역 (좌측) */}
                <div className="relative w-32 h-32 shrink-0">
                    <PieChart width={128} height={128}>
                        <Pie
                            data={data.slice(0, 10).map(t => ({ score: t?.count ? Math.abs(t.count) : 0, name: t?.styleName || 'Unknown' }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={4}
                            dataKey="score"
                            nameKey="name"
                            stroke="none"
                        >
                            {data.slice(0, 10).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.styleName || '')} />
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
                        <div className="relative w-16 h-16 opacity-40">
                            <Image src={Wizard} alt="Style Distribution" fill className="object-contain" />
                        </div>
                    </div>
                </div>

                {/* 범례 텍스트 표시 영역 (우측 그리드) */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 py-0.5 auto-cols-min">
                    {data.slice(0, 10).map((item, i) => (
                        <div key={i} className="flex items-center justify-between group px-1.5 py-0.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getColor(item.styleName || '') }}></div>
                                <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-wider truncate" title={item.styleName || 'Unknown'}>
                                    {item.styleName || 'Unknown'}
                                </span>
                            </div>
                            <span className="text-[9px] font-medium text-gray-400 shrink-0 ml-1">{((item.count / totalCnt) * 100).toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
                <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>
        </DashboardCard>
    );
};

export default StyleDistributionCard;
