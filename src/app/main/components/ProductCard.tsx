import { RecommendData } from "@/types/ProductType";
import Image from "next/image";
import { FaCheck } from "react-icons/fa6";

interface ProductCardProps {
    product: RecommendData;
    index?: number;
    selected?: boolean; // 선택 상태 추가
    onClick?: () => void;
}

/**
 * ProductCard: 스튜디오 검색 결과나 추천 상품을 보여주는 개별 상품 카드
 */
export default function ProductCard({ product, index = 0, selected = false, onClick }: ProductCardProps) {
    // ... 기존 포맷팅 로직 생략 (유지에 주의)
    const formattedScore = typeof product.similarityScore === 'number'
        ? `${(product.similarityScore * 100).toFixed(1)}%`
        : product.similarityScore;

    const formattedPrice = new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(product.price);

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
