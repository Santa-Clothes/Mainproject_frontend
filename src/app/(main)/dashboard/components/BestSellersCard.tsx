'use client';

import React from 'react';
import DashboardCard from './DashboardCard';
import { RankingData, SalesRankItem } from '@/app/api/salesservice/salesapi';
import { FaRegCalendarAlt, FaTimes } from 'react-icons/fa';
import { getShopList, ShopInfo } from '@/app/api/salesservice/salesapi';

interface Props {
    initialSales: SalesRankItem[];
    fetchSalesFn: (shop: string, startDate: string, endDate: string) => Promise<RankingData>;
    className?: string;
    isLoading?: boolean;
}

const fetchShopList = async (): Promise<ShopInfo[]> => {

    const shopList = await getShopList();
    return shopList;
};

const BestSellersCard: React.FC<Props> = ({ initialSales, fetchSalesFn, className = "", isLoading = false }) => {
    const [shopList, setShopList] = React.useState<ShopInfo[]>([]);
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
    const today = new Date().toISOString().split('T')[0];

    // 부모(Dashboard)에서 비동기로 넘어오는 initialSales (전체 랭킹) 업데이트 동기화
    React.useEffect(() => {
        if (initialSales && initialSales.length > 0) {
            setSalesMap(prev => ({
                ...prev,
                '전체': initialSales
            }));
        }
    }, [initialSales]);

    // 초기 마운트 시 지점 리스트 받아오기
    React.useEffect(() => {
        let isMounted = true;
        fetchShopList().then(list => {
            if (isMounted) {
                // 온라인이 들어간 지점들을 "온라인" 키워드 하나로 통합해서 보여주기 위해 중복 제거
                const unifiedList: ShopInfo[] = [];
                let hasOnline = false;

                for (const shop of list) {
                    if (shop.storeName.includes('온라인')) {
                        if (!hasOnline) {
                            unifiedList.push({ storeId: 'online', storeName: '온라인' });
                            hasOnline = true;
                        }
                    } else {
                        unifiedList.push(shop);
                    }
                }

                setShopList(unifiedList);
                setIsShopListLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, []);

    const formatProductName = (name: string) => {
        if (!name) return 'Unknown Product';
        return name.trim();
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
                    shopsToFetch.map(async (shopName) => {
                        let fetchParam = '';
                        if (shopName !== '전체') {
                            const targetShop = shopList.find(s => s.storeName === shopName);
                            fetchParam = targetShop ? targetShop.storeId : shopName;
                        }

                        const data: RankingData = await fetchSalesFn(
                            fetchParam,
                            startDate,
                            endDate
                        );
                        return { shop: shopName, data };
                    })
                );

                setSalesMap(prev => {
                    const nextMap = isDateChanged ? {} : { ...prev };
                    results.forEach(res => {
                        nextMap[res.shop] = res.data?.products || [];
                    });

                    // 날짜가 초기화된 경우(빈 문자열) initialSales로 복구하거나 0부터 다시 시작
                    if (isDateChanged && !startDate && !endDate) {
                        nextMap['전체'] = initialSales;
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

    }, [selectedShops, startDate, endDate]);

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split('-'); // ["2024", "02", "25"]
        // 연도 뒤 두자리만 추출 (2024 -> 24)
        const yearShort = parts[0].slice(-2);
        return `${yearShort}.${parts[1]}.${parts[2]}`;
    };

    const startDateRef = React.useRef<HTMLInputElement>(null);
    const endDateRef = React.useRef<HTMLInputElement>(null);

    return (
        <DashboardCard
            title={
                <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4">
                    <span>판매량 순위</span>
                    <div className="flex items-end gap-3 shrink-0 h-8">
                        <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest hidden xl:block whitespace-nowrap leading-none pb-2">Shop Selection (Max 3)</span>
                        <div className="relative w-40 xl:w-52">
                            <input
                                type="text"
                                placeholder="지점 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-full px-3 h-8 text-[10px] font-bold text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-white/10 p-0.5 shadow-sm transition-all hover:border-violet-300 h-8">
                            {/* Calendar Icon & Label */}
                            <div className="flex items-center gap-1 pl-2 pr-1 border-r border-neutral-100 dark:border-white/5 text-neutral-400 shrink-0">
                                <FaRegCalendarAlt className="text-violet-500" size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-widest hidden lg:block">기간</span>
                            </div>
                            <div
                                onClick={() => startDateRef.current?.showPicker()}
                                className="relative px-2 py-1 flex items-center justify-center gap-1 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all cursor-pointer rounded-l-full border-r border-neutral-100 dark:border-white/5 whitespace-nowrap"
                            >
                                <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400">
                                    {formatDateDisplay(startDate) || 'START'}
                                </span>
                                <input
                                    ref={startDateRef}
                                    type="date"
                                    value={startDate}
                                    max={today}
                                    onChange={(e) => {
                                        const newStart = e.target.value;
                                        setStartDate(newStart);
                                        if (endDate && newStart > endDate) setEndDate('');
                                    }}
                                    className="absolute -z-50 opacity-0 pointer-events-none w-0 h-0"
                                />
                            </div>
                            <div
                                onClick={() => endDateRef.current?.showPicker()}
                                className="relative px-2 py-1 flex items-center justify-center gap-1 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all cursor-pointer rounded-r-full whitespace-nowrap"
                            >
                                <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400">
                                    {formatDateDisplay(endDate) || 'END'}
                                </span>
                                <input
                                    ref={endDateRef}
                                    type="date"
                                    value={endDate}
                                    min={startDate}
                                    max={today}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="absolute -z-50 opacity-0 pointer-events-none w-0 h-0"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-red-500"
                                >
                                    <FaTimes size={8} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            }
            subtitle="지점별 비교"
            error={error}
            onRetry={() => {
                setError(null);
                setSalesMap({ '전체': initialSales });
            }}
            className={`${className}`}
        >
            <div className="flex flex-col h-full space-y-0 pt-2">

                {/* 1. Shop Pills (Horizontal Scroller) */}
                <div className="flex flex-col gap-1 p-1.5 bg-neutral-50/50 dark:bg-neutral-800/20 rounded-2xl border border-neutral-200/60 dark:border-white/10 mb-2 shadow-sm">

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
                                    .filter(s => s.storeName !== '전체')
                                    .filter(s => s.storeName.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((shop) => (
                                        <button
                                            key={shop.storeId}
                                            onClick={() => handleShopToggle(shop.storeName)}
                                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase transition-all shrink-0 border
                                            ${selectedShops.includes(shop.storeName)
                                                    ? 'bg-violet-600 text-white shadow-md border-transparent'
                                                    : 'bg-white dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/50'}`}
                                        >
                                            {shop.storeName}
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Content Split by Shop (Columns) */}
                <div className="flex-1 min-h-50 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-0 gap-y-4 lg:gap-y-0 h-full items-stretch">

                        {/* Always Display Total First */}
                        <div className="flex flex-col space-y-1 col-span-1 px-3 min-w-0">
                            {/* 지점 헤더 */}
                            <div className="flex items-center gap-3 h-9">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-violet-500/20 dark:border-violet-500/30 bg-violet-50/50 dark:bg-violet-900/20 shadow-sm shrink-0">
                                    <div className="w-1 h-3 bg-violet-500 rounded-full"></div>
                                    <h4 className="text-[14px] font-black text-neutral-900 dark:text-white uppercase tracking-widest truncate">
                                        전체 지점
                                    </h4>
                                </div>
                                {(loadingShops['전체'] || isLoading) && (
                                    <div className="w-3 h-3 rounded-full border-2 border-violet-500 border-t-transparent animate-spin ml-auto shrink-0"></div>
                                )}
                            </div>

                            {(() => {
                                const isLoadingShopData = loadingShops['전체'] || isLoading;
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
                                    <div className={`flex flex-col gap-3.5 mt-2.5 ${isLoadingShopData ? 'opacity-50' : ''} min-w-0`}>
                                        {items.map((item, i) => (
                                            <div key={item.shortName} className="space-y-0.5 group min-w-0">
                                                <div className="flex justify-between items-end gap-2 min-w-0">
                                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                        <span className="text-[15px] italic text-violet-600 font-black shrink-0">0{i + 1}</span>
                                                        <span className="text-[15px] font-black text-black dark:text-white uppercase tracking-tight truncate group-hover:text-violet-500 transition-colors tooltip flex-1" title={item.shortName}>
                                                            {item.shortName}
                                                        </span>
                                                    </div>
                                                    <span className="text-[15px] font-black text-violet-600 tracking-tighter shrink-0">
                                                        {item.quantity.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="h-2.5 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-1000 bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.3)]" style={{ width: `${(item.quantity / maxQ) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );

                                return <div className="text-xs font-bold text-gray-400 py-4 text-center bg-neutral-50 dark:bg-white/5 rounded-xl border border-dashed border-neutral-200 dark:border-white/10">No data.</div>;
                            })()}
                        </div>

                        {/* Selected Compare Shops (Up to 3 Slots) */}
                        {Array.from({ length: 3 }).map((_, slotIdx) => {
                            const shop = selectedShops[slotIdx];

                            // Empty Slot
                            if (!shop) {
                                return (
                                    <div key={`empty-${slotIdx}`} className={`flex flex-col space-y-1 col-span-1 px-3 min-w-0 lg:border-l-2 ${slotIdx % 2 === 0 ? 'md:border-l-2' : ''} border-neutral-300 dark:border-white/30`}>
                                        <div className="flex items-center gap-3 h-9">
                                            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-dashed border-neutral-300 dark:border-white/20 bg-transparent opacity-60 shrink-0">
                                                <div className="w-1.5 h-4 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
                                                <h4 className="text-[14px] font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest truncate">
                                                    비교 지점 선택
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-h-50 flex flex-col items-center justify-center text-center p-6 bg-neutral-50 dark:bg-white/5 rounded-xl border border-dashed border-neutral-200 dark:border-white/10">
                                            <div className="w-10 h-10 mb-3 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                                <span className="text-xl text-neutral-300 dark:text-neutral-600">+</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500">
                                                지점 선택 후 비교
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
                                <div key={shop} className={`flex flex-col space-y-1 col-span-1 fade-in px-3 min-w-0 lg:border-l-2 ${slotIdx % 2 === 0 ? 'md:border-l-2' : ''} border-neutral-300 dark:border-white/30`}>
                                    <div className="flex items-center gap-3 h-9 group/header relative">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-sm max-w-[calc(100%-40px)] shrink-0">
                                            <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                                            <h4 className="text-[14px] font-black text-neutral-900 dark:text-white uppercase tracking-widest truncate">
                                                {shop}
                                            </h4>
                                        </div>
                                        <button
                                            onClick={() => handleShopToggle(shop)}
                                            className="absolute right-0 p-1 rounded-full text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                                            title="선택 해제"
                                        >
                                            <FaTimes size={8} />
                                        </button>
                                        {isLoadingShopData && (
                                            <div className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin ml-auto shrink-0"></div>
                                        )}
                                    </div>

                                    {isLoadingShopData && items.length === 0 ? (
                                        <div className="flex flex-col gap-4">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <div key={v} className="flex flex-col gap-1.5 w-full animate-pulse">
                                                    <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                                                    <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : items.length > 0 ? (
                                        <div className={`flex flex-col gap-3.5 mt-2.5 ${isLoadingShopData ? 'opacity-50' : ''} min-w-0`}>
                                            {items.map((item, i) => (
                                                <div key={item.shortName} className="space-y-0.5 group min-w-0">
                                                    <div className="flex justify-between items-end gap-2 min-w-0">
                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                            <span className="text-[15px] italic text-indigo-600 font-black shrink-0">0{i + 1}</span>
                                                            <span className="text-[15px] font-black text-black dark:text-white uppercase tracking-tight truncate group-hover:text-indigo-500 transition-colors tooltip flex-1" title={item.shortName}>
                                                                {item.shortName}
                                                            </span>
                                                        </div>
                                                        <span className="text-[15px] font-black text-indigo-600 tracking-tighter shrink-0">
                                                            {item.quantity.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-indigo-50 dark:bg-white/5 rounded-full overflow-hidden">
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
