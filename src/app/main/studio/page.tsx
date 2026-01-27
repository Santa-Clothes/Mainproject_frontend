import Studio from "./Studio";

export default function StudioPage() {
  /**
   * [TODO: Backend Integration]
   * 추후 이곳에 Spring Boot API(/api/v1/archive/search 등)를 호출하는 로직을 작성합니다.
   * @param params - AI 분석 결과 또는 수동 필터 데이터
   */
  const fetchArchiveData = async (params: any) => {
    "use server"; // Next.js 환경일 경우 서버 액션 선언
    
    console.log("Spring Boot API Request with:", params);
    
    // 시뮬레이션: 실제 연동 시 fetch('http://your-spring-api/...') 코드가 들어갈 자리입니다.
    // 현재는 빈 결과를 반환하여 Client에서 Mock 데이터를 제어하게 합니다.
    return null; 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-10 h-px bg-black/10"></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">Neural Module</span>
        </div>
        <div className="flex justify-between items-end">
          <h2 className="text-6xl font-serif italic tracking-tighter">Intelligence Studio</h2>
          <div className="text-right">
             <p className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">Protocol v.1.0</p>
             <p className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em] mt-1">Multi-modal Search Active</p>
          </div>
        </div>
      </div>

      <Studio serverAction={fetchArchiveData} />
    </div>
  );
}