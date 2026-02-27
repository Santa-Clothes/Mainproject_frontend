import React from 'react';
import Dashboard from './Dashboard';
import Image from 'next/image';
import NineOunceIcon from '@/assets/9ounces.svg';

export default function DashboardPage() {
  return (
    <div className="max-w-none mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-10 h-px bg-neutral-200 dark:bg-neutral-800"></span>
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            Analytics Module
          </span>
        </div>
        <div className="flex justify-start items-center">
          <h2 className="flex items-center gap-2 text-5xl md:text-6xl font-normal italic tracking-tighter text-neutral-900 dark:text-white">
            <Image src={NineOunceIcon} alt="Nine Ounce Icon" width={24} height={24} className="w-24 h-24 dark:invert" />
            아카이브
          </h2>
        </div>
      </div>

      <div className="w-full">
        <Dashboard />
      </div>
    </div>
  );
}