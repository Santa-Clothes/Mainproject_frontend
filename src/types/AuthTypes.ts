export interface AuthUser {
    accessToken: string;
    userId: string;
    name: string;
    profile: string;
    success: boolean;
    provider?: string; // local, google, kakao, naver 등
    storeId?: string;
}

export interface JoinRequest {
    id: string;
    nickname: string;
    password: string;
    storeId: string;
    profileImg?: File | null;
}