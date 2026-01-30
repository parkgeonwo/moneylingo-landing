import Image from 'next/image';

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Feature 1: 실시간 피드백 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-32">
          <div className="flex-1 order-2 lg:order-1">
            <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              뼈 때리는 실시간 피드백
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              &ldquo;돈 많습니까?
              <br />
              정신 차립니다.&rdquo;
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              소비를 입력하면, 지갑교관이 등판합니다.
              <br /><br />
              이번 달 예산과 현재 시간을 기준으로
              <br />
              <span className="font-bold text-emerald-600">칭찬</span>하거나 <span className="font-bold text-red-500">호되게 혼냅니다.</span>
            </p>
          </div>
          <div className="flex-1 order-1 lg:order-2">
            <div className="relative max-w-md mx-auto">
              <Image
                src="/images/feedback.jpeg"
                alt="실시간 피드백 화면"
                width={500}
                height={600}
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Feature 2: 남은 돈 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-32">
          <div className="flex-1">
            <div className="relative max-w-md mx-auto">
              <Image
                src="/images/budget.png"
                alt="예산 화면"
                width={500}
                height={600}
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
          <div className="flex-1">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              눈에 보이는 남은 돈
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              &ldquo;450,000원
              <br />
              남았습니다.&rdquo;
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              복잡한 계산은 교관이 합니다.
              <br /><br />
              <span className="font-bold text-gray-900">필수 소비</span>를 뺀
              <br />
              <span className="font-bold text-emerald-600">진짜 쓸 수 있는 돈</span>만 보여줍니다.
            </p>
          </div>
        </div>

        {/* Feature 3: 기록의 불꽃 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-32">
          <div className="flex-1 order-2 lg:order-1">
            <span className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              꺼지지 않는 기록의 불꽃
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              &ldquo;오늘도 기록하셨군요!
              <br />
              123일째입니다.&rdquo;
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              기록하면 훈련 일수가 쌓이고
              <br />
              불꽃이 타오릅니다.
              <br /><br />
              기록을 멈추면
              <br />
              <span className="font-bold text-red-500">교관의 잔소리 폭격</span>을 받게 됩니다.
            </p>
          </div>
          <div className="flex-1 order-1 lg:order-2">
            <div className="relative max-w-sm mx-auto">
              <Image
                src="/images/streak.png"
                alt="기록 스트릭 화면"
                width={400}
                height={700}
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Feature 4: 캐릭터 소개 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-3xl p-8 lg:p-16">
          <div className="flex-1">
            <div className="relative max-w-sm mx-auto">
              <Image
                src="/images/character.png"
                alt="백억만 지갑교관"
                width={400}
                height={500}
                className="rounded-2xl"
              />
            </div>
          </div>
          <div className="flex-1">
            <span className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              백억만 | 지갑교관
            </span>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">이름</h3>
                <p className="text-gray-600">백억만 (지갑교관)</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">성격</h3>
                <p className="text-gray-600">
                  까칠하지만
                  <br />
                  당신의 통장을 누구보다 걱정함.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">특징</h3>
                <p className="text-gray-600">
                  잘하면 <span className="text-amber-500 font-bold">황금알</span>을 주지만,
                  <br />
                  과소비하면 <span className="text-red-500 font-bold">불호령</span>이 떨어짐.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
