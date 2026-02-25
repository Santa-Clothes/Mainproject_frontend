'use client';
import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useAtom } from 'jotai';
import { authUserAtom } from '@/jotai/loginjotai';
import { FaLayerGroup, FaBookmark, FaTrashCan, FaCheckDouble, FaXmark, FaArrowsRotate } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { saveBookmarkAPI, getBookmarkAPI, deleteBookmarkAPI } from '@/app/api/memberservice/bookmarkapi';
import { bookmarkAtom } from '@/jotai/historyJotai';

export default function BookmarkPage() {
    const [bookmark, setBookmark] = useAtom(bookmarkAtom);
    const [authUser] = useAtom(authUserAtom);
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // 로그인 검증 및 리다이렉트
    React.useEffect(() => {
        if (!isMounted) return;

        if (!authUser) {
            alert('로그인이 필요한 페이지입니다.');
            router.push('/login');
            return;
        }

        // 페이지 진입 시 최신 데이터 강제 동기화 (최적화 전략)
        const syncOnMount = async () => {
            setIsActionLoading(true);
            const savedItems = await getBookmarkAPI(authUser.accessToken);
            if (savedItems) setBookmark(savedItems);
            setIsActionLoading(false);
        };
        syncOnMount();
    }, [isMounted, authUser, router, setBookmark]);



    // 데이터 갱신 함수
    const refreshBookmarks = async () => {
        if (!authUser) return;
        setIsActionLoading(true);
        try {
            const updated = await getBookmarkAPI(authUser.accessToken);
            if (updated) setBookmark(updated);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleClearBookmark = async () => {
        if (!authUser) return;
        const allIds = bookmark.map((item) => item.productId);
        if (confirm('북마크 리스트를 완전히 비우시겠습니까?')) {
            setIsActionLoading(true);
            try {
                const success = await deleteBookmarkAPI(authUser.accessToken, allIds);
                if (success) {
                    setBookmark([]);
                    setSelectedIds([]);
                    setIsEditMode(false);
                } else {
                    alert('삭제 처리 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error("Delete All error:", error);
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!authUser) return;

        if (confirm(`선택한 ${selectedIds.length}개의 아이템을 삭제하시겠습니까?`)) {
            setIsActionLoading(true);
            console.log("selectedIds", selectedIds);

            try {
                const success = await deleteBookmarkAPI(authUser.accessToken, selectedIds);
                if (success) {
                    await refreshBookmarks();
                    setSelectedIds([]);
                    setIsEditMode(false);
                } else {
                    alert('삭제 처리 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error("Delete Batch error:", error);
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full px-4 lg:px-0 pt-6 pb-20">
            <div className="bg-white dark:bg-neutral-900/50 rounded-4xl lg:rounded-[2.5rem] border-2 border-neutral-100 dark:border-white/10 shadow-xl p-6 lg:p-12 min-h-200 flex flex-col">

                {/* 헤더 영역 */}
                <div className="flex-none flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-neutral-100 dark:border-white/10 pb-6 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                            <FaLayerGroup size={10} className="text-violet-500" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Saved Items</span>
                        </div>
                        <h3 className="font-normal text-3xl lg:text-4xl italic tracking-tighter text-neutral-900 dark:text-white flex items-center gap-4">
                            북마크 리스트
                            <span className="text-lg text-violet-500 font-bold bg-violet-50 dark:bg-violet-900/30 px-3 py-1 rounded-full not-italic">
                                {bookmark.length}
                            </span>
                        </h3>
                    </div>


                    {/* 버튼 영역 (오른쪽 정렬 및 간격 조정) */}
                    <div className="flex items-center gap-3">
                        {isEditMode && selectedIds.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                disabled={isActionLoading}
                                className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white transition-all rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 disabled:opacity-50"
                            >
                                <FaTrashCan size={10} />
                                선택 삭제 ({selectedIds.length})
                            </button>
                        )}
                        {bookmark.length > 0 && (
                            <button
                                onClick={() => {
                                    setIsEditMode(!isEditMode);
                                    if (isEditMode) setSelectedIds([]);
                                }}
                                className={`flex items-center gap-2 px-5 py-2 transition-all rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 ${isEditMode ? 'bg-neutral-800 text-white dark:bg-white dark:text-black shadow-lg' : 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/20'}`}
                            >
                                {isEditMode ? <FaXmark size={12} /> : <FaCheckDouble size={12} />}
                                {isEditMode ? '선택 취소' : '선택 삭제'}
                            </button>
                        )}
                        {bookmark.length > 0 && !isEditMode && (
                            <button
                                onClick={handleClearBookmark}
                                className="flex items-center gap-2 px-5 py-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 transition-all rounded-full text-[10px] font-black uppercase tracking-widest group active:scale-95"
                            >
                                <FaTrashCan size={10} className="group-hover:animate-bounce" />
                                전체 삭제
                            </button>
                        )}
                    </div>
                </div>

                {/* 상품 리스트 영역 */}
                <div className="flex-1 min-h-0">
                    {isActionLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-40 gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-violet-100 dark:border-white/5 rounded-full animate-spin border-t-violet-600" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FaBookmark className="text-violet-600/30 animate-pulse" size={24} />
                                </div>
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-[12px] font-black text-neutral-800 dark:text-white uppercase tracking-widest">Syncing Bookmark...</p>
                                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Updating from server</p>
                            </div>
                        </div>
                    ) : bookmark.length > 0 ? (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 pb-12">
                            {bookmark.map((item, idx) => (
                                <div
                                    key={`${item.productId}-${idx}`}
                                    style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
                                >
                                    <ProductCard
                                        product={item}
                                        index={idx}
                                        selected={selectedIds.includes(item.productId)}
                                        showCartButton={!isEditMode}
                                        onClick={() => {
                                            if (isEditMode) {
                                                setSelectedIds(prev =>
                                                    prev.includes(item.productId)
                                                        ? prev.filter(id => id !== item.productId)
                                                        : [...prev, item.productId]
                                                );
                                            } else {
                                                if (item.productLink) {
                                                    window.open(item.productLink, '_blank');
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-32 text-center space-y-4">
                            <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-300 dark:text-neutral-600 mb-2">
                                <FaBookmark size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">북마크 리스트가 비어있습니다.</h4>
                            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                                원하는 스타일을 발견하고 북마크에 저장할 수 있습니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
