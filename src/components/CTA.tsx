import Image from 'next/image';
import StoreButtons from './StoreButtons';

export default function CTA() {
  return (
    <section id="download" className="py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Mascot */}
        <div className="mb-8">
          <Image
            src="/images/mascot.png"
            alt="지갑교관 백억만"
            width={200}
            height={200}
            className="mx-auto"
          />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          훈련병, 지금 바로 시작한다!
        </h2>

        <p className="text-xl text-gray-300 mb-4 font-medium">
          지갑을 지키는 가장 확실한 방법.
        </p>

        <p className="text-lg text-gray-400 mb-10">
          망설이는 순간 통장은 <span className="text-red-400 font-bold">텅장</span>이 됩니다.
        </p>

        <div className="mb-8">
          <StoreButtons />
        </div>

        <p className="text-gray-500 text-sm">
          완전 무료
        </p>
      </div>
    </section>
  );
}
