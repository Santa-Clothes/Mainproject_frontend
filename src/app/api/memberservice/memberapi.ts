//"use server" // 클라이언트에서도 호출이 필요하므로 주석 처리하거나 제거

import { AuthUser } from "@/types/AuthTypes";
import { JoinRequest } from "@/types/AuthTypes";

const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

/**
 * 일반 로그인 API: 사용자의 ID와 비밀번호를 백엔드로 전송하여 인증을 시도합니다.
 * 성공 시 액세스 토큰과 사용자 정보를 반환합니다.
 */
export const loginAPI = async (email: string, password: string) => {
    const reqUrl = `${BASEURL}/api/members/login`;

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: email,
                password: password
            }),
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Login API error:", error);
        return null;
    }
};


/**
 * 로그아웃 API: 현재 세션을 종료하고 서버 측에 토큰 무효화를 요청합니다.
 * Authorization 헤더에 현재의 액세스 토큰을 담아 보냅니다.
 */
export const logoutAPI = async (authInfo: AuthUser) => {
    const reqUrl = `${BASEURL}/api/members/logout`;

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authInfo.accessToken}`,
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }

        // const data = await response.json();
        return response.ok;
    } catch (error) {
        console.error("Login API error:", error);
        return false;
    }
};


/**
 * 회원가입 API: 새로운 사용자를 등록합니다.
 * ID, 닉네임, 비밀번호를 포함한 회원가입 정보를 객체 형태로 전달받습니다.
 */
export const signupAPI = async (JoinRequest: JoinRequest) => {
    const reqUrl = `${BASEURL}/api/members/signup`;

    try {
        // 이미지가 있으면 FormData로 전송
        const formData = new FormData();
        formData.append('id', JoinRequest.id);
        formData.append('nickname', JoinRequest.nickname);
        formData.append('password', JoinRequest.password);
        formData.append('storeId', JoinRequest.storeId);

        if (JoinRequest.profileImg) {
            formData.append('file', JoinRequest.profileImg);
        }

        const response = await fetch(reqUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }

        // const data = await response.json();
        return response.ok;
    } catch (error) {
        console.error("Login API error:", error);
        return false;
    }
};


/**
 * 내 정보 조회 API (OAuth2 대응): 
 * 소셜 로그인 등으로 획득한 토큰을 사용하여 백엔드로부터 상세 사용자 프로토타입을 가져옵니다.
 */
export const getUserInfoAPI = async (token: string) => {
    const reqUrl = `${BASEURL}/api/members/me`; // 백엔드 엔드포인트에 맞게 조정 필요

    try {
        const response = await fetch(reqUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error(`User info fetch failed: ${response.status}`);
            return null;
        }

        const userData = await response.json();

        return userData;
    } catch (error) {
        console.error("GetUserInfo Error:", error);
        return null;
    }
};

export const updateProfileImg = async (token: string, id: string, profileImg: File) => {
    const reqUrl = `${BASEURL}/api/imageupload/profile?id=${id}`;
    const formData = new FormData();
    formData.append('file', profileImg);

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        return response.ok;
    } catch (error) {
        console.error("UpdateProfileImg Error:", error);
        return false;
    }
};


/**
 * 내 정보 수정 API: 닉네임 또는 프로필 이미지를 업데이트합니다.
 */
export const updateMemberInfoAPI = async (token: string, data: { nickname?: string; password?: string }) => {
    const reqUrl = `${BASEURL}/api/members/update`;

    try {
        const response = await fetch(reqUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        // if (!response.ok) return null;
        return await response.ok;
    } catch (error) {
        console.error("UpdateMember Error:", error);
        return null;
    }
};

/**
 * 회원 탈퇴 API
 */
export const deleteMemberAPI = async (token: string, id: string, password: string) => {
    const reqUrl = `${BASEURL}/api/members/withdraw`;

    try {
        const response = await fetch(reqUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id, password })
        });

        // if (!response.ok) return null;
        return await response.ok;
    } catch (error) {
        console.error("DeleteMember Error:", error);
        return null;
    }
};
