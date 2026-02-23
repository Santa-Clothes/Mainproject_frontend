'use client';

import React from 'react';
import DashboardCard from './DashboardCard';
import { SalesRankItem } from '@/app/api/salesservice/salesapi';
import { FaRegCalendarAlt } from 'react-icons/fa';

interface Props {
    initialSales: SalesRankItem[];
    fetchSalesFn: (shop: string, startDate: string, endDate: string) => Promise<SalesRankItem[]>;
    className?: string;
}

const mockFetchShopList = async (): Promise<string[]> => {
    // 임시 모의 API: 향후 백엔드 API로 교체 가능
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                '전체', 'HP김포풍무점', 'HP서울방학점', 'HP서울시흥점', 'HP센텀시티점',
                '대구반야월점', '대구태전점', '부산구서점(직)', '부산당감점', '부산두실점(직)',
                '부산만덕점(직)', '부산모라점(직)', '부산연지점(직)', '부산하단점',
                '서울목동점(행복한백화점)', '씨엔에스컴퍼니', '양산웅상점', '온라인',
                '일산주엽점(그랜드백화점)', '제주일도점'
            ]);
        }, 600);
    });
};

const BestSellersCard: React.FC<Props> = ({ initialSales, fetchSalesFn, className = "" }) => {
    const [shopList, setShopList] = React.useState<string[]>([]);
    const [isShopListLoading, setIsShopListLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    const [selectedShops, setSelectedShops] = React.useState<string[]>([]);
    const [salesMap, setSalesMap] = React.useState<Record<string, SalesRankItem[]>>({
        '전체': initialSales
    });

    // 개별 지점 로딩 상태 (전체 화면 로딩 방지)
    const [loadingShops, setLoadingShops] = React.useState<Record<string, boolean>>({});

    const [error, setError] = React.useState<string | null>(null);
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    // 이전 날짜 필터 기억용 Ref
    const prevDateRef = React.useRef(`${startDate}_${endDate}`);

    // 초기 마운트 시 지점 리스트 받아오기
    React.useEffect(() => {
        let isMounted = true;
        mockFetchShopList().then(list => {
            if (isMounted) {
                setShopList(list);
                setIsShopListLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, []);

    const formatProductName = (name: string) => {
        if (!name) return 'Unknown Product';
        const parts = name.split('-');
        return (parts[parts.length - 1] || name).trim();
    };

    const handleShopToggle = (shop: string) => {
        setSelectedShops(prev => {
            if (prev.includes(shop)) return prev.filter(s => s !== shop);

            // 최대 3곳까지만 비교 가능하도록 (총 4컬럼) 오래된 것을 밀어내고 추가
            if (prev.length >= 3) {
                return [...prev.slice(1), shop];
            }
            return [...prev, shop];
        });
    };

    const aggregatedDataByShop = React.useMemo(() => {
        const result: Record<string, { shortName: string; quantity: number }[]> = {};

        const shopsToProcess = ['전체', ...selectedShops];

        for (const shop of shopsToProcess) {
            const data = salesMap[shop] || [];
            const map = new Map<string, { shortName: string; quantity: number }>();

            data.forEach(s => {
                const short = formatProductName(s.productName);
                const existing = map.get(short);
                if (existing) {
                    existing.quantity += s.saleQuantity;
                } else {
                    map.set(short, { shortName: short, quantity: s.saleQuantity });
                }
            });

            result[shop] = Array.from(map.values())
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);
        }
        return result;
    }, [salesMap, selectedShops]);

    // 필터 변경 시 (선택 지점 또는 날짜) API 호출
    React.useEffect(() => {
        const loadFilteredData = async () => {
            if ((startDate && !endDate) || (!startDate && endDate)) return;

            const isDateChanged = prevDateRef.current !== `${startDate}_${endDate}`;
            prevDateRef.current = `${startDate}_${endDate}`;

            const shopsToProcess = ['전체', ...selectedShops];

            // 날짜가 안 바뀌었으면 캐시에 없는 지점만 추가 페칭
            const shopsToFetch = isDateChanged ? shopsToProcess : shopsToProcess.filter(s => !salesMap[s]);

            if (shopsToFetch.length === 0) return;

            setError(null);

            const newLoadingState = { ...loadingShops };
            shopsToFetch.forEach(s => newLoadingState[s] = true);
            setLoadingShops(newLoadingState);

            try {
                const results = await Promise.all(
                    shopsToFetch.map(async (shop) => {
                        const data = await fetchSalesFn(
                            shop === '전체' ? '' : shop,
                            startDate,
                            endDate
                        );
                        return { shop, data };
                    })
                );

                setSalesMap(prev => {
                    const nextMap = isDateChanged ? {} : { ...prev };
                    results.forEach(res => {
                        nextMap[res.shop] = res.data;
                    });

                    if (isDateChanged && !nextMap['전체'] && prev['전체']) {
                        nextMap['전체'] = prev['전체'];
                    }
                    return nextMap;
                });
            } catch (err) {
                console.error("Filter fetch failed:", err);
            } finally {
                setLoadingShops(prev => {
                    const next = { ...prev };
                    shopsToFetch.forEach(s => { delete next[s] });
                    return next;
                });
            }
        };

        loadFilteredData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedShops, startDate, endDate]);

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split('-');
        return `${parts[1]}.${parts[2]}`;
    };

    const startDateRef = React.useRef<HTMLInputElement>(null);
    const endDateRef = React.useRef<HTMLInputElement>(null);

    return (
        <DashboardCard
            title="Best Sellers Ranking"
            subtitle="Shop Comparison"
            error={error}
            onRetry={() => {
                setError(null);
                setSalesMap({ '전체': initialSales });
            }}
            className={`${className}`}
        >
            <div className="flex flex-col h-full space-y-6 pt-2">

                {/* 1. Header with Search and Shop Pills */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 w-full max-w-lg">
                            <div className="relative w-full max-w-sm flex-1">
                                <input
                                    type="text"
                                    placeholder="지점 검색 (예: 부산)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-full px-4 py-2 text-[11px] font-bold text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                />
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden sm:block shrink-0">Max 3 Compare Shops</span>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-white/10 p-1 shadow-sm w-full sm:max-w-64 shrink-0 transition-all hover:border-violet-300 dark:hover:border-violet-500/50">
                                {/* Calendar Icon & Label Wrapper */}
                                <div className="flex items-center gap-1.5 pl-3 pr-1 border-r border-neutral-100 dark:border-white/5 text-neutral-400 dark:text-neutral-500">
                                    <FaRegCalendarAlt className="text-violet-500" size={12} />
                                    <span className="text-[12px] font-bold uppercase tracking-widest hidden lg:block">기간설정</span>
                                </div>

                                <div
                                    onClick={() => startDateRef.current?.showPicker()}
                                    className="relative flex-1 px-2 py-1 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all cursor-pointer rounded-l-full border-r border-neutral-100 dark:border-white/5"
                                >
                                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                                        {formatDateDisplay(startDate) || 'START'}
                                    </span>
                                    <input
                                        ref={startDateRef}
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="absolute -z-50 opacity-0 pointer-events-none w-0 h-0"
                                    />
                                </div>
                                <div
                                    onClick={() => endDateRef.current?.showPicker()}
                                    className="relative flex-1 px-2 py-1 flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all cursor-pointer rounded-r-full"
                                >
                                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                                        {formatDateDisplay(endDate) || 'END'}
                                    </span>
                                    <input
                                        ref={endDateRef}
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="absolute -z-50 opacity-0 pointer-events-none w-0 h-0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shops Horizontal Scroller */}
                    <div className="-mx-1 px-1 min-h-10 flex items-center">
                        {isShopListLoading ? (
                            <div className="flex gap-2 w-full animate-pulse overflow-hidden">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <div key={v} className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full shrink-0"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {shopList
                                    .filter(s => s !== '전체')
                                    .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((shop) => (
                                        <button
                                            key={shop}
                                            onClick={() => handleShopToggle(shop)}
                                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase transition-all shrink-0 border
                                            ${selectedShops.includes(shop)
                                                    ? 'bg-violet-600 text-white shadow-md border-transparent'
                                                    : 'bg-white dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/50'}`}
                                        >
                                            {shop.replace('HP', '').replace('(직)', '').replace('(행복한백화점)', '').replace('(그랜드백화점)', '')}
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Content Split by Shop (Columns) */}
                <div className="flex-1 min-h-80">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">

                        {/* Always Display Total First */}
                        <div className="flex flex-col space-y-4 col-span-1">
                            {/* 지점 헤더 */}
                            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-white/10 pb-2">
                                <div className="w-1.5 h-4 bg-violet-500 rounded-full"></div>
                                <h4 className="text-xs font-bold text-neutral-800 dark:text-gray-200 uppercase tracking-widest truncate">
                                    Total Sales Rating
                                </h4>
                                {loadingShops['전체'] && (
                                    <div className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin ml-auto"></div>
                                )}
                            </div>

                            {(() => {
                                const isLoadingShopData = loadingShops['전체'];
                                const items = aggregatedDataByShop['전체'] || [];
                                const maxQ = items[0]?.quantity || 1;

                                if (isLoadingShopData && items.length === 0) return (
                                    <div className="flex flex-col gap-4">
                                        {[1, 2, 3, 4, 5].map(v => (
                                            <div key={v} className="flex flex-col gap-2 w-full animate-pulse">
                                                <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                                                <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                );

                                if (items.length > 0) return (
                                    <div className={`flex flex-col gap-5 ${isLoadingShopData ? 'opacity-50' : ''}`}>
                                        {items.map((item, i) => (
                                            <div key={item.shortName} className="space-y-2 group">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[12px] italic text-violet-600 font-bold">0{i + 1}</span>
                                                        <span className="text-[11px] font-bold text-black dark:text-white uppercase tracking-tight truncate max-w-28 xl:max-w-32 group-hover:text-violet-500 transition-colors tooltip" title={item.shortName}>
                                                            {item.shortName}
                                                        </span>
                                                    </div>
                                                    <span className="text-[12px] font-black text-violet-600 tracking-tighter">
                                                        {item.quantity.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-1000 bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.3)]" style={{ width: `${(item.quantity / maxQ) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );

                                return <div className="text-xs font-bold text-gray-400 py-8 text-center bg-neutral-50 dark:bg-white/5 rounded-xl border border-dashed border-neutral-200 dark:border-white/10">No data.</div>;
                            })()}
                        </div>

                        {/* Selected Compare Shops (Up to 3 Slots) */}
                        {Array.from({ length: 3 }).map((_, slotIdx) => {
                            const shop = selectedShops[slotIdx];

                            // Empty Slot
                            if (!shop) {
                                return (
                                    <div key={`empty-${slotIdx}`} className="flex flex-col space-y-4 col-span-1">
                                        <div className="flex items-center gap-3 border-b border-dashed border-neutral-200 dark:border-white/10 pb-2">
                                            <div className="w-1.5 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
                                            <h4 className="text-xs font-bold text-neutral-400 dark:text-gray-600 uppercase tracking-widest truncate">
                                                Compare slot
                                            </h4>
                                        </div>
                                        <div className="flex-1 min-h-50 flex flex-col items-center justify-center text-center p-6 bg-neutral-50 dark:bg-white/5 rounded-xl border border-dashed border-neutral-200 dark:border-white/10">
                                            <div className="w-10 h-10 mb-3 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                                <span className="text-xl text-neutral-300 dark:text-neutral-600">+</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500">
                                                Select a shop above<br />to compare
                                            </span>
                                        </div>
                                    </div>
                                );
                            }

                            // Rendering Selected Shop
                            const isLoadingShopData = loadingShops[shop];
                            const items = aggregatedDataByShop[shop] || [];
                            const maxQ = items[0]?.quantity || 1;

                            return (
                                <div key={shop} className="flex flex-col space-y-4 col-span-1 fade-in">
                                    <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-white/10 pb-2">
                                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                                        <h4 className="text-xs font-bold text-neutral-800 dark:text-gray-200 uppercase tracking-widest truncate">
                                            {shop}
                                        </h4>
                                        {isLoadingShopData && (
                                            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin ml-auto"></div>
                                        )}
                                    </div>

                                    {isLoadingShopData && items.length === 0 ? (
                                        <div className="flex flex-col gap-4">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <div key={v} className="flex flex-col gap-2 w-full animate-pulse">
                                                    <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                                                    <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : items.length > 0 ? (
                                        <div className={`flex flex-col gap-5 ${isLoadingShopData ? 'opacity-50' : ''}`}>
                                            {items.map((item, i) => (
                                                <div key={item.shortName} className="space-y-2 group">
                                                    <div className="flex justify-between items-end">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[12px] italic text-indigo-600 font-bold">0{i + 1}</span>
                                                            <span className="text-[11px] font-bold text-black dark:text-white uppercase tracking-tight truncate max-w-28 xl:max-w-32 group-hover:text-indigo-500 transition-colors tooltip" title={item.shortName}>
                                                                {item.shortName}
                                                            </span>
                                                        </div>
                                                        <span className="text-[12px] font-black text-indigo-600 tracking-tighter">
                                                            {item.quantity.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-indigo-50 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-1000 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                                                            style={{ width: `${(item.quantity / maxQ) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs font-bold text-gray-400 py-8 bg-neutral-50 dark:bg-white/5 rounded-xl border border-dashed border-neutral-200 dark:border-white/10 text-center">
                                            No data for this period.
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};

export default BestSellersCard;
