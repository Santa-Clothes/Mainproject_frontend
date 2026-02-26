const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

export interface rawData {
    productIds: string[],
    productNames: string[],
    styles: string[],
    xcoords: number[],
    ycoords: number[]
}

export interface ScatterPoint {
    productId: string,
    productName: string,
    style: string,
    xcoord: number,
    ycoord: number
}

/**
 * 산점도 좌표 데이터를 가져오는 API
 * @returns {Promise<ScatterPoint[]>} 산점도 포인트 배열
 */
export const getScatterPoints = async (): Promise<ScatterPoint[]> => {
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
        console.error("getScatterPoints error:", error);
        // API가 아직 준비되지 않았을 경우를 대비해 빈 배열 혹은 에러를 던집니다.
        return [];
    }
};

/**
 * 고정밀(768) 산점도 좌표 데이터를 가져오는 API
 * @returns {Promise<ScatterPoint[]>} 산점도 포인트 배열
 */
export const getScatter768Points = async (): Promise<ScatterPoint[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/products/768/map`, {
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
        console.error("getScatter768Points error:", error);
        return [];
    }
};
