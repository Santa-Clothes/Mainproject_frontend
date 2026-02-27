import React from 'react';
import Dashboard from './Dashboard';
import Image from 'next/image';
import NineOunceIcon from '@/assets/9ounces.svg';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-10 h-px bg-black/10 dark:bg-white/10"></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">Analytics Module</span>
        </div>
        <div className="flex justify-start items-center">
          <h2 className="flex items-center gap-2 text-6xl font-normal tracking-tighter text-gray-900 dark:text-gray-50">
            <Image src={NineOunceIcon} alt="Nine Ounce Icon" width={24} height={24} className="w-24 h-24 dark:invert" />
            Archive
          </h2>
        </div>
      </div>

      <Dashboard />
    </div>
  );
}