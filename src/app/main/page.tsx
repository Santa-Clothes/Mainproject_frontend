import React from 'react';

export default function MainPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">메인 페이지</h1>
      <p className="mt-4">이 영역에 페이지의 실제 내용이 표시됩니다.</p>
      <p>사이드바는 layout.tsx에서 이미 처리되었으므로, page.tsx에는 컨텐츠만 작성하면 됩니다.</p>
    </div>
  );
}