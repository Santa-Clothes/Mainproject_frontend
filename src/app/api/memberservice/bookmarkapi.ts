const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

/**
 * 장바구니 리스트 저장 API
 */
export const saveBookmarkAPI = async (token: string, productId: string, styleName?: string) => {
    console.log("saveBookmarkAPI productId:", productId);
    console.log("saveBookmarkAPI styleName:", styleName);
    const reqUrl = `${BASEURL}/api/save-products`;
    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ naverProductId: productId, styleName: styleName || '' }),
        });
        return response.ok;
    } catch (error) {
        console.error("saveCartAPI error:", error);
        return false;
    }
};

/**
 * 장바구니 리스트 삭제 API (단일/다중 통합)
 * @param productIds 삭제할 ID들의 배열 (Body에 직접 배열로 전송)
 */
export const deleteBookmarkAPI = async (token: string, productIds: string[]) => {

    const reqUrl = `${BASEURL}/api/save-products`;
    try {
        const response = await fetch(reqUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(productIds),
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
import { BookmarkData } from "@/types/ProductType";

/**
 * 장바구니 리스트 불러오기 API
 */
export const getBookmarkAPI = async (token: string): Promise<BookmarkData[] | null> => {
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
        console.log("getBookmarkAPI data:", data);

        if (Array.isArray(data)) {
            return data.map((item: any) => ({
                ...item,
                productId: item.productId || item.naverProductId
            }));
        }

        return [];
    } catch (error) {
        console.error("getCartAPI error:", error);
        return [];
    }
};