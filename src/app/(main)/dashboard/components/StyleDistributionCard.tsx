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
        '캐주얼': '#1d4ed8',        // Blue-700
        'casual': '#1d4ed8',
        'CAS': '#1d4ed8',
        '컨템포러리': '#eab308',    // Yellow-500
        'contemporary': '#eab308',
        'CNT': '#eab308',
        '에스닉': '#f97316',        // Orange-500
        'ethnic': '#f97316',
        'ETH': '#f97316',
        '페미닌': '#db2777',        // Pink-600
        'feminine': '#db2777',
        'FEM': '#db2777',
        '젠더리스': '#06b6d4',      // Cyan-500
        'genderless': '#06b6d4',
        'GNL': '#06b6d4',
        '매니시': '#4338ca',        // Deep Indigo
        'mannish': '#4338ca',
        'MAN': '#4338ca',
        '내추럴': '#22c55e',        // Green-500
        'natural': '#22c55e',
        'NAT': '#22c55e',
        '스포츠': '#ef4444',        // Red-500
        'sporty': '#ef4444',
        'SPT': '#ef4444',
        '서브컬처': '#a855f7',      // Purple-500
        'subculture': '#a855f7',
        'SUB': '#a855f7',
        '트레디셔널': '#c2410c',    // Brown/Rust
        'traditional': '#c2410c',
        'TRD': '#c2410c',
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
