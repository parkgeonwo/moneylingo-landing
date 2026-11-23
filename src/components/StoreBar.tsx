import StoreButtons from './StoreButtons';

/** 화면 하단에 항상 떠 있는 다운로드 바 (가로 2개 버튼) */
export default function StoreBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-md px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <StoreButtons variant="compact" />
      </div>
    </div>
  );
}
