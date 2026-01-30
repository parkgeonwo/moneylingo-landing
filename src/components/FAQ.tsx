'use client';

import { useState } from 'react';

const faqs = [
  {
    question: '필수 소비는 뭔가요?',
    answer: '월세, 통신비 등 숨만 쉬어도 나가는 고정 지출입니다. 이를 제외해야 진짜 용돈 관리가 됩니다.',
  },
  {
    question: '예산을 변경할 수 있나요?',
    answer: '네. 지정한 예산은 한 달간 유지되고, 변경한 예산은 다음 달 1일부터 적용됩니다.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-4xl mb-4 block">✉️</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            자주 묻는 질문 (FAQ)
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-emerald-300 shadow-sm"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-gray-900 pr-4 text-lg">
                  Q. {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed text-lg">
                  <span className="font-medium text-emerald-600">A.</span> {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
