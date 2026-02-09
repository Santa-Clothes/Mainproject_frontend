'use client';

import React, { useState, useRef } from 'react';
import { FaCloudArrowUp, FaXmark, FaMagnifyingGlass } from 'react-icons/fa6';
import Image from 'next/image';

interface UploadPanelProps {
  onResultFound: (results: any[] | null) => void;
  onAnalysisStart: (imgUrl: string, name?: string) => void;
  onAnalysisCancel: () => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}

export default function UploadPanel({ onResultFound, onAnalysisStart, onAnalysisCancel, isPending, startTransition }: UploadPanelProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onAnalysisStart(result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    onAnalysisCancel();
    // 검색 결과도 같이 초기화를 원할 경우
    onResultFound(null);
  };

  const handleSearch = () => {
    if (!preview) return;

    startTransition(async () => {
      // Mock result finding for demonstration
      setTimeout(() => {
        onResultFound([]); // trigger empty results to show grid
      }, 2000);
    });
  };

  return (
    <div className="space-y-10">
      <div className="max-w-2xl mx-auto">
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group aspect-video border-2 border-dashed border-neutral-200 dark:border-white/5 rounded-4xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-900/50 flex items-center justify-center text-gray-400 group-hover:text-violet-600 transition-colors">
              <FaCloudArrowUp size={24} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Upload reference for indexing
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="relative aspect-video rounded-4xl overflow-hidden border border-neutral-200 dark:border-white/5 bg-white dark:bg-neutral-900/50">
            <Image
              src={preview}
              alt="Target"
              fill
              className="object-contain p-4"
              unoptimized
            />
            <button
              onClick={handleCancel}
              className="absolute top-6 right-6 w-10 h-10 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
            >
              <FaXmark size={14} />
            </button>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleSearch}
            disabled={!preview || isPending}
            className="w-full py-5 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full disabled:opacity-30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg"
          >
            {isPending ? (
              <span className="animate-pulse">Processing DNA...</span>
            ) : (
              <>
                <FaMagnifyingGlass size={12} />
                <span>Scan Reference</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}