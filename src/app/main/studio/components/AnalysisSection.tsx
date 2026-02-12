'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { FaFingerprint, FaWaveSquare, FaCircleCheck } from 'react-icons/fa6';

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

const mockRadarData: AnalysisData[] = [
    { name: 'Minimalism', value: 85, fullMark: 100 },
    { name: 'Elegance', value: 72, fullMark: 100 },
    { name: 'Vibrancy', value: 45, fullMark: 100 },
    { name: 'Avant-Garde', value: 30, fullMark: 100 },
    { name: 'Heritage', value: 90, fullMark: 100 },
    { name: 'Technical', value: 65, fullMark: 100 },
];

const mockBarData = [
    { name: 'Texture', val: 78 },
    { name: 'Pattern', val: 12 },
    { name: 'Cut', val: 92 },
    { name: 'Volume', val: 45 },
];

/**
 * AnalysisSection: Studio 페이지에서 이미지 분석 결과를 시각화합니다.
 */
export default function AnalysisSection({ sourceImage, productName, isLoading }: AnalysisSectionProps) {
    const [isMounting, setIsMounting] = useState(true);

    useEffect(() => {
        setIsMounting(false);
    }, []);

    return (
        <div className="space-y-8">
            {/* 1. Header Area with dynamic title */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-neutral-100 dark:border-white/10 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Neural Analysis Dashboard</span>
                    </div>
                    <h3 className="font-serif text-4xl italic tracking-tighter text-neutral-900 dark:text-white">
                        {isLoading ? "Analyzing DNA..." : `Product Analysis: ${productName || "Reference Item"}`}
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

                    <div className="p-8 rounded-4xl bg-violet-50/50 dark:bg-violet-950/10 border-2 border-violet-100/50 dark:border-violet-500/20 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Embedding Extraction</span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                            Successfully extracted 2048-dimensional vector embedding. Visual signatures indicate high structural fidelity and textural complexity.
                        </p>
                    </div>
                </div>

                {/* Right Col: Graphs */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Radar Chart Section */}
                    <div className="bg-white dark:bg-neutral-900/50 rounded-4xl p-8 border-2 border-neutral-100 dark:border-white/10 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Style Projection Radar</h4>
                        <div className="h-64 w-full">
                            {!isMounting && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                                        <PolarGrid stroke="#e5e7eb" className="dark:opacity-10" />
                                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 700 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Style DNA"
                                            dataKey="value"
                                            stroke="#7c3aed"
                                            fill="#7c3aed"
                                            fillOpacity={0.4}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
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
