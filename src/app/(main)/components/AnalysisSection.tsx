'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FaWaveSquare, FaShirt, FaMagnifyingGlass } from 'react-icons/fa6';
import { getShoppingTrends } from '@/app/api/statservice/trendapi';
import SearchRankCard from './SearchRankCard';
import { RadarDataType } from '@/types/ProductType';

interface AnalysisSectionProps {
    sourceImage?: string | null;
    productName?: string;
    isLoading?: boolean;
    // RadarDataType[] 형태로 묶어서 받음
    radarData?: RadarDataType[];
    onImageUpload?: (file: File) => void;
    isSelectionMode?: boolean;
}

// 빈 데이터가 전달될 경우 차트 렌더링 오류를 방지하기 위한 더미 데이터
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
 * AnalysisSection
 * 사용자가 선택하거나 업로드한 원본 이미지를 썸네일로 표출하고, 
 * 모델 분석 진행 상태 및 결과에 대한 레이더 차트, 상관 트렌드 랭킹 통계를 표시합니다.
 */
export default function AnalysisSection({
    sourceImage,
    productName,
    isLoading,
    radarData,
    onImageUpload,
    isSelectionMode = false
}: AnalysisSectionProps) {
    const [isMounting, setIsMounting] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // 레이더 차트 수치 정규화 로직 (오분류 그래프 왜곡 방지)
    const krBarData = React.useMemo(() => {
        const top3 = radarData && radarData.length > 0 ? [...radarData] : [];

        // 레이더 차트 구성을 위해 최소 3개 축 유지
        while (top3.length < 3) {
            top3.push({
                score: 0,
                styleName: ' '
            });
        }

        const maxScore = top3[0].score !== 0 ? Math.abs(top3[0].score) : 1;

        return top3.map((item) => {
            if (item.score === 0 && item.styleName === ' ') {
                return { ...item, displayScore: 0, originalScore: 0, label_name: ' ' };
            }

            const absScore = Math.abs(item.score);
            const ratio = maxScore > 0 ? (absScore / maxScore) : 0;
            const adjustedRatio = Math.max(Math.floor(ratio * 10) * 0.1, 0.1);

            return {
                ...item,
                displayScore: adjustedRatio * 100,
                originalScore: absScore,
                label_name: item.styleName ? (styleName[item.styleName.toLowerCase() as keyof typeof styleName] || item.styleName) : '분석 결과 없음',
            };
        });
    }, [radarData]);

    // 네이버 검색 트렌드
    const [trendsData, setTrendsData] = useState<any[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(true);
    const [errorTrends, setErrorTrends] = useState<string | null>(null);
    const [hasAttemptedTrendsFetch, setHasAttemptedTrendsFetch] = useState(false);

    // 가장 유사도가 높은 최상위 스타일 명 추출
    const highestLabel = React.useMemo(() => {
        if (!krBarData || krBarData.length === 0) return null;
        const sorted = [...krBarData].sort((a, b) => Math.abs(b.originalScore || 0) - Math.abs(a.originalScore || 0));
        return sorted.length > 0 ? sorted[0].label_name : null;
    }, [krBarData]);

    useEffect(() => {
        setIsMounting(false);
    }, []);

    useEffect(() => {
        if (trendsData.length === 0 && !hasAttemptedTrendsFetch) {
            fetchTrends();
        }
    }, [trendsData.length, hasAttemptedTrendsFetch]);


    const fetchTrends = async (isRetry = false) => {
        if (!isRetry && hasAttemptedTrendsFetch) return;
        setHasAttemptedTrendsFetch(true);
        setIsLoadingTrends(true);
        setErrorTrends(null);

        try {
            const result = await getShoppingTrends();

            const processedData = result.map((item: any, i: number) => ({
                ...item,
                score: item.value !== undefined ? Math.abs(item.value) : 0,
                value: item.value !== undefined ? Math.abs(item.value) : 0,
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
                        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.3em] font-sans">스타일 분석 영역</span>
                    </div>
                    <h3 className="font-bold text-5xl italic tracking-tight text-neutral-900 dark:text-white">
                        {isLoading ? "스타일 분석중..." : `스타일 분석: ${highestLabel || productName || "Reference Item"}`}
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
                                priority
                                loading="eager"
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
                    {/* Radar Chart Section */}
                    <div className="bg-white dark:bg-neutral-900/50 rounded-4xl p-8 border-2 border-neutral-100 dark:border-white/10 shadow-sm space-y-6 aspect-3/4 flex flex-col relative overflow-hidden">
                        {/* 빛 반사 디자인 효과 */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-[80px] z-0 pointer-events-none" />
                        <div className="relative z-10 space-y-3 shrink-0">
                            <span className="text-[16px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.3em]">스타일 분석 결과</span>
                        </div>
                        <div className="flex-1 w-full min-h-0 flex items-center justify-center relative z-10">
                            {!isMounting && (
                                (radarData && radarData.length > 0 && radarData[0].styleName.trim() !== '') ? (

                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="55%" margin={{ top: 20, right: 30, bottom: 20, left: 30 }} data={krBarData}>
                                            <PolarGrid stroke="#a3a3a3" strokeDasharray="3 3" className="dark:stroke-white/30" />
                                            <PolarAngleAxis
                                                dataKey="label_name"
                                                tick={{ fill: '#8b5cf6', fontSize: 16, fontWeight: 'bold' }}
                                            />
                                            {/* Y축 범위를 0~100으로 고정하여 비율을 명확히 함 */}
                                            <PolarRadiusAxis
                                                angle={30}
                                                domain={[0, 100]}
                                                tick={false}
                                                axisLine={false}
                                            />
                                            <Radar
                                                name="Style Score"
                                                dataKey="displayScore"
                                                stroke="#7c3aed"
                                                strokeWidth={3}
                                                fill="#8b5cf6"
                                                fillOpacity={0.4}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-500">
                                        <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-center border border-neutral-100 dark:border-white/5">
                                            <FaWaveSquare className="text-neutral-300 dark:text-neutral-600" size={20} />
                                        </div>
                                        <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                                            분석 데이터가 없습니다
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div>
                        <SearchRankCard
                            trends={trendsData}
                            isLoading={isLoadingTrends}
                            error={errorTrends}
                            onRetry={() => fetchTrends(true)}
                            highlightStyle={highestLabel}
                            className="aspect-3/4"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
