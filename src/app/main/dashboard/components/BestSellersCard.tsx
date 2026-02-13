'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DashboardCard from './DashboardCard';
import { SalesRankItem } from '@/app/api/salesservice/salesapi';

interface Props {
    sales: SalesRankItem[];
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}

/**
 * BestSellersCard: 가장 많이 팔린 상품들을 시각화하는 카드 컴포넌트입니다.
 * 왼쪽에는 Recharts BarChart를, 오른쪽에는 상세 상품 리스트를 표시합니다.
 */
const BestSellersCard: React.FC<Props> = ({ sales, isLoading, error, onRetry }) => {
    /**
     * 상품명 가공 함수: 하이픈(-)으로 연결된 이름 중 브랜드명 등을 제외한 실제 상품명만 추출합니다.
     */
    const formatProductName = (name: string) => {
        if (!name) return 'Unknown Product';
        const parts = name.split('-');
        return (parts[parts.length - 1] || name).trim();
    };

    /**
     * 동일한 가공 명칭을 가진 상품들을 하나로 묶어 판매량을 합산합니다.
     */
    const aggregatedData = React.useMemo(() => {
        if (!sales || sales.length === 0) return [];

        const map = new Map<string, { shortName: string; quantity: number }>();

        sales.forEach(s => {
            const short = formatProductName(s.productName);
            const existing = map.get(short);
            if (existing) {
                existing.quantity += s.saleQuantity;
            } else {
                map.set(short, { shortName: short, quantity: s.saleQuantity });
            }
        });

        return Array.from(map.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }, [sales]);

    return (
        <DashboardCard
            title="Best Sellers"
            subtitle="Sales Performance"
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            lgColSpan={1}
            className="min-h-72"
            topRight={
                <div className="flex items-center gap-2 px-3 py-1 bg-violet-600 rounded-full shadow-lg">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live</span>
                </div>
            }
        >
            <div className="flex flex-col h-full space-y-4">
                {aggregatedData.map((item, i) => (
                    <div key={item.shortName} className="space-y-1.5 group">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2">
                                <span className={`text-[12px] italic text-violet-600 font-bold`}>0{i + 1}</span>
                                <span className="text-[11px] font-bold text-black dark:text-white uppercase tracking-tight truncate max-w-28 group-hover:text-violet-500 transition-colors">
                                    {item.shortName}
                                </span>
                            </div>
                            <span className="text-[12px] font-black text-violet-600 tracking-tighter">
                                {item.quantity.toLocaleString()}
                            </span>
                        </div>
                        {/* 가로형 커스텀 바 가시화 */}
                        <div className="h-1.5 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 bg-violet-600`}
                                style={{ width: `${(item.quantity / (aggregatedData[0]?.quantity || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

export default BestSellersCard;
