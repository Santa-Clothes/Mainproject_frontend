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
                // ngrok 무료 버전의 경우 브라우저 경고 페이지를 건너뛰기 위해 헤더 추가
                'ngrok-skip-browser-warning': '69420',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("fetchTrends error:", error);
        throw error;
    }
};
