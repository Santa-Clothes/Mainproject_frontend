const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

export interface RankingData {
    storeId: string;
    startDate: string;
    endDate: string;
    products: SalesRankItem[];
}
export interface SalesRankItem {
    productId: string;
    productName: string;
    saleQuantity: number;
}

/**
 * 매출 랭킹 데이터 조회 API:
 * 서버로부터 누적 판매량 및 매출액 기준 상품 랭킹 데이터를 가져옵니다.
 */
export const getSalesRanking = async (): Promise<RankingData> => {
    try {
        const response = await fetch(`${BASEURL}/api/sales/rank`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 3600 } // 1시간 단위 캐싱 (필요에 따라 조정)
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return { storeId: '', startDate: '', endDate: '', products: [] }; // 빈 배열을 반환해서 UI가 깨지지 않게 함
        }
        const data = await response.json();
        // console.log("Ranking", data);

        return data
    } catch (error) {
        console.error("fetchSalesRanking error:", error);
        return { storeId: '', startDate: '', endDate: '', products: [] };
    }
};


export const getSalesRankingByShopAndDate = async (shop: string, startDate: string, endDate: string): Promise<RankingData> => {
    try {
        const storeQuery = shop ? `storeId=${shop}&` : '';
        const response = await fetch(`${BASEURL}/api/sales/rank?${storeQuery}startDate=${startDate}&endDate=${endDate}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return { storeId: '', startDate: '', endDate: '', products: [] };
        }
        const data = await response.json();

        return data;
    } catch (error) {
        console.error("fetchSalesRankingByShop error:", error);
        return { storeId: '', startDate: '', endDate: '', products: [] };
    }
};

export interface ShopInfo {
    storeId: string;
    storeName: string;
}

export const getShopList = async (): Promise<ShopInfo[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/store/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return []; // 빈 배열을 반환해서 UI가 깨지지 않게 함
        }

        return await response.json();
    } catch (error) {
        console.error("fetchShopList error:", error);
        return [];
    }
};