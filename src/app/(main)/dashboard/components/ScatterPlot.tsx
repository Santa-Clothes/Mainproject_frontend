'use client';

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FaArrowsRotate, FaTriangleExclamation } from "react-icons/fa6";
import { LuChartScatter } from "react-icons/lu";
import { ScatterPoint } from "@/app/api/statservice/plotapi";
import { motion, AnimatePresence } from "framer-motion";
import DashboardCard from "./DashboardCard";
import { useAtom } from "jotai";
import { isFullScreenModalOpenAtom } from "@/jotai/uiJotai";

/**
 * CSR 전용 Plotly 컴포넌트
 * SSR 환경에서 window 객체 접근 오류를 방지하기 위해 동적으로 임포트됩니다.
 */
import type { PlotParams } from "react-plotly.js";

const Plot = dynamic<PlotParams>(() => import("react-plotly.js"), {
    ssr: false,
    loading: () => <div className="h-125 flex items-center justify-center bg-gray-50/10 rounded-4xl animate-pulse">
        <p className="text-[10px] uppercase tracking-widest opacity-20">Initializing Engine...</p>
    </div>
});

export interface ScatterPlotProps {
    title?: string;
    subtitle?: string;
    description?: string;
    bottomTextFormat?: string;
    className?: string;
    fetchDataFn: () => Promise<ScatterPoint[]>;
}

export default function ScatterPlot({
    title = "UMAP Clustering Map",
    subtitle = "Style Projection",
    description = "선택된 AI 모델(512/768 차원)의 분석 결과를 3차원 공간에 투영한 스타일 맵입니다.",
    bottomTextFormat = "Visualizing {count} Style Latent vectors.",
    className = "lg:col-span-4",
    fetchDataFn
}: ScatterPlotProps) {
    const [data, setData] = useState<ScatterPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    const loadingMessages = [
        "잠재 공간 벡터를 3차원으로 투영 중..."
    ];

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 무한 로딩 방지를 위한 20초 타임아웃 설정
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), 20000)
            );

            // 데이터 페칭과 타임아웃 간의 레이스 컨디션
            const points = await Promise.race([
                fetchDataFn(),
                timeoutPromise
            ]) as ScatterPoint[];

            setData(points);
        } catch (err: any) {
            console.error("분석 실패 또는 타임아웃 발생");

            // 에러 유형에 따른 메시지 렌더링
            const isTimeout = err.message === 'TIMEOUT';
            setError(isTimeout
                ? `백엔드 연결 시간이 초과되었습니다. 리셋 버튼을 눌러주세요.`
                : `백엔드에 연결할 수 없습니다. 리셋 버튼을 눌러주세요.`
            );

            // 실패 시 빈 배열로 UI 흐름 유지
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // 모델 차원 변경 등 데이터 함수가 변경될 때 재조회
    }, [fetchDataFn]);

    // 불필요한 리렌더링 없이 UI를 활성 상태로 유지하기 위한 로딩 메시지 순환
    useEffect(() => {
        if (!isLoading) return;

        const messageTimer = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 3000);
        return () => clearInterval(messageTimer);
    }, [isLoading]);

    // 클러스터 구분성을 극대화하기 위한 고대비 고채도 식별 컬러 팔레트
    // 안정적인 매핑을 위해 한글과 영문 키를 모두 처리합니다.
    const STYLE_COLORS: Record<string, string> = {
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
        '매니시': '#4338ca',        // Deep Indigo (Sophisticated & Strong)
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

    /**
     * 컬러 제너레이터
     * 1. 사전에 정의된 스타일 목록에 있으면 지정된 색상 반환
     * 2. 그 외 알 수 없는 스타일의 경우, 문자열 해싱을 통해 일관된 HSL 색상을 동적으로 생성
     */
    const generateColor = (str: string) => {
        if (STYLE_COLORS[str]) return STYLE_COLORS[str];
        const keyLower = str.toLowerCase();
        if (STYLE_COLORS[keyLower]) return STYLE_COLORS[keyLower];

        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash % 360);
        return `hsl(${h}, 75%, 45%)`; // 알 수 없는 스타일 컬러를 약간 깊고 진하게 매핑
    };

    const plotData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // 스타일 카테고리별로 데이터 구분
        const groups = new Map<string, ScatterPoint[]>();
        data.forEach(point => {
            const style = point.style || "Unknown";
            if (!groups.has(style)) groups.set(style, []);
            groups.get(style)?.push(point);
        });

        // 그룹화된 데이터를 Plotly 렌더링 규격 배열로 변환
        return Array.from(groups.entries()).map(([style, points]) => {
            const color = generateColor(style);

            return {
                x: points.map(d => Number(d.xcoord)),
                y: points.map(d => Number(d.ycoord)),
                z: points.map(d => Number(d.zcoord)),
                text: points.map(d => `<b>${d.productName}</b>`),
                name: `<b>${style}</b>`,
                mode: 'markers' as const,
                type: 'scatter3d' as any,
                hovertemplate: `<span style="font-size:16px; color:${color}; font-weight:900;">${style}</span><br><br>%{text}<br>X: %{x:.2f}  Y: %{y:.2f}  Z: %{z:.2f}<extra></extra>`,
                marker: {
                    color: color,
                    size: 4.5,
                    opacity: 0.8,
                    line: { color: 'rgba(0, 0, 0, 0.25)', width: 0.5 },
                },
                hoverlabel: {
                    bgcolor: '#171717',
                    bordercolor: color,
                    font: { color: '#ffffff', size: 14, family: 'Inter' }
                }
            };
        });
    }, [data]);

    const [isExpanded, setIsExpanded] = useState(false);
    const [, setIsFullScreen] = useAtom(isFullScreenModalOpenAtom);

    useEffect(() => {
        setIsFullScreen(isExpanded);
        // 컴포넌트 언마운트 시 상태 초기화
        return () => setIsFullScreen(false);
    }, [isExpanded, setIsFullScreen]);

    return (
        <>
            <DashboardCard
                title={title}
                subtitle={subtitle}
                isLoading={isLoading}
                error={error}
                onRetry={fetchData}
                className={`${className} ${isExpanded ? 'invisible' : ''}`}
                lgColSpan={2}
                topRight={
                    <div className="relative group">
                        <button onClick={fetchData} disabled={isLoading} className="p-1 px-2 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 text-gray-400 hover:text-violet-500 hover:border-violet-500 flex items-center justify-center transition-all h-7">
                            <FaArrowsRotate className={isLoading ? 'animate-spin' : ''} size={12} />
                        </button>
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-neutral-800 dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap shadow-lg z-50">
                            RESET
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-800 dark:bg-white rotate-45"></div>
                        </div>
                    </div>
                }
            >

                {/* 축소된 메인 그래프 컨테이너 */}
                <div className="w-full h-32 mt-2 rounded-3xl overflow-hidden border border-neutral-300 dark:border-white/10 bg-gray-50/10 dark:bg-black/20 relative shadow-inner cursor-pointer group" onClick={() => setIsExpanded(true)}>
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl"
                            >
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full border-t-2 border-r-2 border-violet-600 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-2 w-2 bg-violet-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-[11px] font-bold text-black dark:text-white uppercase tracking-[0.2em]">{loadingMessages[loadingMessageIndex]}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CSS로 구현된 애니메이션 Placeholder (모달 확장을 유도) */}
                    <div className="w-full h-full relative z-10 flex flex-col items-center justify-center py-0 bg-linear-to-b from-transparent to-neutral-100/50 dark:to-white/5 transition-colors">

                        {/* CSS 추상 신경망 디자인 */}
                        <div className="relative w-14 h-14 flex items-center justify-center">
                            <div className="absolute inset-0 bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-xl group-hover:bg-violet-500/40 transition-colors duration-500"></div>
                            <div className="absolute inset-2 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-lg group-hover:bg-indigo-500/40 transition-colors duration-500 delay-75"></div>
                            <div className="absolute inset-4 bg-pink-400/20 dark:bg-pink-600/20 rounded-full blur-sm group-hover:bg-pink-500/40 transition-colors duration-500 delay-150"></div>
                            <LuChartScatter className="text-xl text-violet-600 dark:text-violet-400 relative z-10 group-hover:scale-125 transition-transform duration-500 drop-shadow-md" />
                        </div>

                        <div className="text-center space-y-0 z-10">
                            <h4 className="text-sm font-bold text-neutral-800 dark:text-gray-200 leading-tight">Interactive Map</h4>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-none px-4 opacity-80">
                                {description}
                            </p>
                        </div>
                    </div>

                    {error && !isLoading && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl flex items-center gap-3 z-30">
                            <FaTriangleExclamation className="text-red-500 text-xs" />
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-widest">{error}</span>
                        </div>
                    )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 relative z-10 mt-auto">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                        {bottomTextFormat.replace('{count}', data.length.toLocaleString())}
                    </p>
                </div>
            </DashboardCard>

            {/* 확대된 모달 뷰 */}
            <AnimatePresence>
                {
                    isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl overflow-y-auto md:overflow-hidden custom-scrollbar"
                        >
                            <div className="h-full p-4 md:p-6 flex flex-col max-w-400 mx-auto w-full">
                                <div className="flex justify-between items-start md:items-center mb-4 shrink-0 flex-col md:flex-row gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Interactive Mode</span>
                                        <div className="flex items-end gap-4">
                                            <h2 className="text-2xl md:text-4xl font-normal italic text-black dark:text-white">Full Scale Analysis</h2>
                                            <p className="text-[10px] md:text-[12px] font-bold text-gray-400 dark:text-gray-500 tracking-widest mb-1 bg-neutral-100 dark:bg-white/5 px-3 py-1 rounded-full">
                                                {bottomTextFormat.replace('{count}', data.length.toLocaleString())}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs md:text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shrink-0"
                                    >
                                        Close View
                                    </button>
                                </div>

                                <div className="w-full flex-1 flex justify-center items-center pb-4 min-h-0">
                                    <div className="w-full h-full rounded-3xl border border-neutral-200 dark:border-white/10 overflow-hidden bg-white dark:bg-black/20 shadow-2xl relative p-2 md:p-4">
                                        <Plot
                                            data={plotData}
                                            layout={{
                                                autosize: true,
                                                margin: { l: 0, r: 0, b: 0, t: 0 },
                                                showlegend: true,
                                                legend: {
                                                    orientation: 'h',
                                                    y: 0.05,
                                                    font: { size: 12, family: 'Inter', color: '#6b7280' },
                                                    itemsizing: 'constant'
                                                },
                                                hovermode: 'closest',
                                                uirevision: 'true', // 카메라 상태 유지를 위한 핵심 옵션
                                                paper_bgcolor: 'rgba(0,0,0,0)',
                                                plot_bgcolor: 'rgba(0,0,0,0)',
                                                scene: {
                                                    xaxis: { showgrid: true, gridcolor: '#cbd5e1', gridwidth: 1.5, zeroline: true, zerolinecolor: '#94a3b8', zerolinewidth: 2, showticklabels: false, title: '' },
                                                    yaxis: { showgrid: true, gridcolor: '#cbd5e1', gridwidth: 1.5, zeroline: true, zerolinecolor: '#94a3b8', zerolinewidth: 2, showticklabels: false, title: '' },
                                                    zaxis: { showgrid: true, gridcolor: '#cbd5e1', gridwidth: 1.5, zeroline: true, zerolinecolor: '#94a3b8', zerolinewidth: 2, showticklabels: false, title: '' },
                                                    camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
                                                }
                                            }}
                                            config={{
                                                displayModeBar: true,
                                                scrollZoom: true,
                                                responsive: true,
                                            }}
                                            useResizeHandler={true}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </>
    );
}
