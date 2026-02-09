
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

  // 자동 Fetch 시도 여부 추적 (무한 루프 방지)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [hasAttemptedSalesFetch, setHasAttemptedSalesFetch] = useState(false);

  /**
   * 타임아웃이 포함된 데이터 Fetch 함수
   */
  const fetchWithTimeout = async <T,>(fetchFn: () => Promise<T>, timeoutMs: number = 2000): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
    );
    return Promise.race([fetchFn(), timeoutPromise]);
  };

  const fetchData = async (isManual: boolean = false) => {
    if (!isManual) {
      setHasAttemptedFetch(true);
    }
    try {
      setIsLoading(true);
      setError(null);
      // 충분한 대기 시간 확보 (1500ms -> 15000ms)
      const res = await fetchWithTimeout(getShoppingTrends, 15000);
      if (res) {
        // API 응답 데이터 매핑: score와 value를 양립시켜 두 컴포넌트 모두 지원
        const mappedData = res.map((item: any, i: number) => {
          const scoreVal = item.score || item.value || 0;
          return {
            style: item.style || 'Unknown',
            score: scoreVal,
            value: item.value || scoreVal,
            percentStr: item.percentStr || `${scoreVal.toFixed(1)}%`,
            xcoord: item.xcoord || (Math.random() * 200 - 100),
            ycoord: item.ycoord || (Math.random() * 200 - 100),
            productId: item.productId || `prod-${Date.now()}-${i}`,
            productName: item.productName || item.style || `Product-${i}`
          };
        });
        setData(mappedData.sort((a: any, b: any) => b.value - a.value));
      }
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      setError(error.message === 'TIMEOUT' ? 'Neural Link Timeout' : 'Sync Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSales = async (isManual: boolean = false) => {
    if (!isManual) {
      setHasAttemptedSalesFetch(true);
    }
    try {
      setIsLoadingSales(true);
      setErrorSales(null);
      const data = await fetchWithTimeout(getSalesRanking, 15000);
      if (data) {
        setSales(data.sort((a, b) => b.saleQuantity - a.saleQuantity).slice(0, 5));
      }
    } catch (error: any) {
      console.error("Failed to fetch sales ranking:", error);
      setErrorSales(error.message === 'TIMEOUT' ? 'Neural Link Timeout' : 'Sync Failed');
    } finally {
      setIsLoadingSales(false);
    }
  };

  // 컴포넌트 마운트 시 최초 1회만 자동 시도
  useEffect(() => {
    if (initialData.length === 0 && !hasAttemptedFetch) {
      fetchData();
    }
  }, []); // 의존성 배열을 비워 마운트 시 1회만 실행되도록 함

  useEffect(() => {
    if (initialSales.length === 0 && !hasAttemptedSalesFetch) {
      fetchSales();
    }
  }, []); // 의존성 배열을 비워 마운트 시 1회만 실행되도록 함

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
              {/* 트렌드(상승/하락) 표시 영역 */}
              <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest ${metric.trend === 'up' ? 'text-violet-500' : 'text-red-400'}`}>
                {metric.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />} {metric.value}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest group-hover:text-violet-300 dark:group-hover:text-violet-400 transition-colors subpixel-antialiased">{metric.label}</p>
              <p className="text-3xl font-serif italic text-black dark:text-white tracking-tight">{metric.value}</p>
              <p className="text-[8px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] subpixel-antialiased">{metric.sub}</p>
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

        {/* 
          [t-SNE 시각화 섹션]
          고차원 스타일 데이터를 2차원으로 투영하여 클러스터링을 시각화합니다.
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
