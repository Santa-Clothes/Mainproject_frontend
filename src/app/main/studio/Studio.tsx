"use client"
import { Suspense, useState, useTransition } from 'react';

import ImageAnalyzer from './ImageAnalyzer';
import ResultGrid from '../../../components/ResultGrid';
import { FaCamera, FaSliders, FaArrowRotateLeft } from 'react-icons/fa6';

interface StudioClientProps {
    serverAction: (data: any) => Promise<any[] | null>;
}

export default function Studio({ serverAction }: StudioClientProps) {
    const [mode, setMode] = useState<'visual' | 'manual'>('visual');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<any[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const filterGroups = [
    { title: 'Silhouette', items: ['Oversized', 'Structured', 'Fluid', 'Draped'] },
    { title: 'Material', items: ['Silk', 'Cashmere', 'Denim', 'Wool'] },
    { title: 'Aesthetic', items: ['Avant-Garde', 'Street', 'Classic', 'Neo-Vintage'] }
  ];

  const handleVisualAction = async (data: any) => {
    setAiAnalysis(data);
    startTransition(async () => {
      try {
        // [Spring Boot Placeholder] 
        // const response = await fetch('/api/v1/search/visual', { method: 'POST', body: JSON.stringify(data) });
        const res = await serverAction(data);
        console.log("StudioPage", res);
        
        setResults(res || []); 
      } catch (e) {
        console.error("Visual Sync Error:", e);
      }
    });
  };

  const handleManualApply = async () => {
    startTransition(async () => {
      try {
        // [Spring Boot Placeholder]
        // const response = await fetch('/api/v1/search/curation', { method: 'POST', body: JSON.stringify(selectedFilters) });
        const res = await serverAction({ mode: 'manual' });
        setResults(res || []);
      } catch (e) {
        console.error("Manual Sync Error:", e);
      }
    });
  };

  const resetAll = () => {
    setResults(null);
    setAiAnalysis(null);
  };

  //0129
  const tempCallImgs = async () => {
    try {
      
    } catch (error) {
      console.error("error:", error);
    }
  }

  return (
    <div className="space-y-12">
      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-full border border-black/5 shadow-sm flex gap-1">
          <button 
            onClick={() => setMode('visual')}
            className={`flex items-center gap-3 px-10 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'visual' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
          >
            <FaCamera size={12} /> Visual DNA
          </button>
          <button 
            onClick={() => setMode('manual')}
            className={`flex items-center gap-3 px-10 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'manual' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
          >
            <FaSliders size={12} /> Curation
          </button>
        </div>
      </div>

      {/* Fixed Outer Frame (Stable Shell) */}
      <div className="bg-white rounded-[4rem] border border-[#EBEAE7] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.04)] overflow-hidden min-h-[600px] flex flex-col justify-center">
        <div className="relative h-full">
          {mode === 'visual' ? (
            <div key="visual">
              <ImageAnalyzer    
                onAction={handleVisualAction} 
                onReset={resetAll} 
                isExternalLoading={isPending} 
              />
            </div>
          ) : (
            <div key="manual" className="p-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
               {filterGroups.map(group => (
                  <div key={group.title} className="space-y-10">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-gray-300 border-b border-gray-50 pb-5">{group.title}</h4>
                    <div className="flex flex-col gap-6">
                      {group.items.map(item => (
                        <label key={item} className="flex items-center justify-between group cursor-pointer">
                          <span className="text-sm font-light text-gray-400 group-hover:text-black transition-colors">{item}</span>
                          <input type="checkbox" className="w-5 h-5 rounded-full border-gray-100 checked:bg-black transition-all appearance-none border checked:border-black cursor-pointer" />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="col-span-full pt-12 flex gap-4">
                  <button onClick={handleManualApply} className="flex-1 py-6 bg-black text-white text-[10px] font-bold uppercase tracking-[0.6em] rounded-full hover:bg-gray-800 transition-all shadow-xl">
                    {isPending ? 'Syncing Archive...' : 'Apply intelligence'}
                  </button>
                  <button onClick={resetAll} className="px-12 py-6 border border-gray-100 text-gray-300 rounded-full hover:bg-gray-50 transition-all">
                    <FaArrowRotateLeft size={14} />
                  </button>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <Suspense fallback={<div className="py-20 text-center animate-pulse text-[10px] uppercase tracking-[0.5em] text-gray-300">Consulting Archive...</div>}>
        <ResultGrid 
          isActive={results !== null && !isPending} 
          title={aiAnalysis ? `Matches for ${aiAnalysis.category}` : "Archive Discovery"}
          subtitle={mode === 'visual' ? "Neural Cross-Reference" : "Metadata Match"}
        />
      </Suspense>
    </div>
  );
}