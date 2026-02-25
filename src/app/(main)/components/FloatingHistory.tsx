'use client';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { analysisHistoryAtom, activeHistoryAtom, HistoryItem, bookmarkAtom } from '@/jotai/historyJotai';
import { authUserAtom } from '@/jotai/loginjotai';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaClockRotateLeft, FaAngleRight, FaAngleLeft, FaBookmark } from 'react-icons/fa6';
import { getBookmarkAPI } from '@/app/api/memberservice/bookmarkapi';

export default function FloatingHistory() {
    const [history] = useAtom(analysisHistoryAtom);
    const [bookmark, setBookmark] = useAtom(bookmarkAtom);
    const [authUser] = useAtom(authUserAtom);
    const [, setActiveHistory] = useAtom(activeHistoryAtom);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);

    const handleHistoryClick = (item: HistoryItem) => {
        // 1. 선택한 히스토리를 active 상태로 만들기
        setActiveHistory(item);

        // 2. 해당 모드 페이지로 푸시 (딥링크를 위한 view=result 포함)
        const path = item.type === 'imageInput' ? '/uploadpage' : '/selectionpage';
        router.push(`${path}?view=result`);
    };

    const handleBookmarkClick = async () => {
        if (!authUser) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }

        // 서버로부터 최신 북마크 리스트 동기화
        const savedItems = await getBookmarkAPI(authUser.accessToken);
        if (savedItems) {
            setBookmark(savedItems);
        }

        router.push('/bookmark');
    };

    return (
        <div className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${isOpen ? 'right-4' : '-right-20'}`}>
            <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-2 border-neutral-100 dark:border-white/10 rounded-3xl p-3 shadow-2xl flex flex-col items-center gap-3">

                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -left-8 top-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-white/10 w-8 h-12 rounded-l-xl flex items-center justify-center shadow-lg hover:text-violet-600 transition-colors"
                >
                    {isOpen ? <FaAngleRight size={14} /> : <FaAngleLeft size={14} />}
                </button>

                {/* Top Section: Bookmark */}
                <div className="flex flex-col items-center w-full pb-3 border-b-2 border-dashed border-neutral-100 dark:border-white/10 mb-2">
                    <div
                        title="북마크"
                        onClick={handleBookmarkClick}
                        className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mb-1 cursor-pointer hover:bg-violet-100 transition-colors shadow-inner"
                    >
                        <FaBookmark size={18} />
                        {bookmark.length > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold px-1 ring-2 ring-white dark:ring-neutral-900 shadow-md animate-in zoom-in">
                                {bookmark.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Section: History Icon */}
                <div className="text-violet-400 dark:text-violet-500 mb-2">
                    <FaClockRotateLeft size={16} title="조회기록" />
                </div>

                {/* Bottom Section: History Items */}
                <div className="flex flex-col gap-3 w-full items-center">
                    {history.length > 0 ? (
                        history.map((item, idx) => (
                            <button
                                key={item.id}
                                onClick={() => handleHistoryClick(item)}
                                className="relative w-12 h-12 rounded-xl overflow-hidden hover:ring-2 hover:ring-violet-500 transition-all group scale-100 active:scale-95 shadow-sm bg-neutral-100 dark:bg-neutral-800"
                                title={`Recent analysis ${history.length - idx}`}
                            >
                                <Image
                                    src={(item.sourceImage.startsWith('data:') || item.sourceImage.startsWith('blob:'))
                                        ? item.sourceImage
                                        : (item.sourceImage.includes('?') ? `${item.sourceImage}&t=${item.timestamp}` : `${item.sourceImage}?t=${item.timestamp}`)}
                                    alt="history"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    unoptimized
                                />
                            </button>
                        ))
                    ) : (
                        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 text-neutral-300 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-800/50">
                            <span className="text-[7px] font-black uppercase tracking-widest leading-tight text-center">Empty</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
