
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';

export default function IntroPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
       <Image 
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
        alt="Fashion Hero Background"
        fill
        className="opacity-60 scale-105 transition-transform duration-[40s] animate-pulse-slow"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/80 via-transparent to-black/95" />
      
      <div className="relative z-10 h-full flex flex-col items-center justify-between py-12 px-10 text-white">
        <header className="w-full flex justify-between items-center border-b border-white/10 pb-6 max-w-7xl mx-auto">
          <div className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-40">Issue No. 001</div>
          <h1 className="text-2xl font-serif italic tracking-[0.3em]">AITELIER</h1>
          <div className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-40">2025 Archive</div>
        </header>

        <div className="flex flex-col items-center text-center max-w-5xl">
          <h2 className="text-[12vw] font-serif leading-[0.85] italic tracking-tighter mb-12 select-none">
            Curated <br/> Intelligence
          </h2>
          <p className="max-w-md mx-auto text-sm font-light leading-relaxed text-gray-400">
            (임시)A high-fidelity visual archive for the modern curator. <br/>
            Analyze, filter, and discover the DNA of fashion.
          </p>
          <Link 
            href="/main"
            className="mt-16 group relative px-20 py-6 overflow-hidden border border-white transition-all hover:bg-white inline-block"
          >
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.5em] text-white group-hover:text-black transition-colors flex items-center gap-6">
              Access the Archive <FaArrowRight className="group-hover:translate-x-3 transition-transform duration-500" />
            </span>
          </Link>
        </div>

        <footer className="w-full max-w-7xl mx-auto flex justify-between items-end">
          <div className="text-[8px] font-bold uppercase opacity-30 tracking-widest">© (임시)2025 Neural Atelier Studio</div>
          <div className="flex gap-16 text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
            <span className="hover:opacity-100 cursor-pointer">Vision(임시)</span>
            <span className="hover:opacity-100 cursor-pointer">Protocol(임시)</span>
          </div>
        </footer>
      </div>
    </main>
  );
}