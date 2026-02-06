const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

export interface SalesRankItem {
    productId: string;
    productName: string;
    saleQuantity: number;
    salePrice: number;
    saleRate: number;
}

/**
 * 매출 랭킹 데이터 조회 API:
 * 서버로부터 누적 판매량 및 매출액 기준 상품 랭킹 데이터를 가져옵니다.
 */
export const getSalesRanking = async (): Promise<SalesRankItem[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/sales/rank`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': '69420',
            },
            next: { revalidate: 3600 } // 1시간 단위 캐싱 (필요에 따라 조정)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("fetchSalesRanking error:", error);
        throw error;
    }
};
