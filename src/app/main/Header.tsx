import { FaBell, FaGear } from 'react-icons/fa6';

//메인 페이지 header 영역 디자인
export default function Header() {
  return (
   <header className="h-24 bg-[#FAF9F6]/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-14 sticky top-0 z-40">
      <div className="flex-1">
        
        <div className="flex items-center gap-4">
          <span className="w-2 h-2 bg-black rounded-full"></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black">System Ready</span>
        </div>
      </div>

      <div className="flex items-center gap-10">
        {/* 종 아이콘 기능 뭐가 필요한가?*/}
        <button className="flex items-center gap-3 text-gray-400 hover:text-black transition-colors group">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Intelligence</span>
          <FaBell size={16} />
        </button>
        {/* 톱니 아이콘 기능 뭐가 필요한가?*/}
        <button className="flex items-center gap-3 text-gray-400 hover:text-black transition-colors group">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Protocol</span>
          <FaGear size={16} />
        </button>
      </div>
    </header>
  );
}