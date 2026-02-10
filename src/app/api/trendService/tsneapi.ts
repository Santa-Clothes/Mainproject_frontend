const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

export interface rawData {
    productIds: string[],
    productNames: string[],
    styles: string[],
    xcoords: number[],
    ycoords: number[]
}

export interface TSNEPoint {
    productId: string,
    productName: string,
    style: string,
    xcoord: number,
    ycoord: number
}

/**
 * t-SNE 좌표 데이터를 가져오는 API
 * @returns {Promise<TSNEPoint[]>} t-SNE 포인트 배열
 */
export const getTSNEPoints = async (): Promise<TSNEPoint[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/products/map`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            return [];
        }

        const data: rawData = await response.json();
        return data.productIds.map((id, i) => ({
            productId: id,
            productName: data.productNames?.[i] ?? 'Unknown',
            style: data.styles?.[i] ?? 'None',
            xcoord: data.xcoords?.[i] ?? 0,
            ycoord: data.ycoords?.[i] ?? 0
        }));
    } catch (error) {
        console.error("getTSNEPoints error:", error);
        // API가 아직 준비되지 않았을 경우를 대비해 빈 배열 혹은 에러를 던집니다.
        return [];
    }
};
