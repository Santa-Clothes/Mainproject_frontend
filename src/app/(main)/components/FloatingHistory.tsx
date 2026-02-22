'use client';
import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { analysisHistoryAtom, activeHistoryAtom, HistoryItem } from '@/jotai/historyJotai';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaClockRotateLeft, FaAngleRight, FaAngleLeft } from 'react-icons/fa6';

export default function FloatingHistory() {
    const [history] = useAtom(analysisHistoryAtom);
    const [, setActiveHistory] = useAtom(activeHistoryAtom);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);

    if (history.length === 0) return null;

    const handleHistoryClick = (item: HistoryItem) => {
        // 1. 선택한 히스토리를 active 상태로 만들기
        setActiveHistory(item);

        // 2. 해당 모드 페이지로 푸시 (이미 있으면 알아서 렌더링)
        if (item.type === 'imageInput') {
            router.push('/uploadpage');
        } else {
            router.push('/selectionpage');
        }
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

                <div className="text-violet-600 mb-1">
                    <FaClockRotateLeft size={18} />
                </div>

                <div className="flex flex-col gap-3">
                    {history.map((item, idx) => (
                        <button
                            key={item.id}
                            onClick={() => handleHistoryClick(item)}
                            className="relative w-12 h-12 rounded-xl overflow-hidden hover:ring-2 hover:ring-violet-500 transition-all group scale-100 active:scale-95 shadow-sm"
                            title={`Recent analysis ${history.length - idx}`}
                        >
                            <Image
                                src={item.sourceImage.includes('?') ? `${item.sourceImage}&t=${item.timestamp}` : `${item.sourceImage}?t=${item.timestamp}`}
                                alt="history"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                unoptimized
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
