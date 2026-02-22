'use client';

import { useState, useEffect } from 'react';
import {
  FaBoxesStacked
} from 'react-icons/fa6';
// import SearchRankCard from './components/SearchRankCard';
import StyleDistributionCard from './components/StyleDistributionCard';
import BestSellersCard from './components/BestSellersCard';
import DashboardCard from './components/DashboardCard';
import { getInternalStyleCount } from '@/app/api/productservice/productapi';
import { getSalesRanking, getSalesRankingByShopAndDate, SalesRankItem } from '@/app/api/salesservice/salesapi';
import { getTSNEPoints } from '@/app/api/trendservice/tsneapi';
import TSNEPlot from './components/TSNEPlot';
import { getInternalProductCount } from '@/app/api/productservice/productapi';
import { InternalStyleCount } from '@/types/ProductType';


/**
 * DashboardStyleItem: 스타일 분석 결과 데이터의 내부 타입 정의
 */
interface DashboardStyleItem {
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
 * 메트릭 카드의 색상 스타일 정의
 */
const METRIC_COLORS: Record<string, string> = {
  violet: 'bg-violet-600 shadow-violet-100 dark:shadow-none',
  indigo: 'bg-indigo-600 shadow-indigo-100 dark:shadow-none',
  green: 'bg-emerald-500 shadow-emerald-100 dark:shadow-none',
  black: 'bg-black dark:bg-neutral-800 shadow-gray-100 dark:shadow-none',
};

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

  //TSNE용
  const [tsneData, setTSNEData] = useState<DashboardStyleItem[]>(
    initialData.length > 0
      ? initialData.map((t, i) => ({
        ...t,
        score: t.value || 0,
        value: t.value || 0,
        percentStr: t.percentStr || '0%',
        // 데모를 위해 초기 좌표를 무작위로 생성 (백엔드 좌표 연동 시 수정 필요)
        xcoord: Math.random() * 200 - 100,
        ycoord: Math.random() * 200 - 100,
        productId: `init-${i}`,
        productName: t.style || `Style-${i}`
      })).sort((a, b) => b.value - a.value)
      : []
  );
  const [isLoadingTSNE, setIsLoadingTSNE] = useState(initialData.length === 0);
  const [errorTSNE, setErrorTSNE] = useState<string | null>(null);

  //랭킹용
  const [sales, setSales] = useState<SalesRankItem[]>(
    initialSales.length > 0 ? initialSales.sort((a, b) => b.saleQuantity - a.saleQuantity).slice(0, 5) : []
  );
  const [isLoadingSales, setIsLoadingSales] = useState(initialSales.length === 0);
  const [errorSales, setErrorSales] = useState<string | null>(null);

  //스타일 비율용도
  const [internalStyles, setInternalStyles] = useState<InternalStyleCount[]>([]);
  const [isLoadingInternalStyles, setIsLoadingInternalStyles] = useState(true);
  const [errorInternalStyles, setErrorInternalStyles] = useState<string | null>(null);

  // 무한 페칭 방지를 위한 요청 시도 플래그
  const [hasAttemptedTSNEFetch, setHasAttemptedTSNEFetch] = useState(false);
  const [hasAttemptedSalesFetch, setHasAttemptedSalesFetch] = useState(false);
  const [hasAttemptedInternalStylesFetch, setHasAttemptedInternalStylesFetch] = useState(false);


  /**
   * 내부 상품(Internal Inventory) 개수를 비동기로 조회합니다.
   * 중복 요청 방지 로직이 포함되어 있습니다.
   * @param isRetry - 재시도 여부 (true일 경우 중복 방지 플래그 무시)
   */
  const fetchInternalStyles = async (isRetry = false) => {
    if (!isRetry && hasAttemptedInternalStylesFetch) return;
    setHasAttemptedInternalStylesFetch(true);
    setIsLoadingInternalStyles(true);
    setErrorInternalStyles(null);
    try {
      const result = await getInternalStyleCount();
      setInternalStyles(result);
    } catch (err) {
      console.error('Failed to fetch product count:', err);
      setErrorInternalStyles('Connection Failed');
    } finally {
      setIsLoadingInternalStyles(false);
    }
  };

  const fetchTSNEData = async (isRetry = false) => {
    if (!isRetry && hasAttemptedTSNEFetch) return;
    setHasAttemptedTSNEFetch(true);
    setIsLoadingTSNE(true);
    setErrorTSNE(null);

    try {
      const result = await getTSNEPoints();
      const processedData = result.map((item: any, i: number) => ({
        ...item,
        score: item.value || 0,
        value: item.value || 0,
        percentStr: item.percentStr || '0%',
        xcoord: Math.random() * 200 - 100, // 클라이언트 사이드 랜덤 좌표 생성
        ycoord: Math.random() * 200 - 100,
        productId: `trend-${i}`,
        productName: item.style || `Style-${i}`
      })).sort((a: any, b: any) => b.value - a.value);

      setTSNEData(processedData);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
      setErrorTSNE('Connection Failed');
    } finally {
      setIsLoadingTSNE(false);
    }
  };

  /**
   * 베스트 셀러(매출 랭킹) 데이터를 조회하여 내림차순 정렬합니다.
   * @param isRetry - 재시도 여부
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

  const fetchSalesByShopAndDate = async (isRetry = false) => {
    if (!isRetry && hasAttemptedSalesFetch) return;
    setHasAttemptedSalesFetch(true);
    setIsLoadingSales(true);
    setErrorSales(null);

    try {
      const result = await getSalesRankingByShopAndDate('9oz', '2022-01-01', '2022-12-31');
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
    if (initialData.length === 0 && !hasAttemptedTSNEFetch) fetchTSNEData();
    if (initialSales.length === 0 && !hasAttemptedSalesFetch) fetchSales();
    if (internalStyles.length === 0 && !hasAttemptedInternalStylesFetch) fetchInternalStyles();

  }, []);

  // 대시보드 메트릭 카드 정의
  // const mainMetrics = [
  //   {
  //     label: '9oz Inventory',
  //     value: internalProductCount,
  //     sub: 'Total Products',
  //     icon: <FaBoxesStacked />,
  //     color: 'violet',
  //     isLoading: isLoadingInternalProductCount,
  //     error: errorInternalProductCount,
  //     onRetry: () => fetchInternalProductCount(true)
  //   },

  // ];

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mainMetrics.map((metric, i) => (
              <DashboardCard
                key={i}
                isMetric={true}
                subtitle={metric.label}
                title={`${metric.value}개`}
                isLoading={metric.isLoading}
                error={metric.error}
                onRetry={metric.onRetry || (() => { })}
                lgColSpan={1}
                className="hover:border-violet-100 dark:hover:border-violet-800 transition-colors group h-44 flex flex-col justify-between"
                topRight={
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm shadow-lg transform group-hover:scale-110 transition-transform ${METRIC_COLORS[metric.color] || METRIC_COLORS.black}`}>
                    {metric.icon}
                  </div>
                }
              >
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest leading-none">{metric.sub}</p>
                </div>
              </DashboardCard>
            ))}
          </div> */}


          <StyleDistributionCard
            data={internalStyles}
            isLoading={isLoadingInternalStyles}
            error={errorInternalStyles}
            onRetry={() => fetchInternalStyles(true)}
            className="flex-1"
          />
        </div>


        <div className="lg:col-span-1">
          <BestSellersCard
            initialSales={sales}
            fetchSalesFn={getSalesRanking}
            className="h-full"
          />
        </div>

        <div className="lg:col-span-1">
          <TSNEPlot
            title="9oz Style Clusters"
            subtitle="t-SNE Projection"
            description="스타일별로 클러스터링된 제품들을 t-SNE 알고리즘을 통해 2차원 평면에 시각화한 맵입니다."
            bottomTextFormat="총 {count}개의 데이터가 매핑되었습니다."
            className="h-full"
            fetchDataFn={getTSNEPoints}
          />
        </div>
      </div>


    </div>
  );
}
