export interface AuthUser {
    accessToken: string;
    userId: string;
    name: string;
    profile: string;
    success: boolean;
    provider?: string; // local, google, kakao, naver 등
}

export interface JoinRequest {
    id: string;
    nickname: string;
    password: string;
    profileImg?: File | null;
}