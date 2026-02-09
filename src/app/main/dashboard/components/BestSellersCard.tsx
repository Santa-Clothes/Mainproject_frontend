'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DashboardCard from './DashboardCard';
import { SalesRankItem } from '@/app/api/salesService/salesapi';

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

    return (
        <DashboardCard
            title="Best Selling Products"
            subtitle="Sales Performance"
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            lgColSpan={3}
            topRight={
                <div className="flex items-center gap-4 px-5 py-2 bg-violet-50 dark:bg-violet-950/30 rounded-full border border-violet-100 dark:border-violet-900/40">
                    <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Quantity Normalized Analysis</span>
                </div>
            }
        >
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
                {/* 왼쪽 섹션: Recharts 막대 차트 (BarChart) */}
                <div className="xl:col-span-3 h-75">
                    {isLoading ? (
                        // 로딩 중 스켈레톤 바
                        <div className="w-full h-full bg-gray-50/50 dark:bg-neutral-800/30 rounded-3xl animate-pulse flex items-center justify-center">
                            <div className="h-2 w-32 bg-gray-100 dark:bg-neutral-700 rounded-full"></div>
                        </div>
                    ) : (
                        // 데이터 로드 완료 시 차트 렌더링
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sales.map(s => ({ ...s, shortName: formatProductName(s?.productName) }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="shortName" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#9CA3AF' }} />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload as SalesRankItem;
                                            return (
                                                <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100">
                                                    <p className="text-[10px] font-bold text-black uppercase tracking-widest mb-1">{data?.productName || 'Unknown'}</p>
                                                    <p className="text-[9px] font-medium text-violet-600 uppercase tracking-wider">Sale: {(data?.saleQuantity || 0).toLocaleString()} Qty</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="saleQuantity" fill="#8B5CF6" radius={[10, 10, 0, 0]} barSize={40}>
                                    {sales.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6D28D9' : '#C4B5FD'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* 오른쪽 섹션: 상품 순위 리스트 */}
                <div className="xl:col-span-2 space-y-4">
                    {isLoading ? (
                        // 로딩 중 5개의 스켈레톤 행 표시
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-gray-50 dark:border-white/5 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-5 h-5 bg-gray-100 dark:bg-neutral-800 rounded"></div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-24 bg-gray-100 dark:bg-neutral-800 rounded-full"></div>
                                        <div className="h-1.5 w-16 bg-gray-50 dark:bg-neutral-900 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <div className="h-2 w-16 bg-gray-100 dark:bg-neutral-800 rounded-full ml-auto"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // 판매량 순위 상품 목록 렌더링
                        sales.map((item, i) => (
                            <div key={item.productId} className="flex items-center justify-between p-5 rounded-2xl border border-gray-50 dark:border-white/5 hover:border-violet-200 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-serif italic ${i === 0 ? 'text-violet-600' : 'text-gray-300'}`}>0{i + 1}</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest truncate max-w-37.5">
                                            {formatProductName(item?.productName)}
                                        </span>
                                        <span className="text-[8px] font-medium text-gray-400 uppercase tracking-tighter">{item?.productId || 'ID-UNKNOWN'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">{(item?.saleQuantity || 0).toLocaleString()} QTY</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardCard>
    );
};

export default BestSellersCard;
