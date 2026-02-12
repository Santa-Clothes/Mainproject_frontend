import React from 'react';
import { FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';
import Image from 'next/image';
import Wizard from '@/assets/wizard.svg';

/**
 * [IntroPage]
 * 서버 컴포넌트로 전환하여 하이드레이션 깜빡임을 원천 차단합니다.
 * 브라우저는 서버로부터 이미지가 투명도 50%로 설정된 완성된 HTML을 받습니다.
 */
export default function IntroPage() {
  return (
    /* 인트로 페이지는 항상 다크 테마이므로, 본문 배경색에 관계없이 검은색으로 강제 고정하여 깜빡임을 방지합니다. */
    <main
      style={{ backgroundColor: 'black' }}
      suppressHydrationWarning
      className="relative h-screen w-full overflow-hidden text-white selection:bg-violet-500 selection:text-white antialiased"
    >

      {/* 1. 배경 이미지: React 상태를 타지 않고 이미지가 준비되는 즉시 브라우저가 그리도록 합니다. */}
      {/* priority 옵션이 있으므로 브라우저는 최우선 순위로 로딩을 시작합니다. */}
      <div className="absolute inset-0 bg-black overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion Hero Background"
          fill
          sizes="100vw"
          priority
          placeholder="blur"
          /* 중립적인 어두운 색상의 플레이스홀더를 사용하여 파란색 톤 왜곡을 방지합니다. */
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          className="object-cover opacity-50"
        />
        {/* 투명 오버레이를 추가하여 플레이스홀더에서 고해상도 이미지로의 전환을 부드럽게 합니다. */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* 2. 시그니처 보라색 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-950/40 via-transparent to-black/80" />
      <div className="absolute inset-0 bg-black/40" />

      {/* 3. 콘텐츠 레이어 */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-10 py-12">

        {/* Header 영역 */}
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-white/10 pb-6 opacity-80">
          {/* <div className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Issue No. 001</div>
          <h1 className="font-sans text-xl font-black tracking-[0.5em] text-white transition-opacity hover:opacity-80">
            <Image src={Wizard} alt="Logo" width={50} height={50} /></h1>
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">2026 Archive</div> */}
        </header>

        {/* Hero Section: 고정된 다크 스타일 타이포그래피 */}
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* <div className="mb-8 inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-violet-300 subpixel-antialiased">New Protocol Ready</span>
          </div> */}

          {/* 하이엔드 텍스트 그라데이션 수정: px-16 및 tracking-normal로 글자 잘림을 완벽히 방지 */}
          <h2 className="mb-10 bg-linear-to-b from-white to-violet-200 bg-clip-text font-serif text-[10vw] leading-none italic tracking-normal text-transparent md:text-[8vw] px-20 block">
            Wizard <br /> of <br /> Ounce
          </h2>

          <p className="mx-auto max-w-md text-sm font-light uppercase leading-relaxed tracking-widest text-neutral-400">
            A high-fidelity visual archive for the modern curator. <br />
            Analyze, filter, and discover the DNA of fashion.
          </p>

          {/* Access 버튼: 고정 화이트 스타일 */}
          <Link
            href="/main"
            className="group mt-16 bg-white px-16 py-6 text-black transition-all duration-500 hover:bg-violet-600 hover:text-white shadow-2xl shadow-violet-500/20 active:scale-95"
          >
            <span className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.5em]">
              Access the Archive
              <FaArrowRight className="transition-transform group-hover:translate-x-2" />
            </span>
          </Link>
        </div>

        {/* Footer 영역 */}
        <footer className="mx-auto flex w-full max-w-7xl items-end justify-between opacity-30">
          <div className="text-[8px] font-bold uppercase tracking-[0.4em]">© 2026 Wizard of Ounce</div>
        </footer>
      </div>
    </main>
  );
}