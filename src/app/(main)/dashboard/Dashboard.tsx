'use client';

import { useState, useEffect } from 'react';

// import SearchRankCard from './components/SearchRankCard';
import StyleDistributionCard from './components/StyleDistributionCard';
import BestSellersCard from './components/BestSellersCard';
// import DashboardCard from './components/DashboardCard';
import { getInternalStyleCount512, getInternalStyleCount768 } from '@/app/api/productservice/productapi';
import { getSalesRanking, getSalesRankingByShopAndDate, SalesRankItem } from '@/app/api/salesservice/salesapi';
import { getScatter512Points, getScatter768Points } from '@/app/api/statservice/plotapi';
import ScatterPlot from './components/ScatterPlot';
// import { getInternalProductCount } from '@/app/api/productservice/productapi';
import { InternalStyleCount } from '@/types/ProductType';
import { useAtom } from 'jotai';
import { modelModeAtom } from '@/jotai/modelJotai';


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
  // 전역 분석 모델 모드 상태 
  const [modelMode] = useAtom(modelModeAtom);



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
      const result = modelMode === '768'
        ? await getInternalStyleCount768()
        : await getInternalStyleCount512();
      setInternalStyles(result);
    } catch (err) {
      console.error('Failed to fetch product count:', err);
      setErrorInternalStyles('Connection Failed');
    } finally {
      setIsLoadingInternalStyles(false);
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

      const sortedSales = result.products.sort((a, b) => b.saleQuantity - a.saleQuantity);
      setSales(sortedSales);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
      setErrorSales('Connection Failed');
    } finally {
      setIsLoadingSales(false);
    }
  };

  useEffect(() => {
    if (initialSales.length === 0 && !hasAttemptedSalesFetch) fetchSales();
    // 모드 변경 시에도 데이터를 다시 불러오도록 로직 수정
    fetchInternalStyles(true);
  }, [modelMode]);

  return (
    <div className="space-y-8 pb-20">
      {/* Bottom Full Width Block: Best Sellers */}
      <div className="w-full">
        <BestSellersCard
          initialSales={sales}
          fetchSalesFn={getSalesRankingByShopAndDate}
          isLoading={isLoadingSales}
        />
      </div>

      {/* Top Side-by-Side Grid: Strategy / Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col gap-6">
          <StyleDistributionCard
            data={internalStyles}
            isLoading={isLoadingInternalStyles}
            error={errorInternalStyles}
            onRetry={() => fetchInternalStyles(true)}
            className="flex-1"
          />
        </div>

        <div className="flex flex-col gap-6">
          <ScatterPlot
            title="스타일 클러스터"
            subtitle="잠재벡터 2차원 투영"
            description="스타일별로 고차원 제품 특징을 차원축소 알고리즘을 통해 2차원 평면에 압축하여 시각화한 맵입니다."
            bottomTextFormat="총 {count}개의 데이터가 매핑되었습니다."
            className="flex-1 h-full"
            fetchDataFn={modelMode === '768' ? getScatter768Points : getScatter512Points}
          />
        </div>
      </div>
    </div>
  );
}
