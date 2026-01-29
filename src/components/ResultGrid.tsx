import { ProductType } from '@/types/ProductType';
import Image from 'next/image';
import { useState } from 'react';
import { FaLayerGroup, FaMagnifyingGlass } from 'react-icons/fa6';

interface ResultGridProps {
    title?: string;
    subtitle?: string;
    isActive?: boolean;
    products?: ProductType[] | null;
}

//출력된 이미지들 뿌릴 영역
export default function ResultGrid({
    title = "Neural Match Results",
    subtitle = "Archive Discovery",
    isActive = false,
    products = null
}: ResultGridProps) {
    const [activeFilter, setActiveFilter] = useState('All');
    const filters = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Accessories'];

    const filteredItems = products && activeFilter === 'All'
        ? products
        : products?.filter(item => item.category === activeFilter) || [];

    return (
        <div className="space-y-10 py-16">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-black/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-400">
                        <FaLayerGroup size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">{subtitle}</span>
                    </div>
                    <h3 className="text-4xl font-serif italic tracking-tighter text-black">{title}</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full border ${activeFilter === filter
                                    ? 'bg-black text-white border-black shadow-lg scale-105'
                                    : 'bg-transparent text-gray-400 border-gray-100 hover:border-black hover:text-black'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Content */}
            {isActive && products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
                    {filteredItems.map((item, idx) => (
                        <div key={item.id} className="group space-y-6 cursor-pointer">
                            <div className="aspect-3/4 overflow-hidden rounded-4xl bg-[#F5F4F0] relative">
                                <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />
                            </div>
                            <div className="space-y-1 px-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{item.brand}</span>
                                    <span className="text-[11px] font-serif italic">${item.price}</span>
                                </div>
                                <h4 className="text-lg font-serif italic text-[#121212] tracking-tight">{item.name}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State: 레이아웃만 보여줌 */
                <div className="py-40 flex flex-col items-center justify-center border border-dashed border-[#EBEAE7] rounded-[4rem] bg-[#FAF9F6]/30">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm">
                        <FaMagnifyingGlass className="text-gray-200" size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.5em] text-center max-w-xs leading-loose">
                        Awaiting parameters to initialize <br /> archival cross-reference
                    </p>
                </div>
            )}
        </div>
    );
};


