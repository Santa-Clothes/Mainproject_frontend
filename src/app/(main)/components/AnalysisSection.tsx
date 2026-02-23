'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { FaWaveSquare, FaCircleCheck } from 'react-icons/fa6';
import { getNaverProductCount } from '@/app/api/productservice/productapi';
import { getShoppingTrends } from '@/app/api/trendservice/trendapi';
import { SiNaver } from 'react-icons/si';
import DashboardCard from '../dashboard/components/DashboardCard';
import SearchRankCard from '../dashboard/components/SearchRankCard';

interface AnalysisData {
    name: string;
    value: number;
    fullMark: number;
}

interface AnalysisSectionProps {
    sourceImage?: string | null;
    productName?: string;
    isLoading?: boolean;
}

const mockBarData = [
    { name: 'Texture', val: 78 },
    { name: 'Pattern', val: 12 },
    { name: 'Cut', val: 92 },
    { name: 'Volume', val: 45 },
];

/**
 * AnalysisSection: Studio 상단 영역에서, 사용자가 선택/업로드한 원본 이미지를 보여주고
 * 이에 대한 간단한 분석 진행률이나 통계 리포트(차트 포함)를 시각화하는 패널 컴포넌트입니다.
 */
export default function AnalysisSection({ sourceImage, productName, isLoading }: AnalysisSectionProps) {
    const [isMounting, setIsMounting] = useState(true);

    //네이버 상품 개수
    const [naverProductCount, setNaverProductCount] = useState(0);
    const [isLoadingNaverProductCount, setIsLoadingNaverProductCount] = useState(true);
    const [errorNaverProductCount, setErrorNaverProductCount] = useState<string | null>(null);
    const [hasAttemptedNaverProductCount, setHasAttemptedNaverProductCount] = useState(false);

    // 네이버 검색 트렌드
    const [trendsData, setTrendsData] = useState<any[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(true);
    const [errorTrends, setErrorTrends] = useState<string | null>(null);
    const [hasAttemptedTrendsFetch, setHasAttemptedTrendsFetch] = useState(false);

    useEffect(() => {
        setIsMounting(false);
    }, []);

    useEffect(() => {
        if (naverProductCount === 0 && !hasAttemptedNaverProductCount) {
            fetchNaverProductCount();
        }
        if (trendsData.length === 0 && !hasAttemptedTrendsFetch) {
            fetchTrends();
        }
    }, [naverProductCount, hasAttemptedNaverProductCount, trendsData.length, hasAttemptedTrendsFetch]);

    const fetchNaverProductCount = async (isRetry = false) => {
        if (!isRetry && hasAttemptedNaverProductCount) return;
        setHasAttemptedNaverProductCount(true);
        setIsLoadingNaverProductCount(true);
        setErrorNaverProductCount(null);
        try {
            // const result = await getNaverProductCount();
            // setNaverProductCount(result);
        } catch (err) {
            console.error('Failed to fetch product count:', err);
            setErrorNaverProductCount('Connection Failed');
        } finally {
            setIsLoadingNaverProductCount(false);
        }
    };

    const fetchTrends = async (isRetry = false) => {
        if (!isRetry && hasAttemptedTrendsFetch) return;
        setHasAttemptedTrendsFetch(true);
        setIsLoadingTrends(true);
        setErrorTrends(null);

        try {
            // const result = await getShoppingTrends();
            // const processedData = result.map((item: any, i: number) => ({
            //     ...item,
            //     score: item.value || 0,
            //     value: item.value || 0,
            //     percentStr: item.percentStr || '0%',
            //     xcoord: Math.random() * 200 - 100,
            //     ycoord: Math.random() * 200 - 100,
            //     productId: `trend-${i}`,
            //     productName: item.style || `Style-${i}`
            // })).sort((a: any, b: any) => b.value - a.value);

            // setTrendsData(processedData);
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
                                unoptimized={sourceImage.startsWith('data:')}
                            />
                        ) : null}
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

                    <div className="lg:col-span-1">
                        <SearchRankCard
                            trends={trendsData}
                            isLoading={isLoadingTrends}
                            error={errorTrends}
                            onRetry={() => fetchTrends(true)}
                            className="h-full"
                        />
                    </div>

                    {/* Bar Chart Section */}
                    <div className="bg-white dark:bg-neutral-900/50 rounded-4xl p-8 border-2 border-neutral-100 dark:border-white/10 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Visual Attribute Distribution</h4>
                        <div className="h-64 w-full">
                            {!isMounting && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mockBarData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} width={70} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: 'none', fontSize: '10px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar
                                            dataKey="val"
                                            fill="#7c3aed"
                                            radius={[0, 20, 20, 0]}
                                            barSize={12}
                                            background={{ fill: '#f3f4f6', radius: 20 }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
