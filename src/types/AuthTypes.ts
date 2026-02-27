export interface AuthUser {
    accessToken: string;
    userId: string;
    name: string;
    profile: string;
    success: boolean;
    provider?: string; // local, google, kakao, naver 등
    storeId?: string;
    expiresAt?: number; // 토큰 만료 시간 (밀리초)
}

export interface JoinRequest {
    id: string;
    nickname: string;
    password: string;
    profileImg?: File | null;
}