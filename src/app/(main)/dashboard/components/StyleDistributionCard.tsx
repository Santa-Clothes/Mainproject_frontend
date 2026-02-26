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
    // 스타일별 확실히 구분되는 원색(Primary Colors) 팔레트 정의
    const STYLE_COLOR_MAP: Record<string, string> = {
        '캐주얼': '#0000FF',        // Pure Blue
        'casual': '#0000FF',
        '컨템포러리': '#00FF00',    // Pure Green
        'contemporary': '#00FF00',
        '에스닉': '#FF8000',        // Vivid Orange
        'ethnic': '#FF8000',
        '페미닌': '#FF00FF',        // Magenta / Pink
        'feminine': '#FF00FF',
        '젠더리스': '#00FFFF',      // Cyan
        'genderless': '#00FFFF',
        '매니시': '#800000',        // Maroon / Brown
        'mannish': '#800000',
        '내추럴': '#80FF00',        // Lime Green
        'natural': '#80FF00',
        '스포츠': '#FF0000',        // Pure Red
        'sporty': '#FF0000',
        '서브컬처': '#8000FF',      // Pure Purple
        'subculture': '#8000FF',
        '트레디셔널': '#FFFF00',    // Pure Yellow
        'traditional': '#FFFF00',
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
            className={`${className} min-h-72`}
            topRight={`${totalCnt.toLocaleString()}개`}
        >
            <div className="flex flex-col md:flex-row items-center gap-4 h-full">
                {/* 차트 영역: 왼쪽 배치 */}
                <div className="relative w-48 h-48 shrink-0">
                    <PieChart width={192} height={192}>
                        <Pie
                            data={data.slice(0, 8).map(t => ({ score: t?.count ? Math.abs(t.count) : 0, name: t?.styleName || 'Unknown' }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={6}
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
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(item.styleName || '') }}></div>
                                <span className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest truncate max-w-28">
                                    {item.styleName || 'Unknown'}
                                </span>
                            </div>
                            <span className="text-[10px] font-medium text-gray-400">{((item.count / totalCnt) * 100).toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>
        </DashboardCard>
    );
};

export default StyleDistributionCard;
