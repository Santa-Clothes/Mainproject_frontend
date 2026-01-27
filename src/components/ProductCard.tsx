import { ProductType } from "@/types/ProductType";
import Image from "next/image";

interface ProductCardProps {
  product: ProductType;
  index?: number; // 애니메이션 지연을 위한 인덱스
}

export default function ProductCard({ product, index = 0 } : ProductCardProps) {
  return (
    <div 
      className="group space-y-6 cursor-pointer animate-in fade-in zoom-in-95 duration-700"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Container */}
      <div className="aspect-3/4 overflow-hidden rounded-4xl bg-[#F5F4F0] relative">
        <Image 
          src={product.img} 
          alt={product.name} 
          fill 
          className="group-hover:scale-110 transition-transform duration-[2s] object-cover" 
        />
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />
        
        {/* Floating Category Tag */}
        <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="px-4 py-2 bg-white/80 backdrop-blur-md text-[8px] font-bold text-black uppercase tracking-widest rounded-full">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="space-y-1 px-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-black transition-colors">
            {product.brand}
          </span>
          <span className="text-[11px] font-serif italic text-gray-500 group-hover:text-black transition-colors">
            ${product.price.toLocaleString()}
          </span>
        </div>
        <h4 className="text-lg font-serif italic text-[#121212] tracking-tight group-hover:translate-x-1 transition-transform">
          {product.name}
        </h4>
      </div>
    </div>
  );
}