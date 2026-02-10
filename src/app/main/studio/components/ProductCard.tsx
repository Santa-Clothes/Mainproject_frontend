import { RecommendData } from "@/types/ProductType";
import Image from "next/image";

interface ProductCardProps {
    product: RecommendData;
    index?: number; // 애니메이션 지연을 위한 인덱스
    onClick?: () => void;
}

/**
 * ProductCard: Studio 결과 그리드에서 개별 상품을 표시하는 카드 컴포넌트입니다.
 */
export default function ProductCard({ product, index = 0, onClick }: ProductCardProps) {
    return (
        <div
            onClick={onClick}
            className="group space-y-6 cursor-pointer"
        >
            {/* Image Container */}
            <div className="aspect-3/4 overflow-hidden rounded-4xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 relative">
                <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="group-hover:scale-110 transition-transform duration-1000 object-cover"
                />
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />

                {/* Floating Category Tag */}
                {/* <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="px-4 py-2 bg-white/80 dark:bg-white/10 backdrop-blur-md text-[8px] font-bold text-black dark:text-white uppercase tracking-widest rounded-full">
                        {product.similarityScore}
                    </span>
                </div> */}
            </div>

            {/* Info Container */}
            <div className="space-y-1 px-2">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-black transition-colors">
                        {product.similarityScore}
                    </span>
                    <span className="text-[11px] font-serif italic text-gray-500 group-hover:text-black transition-colors">
                        \{(product.price / 100) * 100}
                    </span>
                </div>
                <h4 className="text-lg font-serif italic text-[#121212] tracking-tight group-hover:translate-x-1 transition-transform">
                    {product.title}
                </h4>
            </div>
        </div>
    );
}
