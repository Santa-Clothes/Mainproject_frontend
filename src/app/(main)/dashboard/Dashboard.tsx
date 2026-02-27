'use client';

import { useState, useEffect } from 'react';

import StyleDistributionCard from './components/StyleDistributionCard';
import BestSellersCard from './components/BestSellersCard';
import { getInternalStyleCount512, getInternalStyleCount768 } from '@/app/api/productservice/productapi';
import { getSalesRanking, getSalesRankingByShopAndDate, SalesRankItem } from '@/app/api/salesservice/salesapi';
import { getScatter512Points, getScatter768Points } from '@/app/api/statservice/plotapi';
import ScatterPlot from './components/ScatterPlot';
import { InternalStyleCount } from '@/types/ProductType';
import { useAtom } from 'jotai';
import { modelModeAtom } from '@/jotai/modelJotai';


export default function Dashboard({
  initialSales = []
}: {
  initialSales?: SalesRankItem[]
}) {
  // 전역 분석 모델 모드 상태 (512 vs 768)
  const [modelMode] = useAtom(modelModeAtom);



  // 베스트 셀러 랭킹 상태 관리
  const [sales, setSales] = useState<SalesRankItem[]>(
    initialSales.length > 0 ? initialSales.sort((a, b) => b.saleQuantity - a.saleQuantity).slice(0, 5) : []
  );
  const [isLoadingSales, setIsLoadingSales] = useState(initialSales.length === 0);
  const [errorSales, setErrorSales] = useState<string | null>(null);

  // 스타일 분포 비율 상태 관리
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
    <div className="space-y-3 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 items-stretch">
        {/* 좌측 영역 (4컬럼): 스타일 분포 차트 + 클러스터 맵 스택 */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <StyleDistributionCard
            data={internalStyles}
            isLoading={isLoadingInternalStyles}
            error={errorInternalStyles}
            onRetry={fetchInternalStyles}
            className="flex-1"
          />
          <ScatterPlot
            title="스타일 클러스터"
            subtitle="잠재벡터 맵"
            description="제품 특징을 공간에 압축하여 시각화한 맵입니다."
            bottomTextFormat="총 {count}개 데이터 매핑"
            className="flex-1"
            fetchDataFn={modelMode === '768' ? getScatter768Points : getScatter512Points}
          />
        </div>

        {/* 우측 영역 (8컬럼): 매출 랭킹 파이프라인 */}
        <div className="lg:col-span-8">
          <BestSellersCard
            initialSales={sales}
            fetchSalesFn={getSalesRankingByShopAndDate}
            isLoading={isLoadingSales}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
