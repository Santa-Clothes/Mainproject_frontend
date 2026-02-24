import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: '10.125.121.182', // 에러 메시지에 나온 IP 주소
        port: '8080',               // 포트 번호
        pathname: '/**',    // 이미지 저장 경로 패턴
      },
      {
        //https://unwilling-amalle-270ml-95aaf6de.koyeb.app
        protocol: 'https',
        hostname: 'unwilling-amalle-270ml-95aaf6de.koyeb.app',
        pathname: '/**',
      },
      {
        //https://fjoylosbfvojioljibku.supabase.co
        protocol: 'https',
        hostname: 'fjoylosbfvojioljibku.supabase.co',
        pathname: '/**',
      },
      //1. 카카오 (Kakao)
      {
        protocol: 'http',
        hostname: '*.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.kakaocdn.net',
        pathname: '/**',
      },
      // 2. 구글 (Google)
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      // 3. 네이버 (Naver)
      {
        protocol: 'https',
        hostname: '*.pstatic.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shopping-phinf.pstatic.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
