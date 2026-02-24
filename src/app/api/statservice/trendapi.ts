const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

/**
 * 쇼핑 트렌드 데이터 조회 API:
 * 서버로부터 현재 유행하는 스타일과 그에 따른 스코어(비중) 데이터를 가져옵니다.
 */
export const getShoppingTrends = async () => {
    try {
        const response = await fetch(`${BASEURL}/api/trends/shopping-insight`, {
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
        console.error("fetchTrends error:", error);
        return [];
    }
};
