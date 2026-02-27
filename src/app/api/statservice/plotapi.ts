const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

export interface rawData {
    productIds: string[],
    productNames: string[],
    styles: string[],
    xcoords: number[],
    ycoords: number[],
    zcoords: number[]
}

export interface ScatterPoint {
    productId: string,
    productName: string,
    style: string,
    xcoord: number,
    ycoord: number,
    zcoord: number
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
            throw new Error(`서버 연결 실패: ${response.status}`);
        }

        const data: rawData = await response.json();
        return data.productIds.map((id, i) => ({
            productId: id,
            productName: data.productNames?.[i] ?? 'Unknown',
            style: data.styles?.[i] ?? 'None',
            xcoord: data.xcoords?.[i] ?? 0,
            ycoord: data.ycoords?.[i] ?? 0,
            zcoord: data.zcoords?.[i] ?? 0
        }));
    } catch (error) {
        console.error("getScatterPoints error:", error);
        throw error;
    }
};

export const getScatter512Points = async (): Promise<ScatterPoint[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/products/map/512`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            throw new Error(`서버 연결 실패: ${response.status}`);
        }

        const data: rawData = await response.json();
        return data.productIds.map((id, i) => ({
            productId: id,
            productName: data.productNames?.[i] ?? 'Unknown',
            style: data.styles?.[i] ?? 'None',
            xcoord: data.xcoords?.[i] ?? 0,
            ycoord: data.ycoords?.[i] ?? 0,
            zcoord: data.zcoords?.[i] ?? 0
        }));
    } catch (error) {
        console.error("getScatter512Points error:", error);
        throw error;
    }
};



export const getScatter768Points = async (): Promise<ScatterPoint[]> => {
    try {
        const response = await fetch(`${BASEURL}/api/products/map/768`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`서버 에러: ${response.status}`);
            throw new Error(`서버 연결 실패: ${response.status}`);
        }

        const data: rawData = await response.json();
        return data.productIds.map((id, i) => ({
            productId: id,
            productName: data.productNames?.[i] ?? 'Unknown',
            style: data.styles?.[i] ?? 'None',
            xcoord: data.xcoords?.[i] ?? 0,
            ycoord: data.ycoords?.[i] ?? 0,
            zcoord: data.zcoords?.[i] ?? 0
        }));
    } catch (error) {
        console.error("getScatter768Points error:", error);
        throw error;
    }
};
