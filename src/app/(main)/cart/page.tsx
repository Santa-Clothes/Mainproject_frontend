'use client';
import React from 'react';
import ProductCard from '../components/ProductCard';
import { useAtom } from 'jotai';
import { cartAtom } from '@/jotai/historyJotai';
import { FaLayerGroup, FaCartShopping, FaTrashCan } from 'react-icons/fa6';

export default function CartPage() {
    const [cart, setCart] = useAtom(cartAtom);

    const handleClearCart = () => {
        if (confirm('Are you sure you want to completely empty your collection?')) {
            setCart([]);
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
                        <h3 className="font-serif text-3xl lg:text-4xl italic tracking-tighter text-neutral-900 dark:text-white flex items-center gap-4">
                            User Collection
                            <span className="text-lg text-violet-500 font-bold bg-violet-50 dark:bg-violet-900/30 px-3 py-1 rounded-full not-italic">
                                {cart.length}
                            </span>
                        </h3>
                    </div>

                    {cart.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 transition-colors rounded-full text-[9px] font-bold uppercase tracking-widest group"
                        >
                            <FaTrashCan size={10} className="group-hover:animate-bounce" />
                            Clear All
                        </button>
                    )}
                </div>

                {/* 상품 리스트 영역 */}
                <div className="flex-1 min-h-0">
                    {cart.length > 0 ? (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 pb-12">
                            {cart.map((item, idx) => (
                                <div
                                    key={`${item.productId}-${idx}`}
                                    // 대량의 장바구니 리스트 렌더링 시 브라우저 버벅임 방지 최적화
                                    style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
                                >
                                    <ProductCard
                                        product={item}
                                        index={idx}
                                        showCartButton={true} // 카트에서 직접 뺐다 꼈다 할 수 있도록 활성화
                                        onClick={() => {
                                            if (item.productLink) {
                                                window.open(item.productLink, '_blank');
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-32 text-center space-y-4">
                            <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-300 dark:text-neutral-600 mb-2">
                                <FaCartShopping size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">Your collection is empty</h4>
                            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                                Browse the catalog or upload images to discover and save your favorite styles here.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}