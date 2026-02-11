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
import SearchRankCard from './components/SearchRankCard';
import AestheticDistributionCard from './components/AestheticDistributionCard';
import BestSellersCard from './components/BestSellersCard';
import { getShoppingTrends } from '@/app/api/trendService/trendapi';
import { getSalesRanking, SalesRankItem } from '@/app/api/salesService/salesapi';
import TSNEPlot from './components/TSNEPlot';

/**
 * DashboardTrendItem: 트렌드 분석 결과 데이터의 내부 타입 정의
 */
interface DashboardTrendItem {
  value: number;
  style: string;
  percentStr: string;
  score: number;
  xcoord: number; // t-SNE 시각화를 위한 X 좌표
  ycoord: number; // t-SNE 시각화를 위한 Y 좌표
  productId: string;
  productName: string;
}

/**
 * Dashboard Component
 * 서비스의 주요 지표, 스타일 트렌드, 매출 순위 등을 한눈에 보여주는 메인 관제 센터
 */
export default function Dashboard({
  initialData = [],
  initialSales = []
}: {
  initialData?: any[],
  initialSales?: SalesRankItem[]
}) {
  // [상태 관리] 트렌드(Data Map) 및 매출 랭킹 데이터
  const [data, setData] = useState<DashboardTrendItem[]>(
    initialData.length > 0 ? initialData.map((t, i) => ({
      ...t,
      score: t.value || 0,
      value: t.value || 0,
      percentStr: t.percentStr || '0%',
      // 데모를 위해 초기 좌표를 무작위로 생성 (백엔드 좌표 연동 시 수정 필요)
      xcoord: Math.random() * 200 - 100,
      ycoord: Math.random() * 200 - 100,
      productId: `init-${i}`,
      productName: t.style || `Style-${i}`
    })).sort((a, b) => b.value - a.value) : []
  );

  const [isLoading, setIsLoading] = useState(initialData.length === 0);
  const [error, setError] = useState<string | null>(null);

  const [sales, setSales] = useState<SalesRankItem[]>(
    initialSales.length > 0 ? initialSales.sort((a, b) => b.saleQuantity - a.saleQuantity).slice(0, 5) : []
  );
  const [isLoadingSales, setIsLoadingSales] = useState(initialSales.length === 0);
  const [errorSales, setErrorSales] = useState<string | null>(null);

  // 무한 페칭 방지를 위한 요청 시도 플래그
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [hasAttemptedSalesFetch, setHasAttemptedSalesFetch] = useState(false);

  /**
   * 스타일 트렌드 데이터 페칭 및 가공
   */
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

  /**
   * 매출 랭킹 데이터 페칭
   */
  const fetchSales = async (isRetry = false) => {
    if (!isRetry && hasAttemptedSalesFetch) return;
    setHasAttemptedSalesFetch(true);
    setIsLoadingSales(true);
    setErrorSales(null);

    try {
      const result = await getSalesRanking();
      const sortedSales = result.sort((a, b) => b.saleQuantity - a.saleQuantity);
      setSales(sortedSales);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
      setErrorSales('Connection Failed');
    } finally {
      setIsLoadingSales(false);
    }
  };

  useEffect(() => {
    if (initialData.length === 0 && !hasAttemptedFetch) fetchData();
    if (initialSales.length === 0 && !hasAttemptedSalesFetch) fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 대시보드 메트릭 카드 정의
  const mainMetrics = [
    { label: 'Inventory Growth', value: '+12.5%', trend: 'up', sub: 'vs last month', icon: <FaBolt />, color: 'violet' },
    { label: 'Aesthetic DNA Score', value: '94.8', trend: 'up', sub: 'High Fidelity', icon: <FaGem />, color: 'indigo' },
    { label: 'Curation Rate', value: '820/d', trend: 'down', sub: '-4% from avg', icon: <FaWaveSquare />, color: 'black' },
    { label: 'Active Metadata', value: '45.2K', trend: 'up', sub: 'Optimal indexing', icon: <FaTags />, color: 'violet' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* 1. 상단 주요 지표 요약 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900/50 p-6 rounded-4xl border border-neutral-200 dark:border-white/5 shadow-sm space-y-4 hover:border-violet-100 dark:hover:border-violet-800 transition-colors group">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 1열: 사용자 검색 순위 리스트 (ColSpan: 1) */}
        <SearchRankCard trends={data as any} isLoading={isLoading} error={error} onRetry={() => fetchData(true)} />

        {/* 2-3열: 미적 분포(Aesthetic Distribution) 레이더 차트 (ColSpan: 2) */}
        <AestheticDistributionCard data={data} isLoading={isLoading} error={error} onRetry={() => fetchData(true)} />

        {/* 4열: 베스트 셀러 상품 랭킹 바 차트 (ColSpan: 1) */}
        <BestSellersCard sales={sales} isLoading={isLoadingSales} error={errorSales} onRetry={() => fetchSales(true)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* t-SNE 스타일 투영 산점도 (ColSpan: 4 - Full Width) */}
        <TSNEPlot />
      </div>
    </div>
  );
}
