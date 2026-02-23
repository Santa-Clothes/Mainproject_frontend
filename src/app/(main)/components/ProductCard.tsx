import { RecommendData } from "@/types/ProductType";
import Image from "next/image";
import { FaCheck, FaCartArrowDown } from "react-icons/fa6";
import { useAtom } from "jotai";
import { cartAtom } from "@/jotai/historyJotai";

interface ProductCardProps {
    product: RecommendData;
    index?: number;
    selected?: boolean; // 선택 상태 추가
    onClick?: () => void;
    showCartButton?: boolean; // 장바구니 버튼 표시 여부
}

/**
 * ProductCard: Upload Studio 및 Explore Catalog의 검색/분석 결과로 반환된 추천 상품을 표시하는 개별 아이템 카드 컴포넌트입니다.
 */
export default function ProductCard({ product, index = 0, selected = false, showCartButton = false, onClick }: ProductCardProps) {
    // ... 기존 포맷팅 로직 생략 (유지에 주의)
    const formattedScore = typeof product.similarityScore === 'number'
        ? `${(product.similarityScore * 100).toFixed(1)}%`
        : product.similarityScore;

    const formattedPrice = new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(product.price);

    // 장바구니 상태 관리
    const [cart, setCart] = useAtom(cartAtom);
    const isInCart = cart.some((item) => item.productId === product.productId);

    const toggleCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // 카드 자체의 클릭 이벤트(새 창 열기 등) 방지
        if (isInCart) {
            setCart(cart.filter((item) => item.productId !== product.productId));
        } else {
            setCart([...cart, product]);
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
                <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`group-hover:scale-110 transition-transform duration-1000 object-cover ${selected ? 'brightness-75' : ''}`}
                />

                {/* 선택 시 체크 표시 오버레이 */}
                {selected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-violet-600/20 backdrop-blur-[2px] animate-in zoom-in duration-300">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-violet-600 shadow-2xl">
                            <FaCheck size={18} />
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />

                {/* 우측 상단 장바구니 버튼 */}
                {showCartButton && (
                    <button
                        onClick={toggleCart}
                        title={isInCart ? 'Remove from Cart' : 'Add to Cart'}
                        className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white shadow-xl ${isInCart ? 'text-violet-600 scale-110 shadow-violet-500/20' : 'text-neutral-300 hover:text-violet-500 hover:scale-110'
                            }`}
                    >
                        <FaCartArrowDown size={14} className={isInCart ? 'animate-bounce' : ''} />
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
                    {product.title}
                </h4>
            </div>
        </div>
    );
}
