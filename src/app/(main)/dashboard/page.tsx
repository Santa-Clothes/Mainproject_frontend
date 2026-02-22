import React from 'react';
import Dashboard from './Dashboard';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-10 h-px bg-black/10"></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">Analytics Page</span>
        </div>
        <div className="flex justify-between items-end">
          <h2 className="text-6xl font-normal italic tracking-tighter">Insights Archive</h2>
        </div>
      </div>

      {/* 클라이언트 중심의 독립적 데이터 로딩을 위해 데이터를 넘기지 않음 */}
      <Dashboard />
    </div>
  );
}