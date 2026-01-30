import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: '개인정보 처리방침 - 지갑교관',
  description: '지갑교관 개인정보 처리방침',
};

export default function PrivacyPage() {
  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="지갑교관 로고"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-xl text-gray-900">지갑교관</span>
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              홈으로
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16 bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray prose-lg max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            지갑교관 개인정보 처리방침
          </h1>

          <p className="text-lg text-gray-700 mb-8">
            <strong>시행일: 2025년 12월 10일</strong>
          </p>

          <p className="text-gray-600 mb-8">
            지갑교관(이하 &quot;회사&quot;)은 「개인정보 보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">1. 수집하는 개인정보 항목</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">필수 수집 항목</h3>

          <p className="font-semibold text-gray-800 mb-2">소셜 로그인 정보</p>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>Apple 로그인: Apple 계정 식별자, 이메일(사용자 선택에 따라 실제 이메일 또는 Private Relay 주소)</li>
            <li>카카오 로그인: 카카오 계정 식별자, 이메일, 프로필 정보</li>
          </ul>

          <p className="font-semibold text-gray-800 mb-2">서비스 이용 정보</p>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>닉네임, 월 예산 설정 금액</li>
          </ul>

          <p className="font-semibold text-gray-800 mb-2">자동 수집 정보</p>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>기기 정보(OS 버전, 기기 모델명), 광고 ID(ADID/IDFA), 앱 버전, 접속 로그, 서비스 이용 기록</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">선택 수집 항목</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>마케팅 수신 동의 시: 이메일 주소, 푸시 토큰</li>
          </ul>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">2. 개인정보의 수집 및 이용 목적</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">서비스 제공 및 운영</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>회원 가입 및 본인 확인</li>
            <li>지출 기록 및 예산 관리 서비스 제공</li>
            <li>코칭 피드백 서비스 제공</li>
            <li>서비스 이용 내역 조회</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">회원 관리</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>회원제 서비스 이용에 따른 본인 확인</li>
            <li>불량 회원의 부정 이용 방지</li>
            <li>가입 의사 확인 및 가입 제한</li>
            <li>고지사항 전달 및 민원 처리</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">서비스 개선 및 통계 분석</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>서비스 이용 통계 및 분석</li>
            <li>신규 서비스 개발 및 기존 서비스 개선</li>
            <li>접속 빈도 파악 및 서비스 품질 향상</li>
          </ul>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3. 개인정보의 보유 및 이용 기간</h2>

          <p className="text-gray-600 mb-4">
            회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.
          </p>
          <p className="text-gray-600 mb-6">
            단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left font-semibold">보존 근거</th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-semibold">보존 항목</th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-semibold">보존 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">전자상거래법</td>
                  <td className="border border-gray-200 px-4 py-2">계약 또는 청약철회 등에 관한 기록</td>
                  <td className="border border-gray-200 px-4 py-2">5년</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">전자상거래법</td>
                  <td className="border border-gray-200 px-4 py-2">대금결제 및 재화 등의 공급에 관한 기록</td>
                  <td className="border border-gray-200 px-4 py-2">5년</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">전자상거래법</td>
                  <td className="border border-gray-200 px-4 py-2">소비자의 불만 또는 분쟁처리에 관한 기록</td>
                  <td className="border border-gray-200 px-4 py-2">3년</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">통신비밀보호법</td>
                  <td className="border border-gray-200 px-4 py-2">서비스 이용 관련 기록</td>
                  <td className="border border-gray-200 px-4 py-2">3개월</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">4. 개인정보의 제3자 제공</h2>

          <p className="text-gray-600 mb-6">
            회사는 「개인정보 보호법」 제17조에 따라 이용자의 개인정보를 제3자에게 제공합니다.
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left font-semibold">제공받는 자</th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-semibold">제공 항목</th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-semibold">제공 목적</th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-semibold">보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Google LLC</td>
                  <td className="border border-gray-200 px-4 py-2">광고 식별자(ADID/IDFA), 기기 정보</td>
                  <td className="border border-gray-200 px-4 py-2">맞춤형 광고 제공 및 광고 효과 측정</td>
                  <td className="border border-gray-200 px-4 py-2">회원 탈퇴 시까지</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Apple Inc.</td>
                  <td className="border border-gray-200 px-4 py-2">Apple 계정 식별자, 이메일</td>
                  <td className="border border-gray-200 px-4 py-2">Apple 계정 기반 로그인 서비스 제공</td>
                  <td className="border border-gray-200 px-4 py-2">회원 탈퇴 시까지</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Kakao Corp.</td>
                  <td className="border border-gray-200 px-4 py-2">카카오 계정 식별자, 이메일, 프로필 정보</td>
                  <td className="border border-gray-200 px-4 py-2">카카오 계정 기반 로그인 서비스, 마케팅 메시지 발송</td>
                  <td className="border border-gray-200 px-4 py-2">회원 탈퇴 시까지</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">5. 개인정보 처리 위탁</h2>

          <p className="text-gray-600 mb-6">
            회사는 서비스 운영을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left font-semibold">수탁업체</th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-semibold">위탁 업무 내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Supabase Inc.</td>
                  <td className="border border-gray-200 px-4 py-2">데이터 저장 및 인증</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Mixpanel Inc.</td>
                  <td className="border border-gray-200 px-4 py-2">서비스 이용 분석</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Google LLC</td>
                  <td className="border border-gray-200 px-4 py-2">앱 분석, 광고 서비스</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-gray-600 mb-8">
            위탁 업무의 내용이나 수탁자가 변경되는 경우 지체없이 본 개인정보 처리방침을 통하여 공개하겠습니다.
          </p>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">6. 마케팅 정보 수신</h2>

          <p className="text-gray-600 mb-6">
            회사는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제50조에 따라 이용자의 사전 동의를 받고 마케팅 정보를 발송합니다.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">마케팅 정보 수신 목적</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>신규 서비스 및 기능 안내</li>
            <li>이벤트, 프로모션, 혜택 정보 제공</li>
            <li>맞춤형 서비스 및 광고 제공</li>
            <li>서비스 관련 설문조사 및 의견 수렴</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">마케팅 정보 발송 방법</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>앱 푸시 알림: 이벤트, 혜택, 서비스 안내</li>
            <li>이메일: 뉴스레터, 이벤트 정보</li>
            <li>카카오 알림톡: 프로모션, 혜택 안내</li>
            <li>인앱 메시지: 맞춤형 혜택, 추천 정보</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">동의 철회 방법</h3>
          <p className="text-gray-600 mb-4">
            마케팅 정보 수신 동의는 언제든지 철회할 수 있습니다.
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>앱 설정 &gt; 알림 설정에서 수신 여부 변경</li>
            <li>마이페이지 &gt; 마케팅 정보 수신 동의 관리</li>
            <li>이메일 하단의 &apos;수신거부&apos; 링크 클릭</li>
          </ul>

          <p className="text-gray-700 font-semibold mb-8">
            본 동의는 선택 사항이며, 동의하지 않아도 서비스 이용에 제한이 없습니다.
          </p>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">7. 광고 및 분석 서비스</h2>

          <p className="text-gray-600 mb-6">
            회사는 서비스 개선 및 맞춤형 광고 제공을 위해 아래 서비스를 이용합니다.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Google AdMob</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>목적: 맞춤형 광고 제공</li>
            <li>수집 정보: 광고 식별자(ADID/IDFA), 앱 사용 정보</li>
            <li>광고 개인화 거부: 앱 설정 &gt; 알림 설정에서 변경 가능</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Mixpanel</h3>
          <ul className="list-disc pl-6 mb-8 text-gray-600">
            <li>목적: 서비스 이용 분석 및 개선</li>
            <li>수집 정보: 앱 이용 로그, 기기 정보 (익명화 처리)</li>
          </ul>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">8. 이용자의 권리와 행사 방법</h2>

          <p className="text-gray-600 mb-4">
            이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600">
            <li>개인정보 열람 요청</li>
            <li>개인정보 정정 요청</li>
            <li>개인정보 삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">권리 행사 방법</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>앱 내 마이페이지에서 직접 처리</li>
            <li>개인정보 보호책임자에게 이메일로 요청</li>
          </ul>

          <p className="text-gray-600 mb-6">
            회사는 이용자의 요청에 대해 지체 없이 조치하겠습니다.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">회원 탈퇴(계정 삭제)</h3>
          <p className="text-gray-600 mb-4">
            이용자는 언제든지 회원 탈퇴를 통해 계정과 관련 데이터를 삭제할 수 있습니다.
          </p>

          <p className="font-semibold text-gray-800 mb-2">탈퇴 방법</p>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>앱 내 마이페이지 &gt; 회원 탈퇴</li>
          </ul>

          <p className="font-semibold text-gray-800 mb-2">삭제되는 정보</p>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>계정 정보 (닉네임, 이메일, 소셜 로그인 연동 정보)</li>
            <li>지출 기록 및 예산 설정 정보</li>
            <li>서비스 이용 기록</li>
          </ul>

          <p className="font-semibold text-gray-800 mb-2">처리 기간</p>
          <ul className="list-disc pl-6 mb-4 text-gray-600">
            <li>탈퇴 요청 즉시 처리되며, 관련 데이터는 지체 없이 파기됩니다.</li>
            <li>단, 관련 법령에 따라 보존이 필요한 정보는 3항의 보존 기간 동안 보관 후 파기합니다.</li>
          </ul>

          <p className="font-semibold text-gray-800 mb-2">기타 문의</p>
          <ul className="list-disc pl-6 mb-8 text-gray-600">
            <li>앱 이용이 어려운 경우 ceo@82studio.xyz로 탈퇴를 요청할 수 있습니다.</li>
          </ul>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">9. 개인정보의 파기</h2>

          <p className="text-gray-600 mb-6">
            회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">파기 방법</h3>
          <ul className="list-disc pl-6 mb-8 text-gray-600">
            <li>전자적 파일: 복구 및 재생되지 않도록 안전하게 삭제</li>
            <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
          </ul>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">10. 개인정보 보호책임자</h2>

          <p className="text-gray-600 mb-6">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="font-semibold text-gray-800 mb-2">개인정보 보호책임자</p>
            <ul className="text-gray-600">
              <li>담당자: 박건우</li>
              <li>이메일: ceo@82studio.xyz</li>
            </ul>
          </div>

          <p className="text-gray-600 mb-8">
            개인정보 관련 문의사항은 위 이메일로 연락해 주시기 바랍니다.
          </p>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">11. 개인정보 처리방침 변경</h2>

          <p className="text-gray-600 mb-4">
            이 개인정보 처리방침은 2025년 1월 1일부터 적용됩니다.
          </p>
          <p className="text-gray-600 mb-8">
            개인정보 처리방침 내용 추가, 삭제 및 수정이 있을 시에는 변경사항의 시행 7일 전부터 앱 내 공지사항을 통하여 고지할 것입니다.
          </p>

          <hr className="my-8" />

          <p className="text-gray-700 font-semibold text-center">
            지갑교관 운영팀
          </p>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            &copy; 2025 지갑교관. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
