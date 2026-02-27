/**
 * productapi.ts
 * 상품 리스트 조회 및 유사 상품 추천 API 연동
 */

const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

import { ProductData, RecommendList512, RecommendResult768, SelectionRecommendResult } from "@/types/ProductType";

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
        // [매핑] ID 필드 표준화
        if (Array.isArray(data)) {
            return data.map((item: any) => ({
                ...item,
                productId: item.productId || item.naverProductId
            }));
        }
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
export const getRecommendList = async (productId: string): Promise<SelectionRecommendResult | null> => {
    try {
        const response = await fetch(`${BASEURL}/api/recommand/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return null;
        }

        const data: SelectionRecommendResult = await response.json();

        // [매핑] 네이버 상품의 경우 naverProductId를 productId로 통일하여 프론트 규격 준수
        if (data.naverProducts) {
            data.naverProducts = data.naverProducts.map((p: any) => ({
                ...p,
                productId: p.productId || p.naverProductId
            }));
        }

        return data;
    } catch (error) {
        console.error("getRecommendList error:", error);
        return null;
    }
}

/**
 * 특정 상품ID를 기반으로 AI가 분석한 유사 스타일 상품 리스트를 가져옵니다 (768 차원).
 * @param productId 기준이 될 상품 식별자
 */
export const getRecommend768List = async (productId: string): Promise<SelectionRecommendResult | null> => {
    try {
        const response = await fetch(`${BASEURL}/api/recommand/768/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return null;
        }

        const data: SelectionRecommendResult = await response.json();

        // [매핑] 네이버 상품의 경우 naverProductId를 productId로 통일하여 프론트 규격 준수
        if (data.naverProducts) {
            data.naverProducts = data.naverProducts.map((p: any) => ({
                ...p,
                productId: p.productId || p.naverProductId
            }));
        }

        return data;
    } catch (error) {
        console.error("getRecommend768List error:", error);
        return null;
    }
}

/**
 * 네이버 상품 리스트를 가져옵니다.
 */
export const getNaverProductList = async (): Promise<ProductData[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/naver-products/list`, {
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
        // [매핑] ID 필드 표준화
        if (Array.isArray(data)) {
            return data.map((item: any) => ({
                ...item,
                productId: item.productId || item.naverProductId
            }));
        }
        return data;
    } catch (error) {
        console.error("getNaverProductList error:", error);
        return [];
    }
}

export const getNaverProductCount = async (): Promise<number> => {
    try {
        const response = await fetch(`${BASEURL}/api/products/naver-count`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return 0;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("getRecommendList error:", error);
        return 0;
    }
}

export const getInternalProductCount = async (): Promise<number> => {
    try {
        const response = await fetch(`${BASEURL}/api/products/internal-count`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return 0;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("getRecommendList error:", error);
        return 0;
    }
}

export const getInternalStyleCount = async () => {
    try {
        const response = await fetch(`${BASEURL}/api/products/style-count`, {
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
        console.error("getStyleCount error:", error);
        return [];
    }
};

export const getInternalStyleCount512 = async () => {
    try {
        const response = await fetch(`${BASEURL}/api/products/style-count/512`, {
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
        // console.log("512", data);
        return data;
    } catch (error) {
        console.error("getStyleCount512 error:", error);
        return [];
    }
};

export const getInternalStyleCount768 = async () => {
    try {
        const response = await fetch(`${BASEURL}/api/products/style-count/768`, {
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
        // console.log("768", data);
        return data;
    } catch (error) {
        console.error("getStyleCount768 error:", error);
        return [];
    }
};