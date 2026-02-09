'use client';

import React, { useState } from 'react';
import { FaArrowRotateLeft, FaCheck, FaFingerprint } from 'react-icons/fa6';
// import { getCategorySamples, searchArchive } from '../../../services/apiService';
import Image from 'next/image';

interface DiscoveryPanelProps {
  onResultFound: (results: any[] | null, category?: string) => void;
  onAnalysisStart: (imgUrl: string, name?: string) => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}

/**
 * [DiscoveryPanel]
 * 카테고리 기반 탐색 패널입니다.
 * 애니메이션 플러그인 의존성을 제거하고 v4 표준 클래스로 재구성했습니다.
 */
export default function DiscoveryPanel({ onResultFound, onAnalysisStart, startTransition }: DiscoveryPanelProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const categories = ['Outerwear', 'Tops', 'Bottoms', 'Accessories'];

  const handleReset = () => {
    setSelectedCat(null);
    setSamples([]);
    setSelectedSampleId(null);
    onResultFound(null);
  };

  const selectCategory = async (cat: string) => {
    if (selectedCat === cat) return;

    setSelectedCat(cat);
    setSelectedSampleId(null);
    onResultFound(null);

    setIsFetching(true);
    // try {
    //   const data = await getCategorySamples(cat);
    //   setSamples(data);
    // } catch (e) {
    //   console.error("샘플 로드 실패:", e);
    // } finally {
    //   setIsFetching(false);
    // }
  };

  const selectSample = (sample: any) => {
    setSelectedSampleId(sample.id);
    onAnalysisStart(sample.img, sample.name);
    startTransition(async () => {
      //   try {
      //     const results = await searchArchive({ 
      //       mode: 'recommendation', 
      //       referenceId: sample.id, 
      //       category: selectedCat 
      //     });
      //     onResultFound(results, selectedCat || undefined);
      //   } catch (e) {
      //     console.error("검색 실패:", e);
      //   }
    });
  };

  return (
    <div className="space-y-12">
      {/* 1. 카테고리 셀렉터: 중복 제거 및 v4 표준 버튼 스타일 */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => selectCategory(cat)}
            className={`px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors outline-none ${selectedCat === cat
              ? 'bg-violet-600 text-white border-violet-600 shadow-md'
              : 'bg-transparent text-neutral-400 border-neutral-300 dark:border-white/10 hover:border-violet-400 hover:text-violet-600'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. 메인 콘텐츠 영역 */}
      {selectedCat || isFetching ? (
        <div className="space-y-6 pt-6 border-t border-neutral-200 dark:border-white/5">
          <div className="flex items-center justify-between pb-4">
            <span className="text-[9px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest">
              Reference: <span className="italic font-serif normal-case text-xs text-violet-500">{selectedCat}</span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-neutral-300 dark:text-neutral-700 hover:text-violet-600 transition-colors"
            >
              <FaArrowRotateLeft size={12} />
            </button>
          </div>

          {isFetching ? (
            <div className="flex justify-center py-24">
              {/* 표준 animate-pulse 사용 */}
              <div className="w-12 h-px bg-violet-600 animate-pulse"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {samples.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => selectSample(sample)}
                  className={`group relative aspect-3/4 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${selectedSampleId === sample.id ? 'border-violet-600' : 'border-transparent hover:border-violet-200'
                    }`}
                >
                  <Image
                    src={sample.img}
                    alt={sample.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {selectedSampleId === sample.id && (
                    <div className="absolute inset-0 bg-violet-600/40 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-violet-600 shadow-xl">
                        <FaCheck size={14} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* [대기 상태 UI] */

        <div className="py-24 flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-white/5 rounded-4xl bg-white dark:bg-neutral-900/50">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-neutral-900/50 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-6 border border-neutral-100 dark:border-white/10">
            <FaFingerprint size={30} className="animate-pulse" />
          </div>
          <p className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest text-center leading-relaxed">
            Select a category above <br /> to initialize neural reference indexing
          </p>
        </div>
      )}
    </div>
  );
}