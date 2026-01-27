
import SideBar from '@/app/main/SideBar';
import Header from './Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#FAF9F6]">
            {/* 고정 사이드바 */}
            <SideBar />

            {/* 콘텐츠 영역: 사이드바 너비만큼 왼쪽 여백(ml-64) 확보 */}
            <div className="flex-1 ml-64 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-12 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}