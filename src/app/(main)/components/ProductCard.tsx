import { RecommendData } from "@/types/ProductType";
import Image from "next/image";
import { FaCheck, FaBookmark, FaShirt, FaArrowsRotate, FaXmark } from "react-icons/fa6";
import { useState } from "react";
import { useAtom } from "jotai";
import { bookmarkAtom } from "@/jotai/historyJotai";
import { authUserAtom } from "@/jotai/loginjotai";
import { saveBookmarkAPI, deleteBookmarkAPI } from "@/app/api/memberservice/bookmarkapi";

interface ProductCardProps {
    product: RecommendData;
    index?: number;
    selected?: boolean; // 선택 상태 추가
    onClick?: () => void;
    showCartButton?: boolean; // 북마크 버튼 표시 여부
    onCartClickOverride?: (e: React.MouseEvent) => void; // 북마크 버튼 클릭 이벤트 오버라이드
}

/**
 * ProductCard: Upload Page 및 Selection Page의 검색/분석 결과로 반환된 추천 상품을 표시하는 개별 아이템 카드 컴포넌트입니다.
 */
export default function ProductCard({ product, index = 0, selected = false, showCartButton = false, onCartClickOverride, onClick }: ProductCardProps) {
    // ... 기존 포맷팅 로직 생략 (유지에 주의)
    const formattedScore = typeof product.similarityScore === 'number'
        ? `${(product.similarityScore * 100).toFixed(1)}%`
        : product.similarityScore;

    const formattedPrice = new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(product.price || 0);
    const displayImageUrl = product.imageUrl || (product as any).image_url || (product as any).image || '';
    const displayTitle = product.title || (product as any).name || 'Unknown Product';

    // 장바구니 상태 관리
    const [cart, setCart] = useAtom(bookmarkAtom);
    const [authUser] = useAtom(authUserAtom);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const isInCart = cart.some((item) => item.productId === product.productId);

    const toggleCart = async (e: React.MouseEvent) => {
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

            if (isInCart) {
                // 서버에서 삭제 시도
                const success = await deleteBookmarkAPI(authUser.accessToken, product.productId);
                if (success) {
                    setCart(cart.filter((item) => item.productId !== product.productId));
                } else {
                    alert('삭제에 실패했습니다.');
                }
            } else {
                // 서버에 저장 시도
                const success = await saveBookmarkAPI(authUser.accessToken, product.productId);
                if (success) {
                    setCart([...cart, product]);
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
            className={`group space-y-4 cursor-pointer transition-all ${selected ? 'scale-[1.02]' : ''}`}
        >
            {/* 1. 이미지 컨테이너 */}
            <div className={`aspect-3/4 overflow-hidden rounded-3xl bg-white dark:bg-neutral-900/50 border-2 relative shadow-sm transition-all
                ${selected ? 'border-violet-600 ring-4 ring-violet-600/10 shadow-2xl' : 'border-neutral-100 dark:border-white/15 group-hover:border-violet-200'}`}>
                {displayImageUrl ? (
                    <Image
                        src={displayImageUrl}
                        alt={displayTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 4}
                        className={`group-hover:scale-110 transition-transform duration-1000 object-cover ${selected ? 'brightness-75' : ''}`}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600">
                        <FaShirt size={48} className="mb-4 opacity-50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Image</span>
                    </div>
                )}

                {/* 선택 시 체크 표시 오버레이 */}
                {selected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-violet-600/20 backdrop-blur-[2px] animate-in zoom-in duration-300">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-violet-600 shadow-2xl">
                            <FaCheck size={18} />
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />

                {/* 우측 상단 북마크 버튼 */}
                {showCartButton && (
                    <button
                        onClick={toggleCart}
                        disabled={isActionLoading}
                        title={isInCart ? 'Remove from Bookmark' : 'Add to Bookmark'}
                        className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white shadow-xl group/btn
                            ${isActionLoading ? 'cursor-wait text-violet-400' : isInCart ? 'text-violet-600 scale-110 shadow-violet-500/20' : 'text-neutral-300 hover:text-violet-500 hover:scale-110'}`}
                    >
                        {isActionLoading ? (
                            <FaArrowsRotate size={14} className="animate-spin" />
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <FaBookmark
                                    size={14}
                                    className={`transition-all duration-300 ${isInCart ? 'animate-bounce group-hover/btn:opacity-0 group-hover/btn:scale-50' : ''}`}
                                />
                                {isInCart && (
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
            <div className={`space-y-1.5 px-1 transition-colors ${selected ? 'text-violet-600' : ''}`}>
                <div className="flex justify-between items-center h-4">
                    {product.similarityScore !== undefined && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-violet-500" />
                            <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">
                                {formattedScore} Match
                            </span>
                        </div>
                    )}
                    <span className={`text-[10px] font-normal italic transition-colors ${selected ? 'text-violet-500' : 'text-gray-500'}`}>
                        {formattedPrice}
                    </span>
                </div>

                <h4 className={`text-sm font-medium italic tracking-tight transition-all duration-300 truncate ${selected ? 'translate-x-1 text-violet-600 font-bold' : 'text-neutral-900 dark:text-neutral-100 group-hover:translate-x-1'}`}>
                    {displayTitle}
                </h4>
            </div>
        </div>
    );
}
