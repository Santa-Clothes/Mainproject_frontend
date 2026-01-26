import Link from 'next/link';
import React from 'react';


export default function MainLayout({ children }: {children: React.ReactNode}) {
    return (
        <nav className='w-full flex gap-5'>
            <aside className='w-64 h-screen bg-[#2c2f36] text-white flex flex-col fixed left-0 top-0 overflow-y-auto'>
                <ul className='text-white'>
                    <li><Link href="main/imageinput">이미지 업로드 검색</Link></li>
                    <li><Link href="main/featureselect">특징 선택 검색</Link></li>
                    <li></li>
                </ul>
            </aside>
            <main className='ml-64 p-8'>
                {children}
            </main>
        </nav>
    );
}