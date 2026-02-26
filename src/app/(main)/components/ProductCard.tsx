import React, { useState } from "react";
import { RecommendData, BookmarkData } from "@/types/ProductType";
import Image from "next/image";
import { FaCheck, FaBookmark, FaShirt, FaArrowsRotate, FaXmark, FaMagnifyingGlass } from "react-icons/fa6";
import { useAtom } from "jotai";
import { bookmarkAtom } from "@/jotai/historyJotai";
import { authUserAtom } from "@/jotai/loginjotai";
import { saveBookmarkAPI, deleteBookmarkAPI } from "@/app/api/memberservice/bookmarkapi";

const STYLE_KO_DICT: Record<string, string> = {
    'casual': '캐주얼',
    'street': '스트릿',
    'natural': '내추럴',
    'contemporary': '컨템포러리',
    'modern': '모던',
    'formal': '포멀',
    'classic': '클래식',
    'romantic': '로맨틱',
    'sporty': '스포티',
    'vintage': '빈티지',
    'chic': '시크',
    'retro': '레트로',
    'minimal': '미니멀',
    'kitsch': '키치',
    'feminine': '페미닌',
    'masculine': '매니시',
    'bohemian': '보헤미안'
};

const translateStyleName = (name?: string) => {
    if (!name) return '';
    const lower = name.toLowerCase();
    return STYLE_KO_DICT[lower] || name; // 매핑 없으면 원래 문자열 반환 (한글이면 그대로)
};

interface ProductCardProps {
    product: RecommendData | BookmarkData;
    index?: number;
    selected?: boolean; // 선택 상태 추가
    onClick?: () => void;
    showCartButton?: boolean; // 북마크 버튼 표시 여부
    showStyleLabels?: boolean; // 북마크 페이지 등에서 저장/원본 스타일 표시 여부
    onCartClickOverride?: (e: React.MouseEvent) => void; // 북마크 버튼 클릭 이벤트 오버라이드
    onAnalyzeClick?: (e: React.MouseEvent) => void; // 분석 시작 버튼 클릭 핸들러
    isAnalyzing?: boolean; // 분석 진행 중 상태
    top1Style?: string; // AnalysisSection에서 도출된 가장 높은 확률의 스타일명
}

/**
 * ProductCard: Upload Page 및 Selection Page의 검색/분석 결과로 반환된 추천 상품을 표시하는 개별 아이템 카드 컴포넌트입니다.
 */
const ProductCard = React.memo(({
    product,
    index = 0,
    selected = false,
    showCartButton = false,
    showStyleLabels = false,
    onCartClickOverride,
    onAnalyzeClick,
    isAnalyzing = false,
    top1Style,
    onClick
}: ProductCardProps) => {
    // ... 기존 포맷팅 로직
    const similarityScore = (product as RecommendData).similarityScore;
    const formattedScore = typeof similarityScore === 'number'
        ? `${(similarityScore * 100).toFixed(1)}%`
        : similarityScore;

    const formattedPrice = new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(product.price || 0);
    const displayImageUrl = product.imageUrl || (product as any).image_url || (product as any).image || '';
    const displayTitle = (product as any).title || (product as any).name || 'Unknown Product';

    // 북마크 데이터 특화 속성 추출 (API 연동 전 더미/구조화용)
    const savedStyle = (product as BookmarkData).savedStyleName;
    const originalStyle = (product as BookmarkData).originalStyleName;
    const originalScore = (product as BookmarkData).originalStyleScore;

    const displaySavedStyle = translateStyleName(savedStyle);
    const displayOriginalStyle = translateStyleName(originalStyle);

    // 북마크 상태 관리
    const [bookmark, setBookmark] = useAtom(bookmarkAtom);
    const [authUser] = useAtom(authUserAtom);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // [정제] 표준 규격인 productId를 사용한 매칭
    const isBookmarked = bookmark.some((item) => item.productId === product.productId);

    const toggleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation(); // 카드 자체의 클릭 이벤트(새 창 열기 등) 방지
        if (isActionLoading) return;

        // 로그인 여부 체크
        if (!authUser) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }

        if (onCartClickOverride) {
            onCartClickOverride(e);
            return;
        }

        setIsActionLoading(true);
        try {

            if (isBookmarked) {
                // 서버에서 삭제 시도 (배열 형태로 전달)
                const success = await deleteBookmarkAPI(authUser.accessToken, [product.productId]);
                if (success) {
                    setBookmark(bookmark.filter((item) => item.productId !== product.productId));
                } else {
                    alert('삭제에 실패했습니다.');
                }
            } else {
                // 서버에 저장 시도
                const success = await saveBookmarkAPI(authUser.accessToken, product.productId, top1Style);
                if (success) {
                    // BookmarkData 규격을 맞추기 위해 임시 객체 생성 (any 타입 활용)
                    const newBookmarkItem: any = {
                        ...product,
                        naverProductId: product.productId,
                        createdAt: new Date().toISOString(), // 임시 날짜
                    };
                    setBookmark([...bookmark, newBookmarkItem]);
                } else {
                    alert('저장에 실패했습니다.');
                }
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div
            onClick={onClick}
            className={`group space-y-4 cursor-pointer transition-all`}
        >
            {/* 1. 이미지 컨테이너 */}
            <div className={`aspect-3/4 overflow-hidden rounded-3xl bg-neutral-50/50 dark:bg-neutral-800/50 border-2 relative shadow-sm transition-all border-neutral-100 dark:border-white/15 group-hover:border-violet-500 group-hover:ring-4 group-hover:ring-violet-500/10`}>
                {displayImageUrl ? (
                    <Image
                        src={displayImageUrl}
                        alt={displayTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 4}
                        className={`group-hover:scale-105 transition-transform duration-700 object-contain p-2`}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600">
                        <FaShirt size={48} className="mb-4 opacity-50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Image</span>
                    </div>
                )}


                {/* 선택 모드 체크 표시 오버레이 */}
                {selected && (
                    <div className="absolute inset-0 z-40 bg-violet-600/30 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-violet-600 animate-in zoom-in-50 duration-300">
                            <FaCheck size={24} className="text-violet-600" />
                        </div>
                    </div>
                )}

                {/* 상단 저장된 스타일 뱃지 (북마크 탭 전용) */}
                {showStyleLabels && displaySavedStyle && (
                    <div className="absolute top-4 left-4 z-20 bg-violet-600 border border-white/20 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">
                            {displaySavedStyle}
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />

                {/* 중앙 분석 시작 버튼 (Hover 시 노출) */}
                {onAnalyzeClick && (
                    <div className={`absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ${isAnalyzing ? 'opacity-100' : ''}`}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAnalyzeClick(e);
                            }}
                            disabled={isAnalyzing}
                            className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-violet-600 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-110 active:scale-95 transition-all group/analyze disabled:opacity-50"
                        >
                            {isAnalyzing ? (
                                <FaArrowsRotate size={12} className="animate-spin text-violet-500" />
                            ) : (
                                <FaMagnifyingGlass size={12} className="group-hover/analyze:scale-110 transition-transform" />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                {isAnalyzing ? '분석중...' : '스타일 분석하기'}
                            </span>
                        </button>
                    </div>
                )}

                {/* 우측 상단 북마크 버튼 */}
                {showCartButton && (
                    <button
                        onClick={toggleBookmark}
                        disabled={isActionLoading}
                        title={isBookmarked ? '북마크에서 삭제' : '북마크에 추가'}
                        className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white shadow-xl group/btn
                            ${isActionLoading ? 'cursor-wait text-violet-400' : isBookmarked ? 'text-violet-600 scale-110 shadow-violet-500/20' : 'text-neutral-300 hover:text-violet-500 hover:scale-110'}`}
                    >
                        {isActionLoading ? (
                            <FaArrowsRotate size={14} className="animate-spin" />
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <FaBookmark
                                    size={14}
                                    className={`transition-all duration-300 ${isBookmarked ? 'opacity-100 group-hover/btn:opacity-0 group-hover/btn:scale-50' : ''}`}
                                />
                                {isBookmarked && (
                                    <FaXmark
                                        size={14}
                                        className="absolute inset-0 m-auto opacity-0 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all duration-300 text-red-500"
                                    />
                                )}
                            </div>
                        )}
                    </button>
                )}
            </div>

            {/* 2. 상품 정보 컨테이너 */}
            <div className={`space-y-1.5 px-1 transition-colors`}>
                <div className="flex justify-between items-center h-4">
                    {similarityScore !== undefined && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-violet-500" />
                            <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">
                                {formattedScore} Match
                            </span>
                        </div>
                    )}
                    <span className={`text-[10px] font-normal italic transition-colors text-gray-500`}>
                        {formattedPrice}
                    </span>
                </div>

                <h4 className={`text-sm font-medium italic tracking-tight transition-all duration-300 truncate text-neutral-900 dark:text-neutral-100 group-hover:translate-x-1`}>
                    {displayTitle}
                </h4>

                {/* 하단 원본 상품 스타일 및 수치 정보 (북마크 탭 전용) */}
                {showStyleLabels && displayOriginalStyle && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/10">
                        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-500 text-xs shadow-inner">
                            <FaCheck />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Original Match</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-black uppercase text-neutral-700 dark:text-neutral-300">{displayOriginalStyle}</span>
                                {originalScore !== undefined && (
                                    <span className="text-[10px] text-violet-500 font-bold">{(originalScore * 100).toFixed(1)}%</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default ProductCard;
