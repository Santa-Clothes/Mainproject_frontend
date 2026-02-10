
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
import CategoryDistributionCard from './components/CategoryDistributionCard';
import AestheticDistributionCard from './components/AestheticDistributionCard';
import BestSellersCard from './components/BestSellersCard';
import { getShoppingTrends } from '@/app/api/trendService/trendapi';
import { getSalesRanking, SalesRankItem } from '@/app/api/salesService/salesapi';
import TSNEPlot from './components/TSNEPlot';

export default function Dashboard({
  initialData = [],
  initialSales = []
}: {
  initialData?: { value: number, style: string, percentStr: string }[],
  initialSales?: SalesRankItem[]
}) {
  // 통합 데이터 상태 관리 (기존 trends -> data)
  const [data, setData] = useState<{
    value: number, style: string, percentStr: string, score: number,
    xcoord: number, ycoord: number, productId: string, productName: string
  }[]>(
    initialData.length > 0 ? initialData.map((t, i) => ({
      ...t,
      score: t.value || 0,
      value: t.value || 0,
      percentStr: t.percentStr || '0%',
      xcoord: Math.random() * 200 - 100,
      ycoord: Math.random() * 200 - 100,
      productId: `init-${i}`,
      productName: t.style || `Style-${i}`
    })).sort((a, b) => b.value - a.value) : []
  );
  const [isLoading, setIsLoading] = useState(initialData.length === 0);
  const [error, setError] = useState<string | null>(null);

  // 매출 랭킹 데이터 상태 관리
  const [sales, setSales] = useState<SalesRankItem[]>(
    initialSales.length > 0 ? initialSales.sort((a, b) => b.saleQuantity - a.saleQuantity).slice(0, 5) : []
  );
  const [isLoadingSales, setIsLoadingSales] = useState(initialSales.length === 0);
  const [errorSales, setErrorSales] = useState<string | null>(null);

  // 데이터 fetch 시도 여부 플래그 (무한 루프 방지)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [hasAttemptedSalesFetch, setHasAttemptedSalesFetch] = useState(false);

  // 통합 데이터 fetch 함수
  const fetchData = async (isRetry = false) => {
    if (!isRetry && hasAttemptedFetch) return;
    setHasAttemptedFetch(true);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getShoppingTrends();
      const processedData = result.map((item: any, i: number) => ({
        ...item,
        score: item.value || 0,
        value: item.value || 0,
        percentStr: item.percentStr || '0%',
        xcoord: Math.random() * 200 - 100,
        ycoord: Math.random() * 200 - 100,
        productId: `trend-${i}`,
        productName: item.style || `Style-${i}`
      })).sort((a: any, b: any) => b.value - a.value);

      setData(processedData);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
      setError('Connection Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 매출 랭킹 fetch 함수
  const fetchSales = async (isRetry = false) => {
    if (!isRetry && hasAttemptedSalesFetch) return;
    setHasAttemptedSalesFetch(true);
    setIsLoadingSales(true);
    setErrorSales(null);

    try {
      const result = await getSalesRanking();
      const sortedSales = result.sort((a, b) => b.saleQuantity - a.saleQuantity).slice(0, 5);
      setSales(sortedSales);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
      setErrorSales('Connection Failed');
    } finally {
      setIsLoadingSales(false);
    }
  };

  // 컴포넌트 마운트 시 최초 1회만 자동 시도
  useEffect(() => {
    if (initialData.length === 0 && !hasAttemptedFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열을 비워 마운트 시 1회만 실행되도록 함

  useEffect(() => {
    if (initialSales.length === 0 && !hasAttemptedSalesFetch) {
      fetchSales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열을 비워 마운트 시 1회만 실행되도록 함

  // 대시보드 상단에 표시될 주요 지표(Metric) 배열
  const mainMetrics = [
    { label: 'Inventory Growth', value: '+12.5%', trend: 'up', sub: 'vs last month', icon: <FaBolt />, color: 'violet' },
    { label: 'Aesthetic DNA Score', value: '94.8', trend: 'up', sub: 'High Fidelity', icon: <FaGem />, color: 'indigo' },
    { label: 'Curation Rate', value: '820/d', trend: 'down', sub: '-4% from avg', icon: <FaWaveSquare />, color: 'black' },
    { label: 'Active Metadata', value: '45.2K', trend: 'up', sub: 'Optimal indexing', icon: <FaTags />, color: 'violet' },
  ];

  return (
    <div className="space-y-10 pb-20">
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
              <div className={`flex items-center gap-1 text-xs font-bold ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.trend === 'up' ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{metric.label}</p>
              <h3 className="text-3xl font-serif italic text-black dark:text-white tracking-tight">{metric.value}</h3>
              <p className="text-[9px] text-gray-400 dark:text-gray-600 uppercase tracking-widest">{metric.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Modularized Trends Card */}
        <CategoryDistributionCard trends={data as any} isLoading={isLoading} error={error} onRetry={() => fetchData(true)} />

        {/* AI 인사이트 카드: 시스템이 제안하는 분석 결과 표시 */}
        <div className="bg-linear-to-br from-violet-950 via-black to-black dark:from-violet-900 dark:via-black dark:to-black rounded-[3rem] p-12 text-white flex flex-col justify-between space-y-12 shadow-xl shadow-violet-900/10 border border-violet-900/20 relative overflow-hidden">
          {/* 내부 은은한 빛 효과 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[60px]" />

          <div className="space-y-6 relative z-10 antialiased">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm">
              <FaGem className="text-violet-400" />
            </div>
            <div className="space-y-3">
              <h4 className="text-2xl font-serif italic tracking-normal px-8 -ml-8">Curation Insight</h4>
              <p className="text-xs font-light text-violet-200/60 leading-relaxed italic">
                "Neural analysis detects a 14% increase in 'minimalist' aesthetic DNA within the Outerwear segment. Inventory rotation is recommended for high-fidelity alignment."
              </p>
            </div>
          </div>

          {/* 하단 상태 표시 영역 */}
          <div className="pt-8 border-t border-white/10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></div>
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-violet-400/60 subpixel-antialiased">AI Intelligence Optimal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 
          [t-SNE 시각화 섹션]
          고차원 스타일 데이터를 2차원으로 투영하여 클러스터링을 시각화합니다.
          각 점은 개별 상품을 나타내며, 유사한 스타일은 가까이 배치됩니다.
          별도의 컴포넌트로 분리하여 관리가 용이하도록 했습니다.
        */}
        <TSNEPlot />

        {/* Modularized Distribution Card with Recharts */}
        <AestheticDistributionCard data={data} isLoading={isLoading} error={error} onRetry={() => fetchData(true)} />

        {/* Modularized Best Sellers Card with Recharts */}
        <BestSellersCard sales={sales} isLoading={isLoadingSales} error={errorSales} onRetry={() => fetchSales(true)} />
      </div>
    </div>
  );
}
