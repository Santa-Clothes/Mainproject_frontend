'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FaWaveSquare, FaShirt, FaMagnifyingGlass, FaArrowsRotate } from 'react-icons/fa6';
import { getShoppingTrends } from '@/app/api/statservice/trendapi';
import SearchRankCard from './SearchRankCard';
import { BarDataType } from '@/types/ProductType';

interface AnalysisSectionProps {
    sourceImage?: string | null;
    productName?: string;
    isLoading?: boolean;
    barData?: BarDataType[];
    onImageUpload?: (file: File) => void; // 신규 이미지 업로드 핸들러
    isSelectionMode?: boolean; // 선택 모드 여부 (이미지 업로드 모드 구분용)
}

// mockBarData 제거하고 빈 데이터일 경우를 위한 예외 처리용 변수
const emptyBarData = [
    { score: 0, label_id: 0, label_name: '데이터 없음' }
];

const styleName = {
    casual: '캐주얼',
    contemporary: '컨템포러리',
    ethnic: '에스닉',
    feminine: '페미닌',
    genderless: '젠더리스',
    mannish: '매니시',
    natural: '내추럴',
    sporty: '스포츠',
    subculture: '서브컬처',
    traditional: '트레디셔널',
}
/**
 * AnalysisSection: Studio 상단 영역에서, 사용자가 선택/업로드한 원본 이미지를 보여주고
 * 이에 대한 간단한 분석 진행률이나 통계 리포트(차트 포함)를 시각화하는 패널 컴포넌트입니다.
 */
export default function AnalysisSection({ sourceImage, productName, isLoading, barData, onImageUpload, isSelectionMode = false }: AnalysisSectionProps) {
    const [isMounting, setIsMounting] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // 데이터 가독성을 위한 스케일링: 가장 작은 값을 1(자연수)로 기준 잡아 비례 상향
    const activeBarData = (barData && barData.length > 0) ? barData : emptyBarData;
    const minScore = Math.min(...activeBarData.map(d => d.score));
    const multiplier = (minScore > 0) ? (1 / minScore) : 1;

    const krBarData = activeBarData.map((item) => {
        return {
            ...item,
            // 차트 렌더링용 스케일링 값 (최소값이 1이 되도록 비례 확대)
            displayScore: item.score * multiplier,
            label_name: styleName[item.label_name.toLowerCase() as keyof typeof styleName] || item.label_name,
        };
    });

    // 네이버 검색 트렌드
    const [trendsData, setTrendsData] = useState<any[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(true);
    const [errorTrends, setErrorTrends] = useState<string | null>(null);
    const [hasAttemptedTrendsFetch, setHasAttemptedTrendsFetch] = useState(false);

    // 가장 높은 점수를 가진 스타일 명칭 추출 (하이라이트용)
    const highestLabel = (krBarData && krBarData.length > 0)
        ? [...krBarData].sort((a, b) => b.score - a.score)[0].label_name
        : null;

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

    /**
     * 신규 이미지 업로드 처리
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImageUpload) onImageUpload(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (isSelectionMode) return;
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (isSelectionMode) return;
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && onImageUpload) onImageUpload(file);
    };


    return (
        <div className="space-y-8">
            {/* 1. Header Area with dynamic title */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-neutral-100 dark:border-white/10 pb-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.3em] font-sans">Style Analysis Dashboard</span>
                    </div>
                    <h3 className="font-bold text-5xl italic tracking-tight text-neutral-900 dark:text-white">
                        {isLoading ? "Analyzing Style..." : `Style Analysis: ${productName || "Reference Item"}`}
                    </h3>
                </div>
            </div>

            {/* 2. Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Col: Source Image Preview & Input Slot */}
                <div className="lg:col-span-4 space-y-6">
                    <div
                        onClick={() => !isSelectionMode && fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`aspect-3/4 relative rounded-4xl overflow-hidden border-2 shadow-inner group transition-all duration-300
                            ${!isSelectionMode ? 'cursor-pointer' : ''}
                            ${isDragging ? 'border-violet-500 bg-violet-50/50 scale-[0.98] ring-8 ring-violet-500/10' : 'border-neutral-100 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-800/50'}
                        `}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

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
                                className="object-contain p-4"
                                unoptimized={true}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600">
                                <FaShirt size={80} className="mb-4 opacity-50" />
                                <span className="text-[12px] font-bold uppercase tracking-widest opacity-50">No Image</span>
                            </div>
                        )}

                        {/* {!isLoading && !isSelectionMode && ( */}
                        {!isSelectionMode && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px] gap-3">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-violet-600 shadow-xl">
                                    <FaMagnifyingGlass size={18} />
                                </div>
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">새 이미지로 분석하기</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Graphs */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Bar Chart Section */}
                    <div className="bg-white dark:bg-neutral-900/50 rounded-4xl p-8 border-2 border-neutral-100 dark:border-white/10 shadow-sm space-y-6 will-change-transform">
                        <div className="relative z-10 space-y-3">
                            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.3em]">Style Analysis Result</span>

                        </div>
                        <div className="h-64 w-full">
                            {!isMounting && krBarData && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={krBarData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                        {/* 도메인 제한을 제거하여 자동 스케일링 적용 */}
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="label_name" type="category" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} width={70} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: 'none', fontSize: '10px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={false}
                                            // 툴팁에서 스코어 수치 표시를 완전히 제거
                                            formatter={() => [null as any, null as any]}
                                        />
                                        <Bar
                                            dataKey="displayScore"
                                            fill="#7c3aed"
                                            radius={[0, 20, 20, 0]}
                                            barSize={12}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <SearchRankCard
                            trends={trendsData}
                            isLoading={isLoadingTrends}
                            error={errorTrends}
                            onRetry={() => fetchTrends(true)}
                            highlightStyle={highestLabel}
                            className="h-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
