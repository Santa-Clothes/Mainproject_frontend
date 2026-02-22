'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { authUserAtom } from '@/jotai/loginjotai';
import { getUserInfoAPI } from '@/app/api/memberservice/memberapi';

/**
 * OAuth2 인증 처리 컴포넌트
 * URL 파라미터에 포함된 token을 감지하여 유저 정보를 가져오고 전역 상태에 저장합니다.
 * 처리 완료 후 주소창의 토큰을 제거하기 위해 페이지를 리다이렉트합니다.
 */
export default function AuthHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuth = useSetAtom(authUserAtom);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            /**
             * 토큰을 사용하여 사용자 정보를 조회하고, 성공 시 전역 상태를 업데이트합니다.
             */
            const fetchUserInfo = async () => {
                setIsProcessing(true);
                try {
                    // 백엔드에서 유저 정보 가져오기
                    const userInfo = await getUserInfoAPI(token);

                    if (userInfo) {
                        // Jotai 상태에 저장 (atomWithStorage에 의해 localStorage에 자동 저장됨)
                        setAuth({
                            accessToken: token,
                            userId: userInfo.userId || "",
                            name: userInfo.name || "",
                            profile: userInfo.profile || "",
                            success: true,
                            provider: userInfo.provider || 'social'
                        });

                        // 주소창에서 토큰을 지우기 위해 쿼리 없이 현재 경로로 이동
                        // replace를 사용하여 히스토리에 토큰이 남지 않게 함
                        router.replace('/');
                    }
                } catch (error) {
                    console.error("Failed to fetch user info in AuthHandler:", error);
                    // 실패 시 로그인 페이지로 다시 보냄
                    router.push('/login');
                } finally {
                    setIsProcessing(false);
                }
            };

            fetchUserInfo();
        }
    }, [searchParams, router, setAuth]);

    if (isProcessing) {
        return (
            <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-violet-100 dark:border-violet-900/30"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"></div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <h2 className="text-xl font-serif italic text-neutral-900 dark:text-white">Authenticating</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Neural Interface Syncing...</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
