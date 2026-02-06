
'use client';

import { useState, useEffect } from 'react';
import {
  FaArrowUp,
  FaArrowDown,
  FaTags,
  FaGem,
  FaWaveSquare,
  FaBolt
} from 'react-icons/fa6';
import { getShoppingTrends } from '@/app/api/trendService/trendapi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard({ initialTrends = [] }: { initialTrends?: { score: number, style: string }[] }) {
  // SSR로 받은 데이터를 초기값으로 사용
  const [trends, setTrends] = useState<{ score: number, style: string }[]>(
    initialTrends.length > 0 ? initialTrends.sort((a, b) => b.score - a.score) : []
  );

  useEffect(() => {
    // 만약 SSR 데이터가 없다면 클라이언트에서 페치 (또는 최신 데이터 업데이트용)
    if (initialTrends.length === 0) {
      const fetchTrends = async () => {
        try {
          const data = await getShoppingTrends();
          if (data) {
            const sortedData = data.sort((a: any, b: any) => b.score - a.score);
            setTrends(sortedData);
          }
        } catch (error) {
          console.error("Failed to fetch shopping trends:", error);
        }
      };
      fetchTrends();
    }
  }, [initialTrends]);
  // 대시보드 상단에 표시될 주요 지표(Metric) 배열
  const mainMetrics = [
    { label: 'Inventory Growth', value: '+12.5%', trend: 'up', sub: 'vs last month', icon: <FaBolt />, color: 'violet' },
    { label: 'Aesthetic DNA Score', value: '94.8', trend: 'up', sub: 'High Fidelity', icon: <FaGem />, color: 'indigo' },
    { label: 'Curation Rate', value: '820/d', trend: 'down', sub: '-4% from avg', icon: <FaWaveSquare />, color: 'black' },
    { label: 'Active Metadata', value: '45.2K', trend: 'up', sub: 'Optimal indexing', icon: <FaTags />, color: 'violet' },
  ];

  // 인벤토리 카테고리별 분포 데이터 배열
  const categories = [
    { name: 'Outerwear', count: 4281, percentage: 34 },
    { name: 'Tops', count: 3120, percentage: 25 },
    { name: 'Bottoms', count: 2890, percentage: 23 },
    { name: 'Accessories', count: 2191, percentage: 18 },
  ];

  return (
    <div className="space-y-10">
      {/* 주요 지표 그리드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900/50 p-8 rounded-[2.5rem] border border-neutral-200 dark:border-white/5 shadow-sm space-y-6 hover:border-violet-100 dark:hover:border-violet-800 transition-colors group">
            <div className="flex justify-between items-start">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm shadow-lg ${metric.color === 'violet' ? 'bg-violet-600 shadow-violet-100 dark:shadow-none' :
                metric.color === 'indigo' ? 'bg-indigo-600 shadow-indigo-100 dark:shadow-none' : 'bg-black dark:bg-neutral-800 shadow-gray-100 dark:shadow-none'
                }`}>
                {metric.icon}
              </div>
              {/* 트렌드(상승/하락) 표시 영역 */}
              <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest ${metric.trend === 'up' ? 'text-violet-500' : 'text-red-400'}`}>
                {metric.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />} {metric.value}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest group-hover:text-violet-300 dark:group-hover:text-violet-400 transition-colors">{metric.label}</p>
              <p className="text-3xl font-serif italic text-black dark:text-white tracking-tight">{metric.value}</p>
              <p className="text-[8px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{metric.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 카테고리 분포 시각화 섹션 (Progress Bar 형태) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900/50 rounded-[3rem] border border-neutral-200 dark:border-white/5 p-12 space-y-10 shadow-sm transition-colors">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em]">Inventory Mapping</span>
              <h3 className="text-3xl font-serif italic text-black dark:text-white tracking-tight">Category Distribution</h3>
            </div>
            <p className="text-[9px] font-bold text-violet-400 dark:text-violet-400 uppercase tracking-widest">Total: 12,482 Items</p>
          </div>

          <div className="space-y-8">
            {categories.map((cat, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">{cat.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{cat.count} items / {cat.percentage}%</span>
                </div>
                {/* 커스텀 프로그레스 바: 데이터 비율 표시 */}
                <div className="h-[2px] w-full bg-gray-50 dark:bg-neutral-800 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-linear-to-r from-violet-500 to-indigo-600 transition-all duration-1000 ease-out"
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 인사이트 카드: 시스템이 제안하는 분석 결과 표시 */}
        <div className="bg-linear-to-br from-violet-950 via-black to-black dark:from-violet-900 dark:via-black dark:to-black rounded-[3rem] p-12 text-white flex flex-col justify-between space-y-12 shadow-xl shadow-violet-900/10 border border-violet-900/20 relative overflow-hidden">
          {/* 내부 은은한 빛 효과 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[60px]" />

          <div className="space-y-6 relative z-10">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm">
              <FaGem className="text-violet-400" />
            </div>
            <div className="space-y-3">
              <h4 className="text-2xl font-serif italic tracking-tight">Curation Insight</h4>
              <p className="text-xs font-light text-violet-200/60 leading-relaxed italic">
                "Neural analysis detects a 14% increase in 'minimalist' aesthetic DNA within the Outerwear segment. Inventory rotation is recommended for high-fidelity alignment."
              </p>
            </div>
          </div>

          {/* 하단 상태 표시 영역 */}
          <div className="pt-8 border-t border-white/10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></div>
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-violet-400/60">AI Intelligence Optimal</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-neutral-900/50 rounded-[3rem] border border-neutral-200 dark:border-white/5 p-12 space-y-10 shadow-sm transition-colors">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em]">Trend Analysis</span>
              <h3 className="text-3xl font-serif italic text-black dark:text-white tracking-tight">Shopping Style Insights</h3>
            </div>
            <p className="text-[9px] font-bold text-violet-400 dark:text-violet-400 uppercase tracking-widest">Top 5 Trending Styles</p>
          </div>

          <div className="space-y-8">
            {trends.length > 0 ? (
              trends.slice(0, 5).map((trend, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest">{trend.style}</span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">Score: {trend.score.toFixed(2)}</span>
                  </div>
                  {/* 커스텀 프로그레스 바: 스코어 비율 표시 (최대 100 가정) */}
                  <div className="h-[2px] w-full bg-gray-50 dark:bg-neutral-800 overflow-hidden rounded-full">
                    <div
                      className="h-full bg-linear-to-r from-violet-500 to-indigo-600 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(trend.score, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-30">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
                <p className="text-[10px] uppercase tracking-widest">Loading Insights...</p>
              </div>
            )}
          </div>
        </div>

        {/* 신규: Recharts를 사용한 전체 스타일 분포 차트 */}
        <div className="lg:col-span-3 bg-white dark:bg-neutral-900/50 rounded-[3rem] border border-neutral-200 dark:border-white/5 p-12 shadow-sm transition-colors overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-16">

            {/* Recharts PieChart 영역 */}
            <div className="relative w-72 h-72 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trends.slice(0, 8).map(t => ({ score: t.score, name: t.style }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="score"
                    nameKey="name"
                    stroke="none"
                  >
                    {trends.slice(0, 8).map((entry, index) => {
                      // 보라색을 기반으로 하되 채도와 명도를 다양하게 하여 구분감 확보
                      const CHART_COLORS = [
                        '#8B5CF6', // Violet 500
                        '#3B82F6', // Blue 500
                        '#EC4899', // Pink 500
                        '#818CF8', // Indigo 400
                        '#2DD4BF', // Teal 400
                        '#60A5FA', // Sky 400
                        '#F472B6', // Pink 400
                        '#A78BFA'  // Violet 400
                      ];
                      return <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* 중앙 텍스트 오버레이 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Style</span>
                <span className="text-2xl font-serif italic text-black dark:text-white">DNA</span>
              </div>
            </div>

            {/* 범례 (Legend) */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
              <div className="col-span-full mb-2">
                <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em]">Style Proportion</span>
                <h3 className="text-2xl font-serif italic text-black dark:text-white tracking-tight">Full Aesthetic Distribution</h3>
              </div>
              {trends.length > 0 ? trends.slice(0, 12).map((trend, i) => {
                const colors = [
                  'bg-[#8B5CF6]', 'bg-[#3B82F6]', 'bg-[#EC4899]', 'bg-[#818CF8]',
                  'bg-[#2DD4BF]', 'bg-[#60A5FA]', 'bg-[#F472B6]', 'bg-[#A78BFA]',
                  'bg-gray-400', 'bg-gray-300', 'bg-gray-200', 'bg-gray-100'
                ];
                return (
                  <div key={i} className="flex items-center gap-3 group transition-all hover:translate-x-1">
                    <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]} shadow-sm`}></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-black dark:text-white uppercase tracking-widest group-hover:text-violet-500 transition-colors truncate max-w-[100px]">{trend.style}</span>
                      <span className="text-[8px] font-medium text-gray-400 dark:text-gray-500 uppercase">{trend.score.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-[10px] text-gray-400 uppercase tracking-widest col-span-full">No data available</p>
              )}
            </div>
          </div>

          {/* 장식용 배경 요소 */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
}
