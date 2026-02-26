import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FaArrowsRotate, FaTriangleExclamation, FaExpand } from "react-icons/fa6";
import { LuChartScatter } from "react-icons/lu";
import { ScatterPoint } from "@/app/api/statservice/plotapi";
import { motion, AnimatePresence } from "framer-motion";
import DashboardCard from "./DashboardCard";

/**
 * react-plotly.js 라이브러리는 내부적으로 window 객체를 사용합니다.
 * Next.js의 서버 사이드 렌더링(SSR) 환경에서는 window가 없으므로 에러가 발생합니다.
 * 이를 방지하기 위해 next/dynamic을 사용하여 클라이언트 사이드에서만 로드하도록 설정합니다.
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
    description = "해당 모델의 클러스터링 결과를 2차원 평면에 시각화한 맵입니다.",
    bottomTextFormat = "Visualizing {count} Style Latent vectors.",
    className = "lg:col-span-4",
    fetchDataFn
}: ScatterPlotProps) {
    const [data, setData] = useState<ScatterPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    const loadingMessages = [
        "잠재벡터 2차원 투영중...",
        /* "비교 분석중...",
        "스타일 공간 투영중...",
        "스타일 클러스터링중...",
        "GPU 렌더링 최적화중..." */
    ];

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 15초 타임아웃 설정 (충분한 대기 시간 확보)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), 20000)
            );

            // 실제 데이터 요청과 타임아웃 경합
            const points = await Promise.race([
                fetchDataFn(),
                timeoutPromise
            ]) as ScatterPoint[];

            setData(points);
        } catch (err: any) {
            console.error("Analysis failed or timed out, using preview mode.");

            // 타임아웃인지 일반 에러인지에 따라 메시지 분기 가능
            const isTimeout = err.message === 'TIMEOUT';
            setError(isTimeout
                ? `backend connection timed out. Please click reset button.`
                : `backend offline. Please click reset button.`
            );

            // 데모용 샘플 데이터 생성 (실패 시에도 UI 흐름 유지를 위함)
            const mockPoints: ScatterPoint[] = Array.from({ length: 0 }, (_, i) => ({
                xcoord: Math.random() * 20 - 10,
                ycoord: Math.random() * 20 - 10,
                productName: `Style Item #${i + 1}`,
                productId: `mock-${i}`,
                style: ["Minimalist", "Avant-Garde", "Vintage", "Streetwear", "Luxury"][Math.floor(Math.random() * 5)]
            }));
            setData(mockPoints);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchDataFn]);

    // 로딩 중에만 메시지 변경 타이머 가동 (불필요한 리렌더링 방지)
    useEffect(() => {
        if (!isLoading) return;

        const messageTimer = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 3000);
        return () => clearInterval(messageTimer);
    }, [isLoading]);

    // 동적 색상 생성 함수: 문자열(style)을 기반으로 고유한 HSL 색상을 생성합니다.
    const generateColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        // HSL 색상 공간을 사용하여 채도(70%)와 명도(60%)를 고정하고 색상(Hue)만 변경
        const h = Math.abs(hash % 360);
        return `hsl(${h}, 70%, 60%)`;
    };

    const plotData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // 데이터 클러스터링 그룹화 (style 기준)
        const groups = new Map<string, ScatterPoint[]>();
        data.forEach(point => {
            const style = point.style || "Unknown";
            if (!groups.has(style)) groups.set(style, []);
            groups.get(style)?.push(point);
        });

        // 각 그룹을 별도의 Trace로 변환
        return Array.from(groups.entries()).map(([style, points]) => {
            // 미리 정의된 색상이 없으므로, 데이터에 있는 스타일 이름으로 즉석에서 색상 생성
            const color = generateColor(style);

            return {
                x: points.map(d => Number(d.xcoord)),
                y: points.map(d => Number(d.ycoord)),
                text: points.map(d => `<b>${d.productName}</b>`), // 툴팁 텍스트 굵게
                name: `<b>${style}</b>`, // 범례 이름 굵게
                mode: 'markers' as const,
                type: 'scatter' as const,
                marker: {
                    color: color,
                    size: 8,
                    opacity: 0.8,
                    line: { color: 'white', width: 0.5 },
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
                        <button onClick={fetchData} disabled={isLoading} className="p-3 rounded-full border-2 border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/5 text-gray-400 hover:text-violet-500 hover:border-2 hover:border-violet-500 flex items-center justify-center transition-all">
                            <FaArrowsRotate className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-neutral-800 dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap shadow-lg z-50">
                            RESET
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-800 dark:bg-white rotate-45"></div>
                        </div>
                    </div>
                }
            >

                {/* 그래프 컨테이너 (축소 상태) */}
                <div className="w-full flex-1 min-h-50 rounded-3xl overflow-hidden border border-neutral-300 dark:border-white/10 bg-gray-50/10 dark:bg-black/20 relative shadow-inner cursor-pointer group" onClick={() => setIsExpanded(true)}>
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

                    {/* 최적화: 메인 화면에서는 무거운 Plotly 대신 퍼포먼스 가벼운 CSS 플레이스홀더를 띄웁니다. */}
                    <div className="w-full h-full min-h-50 relative z-10 flex flex-col items-center justify-center gap-4 py-4 bg-linear-to-b from-transparent to-neutral-100/50 dark:to-white/5 transition-colors">

                        {/* CSS 렌더링 추상 신경망 */}
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-2xl group-hover:bg-violet-500/40 transition-colors duration-500"></div>
                            <div className="absolute inset-3 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-xl group-hover:bg-indigo-500/40 transition-colors duration-500 delay-75"></div>
                            <div className="absolute inset-8 bg-pink-400/20 dark:bg-pink-600/20 rounded-full blur-md group-hover:bg-pink-500/40 transition-colors duration-500 delay-150"></div>

                            <LuChartScatter className="text-4xl text-violet-600 dark:text-violet-400 relative z-10 group-hover:scale-125 transition-transform duration-500 drop-shadow-lg" />
                        </div>

                        <div className="text-center space-y-1 z-10">
                            <h4 className="text-xl font-bold text-neutral-800 dark:text-gray-200">Interactive Map</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed px-4">
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

                <div className="pt-6 border-t border-gray-100 dark:border-white/5 relative z-10 mt-auto">
                    <p className="text-[12px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                        {bottomTextFormat.replace('{count}', data.length.toLocaleString())}
                    </p>
                </div>
            </DashboardCard>

            {/* 확장된 모달 뷰 */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl p-8 md:p-16 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Interactive Mode</span>
                                <div className="flex items-end gap-4">
                                    <h2 className="text-4xl font-normal italic text-black dark:text-white">Full Scale Analysis</h2>
                                    <p className="text-[12px] font-bold text-gray-400 dark:text-gray-500 tracking-widest mb-1.5 bg-neutral-100 dark:bg-white/5 px-3 py-1 rounded-full">
                                        {bottomTextFormat.replace('{count}', data.length.toLocaleString())}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="px-8 py-4 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                                Close View
                            </button>
                        </div>

                        <div className="flex-1 rounded-3xl border border-neutral-200 dark:border-white/10 overflow-hidden bg-gray-50/50 dark:bg-black/20 shadow-2xl relative p-2 md:p-4">
                            <Plot
                                data={plotData}
                                layout={{
                                    autosize: true,
                                    margin: { l: 60, r: 60, b: 80, t: 60 },
                                    showlegend: true,
                                    legend: {
                                        orientation: 'h',
                                        y: -0.15,
                                        font: { size: 14, family: 'Inter', color: '#6b7280' },
                                        itemsizing: 'constant'
                                    },
                                    hovermode: 'closest',
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    xaxis: { showgrid: true, gridcolor: '#e5e7eb', zeroline: false, showticklabels: true },
                                    yaxis: { showgrid: true, gridcolor: '#e5e7eb', zeroline: false, showticklabels: true },
                                    dragmode: 'pan',
                                }}
                                config={{
                                    displayModeBar: true,
                                    scrollZoom: true, // 스크롤 줌 활성화
                                    responsive: true,
                                }}
                                useResizeHandler={true}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
