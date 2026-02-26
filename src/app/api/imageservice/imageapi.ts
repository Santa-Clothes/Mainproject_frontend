"use server"

import { RecommendData } from "@/types/ProductType";

/**
 * imageapi.ts
 * 스타일 분석을 위한 이미지 업로드 및 관련 처리를 담당하는 Server Actions
 */

const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;
const TESTURL = process.env.NEXT_PUBLIC_FASHION_SEARCH_API;
/**
 * 사용자로부터 전달받은 파일을 이미지 서버로 업로드합니다.
 * 에러 발생 시 throw 대신 null을 반환하여 페이지 멈춤을 방지합니다.
 * @param file 업로드할 이미지 파일 객체
 */
export const postImage = async (file: File) => {
    const reqUrl = `${BASEURL}/api/imageupload/upload`;
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            console.error("Server error:", response.status, response.statusText);
            return null; // 에러 발생 시 null 반환하여 호출부에서 처리하게 함
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("postImage error:", error);
        return null; // 네트워크 에러 등 발생 시에도 null 반환하여 중단 방지
    }
}

/**
 * 이미지 리스트 정보를 가져옵니다.
 */
export const getImages = async () => {
    const reqUrl = `${BASEURL}/api/imageupload/list`;

    try {
        const response = await fetch(reqUrl, {
            method: 'GET',
        });

        if (!response.ok) {
            console.error("Server error:", response.status, response.statusText);
            return []; // 실패 시 빈 배열 반환
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("getImages error:", error);
        return []; // 에러 시 빈 배열 반환하여 UI 깨짐 방지
    }
}

export const imageAnalyze = async (file: File) => {
    const reqUrl = `${BASEURL}/api/recommand/analyze`;
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            console.error("Server error:", response.status, response.statusText);
            return []; // 실패 시 빈 배열 반환
        }

        const data = await response.json();
        // console.log("imageAnalyze data:", data);

        return data;
    } catch (error) {
        console.error("imageAnalyze error:", error);
        return []; // 에러 시 빈 배열 반환하여 UI 깨짐 방지
    }
}

export const image768Analyze = async (file: File) => {
    const reqUrl = `${BASEURL}/api/recommand/768/analyze`;
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            console.error("Server error:", response.status, response.statusText);
            return null; // 실패 시 null 반환
        }

        const data = await response.json();

        // 새 API 응답 형식(RecommendResult768)을 기존 UI 구조(RecommendList)에 맞게 변환 (어댑터 처리)
        if (data && data.styles) {
            return {
                results: [
                    {
                        dimension: data.dimension || 768,
                        // 새 API의 { style, score } 를 기존 UI가 쓰는 { label_name, score, label_id } 로 매핑
                        topk: data.styles.map((s: any, idx: number) => ({
                            label_name: s.style,
                            score: s.score,
                            label_id: idx
                        }))
                    }
                ],
                internalProducts: data.internalProducts || [],
                naverProducts: data.naverProducts || []
            };
        }

        return data;
    } catch (error) {
        console.error("image768Analyze error:", error);
        return null; // 에러 시 null 반환하여 UI 로직에 맞춤
    }
}