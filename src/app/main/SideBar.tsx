'use client';

import { FaUser, FaHouse, FaMicrochip } from 'react-icons/fa6';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideBar() {
  const pathname = usePathname();

  const navItems = [
    { id: 'home', label: 'Overview', icon: <FaHouse />, path: '/main' },
    { id: 'studio', label: 'Intelligence Studio', icon: <FaMicrochip />, path: '/main/studio' },
  ];
  
  return (
    <aside className="w-64 h-screen bg-[#121212] text-white flex flex-col fixed left-0 top-0 border-r border-white/5 z-50">
      <Link 
        href="/"
        className="p-12 flex flex-col items-start border-b border-white/5 bg-[#0d0d0d] hover:bg-black transition-colors" 
      >
        <h1 className="text-2xl font-serif italic tracking-[0.2em] uppercase mb-1 text-white">ATELIER</h1>
        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.5em]">Neural Archive v1.0</p>
      </Link>

      <nav className="flex-1 px-8 py-12 space-y-2">
        {navItems.map((item) => (
          <Link 
            key={item.id}
            href={item.path}
            className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all group ${pathname === item.path ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <span className={`transition-transform duration-500 inline-block ${pathname === item.path ? 'scale-125' : 'group-hover:scale-125 text-gray-600 group-hover:text-white'}`}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

        {/* 유저 로그인 있으면 구현 */}
      {/* <div className="p-10 border-t border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white transition-all overflow-hidden bg-white/5">
            <FaUser size={14} className="text-gray-500 group-hover:text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white">Curator 01</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Active Status</span>
            </div>
          </div>
        </div>
      </div> */}
    </aside>
  );
};