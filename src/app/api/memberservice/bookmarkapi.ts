const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;
import { RecommendData } from "@/types/ProductType";

/**
 * 장바구니 리스트 저장 API
 */
export const saveBookmarkAPI = async (token: string, productId: string) => {
    const reqUrl = `${BASEURL}/api/save-products`;
    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ naverProductId: productId }),
        });
        return response.ok;
    } catch (error) {
        console.error("saveCartAPI error:", error);
        return false;
    }
};

/**
 * 장바구니 개별 아이템 삭제 API
 */
export const deleteBookmarkAPI = async (token: string, productId: string) => {
    const reqUrl = `${BASEURL}/api/save-products/${productId}`;
    try {
        const response = await fetch(reqUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.ok;
    } catch (error) {
        console.error("deleteCartAPI error:", error);
        return false;
    }
};

/**
 * 장바구니 리스트 불러오기 API
 */
export const getBookmarkAPI = async (token: string): Promise<RecommendData[] | null> => {
    const reqUrl = `${BASEURL}/api/save-products`;
    try {
        const response = await fetch(reqUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) return [];
        const data = await response.json();

        // 백엔드 반환 구조에 따라 조정 (예: { items: [...] } 또는 [...])
        return data;
    } catch (error) {
        console.error("getCartAPI error:", error);
        return [];
    }
};