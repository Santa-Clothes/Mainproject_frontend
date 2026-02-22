/**
 * 별개의 임시 API. AI model fastAPI와 직접 연결
 * 
 * Fashion Search API Client
 * =========================
 *
 * Next.js에서 바로 사용할 수 있는 Fashion Search API 클라이언트
 */

// API Response Types
export interface FashionSearchResult {
  rank: number;
  product_id: string;
  title: string;
  price: number;
  image_url: string;
  category_id: string;
  kfashion_category: string;
  score: number;
}

export interface FashionSearchResponse {
  query: {
    query_id: string;
    timestamp: string;
    image_info: {
      filename: string;
      size: number;
      dimensions: string;
      format: string;
    };
  };
  results: FashionSearchResult[];
  metrics: {
    total_results: number;
    search_time_ms: number;
    total_time_ms: number;
    category_filter: string | null;
    faiss_enabled: boolean;
  };
  stats: {
    avg_score: number;
    max_score: number;
    min_score: number;
    score_distribution: Record<string, number>;
  };
}

// API Base URL (환경 변수에서 가져오기)
const FASHION_SEARCH_API = process.env.NEXT_PUBLIC_FASHION_SEARCH_API;

/**
 * 이미지 파일로 패션 검색
 *
 * @param imageFile - 검색할 이미지 파일
 * @param topK - 반환할 결과 개수 (기본: 10)
 * @param category - 카테고리 필터 (선택사항)
 * @returns 검색 결과
 *
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const results = await searchByImage(file, 10);
 * console.log(results.results);
 * ```
 */
export async function searchByImage(
  imageFile: File,
  topK: number = 10,
  category?: string
): Promise<FashionSearchResponse> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const params = new URLSearchParams();
  params.append('top_k', topK.toString());
  if (category) {
    params.append('category', category);
  }

  const response = await fetch(
    `${FASHION_SEARCH_API}/search/upload?${params}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `Fashion search failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * API 헬스 체크
 *
 * @returns 헬스 상태
 */
export async function checkHealth(): Promise<{
  status: string;
  model_loaded: boolean;
  nineoz_count: number;
  naver_count: number;
}> {
  const response = await fetch(`${FASHION_SEARCH_API}/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}
