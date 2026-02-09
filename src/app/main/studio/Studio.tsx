"use client"
import React, { useState, useTransition, useEffect } from 'react';
import ResultGrid from './components/ResultGrid';
import ModeTabs from './ModeTabs';
import DiscoveryPanel from './DiscoveryPanel';
import UploadPanel from './UploadPanel';
import AnalysisSection from './components/AnalysisSection';
import { useSearchParams, useRouter } from 'next/navigation';


import { ProductType } from '@/types/ProductType';
import { AuthUser } from '@/types/AuthTypes';
// interface StudioClientProps {
//   serverAction: (data: any) => Promise<any[] | null>;
// }

const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

//임시 이미지(프로필 사진 리스트) GET
export const getProfileImgs = async () => {
  const reqUrl = `${BASEURL}/api/members/list`;

  try {
    const response = await fetch(reqUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      // 서버 에러 메시지를 확인하기 위해 로그 추가
      console.error("Server error:", response.status, response.statusText);
    }
    const data = await response.json();


    return data;
  } catch (error) {
    console.error("error:", error);
  }
}

export type StudioMode = 'imageInput' | 'imageDiscovery';

//이미지 입력 및 출력 수행할 컴포넌트
export default function Studio(/* { serverAction }: StudioClientProps */) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리 파라미터(?mode=...)에서 현재 모드를 결정합니다. 
  // 서버와 클라이언트가 동일한 주소를 보므로 Hydration mismatch가 발생하지 않습니다.
  const mode = (searchParams.get('mode') as StudioMode) || 'imageDiscovery';

  // [상태] 비동기 데이터 요청 상태 관리 
  const [isPending, startTransition] = useTransition();

  // [상태] 검색 결과 데이터 및 활성화 카테고리
  const [results, setResults] = useState<any[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // [상태] 분석 표시 영역 (업로드/선택 이미지 정보)
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [analysisName, setAnalysisName] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 화면에 표시할 카테고리 목록 상수
  const categories = ['Outerwear', 'Tops', 'Bottoms', 'Accessories'];

  /**
   * [핸들러] 모드 전환 시 URL 업데이트
   */
  const handleModeChange = (newMode: StudioMode) => {
    if (mode === newMode) return;

    // 상태 초기화 및 URL 파라미터 변경
    setResults(null);
    setActiveCategory(null);
    setAnalysisImage(null);
    setAnalysisName(undefined);
    setIsAnalyzing(false);

    // shallow routing 효과를 위해 주소창만 업데이트
    router.push(`/main/studio?mode=${newMode}`, { scroll: false });
  };

  /**
   * [핸들러] 검색 결과 처리 콜백
   */
  const handleSearchResult = (data: any[] | null, category?: string) => {
    setResults(data);
    if (category) setActiveCategory(category);
    // 검색 결과가 나오면 분석 로딩도 종료된 것으로 간주 (실제 앱에선 별도 API 타이밍 조절 가능)
    setIsAnalyzing(false);
  };

  /**
   * [핸들러] 분석 시작 (패널에서 업로드/선택 시 호출)
   */
  const handleAnalysisStart = (imgUrl: string, name?: string) => {
    setAnalysisImage(imgUrl);
    setAnalysisName(name);
    setIsAnalyzing(true);
  };

  /**
   * [핸들러] 결과 이미지 클릭 시 상세 분석 표시
   */
  const handleProductClick = (product: ProductType) => {
    setAnalysisImage(product.imgUrl);
    setAnalysisName(product.name);
    setIsAnalyzing(true);

    // 분석 강조를 위해 부드럽게 스크롤 (선택 사항)
    window.scrollTo({ top: 400, behavior: 'smooth' });

    // 시뮬레이션: 데이터 로딩 시간
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1500);
  };

  /**
   * [핸들러] 분석 취소 (업로드 취소 시 호출)
   */
  const handleAnalysisCancel = () => {
    setAnalysisImage(null);
    setAnalysisName(undefined);
    setIsAnalyzing(false);
  };


  return (
    <div className="space-y-10" suppressHydrationWarning>
      {/* 1. 모드 전환 탭 */}
      <ModeTabs mode={mode} onModeChange={handleModeChange} />

      {/* 2. 메인 입력 패널 영역 */}
      <div className="bg-white dark:bg-neutral-900/50 rounded-[2.5rem] border border-neutral-200 dark:border-white/5 shadow-xl overflow-hidden min-h-125">
        {/* 애니메이션 클래스(animate-in 등)를 모두 제거하여 정적으로 렌더링됩니다. */}
        <div className="p-10 lg:p-14">
          {mode === 'imageDiscovery' ? (
            <DiscoveryPanel
              key="discovery-panel"
              onResultFound={handleSearchResult}
              onAnalysisStart={handleAnalysisStart}
              isPending={isPending}
              startTransition={startTransition}
            />
          ) : (
            <UploadPanel
              key="upload-panel"
              onResultFound={handleSearchResult}
              onAnalysisStart={handleAnalysisStart}
              onAnalysisCancel={handleAnalysisCancel}
              isPending={isPending}
              startTransition={startTransition}
            />
          )}
        </div>
      </div>

      {/* 3. 분석 대시보드 (중간 영역) */}
      <AnalysisSection
        sourceImage={analysisImage}
        productName={analysisName}
        isLoading={isAnalyzing}
      />

      {/* 4. 최종 검색 결과 출력 영역 */}
      <ResultGrid
        isActive={results !== null && !isPending}
        isPending={isPending}
        products={results}
        title={mode === 'imageInput' ? "Archival Matches" : "Neural Recommendations"}
        subtitle={mode === 'imageInput' ? "Visual Search" : `Similar to selected ${activeCategory || 'Items'}`}
        onProductClick={handleProductClick}
      />
    </div>
  );
}