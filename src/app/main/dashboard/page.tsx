import React from 'react';
import Dashboard from './Dashboard';
import { getShoppingTrends } from '@/app/api/trendService/trendapi';
import { getSalesRanking, SalesRankItem } from '@/app/api/salesService/salesapi';

export default async function DashboardPage() {
  let initialTrends: any[] = [];
  let initialSales: SalesRankItem[] = [];

  try {
    // 서버 컴포넌트 환경에서 병렬로 API 호출
    const [trendsData, salesData] = await Promise.all([
      getShoppingTrends().catch(() => []),
      getSalesRanking().catch(() => [])
    ]);

    initialTrends = trendsData;
    initialSales = salesData;
  } catch (error) {
    console.error("Server-side fetch error:", error);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-10 h-px bg-black/10"></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">Analytics Module</span>
        </div>
        <div className="flex justify-between items-end">
          <h2 className="text-6xl font-serif italic tracking-tighter">Insights Archive</h2>
          <div className="text-right">
            <p className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">Neural Engine Sync</p>
            <p className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em] mt-1">SSR Enhanced Data Pipeline</p>
          </div>
        </div>
      </div>

      {/* 서버에서 가져온 데이터를 props로 전달 (SSR + CSR 융합) */}
      <Dashboard initialTrends={initialTrends} initialSales={initialSales} />
    </div>
  );
}