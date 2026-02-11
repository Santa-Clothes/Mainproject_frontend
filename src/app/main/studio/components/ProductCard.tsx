import { RecommendData } from "@/types/ProductType";
import Image from "next/image";

interface ProductCardProps {
    product: RecommendData;
    index?: number; // 애니메이션 순서 제어를 위한 인덱스
    onClick?: () => void;
}

/**
 * ProductCard: 스튜디오 검색 결과나 추천 상품을 보여주는 개별 상품 카드
 * 세련된 이미지 오버레이와 함께 유사도 점수, 가격 등의 정보를 매력적으로 표시합니다.
 */
export default function ProductCard({ product, index = 0, onClick }: ProductCardProps) {
    // 유사도 점수 포맷팅 (숫자인 경우 퍼센트로 변환)
    const formattedScore = typeof product.similarityScore === 'number'
        ? `${(product.similarityScore * 100).toFixed(1)}%`
        : product.similarityScore;

    // 가격 포맷팅 (세 자리마다 쉼표 추가)
    const formattedPrice = new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(product.price);

    return (
        <div
            onClick={onClick}
            className="group space-y-6 cursor-pointer"
        >
            {/* 1. 이미지 컨테이너 (3:4 비율 고정) */}
            <div className="aspect-3/4 overflow-hidden rounded-4xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 relative shadow-sm">
                <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="group-hover:scale-110 transition-transform duration-1000 object-cover"
                />

                {/* 호버 시 이미지가 선명해지는 효과를 위한 오버레이 */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />

                {/* 선택사항: 유사도 점수를 이미지 위에도 작게 띄우고 싶을 때 사용 가능 */}
            </div>

            {/* 2. 상품 정보 컨테이너 */}
            <div className="space-y-2 px-2">
                <div className="flex justify-between items-center">
                    {/* 유사도 매칭 정보 */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-violet-500" />
                        <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">
                            {formattedScore} Match
                        </span>
                    </div>
                    {/* 가격 정보 */}
                    <span className="text-[11px] font-normal italic text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {formattedPrice}
                    </span>
                </div>

                {/* 상품명 */}
                <h4 className="text-lg font-normal italic text-neutral-900 dark:text-neutral-100 tracking-tight group-hover:translate-x-1 transition-transform">
                    {product.title}
                </h4>
            </div>
        </div>
    );
}
