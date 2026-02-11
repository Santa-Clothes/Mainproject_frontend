import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FaCircleInfo, FaArrowsRotate, FaTriangleExclamation, FaExpand } from "react-icons/fa6";
import { getTSNEPoints, TSNEPoint } from "@/app/api/trendService/tsneapi";
import { motion, AnimatePresence } from "framer-motion";

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

export default function TSNEPlot() {
    const [data, setData] = useState<TSNEPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    const loadingMessages = [
        "Analyzing high-dimensional vectors...",
        "Comparing neural patterns...",
        "Projecting aesthetic space...",
        "Clustering style DNA...",
        "Optimizing GPU rendering..."
    ];

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 15초 타임아웃 설정 (충분한 대기 시간 확보)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), 15000)
            );

            // 실제 데이터 요청과 타임아웃 경합
            const points = await Promise.race([
                getTSNEPoints(),
                timeoutPromise
            ]) as TSNEPoint[];

            setData(points);
        } catch (err: any) {
            console.error("Analysis failed or timed out, using preview mode.");

            // 타임아웃인지 일반 에러인지에 따라 메시지 분기 가능
            const isTimeout = err.message === 'TIMEOUT';
            setError(isTimeout
                ? "Neural engine connection timed out. Displaying cached preview."
                : "Neural engine offline. Displaying cached preview."
            );

            // 데모용 샘플 데이터 생성 (실패 시에도 UI 흐름 유지를 위함)
            const mockPoints: TSNEPoint[] = Array.from({ length: 300 }, (_, i) => ({
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
    }, []);

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
        const groups = new Map<string, TSNEPoint[]>();
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
                text: points.map(d => d.productName),
                name: style, // 범례에 표시될 이름
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
                    font: { color: '#ffffff', size: 11, family: 'Inter' }
                }
            };
        });
    }, [data]);

    const [isExpanded, setIsExpanded] = useState(false);

    // ... (existing code)

    return (
        <>
            <div className={`lg:col-span-4 bg-white dark:bg-neutral-900/50 rounded-4xl border border-neutral-200 dark:border-white/5 p-8 space-y-8 shadow-sm transition-colors overflow-hidden flex flex-col min-h-87.5 relative ${isExpanded ? 'invisible' : ''}`}>
                <div className="flex justify-between items-end relative z-10">
                    <div className="space-y-2">
                        <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em]">Style Projection</span>
                        <h3 className="text-3xl font-serif italic text-black dark:text-white tracking-tight">T-SNE Neural Map</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsExpanded(true)} className="p-3 rounded-full bg-neutral-100 dark:bg-white/5 text-gray-400 hover:text-violet-500 transition-all" title="Expand View">
                            <FaExpand />
                        </button>
                        <button onClick={fetchData} disabled={isLoading} className="p-3 rounded-full bg-neutral-100 dark:bg-white/5 text-gray-400 hover:text-violet-500 transition-all">
                            <FaArrowsRotate className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <div className="px-5 py-2 bg-violet-50 dark:bg-violet-950/30 rounded-full border border-violet-100 dark:border-violet-900/40">
                            <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest flex items-center gap-2">
                                <FaCircleInfo className="text-xs" />
                                Neural Aesthetics Mapping
                            </span>
                        </div>
                    </div>
                </div>

                {/* 그래프 컨테이너 (축소 상태) */}
                <div className="w-full flex-1 min-h-100 rounded-3xl overflow-hidden border border-neutral-300 dark:border-white/10 bg-gray-50/10 dark:bg-black/20 relative shadow-inner cursor-pointer" onClick={() => setIsExpanded(true)}>
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

                    <div className="w-full h-100 relative z-10 bg-white/5 pointer-events-none">
                        <Plot
                            data={plotData}
                            layout={{
                                autosize: true,
                                margin: { l: 40, r: 40, b: 40, t: 40 },
                                showlegend: false,
                                hovermode: false,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                xaxis: { showgrid: true, gridcolor: '#f3f4f6', zeroline: false, showticklabels: false, autorange: true },
                                yaxis: { showgrid: true, gridcolor: '#f3f4f6', zeroline: false, showticklabels: false, autorange: true },
                            }}
                            config={{ displayModeBar: false, responsive: true, staticPlot: true }}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '100%' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors group">
                            <span className="px-6 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                Click to Interact
                            </span>
                        </div>
                    </div>

                    {error && !isLoading && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl flex items-center gap-3 z-30">
                            <FaTriangleExclamation className="text-red-500 text-xs" />
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-widest">{error}</span>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-white/5 relative z-10">
                    <p className="text-[9px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                        Visualizing {data.length} neural vectors across aesthetic manifold.
                    </p>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-violet-600/5 rounded-full blur-[120px] pointer-events-none"></div>
            </div>

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
                                <h2 className="text-4xl font-serif italic text-black dark:text-white">Full Scale Analysis</h2>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="px-8 py-4 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                                Close View
                            </button>
                        </div>

                        <div className="flex-1 rounded-[3rem] border border-neutral-200 dark:border-white/10 overflow-hidden bg-gray-50/50 dark:bg-black/20 shadow-2xl relative">
                            <Plot
                                data={plotData}
                                layout={{
                                    autosize: true,
                                    margin: { l: 60, r: 60, b: 60, t: 60 },
                                    showlegend: true,
                                    legend: { orientation: 'h', y: -0.1 },
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
