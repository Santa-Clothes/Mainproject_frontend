const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

import { ProductData, RecommendData } from "@/types/ProductType";

export const getProductList = async (): Promise<ProductData[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/products/list`, {
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
        // console.log("data", data);
        return data;
    } catch (error) {
        console.error("getProductList error:", error);
        return [];
    }
}

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
        // console.log("data", data);
        return data;
    } catch (error) {
        console.error("getRecommendList error:", error);
        return [];
    }
}