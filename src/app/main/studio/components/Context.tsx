
'use client';
import React, { createContext, useContext, useState } from 'react';

const StudioContext = createContext<any>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
    const [results, setResults] = useState<any[] | null>(null);
    const [analysisData, setAnalysisData] = useState({ img: null, name: null });

    return (
        <StudioContext.Provider value={{ results, setResults, analysisData, setAnalysisData }}>
            {children}
        </StudioContext.Provider>
    );
}

export const useStudio = () => useContext(StudioContext);