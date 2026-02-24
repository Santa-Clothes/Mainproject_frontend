'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { FaWaveSquare, FaCircleCheck, FaShirt } from 'react-icons/fa6';
import { getNaverProductCount } from '@/app/api/productservice/productapi';
import { getShoppingTrends } from '@/app/api/statservice/trendapi';
import { SiNaver } from 'react-icons/si';
import DashboardCard from '../dashboard/components/DashboardCard';
import SearchRankCard from './SearchRankCard';
import { BarDataType } from '@/types/ProductType';

interface AnalysisSectionProps {
    sourceImage?: string | null;
    productName?: string;
    isLoading?: boolean;
    barData?: BarDataType[];
}

// mockBarData 제거하고 빈 데이터일 경우를 위한 예외 처리용 변수
const emptyBarData = [
    { score: 0, label_id: 0, label_name: '데이터 없음' }
];

const styleName = {
    CAS: '캐주얼',
    CNT: '컨템포러리',
    ETH: '에스닉',
    FEM: '페미닌',
    GNL: '젠더리스',
    MAN: '매니시',
    NAT: '내추럴',
    SPT: '스포츠',
    SUB: '서브컬처',
    TRD: '트레디셔널',
}
/**
 * AnalysisSection: Studio 상단 영역에서, 사용자가 선택/업로드한 원본 이미지를 보여주고
 * 이에 대한 간단한 분석 진행률이나 통계 리포트(차트 포함)를 시각화하는 패널 컴포넌트입니다.
 */
export default function AnalysisSection({ sourceImage, productName, isLoading, barData }: AnalysisSectionProps) {
    const [isMounting, setIsMounting] = useState(true);


    // 네이버 검색 트렌드
    const [trendsData, setTrendsData] = useState<any[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(true);
    const [errorTrends, setErrorTrends] = useState<string | null>(null);
    const [hasAttemptedTrendsFetch, setHasAttemptedTrendsFetch] = useState(false);

    useEffect(() => {
        setIsMounting(false);
    }, []);

    useEffect(() => {
        // if (naverProductCount === 0 && !hasAttemptedNaverProductCount) {
        //     fetchNaverProductCount();
        // }
        if (trendsData.length === 0 && !hasAttemptedTrendsFetch) {
            fetchTrends();
        }
    }, [/* naverProductCount, hasAttemptedNaverProductCount, */ trendsData.length, hasAttemptedTrendsFetch]);

    // const fetchNaverProductCount = async (isRetry = false) => {
    //     if (!isRetry && hasAttemptedNaverProductCount) return;
    //     setHasAttemptedNaverProductCount(true);
    //     setIsLoadingNaverProductCount(true);
    //     setErrorNaverProductCount(null);
    //     try {
    //         const result = await getNaverProductCount();
    //         setNaverProductCount(result);
    //     } catch (err) {
    //         console.error('Failed to fetch product count:', err);
    //         setErrorNaverProductCount('Connection Failed');
    //     } finally {
    //         setIsLoadingNaverProductCount(false);
    //     }
    // };

    const fetchTrends = async (isRetry = false) => {
        if (!isRetry && hasAttemptedTrendsFetch) return;
        setHasAttemptedTrendsFetch(true);
        setIsLoadingTrends(true);
        setErrorTrends(null);

        try {
            const result = await getShoppingTrends();

            const processedData = result.map((item: any, i: number) => ({
                ...item,
                score: item.value || 0,
                value: item.value || 0,
                percentStr: item.percentStr || '0%',
            })).sort((a: any, b: any) => b.value - a.value);

            setTrendsData(processedData);
        } catch (err) {
            console.error('Failed to fetch trends:', err);
            setErrorTrends('Connection Failed');
        } finally {
            setIsLoadingTrends(false);
        }
    };


    return (
        <div className="space-y-8">
            {/* 1. Header Area with dynamic title */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-neutral-100 dark:border-white/10 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Style Analysis Dashboard</span>
                    </div>
                    <h3 className="font-serif text-4xl italic tracking-tighter text-neutral-900 dark:text-white">
                        {isLoading ? "Analyzing Style..." : `Style Analysis: ${productName || "Reference Item"}`}
                    </h3>
                </div>
            </div>

            {/* 2. Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Col: Source Image Preview */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="aspect-square relative rounded-4xl overflow-hidden border-2 border-neutral-100 dark:border-white/10 bg-gray-50 dark:bg-neutral-800 shadow-inner group">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 animate-pulse">
                                <FaWaveSquare className="text-violet-500/20" size={40} />
                            </div>
                        ) : sourceImage ? (
                            <Image
                                src={sourceImage}
                                alt="Original Reference"
                                fill
                                sizes='(min-width: 1024px) 50vw, (min-width: 768px) 75vw, 100vw'
                                className="object-cover"
                                unoptimized={true}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600">
                                <FaShirt size={80} className="mb-4 opacity-50" />
                                <span className="text-[12px] font-bold uppercase tracking-widest opacity-50">No Image</span>
                            </div>
                        )}
                        {!isLoading && (
                            <div className="absolute top-6 right-6">
                                <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md p-2 rounded-full border border-neutral-100 dark:border-white/10 text-violet-600 shadow-lg">
                                    <FaCircleCheck size={14} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Graphs */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Bar Chart Section */}
                    <div className="bg-white dark:bg-neutral-900/50 rounded-4xl p-8 border-2 border-neutral-100 dark:border-white/10 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Visual Attribute Distribution</h4>
                        <div className="h-64 w-full">
                            {!isMounting && (
                                barData && barData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                            <XAxis type="number" hide domain={[0, 100]} />
                                            <YAxis dataKey="label_name" type="category" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} width={70} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: 'none', fontSize: '10px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'transparent' }}
                                                formatter={(value: any) => [`${value}`, '확률']}
                                            />
                                            <Bar
                                                dataKey="score"
                                                fill="#7c3aed"
                                                radius={[0, 20, 20, 0]}
                                                barSize={12}
                                                background={{ fill: '#f3f4f6', radius: 20 }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex w-full h-full items-center justify-center text-xs text-neutral-400 font-medium">
                                        과거 기록이거나 분석 데이터가 없습니다.
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <SearchRankCard
                            trends={trendsData}
                            isLoading={isLoadingTrends}
                            error={errorTrends}
                            onRetry={() => fetchTrends(true)}
                            className="h-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
