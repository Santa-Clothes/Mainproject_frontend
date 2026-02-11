/**
 * productapi.ts
 * 상품 리스트 조회 및 유사 상품 추천 API 연동
 */

const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

import { ProductData, RecommendData } from "@/types/ProductType";

/**
 * 프로젝트 내의 전체 상품 리스트를 가져옵니다.
 */
export const getProductList = async (): Promise<ProductData[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/products/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // 캐싱 전략을 설정할 수 있습니다 (예: next: { revalidate: 3600 })
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("getProductList error:", error);
        return [];
    }
}

/**
 * 특정 상품ID를 기반으로 AI가 분석한 유사 스타일 상품 리스트를 가져옵니다.
 * @param productId 기준이 될 상품 식별자
 */
export const getRecommendList = async (productId: string): Promise<RecommendData[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/recommand/demo/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("getRecommendList error:", error);
        return [];
    }
}