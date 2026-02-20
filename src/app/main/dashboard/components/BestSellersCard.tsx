'use client';

import React from 'react';
import DashboardCard from './DashboardCard';
import { SalesRankItem } from '@/app/api/salesservice/salesapi';

interface Props {
    initialSales: SalesRankItem[];
    fetchSalesFn: (shop: string, startDate: string, endDate: string) => Promise<SalesRankItem[]>;
    className?: string;
}

const shopList = [
    '전체',
    'HP김포풍무점',
    'HP서울방학점',
    'HP서울시흥점',
    'HP센텀시티점',
    '대구반야월점',
    '대구태전점',
    '부산구서점(직)',
    '부산당감점',
    '부산두실점(직)',
    '부산만덕점(직)',
    '부산모라점(직)',
    '부산연지점(직)',
    '부산하단점',
    '서울목동점(행복한백화점)',
    '씨엔에스컴퍼니',
    '양산웅상점',
    '온라인',
    '일산주엽점(그랜드백화점)',
    '제주일도점'
];


/**
 * BestSellersCard: 가장 많이 팔린 상품들을 시각화하는 카드 컴포넌트입니다.
 * 왼쪽에는 Recharts BarChart를, 오른쪽에는 상세 상품 리스트를 표시합니다.
 */
const BestSellersCard: React.FC<Props> = ({ initialSales, fetchSalesFn, className = "" }) => {
    const [sales, setSales] = React.useState<SalesRankItem[]>(initialSales);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    /**
     * 상품명 가공 함수: 하이픈(-)으로 연결된 이름 중 브랜드명 등을 제외한 실제 상품명만 추출합니다.
     */
    const formatProductName = (name: string) => {
        if (!name) return 'Unknown Product';
        const parts = name.split('-');
        return (parts[parts.length - 1] || name).trim();
    };

    /**
     * 동일한 가공 명칭을 가진 상품들을 하나로 묶어 판매량을 합산합니다.
     */
    const aggregatedData = React.useMemo(() => {
        if (!sales || sales.length === 0) return [];

        const map = new Map<string, { shortName: string; quantity: number }>();

        sales.forEach(s => {
            const short = formatProductName(s.productName);
            const existing = map.get(short);
            if (existing) {
                existing.quantity += s.saleQuantity;
            } else {
                map.set(short, { shortName: short, quantity: s.saleQuantity });
            }
        });

        return Array.from(map.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }, [sales]);

    // 필터 상태 관리 (지점, 시작일, 종료일)
    // 기본값: '전체' 지점, 날짜는 비워두어 전체 기간 검색 유도 (또는 기본값 할당)
    const [selectedShop, setSelectedShop] = React.useState('전체');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    // 필터 값이 바뀔 때마다 외부에서 주입받은 API 조회 함수 실행
    React.useEffect(() => {
        const loadFilteredData = async () => {
            // 날짜가 둘 다 입력되었거나, 아예 선택을 안 한 경우에만 실행 (선택 중 에러 방지)
            if ((startDate && !endDate) || (!startDate && endDate)) return;

            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchSalesFn(
                    selectedShop === '전체' ? '' : selectedShop,
                    startDate,
                    endDate
                );
                setSales(result);
            } catch (err) {
                console.error("Filter fetch failed:", err);
                setError("Data loading failed.");
            } finally {
                setIsLoading(false);
            }
        };

        // 초기 로드가 아닌 경우에만 트리거되도록 딜레이나 조건 추가 가능하지만 즉시 실행
        // (주의: 최초 렌더링 시에도 initialSales가 있지만 useEffect가 돌아서 한번 더 fetch될 수 있음)
        loadFilteredData();
    }, [selectedShop, startDate, endDate, fetchSalesFn]);

    // 날짜 표시 형식 가공 (예: 2024-02-19 -> 02.19)
    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split('-');
        return `${parts[1]}.${parts[2]}`;
    };

    // 레퍼런스 추가 (showPicker 호출용)
    const startDateRef = React.useRef<HTMLInputElement>(null);
    const endDateRef = React.useRef<HTMLInputElement>(null);

    return (
        <DashboardCard
            title="Best Sellers"
            subtitle="9oz Sales"
            isLoading={isLoading}
            error={error}
            onRetry={() => {
                setError(null);
                setSales(initialSales); // 에러시 재시도 로직 (초기화)
            }}
            lgColSpan={1}
            className={`${className} min-h-72`}
            topRight={
                <div className="flex items-center gap-2">
                    {/* Shop Select: Expanded next to subtitle */}
                    <div className="relative group/pill flex-1 max-w-[200px]">
                        <select
                            value={selectedShop}
                            onChange={(e) => setSelectedShop(e.target.value)}
                            className="appearance-none w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-full px-4 py-2 pr-9 text-xs font-bold text-neutral-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/10 cursor-pointer hover:bg-white dark:hover:bg-neutral-800 transition-all shadow-sm truncate"
                        >
                            <option value="전체">모든 지점</option>
                            {shopList.filter(s => s !== '전체').map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/pill:text-violet-500 transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-full space-y-6">
                {/* Compact Period Filter Bar */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Start Date */}
                    <div
                        onClick={() => startDateRef.current?.showPicker()}
                        className="relative bg-white dark:bg-neutral-900 rounded-xl px-4 py-2.5 border border-neutral-200 dark:border-white/5 flex items-center gap-2.5 hover:border-violet-300 dark:hover:border-violet-600 transition-all group/date cursor-pointer"
                    >
                        <div className="text-violet-500 z-0">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h352V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"></path></svg>
                        </div>
                        <span className="text-xs font-bold text-neutral-800 dark:text-gray-300 uppercase tracking-tighter z-0">
                            {formatDateDisplay(startDate) || 'From'}
                        </span>
                        <input
                            ref={startDateRef}
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="absolute -z-50 opacity-0 pointer-events-none"
                        />
                    </div>

                    {/* End Date */}
                    <div
                        onClick={() => endDateRef.current?.showPicker()}
                        className="relative bg-white dark:bg-neutral-900 rounded-xl px-4 py-2.5 border border-neutral-200 dark:border-white/5 flex items-center gap-2.5 hover:border-violet-300 dark:hover:border-violet-600 transition-all group/date cursor-pointer"
                    >
                        <div className="text-violet-500 z-0">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h352V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"></path></svg>
                        </div>
                        <span className="text-xs font-bold text-neutral-800 dark:text-gray-300 uppercase tracking-tighter z-0">
                            {formatDateDisplay(endDate) || 'To'}
                        </span>
                        <input
                            ref={endDateRef}
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="absolute -z-50 opacity-0 pointer-events-none"
                        />
                    </div>
                </div>

                {/* Best Sellers Rankings List */}
                <div className="space-y-4 flex-1">
                    {aggregatedData.map((item, i) => (
                        <div key={item.shortName} className="space-y-2 group">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] italic text-violet-600 font-bold">0{i + 1}</span>
                                    <span className="text-[11px] font-bold text-black dark:text-white uppercase tracking-tight truncate max-w-28 group-hover:text-violet-500 transition-colors">
                                        {item.shortName}
                                    </span>
                                </div>
                                <span className="text-[12px] font-black text-violet-600 tracking-tighter">
                                    {item.quantity.toLocaleString()}
                                </span>
                            </div>
                            {/* Horizontal Chart Bar */}
                            <div className="h-1.5 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                                    style={{ width: `${(item.quantity / (aggregatedData[0]?.quantity || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardCard>
    );
};

export default BestSellersCard;
