import { FaArrowRight, FaMicrochip, FaChartLine } from 'react-icons/fa6';
import Image from 'next/image';
import Link from 'next/link';


export default function MainPage() {
  return (
     <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700">
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">Dashboard Overview</span>
        <h2 className="text-6xl font-serif italic tracking-tighter text-[#121212]">Welcome to the Studio</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Entry: Unified Studio */}
        <Link 
          href="/main/studio"
          className="lg:col-span-2 group relative h-[550px] bg-[#121212] rounded-[4rem] overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-[1.01] block"
        >
          <Image 
            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop"
            alt="Studio Backdrop"
            fill
            className="opacity-40 group-hover:scale-110 transition-transform duration-[5s]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-20 left-20 right-20 space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <FaMicrochip className="text-white text-2xl" />
            </div>
            <div className="space-y-2">
              <h3 className="text-5xl font-serif italic text-white tracking-tight">Intelligence Studio</h3>
              <p className="text-lg font-light text-gray-400 max-w-xl">The complete neural archive. Search by Visual DNA or curate through deep metadata intelligence.</p>
            </div>
            <div className="pt-6 flex items-center gap-6 text-[11px] font-bold text-white uppercase tracking-[0.5em] group-hover:gap-10 transition-all">
              Initialize Protocol <FaArrowRight />
            </div>
          </div>
        </Link>

        {/* Stats Card 여기에 전체 의류 데이터 숫자 같은거 넣기?*/}
        <div className="bg-white rounded-[4rem] border border-black/5 p-12 flex flex-col justify-between shadow-sm">
          <div className="space-y-8">
            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center">
              <FaChartLine className="text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">Archive Scale</h4>
              <p className="text-4xl font-serif italic text-black tracking-tighter">12.4k Items</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-1px bg-gray-50 w-full" />
            <p className="text-[10px] font-medium leading-relaxed text-gray-400 uppercase tracking-widest">
              Last intelligence sync <br/> 4 minutes ago
            </p>
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-black/5">
         <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-gray-300">System Status</h4>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Neural Engine Online</span>
            </div>
         </div>
      </div>
    </div>
  );
}