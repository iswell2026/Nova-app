import { useState } from "react";

// ── Claude API ──────────────────────────────────────────────────────────────
const callClaude = async (prompt) => {
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    return data.content?.[0]?.text || "분석 실패";
  } catch { return "연결 오류"; }
};

// ── VA 자재 단가 데이터 ─────────────────────────────────────────────────────
const MATERIALS = [
  { category: "바닥재", item: "Hardwood (Oak)", unit: "sqft", light: 4.5, medium: 7, heavy: 12 },
  { category: "바닥재", item: "LVP (Luxury Vinyl)", unit: "sqft", light: 2.5, medium: 4, heavy: 6 },
  { category: "바닥재", item: "Tile (Ceramic)", unit: "sqft", light: 3, medium: 5.5, heavy: 9 },
  { category: "주방", item: "Cabinets (Stock)", unit: "linear ft", light: 150, medium: 280, heavy: 500 },
  { category: "주방", item: "Countertop (Granite)", unit: "sqft", light: 35, medium: 55, heavy: 90 },
  { category: "주방", item: "Appliances Package", unit: "set", light: 2500, medium: 4500, heavy: 8000 },
  { category: "욕실", item: "Vanity + Fixtures", unit: "set", light: 800, medium: 1800, heavy: 4000 },
  { category: "욕실", item: "Tile (Shower/Floor)", unit: "sqft", light: 8, medium: 14, heavy: 25 },
  { category: "페인트", item: "Interior Paint", unit: "sqft", light: 1.2, medium: 2, heavy: 3.5 },
  { category: "지붕", item: "Asphalt Shingles", unit: "sqft", light: 3.5, medium: 5.5, heavy: 9 },
  { category: "HVAC", item: "AC + Furnace", unit: "unit", light: 5000, medium: 8500, heavy: 14000 },
  { category: "전기", item: "Panel Upgrade", unit: "unit", light: 1800, medium: 3200, heavy: 5500 },
  { category: "배관", item: "Plumbing (partial)", unit: "unit", light: 2000, medium: 5000, heavy: 12000 },
  { category: "창문", item: "Window (Double Pane)", unit: "unit", light: 350, medium: 600, heavy: 1200 },
  { category: "문", item: "Interior Door", unit: "unit", light: 180, medium: 320, heavy: 600 },
];

const LENDERS = [
  // 🏦 일반 (Conventional) — 10개
  { category: "conventional", name: "Navy Federal Credit Union", email: "mortgages@navyfederal.org", rate: 6.75, ltv: 80, points: 0.25, speed: "25일", phone: "888-842-6328", website: "navyfederal.org", review: "NoVA 군인·연방직원 최저금리. LTV 80% 가능. McLean HQ 인접. 회원 전용 특별 조건.", rating: "4.9★", badge: "최저금리" },
  { category: "conventional", name: "PenFed Credit Union", email: "mortgages@penfed.org", rate: 6.85, ltv: 80, points: 0.25, speed: "28일", phone: "800-247-5626", website: "penfed.org", review: "NoVA 기반 연방 크레딧유니언. 투자용 LTV 80%. 금리 경쟁력 최상위. 회원 가입 쉬움.", rating: "4.8★", badge: "추천" },
  { category: "conventional", name: "Capital One (McLean HQ)", email: "investor.loans@capitalone.com", rate: 7.0, ltv: 75, points: 0.5, speed: "25일", phone: "877-442-3764", website: "capitalone.com", review: "McLean VA 본사. NoVA 투자자 전담팀. Venture X 고객 우대. 온라인 관리 최고.", rating: "4.7★", badge: "NoVA본사" },
  { category: "conventional", name: "Bank of America Investment", email: "investor.loans@bankofamerica.com", rate: 7.0, ltv: 75, points: 0.75, speed: "28일", phone: "800-432-1000", website: "bankofamerica.com", review: "Preferred Rewards 회원 금리 할인. NoVA 투자자 전담팀. 온라인 신청 간편.", rating: "4.5★", badge: "우대할인" },
  { category: "conventional", name: "Wells Fargo Investment Loan", email: "investor.lending@wellsfargo.com", rate: 7.125, ltv: 75, points: 0.5, speed: "30일", phone: "800-357-6675", website: "wellsfargo.com", review: "미국 최대 은행. NoVA 지점 다수. 투자용 Conventional 전문. 장기 관계 투자자 우대.", rating: "4.4★", badge: "" },
  { category: "conventional", name: "Chase Investment Mortgage", email: "investor.mortgage@chase.com", rate: 7.25, ltv: 75, points: 0.5, speed: "30일", phone: "800-432-3117", website: "chase.com", review: "전국 네트워크. Private Client 우대. Fairfax·Arlington 지점 편리. 온라인 관리 우수.", rating: "4.4★", badge: "" },
  { category: "conventional", name: "Rocket Mortgage (VA #1)", email: "info@rocketmortgage.com", rate: 7.125, ltv: 75, points: 0.5, speed: "21일", phone: "800-769-6133", website: "rocketmortgage.com", review: "VA 주 대출 실행 1위. 온라인 완전 디지털. 빠른 승인. 2024 HMDA $3.1B 실행.", rating: "4.6★", badge: "VA 1위" },
  { category: "conventional", name: "CapCenter (Zero Closing)", email: "info@capcenter.com", rate: 6.99, ltv: 75, points: 0.0, speed: "30일", phone: "800-968-5844", website: "capcenter.com", review: "클로징 비용 제로 옵션. VA 기반 지역 전문. Realtor 수수료 절감 가능. 투자자 재이용 많음.", rating: "4.8★", badge: "클로징무료" },
  { category: "conventional", name: "LendFriend Mortgage VA", email: "info@lendfriendmtg.com", rate: 7.0, ltv: 75, points: 0.25, speed: "30일", phone: "703-828-8700", website: "lendfriendmtg.com", review: "NoVA·Arlington 전문 브로커. 재이용 고객 수수료 면제. Non-QM도 가능. 투명한 프로세스.", rating: "4.9★", badge: "재이용무료" },
  { category: "conventional", name: "Truist Investment Mortgage", email: "investor.loans@truist.com", rate: 7.25, ltv: 75, points: 0.5, speed: "30일", phone: "844-487-8478", website: "truist.com", review: "BB&T+SunTrust 합병. VA 전역 지점. 포트폴리오 투자자 전담 서비스. 다주택 우대.", rating: "4.3★", badge: "" },

  // 📈 플립 (Fix & Flip) — 10개
  { category: "flip", name: "Easy Street Capital", email: "info@easystreetcap.com", rate: 10.99, ltv: 90, points: 2.0, speed: "2일", phone: "512-641-9817", website: "easystreetcap.com", review: "48시간 클로징 가능. 감정평가 불필요. 전국 1위 리뷰. Flip 전문 투자자 선호도 1위.", rating: "5.0★", badge: "최빠른" },
  { category: "flip", name: "Asset Based Lending (ABL)", email: "info@ablfunding.com", rate: 10.99, ltv: 90, points: 1.5, speed: "10일", phone: "201-942-9089", website: "ablfunding.com", review: "구매가 90% + 수리비 100% 커버. 24시간 승인. NoVA 전문. 10년 이상 운영.", rating: "4.9★", badge: "추천" },
  { category: "flip", name: "LendingOne Fix & Flip", email: "info@lendingone.com", rate: 10.5, ltv: 92, points: 1.5, speed: "7일", phone: "866-970-7889", website: "lendingone.com", review: "LTC 92.5% + 수리비 100%. Trustpilot 최고 평점. NoVA·VA 전문 팀. BRRRR 최적화.", rating: "4.9★", badge: "" },
  { category: "flip", name: "HouseMax Funding", email: "info@housemaxfunding.com", rate: 10.75, ltv: 85, points: 1.5, speed: "7일", phone: "888-436-9723", website: "housemaxfunding.com", review: "Forbes 선정 2024·2025 Best Hard Money Lender. 2,700+ 플립 경험. 셀프서브 플랫폼.", rating: "4.9★", badge: "Forbes선정" },
  { category: "flip", name: "Kiavi (구 LendingHome)", email: "info@kiavi.com", rate: 10.25, ltv: 90, points: 1.0, speed: "10일", phone: "844-415-4663", website: "kiavi.com", review: "기술 기반 대출. 온라인 신청 5분. 반복 투자자 금리 인하. 전국 $20B+ 실행 실적.", rating: "4.8★", badge: "테크기반" },
  { category: "flip", name: "RCN Capital", email: "info@rcncapital.com", rate: 10.99, ltv: 90, points: 1.75, speed: "10일", phone: "860-432-5858", website: "rcncapital.com", review: "전국 투자자 네트워크. Broker 채널 강함. 다주택 경험자 우대. 빠른 재승인.", rating: "4.7★", badge: "" },
  { category: "flip", name: "Groundfloor Finance", email: "info@groundfloor.us", rate: 7.5, ltv: 80, points: 0.0, speed: "14일", phone: "404-850-9225", website: "groundfloor.com", review: "크라우드펀딩 기반 최저금리 플립론. 7.5%부터 시작. 소규모 투자자 접근 용이.", rating: "4.6★", badge: "최저금리" },
  { category: "flip", name: "Civic Financial Services", email: "info@civicfs.com", rate: 10.5, ltv: 85, points: 1.5, speed: "10일", phone: "877-462-4842", website: "civicfs.com", review: "Non-QM 전문. 빠른 클로징. 경험 있는 플리퍼 우대 조건. 브로커 네트워크 강함.", rating: "4.6★", badge: "" },
  { category: "flip", name: "CoreVest Finance", email: "info@corevestfinance.com", rate: 9.99, ltv: 85, points: 1.5, speed: "14일", phone: "844-223-2231", website: "corevestfinance.com", review: "대규모 포트폴리오 플립 전문. 다건 동시 대출 가능. 기관 투자자 수준 조건.", rating: "4.5★", badge: "다건가능" },
  { category: "flip", name: "LoanBidz (BRRRR)", rate: 10.5, ltv: 85, points: 1.5, speed: "10일", phone: "888-562-4395", website: "loanbidz.com", review: "BRRRR 전문 플랫폼. $700M+ 실행. 최적 옵션 자동 매칭. $100K~$3M 범위.", rating: "4.6★", badge: "BRRRR" },

  // 🏠 임대 (DSCR/Rental) — 10개
  { category: "rental", name: "Griffin Funding DSCR", rate: 7.5, ltv: 80, points: 0.5, speed: "21일", phone: "855-394-8288", website: "griffinfunding.com", review: "DSCR 1.0 미만도 승인 가능. W-2 불필요. LLC 대출 가능. VA 투자자 선호 1위.", rating: "4.9★", badge: "조건유연" },
  { category: "rental", name: "Lima One Capital", email: "info@limaone.com", rate: 7.75, ltv: 80, points: 1.0, speed: "14일", phone: "800-390-4212", website: "limaone.com", review: "DSCR + Flip + 멀티패밀리 원스톱. 포트폴리오 확장 투자자 전문. DSCR 1.0 기준.", rating: "4.7★", badge: "포트폴리오" },
  { category: "rental", name: "Visio Lending DSCR", rate: 7.625, ltv: 80, points: 0.75, speed: "21일", phone: "855-846-6765", website: "visiolending.com", review: "장기 임대 전문. 단기렌탈(Airbnb) 가능. 개인소득 검증 없음. 30년 고정 안정적.", rating: "4.7★", badge: "STR가능" },
  { category: "rental", name: "Angel Oak DSCR", rate: 7.5, ltv: 80, points: 0.75, speed: "21일", phone: "877-926-3535", website: "angeloakmortgage.com", review: "비전통 소득 투자자 특화. DSCR 0.75도 가능. NoVA 지역 경험 풍부. LLC 명의 대출.", rating: "4.6★", badge: "" },
  { category: "rental", name: "Rehab Financial Group (RFG)", rate: 8.0, ltv: 80, points: 1.0, speed: "14일", phone: "800-571-0887", website: "rehabfinancial.com", review: "$300M+ 실행. DSCR 30년 고정. BRRRR 전략 최적. VA 전역 서비스.", rating: "4.6★", badge: "BRRRR전문" },
  { category: "rental", name: "Deephaven Mortgage", rate: 7.75, ltv: 80, points: 0.75, speed: "21일", phone: "800-388-6135", website: "deephavenmortgage.com", review: "Non-QM 전문 기관. 은행 거래내역 소득 증명 가능. LLC·Trust 명의 대출. 대형 포트폴리오.", rating: "4.5★", badge: "" },
  { category: "rental", name: "New Silver DSCR", rate: 7.99, ltv: 75, points: 1.0, speed: "5일", phone: "860-435-0025", website: "newsilver.com", review: "AI 기반 즉시 승인. 5일 클로징. 온라인 완전 자동화. 소규모 임대 투자자 친화적.", rating: "4.7★", badge: "AI승인" },
  { category: "rental", name: "HouseMax Funding DSCR", rate: 5.75, ltv: 80, points: 0.5, speed: "14일", phone: "888-436-9723", website: "housemaxfunding.com", review: "DSCR 5.75%~ 최저금리. Forbes 선정. NoVA 수요 높음. 단기렌탈 포함.", rating: "4.9★", badge: "최저5.75%" },
  { category: "rental", name: "Kiavi DSCR Rental", rate: 7.5, ltv: 80, points: 0.75, speed: "14일", phone: "844-415-4663", website: "kiavi.com", review: "Flip 후 임대 전환 원스톱. $20B+ 실행. 반복 투자자 자동 우대. 30년 고정.", rating: "4.8★", badge: "플립→임대" },
  { category: "rental", name: "CapSource Lending", rate: 7.875, ltv: 75, points: 1.0, speed: "21일", phone: "703-349-2200", website: "capsourcellc.com", review: "NoVA 기반 지역 투자 전문. 임대+플립+신축 포트폴리오. 지역 시장 이해도 최상.", rating: "4.6★", badge: "NoVA전문" },
];

const CONTRACTORS = [
  // ── 🏆 LUXURY HEAVY (고급 리노베이션 전문) ──────────────────────────────
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "TriVista USA Design+Build", email: "info@trivistausa.com", sqft: "$110–$160", score: 97, phone: "703-865-6182", website: "trivistausa.com", specialty: "Full Home Luxury Renovation", review: "20년 경력, 수상 이력 다수. 아키텍트+인테리어디자이너 인하우스. Fairfax·Arlington 전문.", rating: "4.9★ (200+ reviews)" },
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "Ridgeline Contractors (DMV)", email: "info@ridgelinedmv.com", sqft: "$95–$145", score: 96, phone: "301-825-1726", website: "ridgelinedmv.com", specialty: "Luxury Bath & Kitchen", review: "NoVA 최고 럭셔리 리모델러 자타공인. 보험 클레임 처리까지 지원. Malcolm 대표 직접 관리.", rating: "5.0★ (180+ reviews)" },
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "Bowers Design Build", email: "info@bowersdesignbuild.com", sqft: "$100–$155", score: 95, phone: "703-506-0845", website: "bowersdesignbuild.com", specialty: "Custom Home & Whole House Remodel", review: "1990년 창립. NRS 고객만족 수상. 30% 재방문 고객. McLean·Great Falls 전문.", rating: "4.9★ (150+ reviews)" },
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "Commonwealth Home Design", email: "info@commonwealthhomedesign.com", sqft: "$90–$140", score: 94, phone: "703-938-2121", website: "commonwealthhomedesign.com", specialty: "Whole House Renovation + Addition", review: "40년 Vienna 기반. 구조 변경·증축 전문. 프로젝트 관리 시스템 우수.", rating: "4.8★ (120+ reviews)" },
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "Foster Remodeling Solutions", email: "info@fosterremodeling.com", sqft: "$85–$135", score: 93, phone: "703-471-7511", website: "fosterremodeling.com", specialty: "Design-Build / Basement + Addition", review: "업계 최고 보증 제공. 디자인팀 인하우스. Herndon·Reston 전문.", rating: "4.9★ (200+ reviews)" },
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "Ideal Construction & Remodeling", email: "info@idealconstructionva.com", sqft: "$88–$138", score: 92, phone: "703-879-4484", website: "idealconstructionva.com", specialty: "Green Build + Luxury Remodel", review: "Arlington County 그린홈 수상. 에너지 효율 특화. DC·Arlington 전문.", rating: "4.8★ (90+ reviews)" },
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "Monova Homes", email: "info@monovahomes.com", sqft: "$92–$142", score: 91, phone: "571-264-5040", website: "monovahomes.com", specialty: "Full Home Renovation", review: "예산·일정 준수로 유명. Alexandria·Fairfax 기반. 투자자 친화적.", rating: "4.9★ (80+ reviews)" },
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "WISA Solutions", email: "info@wisasolutions.com", sqft: "$80–$130", score: 90, phone: "703-455-2212", website: "wisasolutions.com", specialty: "Kitchen & Bath Luxury", review: "West Springfield 기반. 고객 추천율 높음. 주방·욕실 럭셔리 전문.", rating: "4.8★ (100+ reviews)" },
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "Total Construction Company", email: "info@totalconstructionco.com", sqft: "$85–$132", score: 89, phone: "703-273-2929", website: "totalconstructionco.com", specialty: "Whole House + Custom Millwork", review: "34년 경력. 수영장·야외공간 포함 풀서비스. Fairfax County 전문.", rating: "4.8★ (140+ reviews)" },
  { category: "luxury", label: "🏆 Luxury / Heavy", name: "Heartland Design & Remodeling", email: "info@heartlandremodeling.com", sqft: "$82–$128", score: 88, phone: "571-220-0505", website: "heartlandremodeling.com", specialty: "Custom Design + Renovation", review: "Bristow·Prince William 기반. 고객 소통 우수. 맞춤 설계 강점.", rating: "4.7★ (70+ reviews)" },

  // ── 📈 FLIP MEDIUM (플립 전문 중급) ────────────────────────────────────
  { category: "flip", label: "📈 Flip / Medium", name: "NHR Kitchen & Floors (NOVA Home Renovate)", email: "info@novahomerenovate.com", sqft: "$55–$85", score: 95, phone: "703-499-0040", website: "novahomerenovate.com", specialty: "Kitchen + Bath + Flooring Flip", review: "Fairfax County ALU 허가 전문. 일정·예산 매일 커뮤니케이션. 투자자 재이용률 매우 높음.", rating: "5.0★ (300+ reviews)" },
  { category: "flip", label: "📈 Flip / Medium", name: "All Renovations", email: "info@allrenovations.com", sqft: "$48–$78", score: 93, phone: "703-596-0000", website: "allrenovations.com", specialty: "Investor Flip Specialist", review: "Class A VA 라이선스. 전기+배관 특화. 가성비 1위. Vienna·Sterling 전문. 4.9★ 38개 리뷰.", rating: "4.9★ (38 verified)" },
  { category: "flip", label: "📈 Flip / Medium", name: "DMV Remodeling Pros", email: "info@dmvremodelingpros.com", sqft: "$52–$80", score: 91, phone: "703-348-2100", website: "dmvremodelingpros.com", specialty: "Fast Flip Turnaround", review: "90일 내 완공 보장. Permit 처리 경험 풍부. Manassas·Centreville 기반.", rating: "4.7★ (110+ reviews)" },
  { category: "flip", label: "📈 Flip / Medium", name: "Capital Remodeling", email: "info@capitalremodeling.com", sqft: "$50–$82", score: 90, phone: "301-649-0900", website: "capitalremodeling.com", specialty: "Kitchen + Flooring Flip Package", review: "DC·VA·MD 트라이스테이트. 패키지 견적 빠름. 투자자 대량 계약 경험.", rating: "4.6★ (250+ reviews)" },
  { category: "flip", label: "📈 Flip / Medium", name: "Fairfax Contracting Group", email: "info@fairfaxcontracting.com", sqft: "$55–$83", score: 89, phone: "703-425-7070", website: "fairfaxcontracting.com", specialty: "Flip & Rental Turnover", review: "Fairfax County Permit 최단 처리. 다중 현장 동시 관리 가능. 투자자 전용 할인.", rating: "4.7★ (90+ reviews)" },
  { category: "flip", label: "📈 Flip / Medium", name: "Renovate DMV", email: "info@renovatedmv.com", sqft: "$48–$75", score: 88, phone: "571-449-3300", website: "renovatedmv.com", specialty: "Medium Flip Full Package", review: "주방+욕실+바닥 패키지 전문. Sterling·Ashburn 기반. ROI 최적화 경험 많음.", rating: "4.6★ (75+ reviews)" },
  { category: "flip", label: "📈 Flip / Medium", name: "ProBuild Contractors VA", sqft: "$52–$79", score: 87, phone: "703-680-5555", website: "probuildva.com", specialty: "Structural + Cosmetic Flip", review: "구조 변경 포함 Flip 전문. Prince William County 기반. Permit 일괄 처리.", rating: "4.6★ (60+ reviews)" },
  { category: "flip", label: "📈 Flip / Medium", name: "Northern Virginia Remodelers", sqft: "$50–$77", score: 86, phone: "703-352-6000", website: "nvrenovation.com", specialty: "Full Flip Renovation", review: "Annandale·Burke 전문. 다세대·단독 모두 가능. 재이용 투자자 30% 이상.", rating: "4.5★ (85+ reviews)" },
  { category: "flip", label: "📈 Flip / Medium", name: "Blueprint Renovation LLC", email: "info@blueprintrenovation.com", sqft: "$53–$80", score: 85, phone: "571-330-8800", website: "blueprintrenovation.com", specialty: "Design+Build Flip", review: "3D 렌더링 무료 제공. Reston·Herndon 전문. 빠른 견적 48시간 보장.", rating: "4.5★ (50+ reviews)" },
  { category: "flip", label: "📈 Flip / Medium", name: "RedLine Construction VA", sqft: "$47–$73", score: 84, phone: "703-494-9100", website: "redlineconstructionva.com", specialty: "Fast & Budget Flip", review: "최단 공사 기간 전문. Woodbridge·Lorton 기반. 예산 초과 시 패널티 조항 포함.", rating: "4.4★ (65+ reviews)" },

  // ── 🏠 RENTAL LIGHT (임대용 경량 리노베이션) ────────────────────────────
  { category: "rental", label: "🏠 Rental / Light", name: "Quick Flip & Rental Services VA", sqft: "$22–$35", score: 92, phone: "571-205-4400", website: "quickflipva.com", specialty: "Rental Turnover Specialist", review: "임대용 리노베이션 최단 7일 완공. 도장+바닥+조명 패키지. 다주택 투자자 전용.", rating: "4.8★ (180+ reviews)" },
  { category: "rental", label: "🏠 Rental / Light", name: "Tenant Ready Contractors", sqft: "$20–$32", score: 91, phone: "703-244-7700", website: "tenantreadyva.com", specialty: "Rental Prep & Turnover", review: "임차인 교체 시 7~14일 완공. 도색+청소+소형수리 패키지. Landlord 선호 1위.", rating: "4.8★ (220+ reviews)" },
  { category: "rental", label: "🏠 Rental / Light", name: "Property Maintenance Plus VA", sqft: "$18–$30", score: 90, phone: "703-330-5050", website: "pmplusva.com", specialty: "Light Rehab + Maintenance", review: "연간 유지보수 계약 가능. 소형 수리 즉시 출동. Manassas·Woodbridge 전문.", rating: "4.7★ (160+ reviews)" },
  { category: "rental", label: "🏠 Rental / Light", name: "Budget Reno Group VA", sqft: "$19–$31", score: 89, phone: "571-285-6300", website: "budgetrenova.com", specialty: "Cost-Effective Rental Rehab", review: "자재비 절감 전문. 임대 수익률 최적화. 대량 계약 시 추가 할인.", rating: "4.6★ (130+ reviews)" },
  { category: "rental", label: "🏠 Rental / Light", name: "NoVA Handyman & Renovation", sqft: "$15–$28", score: 88, phone: "703-470-2020", website: "novahandyman.com", specialty: "Light Fix + Rental Prep", review: "핸디맨 수준 소형 공사 전문. 긴급 출동 가능. Springfield·Burke 기반.", rating: "4.7★ (300+ reviews)" },
  { category: "rental", label: "🏠 Rental / Light", name: "FirstChoice Renovation VA", sqft: "$21–$34", score: 87, phone: "703-361-8800", website: "firstchoicerenovation.com", specialty: "Rental Light Rehab Package", review: "주방+욕실 저비용 리프레시 전문. Manassas 기반. 일정 준수율 95%.", rating: "4.6★ (90+ reviews)" },
  { category: "rental", label: "🏠 Rental / Light", name: "Sterling Renovation Group", sqft: "$20–$33", score: 86, phone: "571-434-7700", website: "sterlingrenovation.com", specialty: "Rental Ready Light Remodel", review: "Loudoun County 전문. 임대용 LVP+페인트+조명 패키지. 빠른 완공.", rating: "4.5★ (75+ reviews)" },
  { category: "rental", label: "🏠 Rental / Light", name: "ValueBuild Contractors", sqft: "$18–$29", score: 85, phone: "703-580-1100", website: "valuebuildva.com", specialty: "Budget Rental Turnover", review: "최저가 보장. 다주택 투자자 전용 계약. Prince William County 기반.", rating: "4.4★ (110+ reviews)" },
  { category: "rental", label: "🏠 Rental / Light", name: "HomeFix Pro VA", email: "info@homefixprova.com", sqft: "$16–$27", score: 84, phone: "571-312-4400", website: "homefixprova.com", specialty: "Rental Repair & Light Refresh", review: "도배+도색+바닥 교체 전문. Centreville·Chantilly 기반. 24시간 견적 대응.", rating: "4.4★ (85+ reviews)" },
  { category: "rental", label: "🏠 Rental / Light", name: "Express Reno VA", sqft: "$15–$26", score: 83, phone: "703-440-9900", website: "expressrenova.com", specialty: "Fast Rental Turnover", review: "임대 회전율 극대화 전문. 5일 이내 완공 기록 보유. Fairfax·Reston 기반.", rating: "4.3★ (95+ reviews)" },
];

const TABS = [
  { id: "deal",         labelKo: "매물 입력",   labelEn: "Deal Intake",     emoji: "🏠" },
  { id: "flip",         labelKo: "Flip 분석",   labelEn: "Flip Analysis",   emoji: "📈" },
  { id: "hold",         labelKo: "Hold 분석",   labelEn: "Hold Analysis",   emoji: "🏦" },
  { id: "finance",      labelKo: "금융 비교",   labelEn: "Finance",         emoji: "💰" },
  { id: "contractor",   labelKo: "건설사",      labelEn: "Contractors",     emoji: "🔨" },
  { id: "materials",    labelKo: "자재 단가",   labelEn: "Materials",       emoji: "🪚" },
  { id: "construction", labelKo: "공사 현황",   labelEn: "Construction",    emoji: "📋" },
  { id: "risk",         labelKo: "리스크",      labelEn: "Risk",            emoji: "⚠️" },
];

const fmt = (n) => "$" + Math.round(n).toLocaleString();
const pct = (n) => n.toFixed(1) + "%";

// ── STYLES ──────────────────────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#060912;--bg2:#0D1220;--bg3:#141B2D;--bg4:#1C2438;
  --gold:#E2B84B;--gold2:rgba(226,184,75,0.12);--gold3:rgba(226,184,75,0.06);
  --blue:#4B8BFF;--blue2:rgba(75,139,255,0.12);
  --green:#34D399;--green2:rgba(52,211,153,0.1);
  --red:#F87171;--red2:rgba(248,113,113,0.1);
  --text:#E8EAF0;--dim:rgba(232,234,240,0.4);--mid:rgba(232,234,240,0.65);
  --border:rgba(255,255,255,0.06);--border2:rgba(226,184,75,0.15);
}
body{font-family:'Sora',sans-serif;background:var(--bg);color:var(--text);}
.app{display:flex;height:100vh;overflow:hidden;}

/* SIDEBAR */
.sidebar{width:200px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:20px 12px;gap:4px;flex-shrink:0;}
.logo{padding:12px 8px 20px;border-bottom:1px solid var(--border);margin-bottom:8px;}
.logo-title{font-size:18px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;}
.logo-sub{font-size:9px;font-weight:500;color:var(--dim);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;}
.nav-btn{width:100%;text-align:left;background:none;border:none;color:var(--dim);padding:9px 12px;border-radius:10px;cursor:pointer;font-family:'Sora',sans-serif;font-size:12px;font-weight:500;display:flex;align-items:center;gap:8px;transition:all 0.15s;}
.nav-btn:hover{background:var(--bg3);color:var(--text);}
.nav-btn.active{background:var(--gold2);color:var(--gold);border:1px solid var(--border2);}
.nav-emoji{font-size:14px;width:20px;text-align:center;}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.topbar{background:var(--bg2);border-bottom:1px solid var(--border);padding:16px 28px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.topbar-title{font-size:20px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:10px;}
.topbar-stats{display:flex;gap:24px;}
.tstat{text-align:right;}
.tstat-label{font-size:8px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--dim);}
.tstat-val{font-family:'DM Mono',monospace;font-size:22px;font-weight:500;}
.tstat-val.gold{color:var(--gold);}
.tstat-val.blue{color:var(--blue);}
.tstat-val.green{color:var(--green);}
.tstat-val.red{color:var(--red);}

.content{flex:1;overflow-y:auto;padding:24px 28px;scrollbar-width:thin;scrollbar-color:rgba(226,184,75,0.2) transparent;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}

/* CARDS */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
.card-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.card-title{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold);opacity:0.7;}
.card-body{padding:20px;}

/* INPUTS */
.field{display:flex;flex-direction:column;gap:6px;}
.label{font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--dim);}
.input{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 14px;color:var(--text);font-size:13px;font-weight:500;font-family:'Sora',sans-serif;outline:none;transition:border-color 0.15s;width:100%;}
.input:focus{border-color:rgba(226,184,75,0.35);}
.input::placeholder{color:var(--dim);}
select.input{cursor:pointer;}

/* BUTTONS */
.btn{border:none;cursor:pointer;font-family:'Sora',sans-serif;font-weight:700;letter-spacing:0.05em;transition:all 0.15s;display:inline-flex;align-items:center;gap:6px;}
.btn-gold{background:linear-gradient(135deg,#E2B84B,#F0CF7A);color:#0D0E10;padding:11px 22px;border-radius:10px;font-size:11px;}
.btn-gold:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(226,184,75,0.3);}
.btn-ghost{background:var(--bg3);border:1px solid var(--border);color:var(--mid);padding:9px 18px;border-radius:10px;font-size:11px;}
.btn-ghost:hover{border-color:var(--border2);color:var(--gold);}
.btn-sm{padding:6px 14px;font-size:10px;border-radius:8px;}
.btn:disabled{opacity:0.4;cursor:default;transform:none !important;}

/* METRIC */
.metric{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px 16px;}
.metric-label{font-size:8px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--dim);margin-bottom:4px;}
.metric-val{font-family:'DM Mono',monospace;font-size:20px;font-weight:500;}

/* VERDICT */
.verdict{border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;margin-bottom:20px;}
.verdict.flip{background:rgba(226,184,75,0.08);border:1px solid rgba(226,184,75,0.2);}
.verdict.hold{background:var(--blue2);border:1px solid rgba(75,139,255,0.2);}
.verdict.both{background:var(--green2);border:1px solid rgba(52,211,153,0.2);}
.verdict.pass{background:var(--red2);border:1px solid rgba(248,113,113,0.15);}
.verdict-badge{font-size:24px;font-weight:900;min-width:80px;}
.verdict-text{font-size:12px;color:var(--mid);line-height:1.6;}

/* TABLE */
.tbl{width:100%;border-collapse:collapse;}
.tbl th{font-size:8px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--dim);padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);}
.tbl td{padding:11px 14px;font-size:12px;color:var(--mid);border-bottom:1px solid rgba(255,255,255,0.03);}
.tbl tr:hover td{background:rgba(226,184,75,0.03);}
.tbl td.mono{font-family:'DM Mono',monospace;color:var(--text);}
.tbl td.gold{font-family:'DM Mono',monospace;color:var(--gold);font-weight:600;}
.tbl td.green{font-family:'DM Mono',monospace;color:var(--green);}
.tbl td.red{font-family:'DM Mono',monospace;color:var(--red);}
.tbl td.blue{font-family:'DM Mono',monospace;color:var(--blue);}

/* SCORE BAR */
.score-wrap{display:flex;align-items:center;gap:10px;}
.score-bar{flex:1;height:6px;background:var(--bg4);border-radius:3px;overflow:hidden;}
.score-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--blue),var(--green));}

/* AI BOX */
.ai-box{background:var(--bg3);border:1px solid rgba(75,139,255,0.15);border-radius:12px;padding:16px 18px;margin-top:16px;}
.ai-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.ai-dot{width:6px;height:6px;border-radius:50%;background:var(--blue);animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
.ai-label{font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--blue);opacity:0.7;}
.ai-text{font-size:11px;color:var(--mid);line-height:1.7;border-left:2px solid rgba(75,139,255,0.2);padding-left:12px;white-space:pre-wrap;}

/* STRESS */
.stress-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;}
.stress-item{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 14px;}
.stress-label{font-size:9px;font-weight:600;color:var(--dim);margin-bottom:4px;}
.stress-val{font-family:'DM Mono',monospace;font-size:14px;}

/* TASKS */
.task-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 120px 80px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);}
.task-input{background:var(--bg3);border:1px solid transparent;border-radius:8px;padding:7px 10px;color:var(--text);font-size:11px;font-family:'Sora',sans-serif;outline:none;width:100%;transition:border-color 0.15s;}
.task-input:focus{border-color:rgba(226,184,75,0.25);}
.status-pill{padding:4px 10px;border-radius:100px;font-size:8px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;border:none;font-family:'Sora',sans-serif;}
.status-pending{background:var(--bg4);color:var(--dim);}
.status-progress{background:var(--blue2);color:var(--blue);}
.status-done{background:var(--green2);color:var(--green);}

/* RENO TOGGLE */
.reno-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.reno-btn{padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--bg3);color:var(--dim);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;cursor:pointer;transition:all 0.15s;font-family:'Sora',sans-serif;}
.reno-btn:hover{border-color:var(--border2);color:var(--text);}
.reno-btn.active{background:var(--gold2);border-color:var(--border2);color:var(--gold);}

/* BADGE */
.badge{display:inline-flex;padding:3px 9px;border-radius:100px;font-size:8px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;}
.badge-gold{background:var(--gold2);color:var(--gold);border:1px solid var(--border2);}
.badge-green{background:var(--green2);color:var(--green);}
.badge-blue{background:var(--blue2);color:var(--blue);}
.badge-red{background:var(--red2);color:var(--red);}

/* SPINNER */
.spinner{width:14px;height:14px;border:2px solid rgba(226,184,75,0.2);border-top-color:var(--gold);border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0;}
.spinner-blue{border-color:rgba(75,139,255,0.2);border-top-color:var(--blue);}
@keyframes spin{to{transform:rotate(360deg);}}

.section-title{font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);opacity:0.6;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.divider{height:1px;background:var(--border);margin:20px 0;}
.space{height:16px;}
/* MOBILE RESPONSIVE */
@media (max-width: 768px) {
  .app{flex-direction:column;height:100dvh;}
  .sidebar{width:100%;height:60px;flex-direction:row;padding:0 4px;gap:0;overflow-x:auto;border-right:none;border-top:1px solid var(--border);border-bottom:none;flex-shrink:0;justify-content:space-around;order:3;position:fixed;bottom:0;left:0;right:0;background:var(--bg2);z-index:100;}
  .logo{display:none;}
  .nav-btn{flex-direction:column;gap:1px;padding:6px 4px;font-size:8px;min-width:44px;align-items:center;text-align:center;white-space:nowrap;border-radius:8px;flex:1;}
  .nav-emoji{font-size:18px;width:auto;}
  .main{flex:1;overflow:hidden;padding-bottom:60px;}
  .topbar{padding:10px 14px;}
  .topbar-title{font-size:14px;}
  .content{padding:10px;}
  .card{padding:12px;}
  .grid-2{grid-template-columns:1fr!important;}
  input[type=range]{width:100%;}
}
@media (max-width: 768px) {
  /* Materials table - horizontal scroll */
  .tbl{font-size:10px;}
  .tbl th, .tbl td{padding:6px 8px;white-space:nowrap;}
  /* Task row - stack on mobile */
  .task-row{grid-template-columns:1fr 1fr 1fr;gap:6px;padding:10px 0;}
  .task-row > *:first-child{grid-column:1/-1;}
  /* Hold grid */
  .grid2{grid-template-columns:1fr!important;}
}
@media (max-width: 480px) {
  .nav-btn{min-width:36px;font-size:7px;padding:4px 2px;}
  .content{padding:8px;}
  .grid2{grid-template-columns:1fr!important;}
  .grid3{grid-template-columns:1fr 1fr!important;}
  .grid4{grid-template-columns:1fr 1fr!important;}
  .task-row{grid-template-columns:1fr 1fr;gap:4px;padding:6px 0;}
  .task-input{padding:5px 8px;font-size:10px;}
}
`;

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("deal");
  const [lang, setLang] = useState("ko"); // "ko" | "en"
  const t = (ko, en) => lang === "en" ? en : ko;

  // Deal inputs
  const [deal, setDeal] = useState({
    address: "", purchasePrice: 650000, sqft: 2200,
    yearBuilt: 1985, beds: 4, baths: 2,
    estimatedRent: 3200, renoLevel: "Medium",
    hoa: 0, propertyTax: 7800
  });

  // Finance
  const [selectedLender] = useState(0);
  const [ltv, setLtv] = useState(75);

  // Construction
  const [tasks, setTasks] = useState([
    { id: 1, desc: "철거 및 폐기물", budget: 5000, actual: 0, status: "대기", due: "" },
    { id: 2, desc: "배관/전기 Rough-in", budget: 12000, actual: 0, status: "대기", due: "" },
    { id: 3, desc: "드라이월/도장", budget: 15000, actual: 0, status: "대기", due: "" },
    { id: 4, desc: "주방/욕실 Fixtures", budget: 25000, actual: 0, status: "대기", due: "" },
    { id: 5, desc: "바닥재/마감", budget: 18000, actual: 0, status: "대기", due: "" },
  ]);

  // AI
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [matFilter, setMatFilter] = useState("전체");
  const [gcCat, setGcCat] = useState("luxury");
  const [finCat, setFinCat] = useState("conventional");
  const [rateRefreshing, setRateRefreshing] = useState(false);
  const [rateUpdatedAt, setRateUpdatedAt] = useState(null);
  const [liveRates, setLiveRates] = useState({});

  const refreshRates = async () => {
    setRateRefreshing(true);
    try {
      const prompt = `You are a real estate lending expert. Return ONLY a JSON object (no markdown, no explanation) with current 2025 interest rates for these lenders in Northern Virginia. Format: {"LenderName": rate_number}
Lenders: Navy Federal Credit Union, PenFed Credit Union, Capital One, Bank of America, Wells Fargo, Chase, Rocket Mortgage, CapCenter, LendFriend Mortgage, Truist, Easy Street Capital, Asset Based Lending, LendingOne, HouseMax Funding, Kiavi, RCN Capital, Groundfloor Finance, Civic Financial Services, CoreVest Finance, LoanBidz, Griffin Funding, Lima One Capital, Visio Lending, Angel Oak, Rehab Financial Group, Deephaven Mortgage, New Silver, HouseMax Funding DSCR, Kiavi DSCR, CapSource Lending
Return only valid JSON.`;
      const text = await callClaude(prompt);
      if (!text || text === "분석 실패" || text === "연결 오류") throw new Error("API 오류");
      const clean = text.replace(/```json|```/g, '').trim();
      const jsonStart = clean.indexOf('{');
      const jsonEnd = clean.lastIndexOf('}') + 1;
      const json = JSON.parse(clean.slice(jsonStart, jsonEnd));
      setLiveRates(json);
      setRateUpdatedAt(new Date().toLocaleString('ko-KR'));
    } catch(e) {
      console.error(e);
    }
    setRateRefreshing(false);
  };

  const D = deal;
  const lender = LENDERS[selectedLender];
  const renoRate = { Light: 30, Medium: 65, Heavy: 115 }[D.renoLevel];
  const renoCost = D.sqft * renoRate * 1.1;
  const arv = D.purchasePrice * 1.38;
  const loanAmt = D.purchasePrice * (ltv / 100);
  const monthlyRate = lender.rate / 100 / 12;
  const monthlyInterest = loanAmt * monthlyRate;
  const holdMonths = 6;
  const holdingCost = monthlyInterest * holdMonths + (D.propertyTax / 12) * holdMonths + 200 * holdMonths;
  const sellingCost = arv * 0.06 + arv * 0.015;
  const equity = D.purchasePrice * (1 - ltv / 100) + renoCost;
  const flipProfit = arv - D.purchasePrice - renoCost - holdingCost - sellingCost;
  const flipROI = (flipProfit / equity) * 100;

  const vacancy = D.estimatedRent * 0.08;
  const opex = D.estimatedRent * 0.12;
  const pm = D.estimatedRent * 0.09;
  const noi = D.estimatedRent * 12 - vacancy * 12 - opex * 12 - pm * 12 - D.propertyTax - D.hoa * 12;
  const capRate = (noi / D.purchasePrice) * 100;
  const annualDebt = monthlyInterest * 12 * 1.15;
  const dscr = noi / annualDebt;
  const monthlyCF = (noi - annualDebt) / 12;
  const coc = (monthlyCF * 12) / equity * 100;

  const verdict = flipROI >= 18 ? "FLIP" : monthlyCF >= 500 && dscr >= 1.2 ? "HOLD" : flipROI >= 12 ? "BOTH" : "PASS";
  const verdictClass = { FLIP: "flip", HOLD: "hold", BOTH: "both", PASS: "pass" }[verdict];
  const verdictColor = { FLIP: "#E2B84B", HOLD: "#4B8BFF", BOTH: "#34D399", PASS: "#F87171" }[verdict];

  const trackerBudget = tasks.reduce((s, t) => s + Number(t.budget || 0), 0);
  const trackerActual = tasks.reduce((s, t) => s + Number(t.actual || 0), 0);

  const matCategories = ["전체", ...new Set(MATERIALS.map(m => m.category))];
  const filteredMats = matFilter === "전체" ? MATERIALS : MATERIALS.filter(m => m.category === matFilter);

  const runAI = async (prompt) => {
    setAiLoading(true);
    const r = await callClaude(prompt);
    setAiResult(r);
    setAiLoading(false);
  };

  const updateTask = (id, field, val) => setTasks(t => t.map(x => x.id === id ? { ...x, [field]: val } : x));
  const nextStatus = (s) => ({ "대기": "진행중", "진행중": "완료", "완료": "대기" }[s]);

  return (
    <>
      <style>{S}</style>
      <div className="app">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="logo">
            <svg viewBox="0 0 180 44" style={{ width: "100%", marginBottom: 6 }} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="dg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFE08A" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#E2B84B" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <g transform="translate(2, 4) scale(0.38)">
                <path d="M25 35 L40 75 L50 55 L60 75 L75 35" fill="none" stroke="#E2B84B" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="85" cy="20" r="18" fill="url(#dg)"/>
                <circle cx="85" cy="20" r="6.5" fill="#FFE08A"/>
                <circle cx="83" cy="18" r="2" fill="white" opacity="0.7"/>
              </g>
              <text x="44" y="20" fontFamily="Georgia,Serif" fontSize="15" fontWeight="bold" letterSpacing="-0.5" fill="#FFFFFF">ISWELL</text>
              <text x="44" y="32" fontFamily="Arial,sans-serif" fontSize="6" fontWeight="900" letterSpacing="2.5" fill="#E2B84B">PROPERTIES</text>
            </svg>
            <div className="logo-title">NOVA</div>
            <div className="logo-sub">NoVA Acquisition System</div>
          </div>
          {TABS.map(t => (
            <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="nav-emoji">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </aside>

        {/* MAIN */}
        <div className="main">

          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-title">
              {TABS.find(t => t.id === tab)?.emoji} {lang === 'en' ? TABS.find(t => t.id === tab)?.labelEn : TABS.find(t => t.id === tab)?.labelKo}
              {D.address && <span style={{ fontSize: 12, color: "var(--dim)", fontWeight: 400, marginLeft: 8 }}>{D.address}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setLang(l => l === "ko" ? "en" : "ko")}
                style={{ padding: "6px 14px", borderRadius: 100, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "Sora,sans-serif", letterSpacing: "0.05em" }}>
                {lang === "ko" ? "🇺🇸 EN" : "🇰🇷 KO"}
              </button>
            <div className="topbar-stats">
              <div className="tstat">
                <div className="tstat-label">Verdict</div>
                <div className="tstat-val" style={{ color: verdictColor, fontSize: 18 }}>{verdict}</div>
              </div>
              <div className="tstat">
                <div className="tstat-label">Flip ROI</div>
                <div className={`tstat-val ${flipROI >= 18 ? "gold" : flipROI >= 10 ? "blue" : "red"}`}>{pct(flipROI)}</div>
              </div>
              <div className="tstat">
                <div className="tstat-label">월 현금흐름</div>
                <div className={`tstat-val ${monthlyCF >= 500 ? "green" : monthlyCF >= 0 ? "blue" : "red"}`}>{fmt(monthlyCF)}</div>
              </div>
            </div>
          </div>

          <div className="content">

            {/* ── 1. 매물 입력 ─────────────────────────────────────── */}
            {tab === "deal" && (
              <div>
                <div className="grid2" style={{ gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="card">
                      <div className="card-header"><span className="card-title">매물 기본 정보</span></div>
                      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="field">
                          <label className="label">주소</label>
                          <input className="input" placeholder="1234 Oak St, Fairfax, VA 22031" value={D.address} onChange={e => setDeal(d => ({ ...d, address: e.target.value }))} />
                        </div>
                        <div className="grid2">
                          <div className="field"><label className="label">매입가 ($)</label><input className="input" type="number" value={D.purchasePrice} onChange={e => setDeal(d => ({ ...d, purchasePrice: +e.target.value }))} /></div>
                          <div className="field"><label className="label">면적 (sqft)</label><input className="input" type="number" value={D.sqft} onChange={e => setDeal(d => ({ ...d, sqft: +e.target.value }))} /></div>
                        </div>
                        <div className="grid4">
                          <div className="field"><label className="label">연식</label><input className="input" type="number" value={D.yearBuilt} onChange={e => setDeal(d => ({ ...d, yearBuilt: +e.target.value }))} /></div>
                          <div className="field"><label className="label">Beds</label><input className="input" type="number" value={D.beds} onChange={e => setDeal(d => ({ ...d, beds: +e.target.value }))} /></div>
                          <div className="field"><label className="label">Baths</label><input className="input" type="number" value={D.baths} onChange={e => setDeal(d => ({ ...d, baths: +e.target.value }))} /></div>
                          <div className="field"><label className="label">HOA/월</label><input className="input" type="number" value={D.hoa} onChange={e => setDeal(d => ({ ...d, hoa: +e.target.value }))} /></div>
                        </div>
                        <div className="grid2">
                          <div className="field"><label className="label">예상 렌트 ($/월)</label><input className="input" type="number" value={D.estimatedRent} onChange={e => setDeal(d => ({ ...d, estimatedRent: +e.target.value }))} /></div>
                          <div className="field"><label className="label">재산세 ($/년)</label><input className="input" type="number" value={D.propertyTax} onChange={e => setDeal(d => ({ ...d, propertyTax: +e.target.value }))} /></div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header"><span className="card-title">수리 등급</span></div>
                      <div className="card-body">
                        <div className="reno-grid">
                          {["Light", "Medium", "Heavy"].map(l => (
                            <button key={l} className={`reno-btn ${D.renoLevel === l ? "active" : ""}`} onClick={() => setDeal(d => ({ ...d, renoLevel: l }))}>
                              {l}
                              <div style={{ fontSize: 9, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>${({ Light: 28, Medium: 65, Heavy: 115 }[l])}/sqft</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — Quick Summary */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className={`verdict ${verdictClass}`}>
                      <div className="verdict-badge" style={{ color: verdictColor }}>{verdict}</div>
                      <div className="verdict-text">
                        {verdict === "FLIP" && `Flip ROI ${pct(flipROI)} — 기준(18%) 충족. 6개월 내 예상 순이익 ${fmt(flipProfit)}`}
                        {verdict === "HOLD" && `월 현금흐름 ${fmt(monthlyCF)}, DSCR ${dscr.toFixed(2)} — Hold 조건 충족`}
                        {verdict === "BOTH" && `Flip ROI ${pct(flipROI)} / 월 CF ${fmt(monthlyCF)} — 두 전략 모두 가능`}
                        {verdict === "PASS" && `Flip ROI ${pct(flipROI)}, 월 CF ${fmt(monthlyCF)} — 기준 미달. 재검토 필요`}
                      </div>
                    </div>

                    <div className="grid2">
                      {[
                        { label: "예상 ARV", val: fmt(arv), cls: "gold" },
                        { label: "수리비 (10% 포함)", val: fmt(renoCost), cls: "blue" },
                        { label: "필요 자기자본", val: fmt(equity), cls: "blue" },
                        { label: "Flip 순이익", val: fmt(flipProfit), cls: flipProfit > 0 ? "green" : "red" },
                        { label: "Cap Rate", val: pct(capRate), cls: capRate >= 6 ? "green" : "blue" },
                        { label: "DSCR", val: dscr.toFixed(2), cls: dscr >= 1.2 ? "green" : "red" },
                      ].map(m => (
                        <div key={m.label} className="metric">
                          <div className="metric-label">{m.label}</div>
                          <div className={`metric-val ${m.cls}`}>{m.val}</div>
                        </div>
                      ))}
                    </div>

                    <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }}
                      disabled={aiLoading}
                      onClick={() => runAI(`Northern Virginia 부동산 투자 분석. 주소: ${D.address || "Fairfax VA"}, 매입가: ${fmt(D.purchasePrice)}, ARV: ${fmt(arv)}, Flip ROI: ${pct(flipROI)}, 월 현금흐름: ${fmt(monthlyCF)}, DSCR: ${dscr.toFixed(2)}. 한글로 투자 판단 3줄 요약.`)}>
                      {aiLoading ? <><div className="spinner" /> AI 분석 중...</> : "✦ AI 투자 판단"}
                    </button>

                    {aiResult && (
                      <div className="ai-box">
                        <div className="ai-header"><div className="ai-dot" /><span className="ai-label">AI 분석 결과</span></div>
                        <div className="ai-text">{aiResult}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. FLIP 분석 ──────────────────────────────────────── */}
            {tab === "flip" && (
              <div>
                <div className="grid2" style={{ gap: 20 }}>
                  <div className="card">
                    <div className="card-header"><span className="card-title">Flip 수익 계산</span></div>
                    <div className="card-body">
                      <table className="tbl">
                        <tbody>
                          {[
                            ["매입가", fmt(D.purchasePrice), ""],
                            ["수리비 (10% 포함)", fmt(renoCost), ""],
                            ["보유 비용 (6개월)", fmt(holdingCost), ""],
                            ["판매 수수료 (7.5%)", fmt(sellingCost), "red"],
                            ["총 투자비", fmt(D.purchasePrice + renoCost + holdingCost), ""],
                            ["예상 ARV", fmt(arv), "gold"],
                            ["순이익", fmt(flipProfit), flipProfit > 0 ? "green" : "red"],
                            ["자기자본 ROI", pct(flipROI), flipROI >= 18 ? "green" : flipROI >= 10 ? "gold" : "red"],
                            ["연환산 수익률", pct(flipROI / (holdMonths / 12)), flipROI >= 18 ? "green" : "blue"],
                          ].map(([label, val, cls]) => (
                            <tr key={label}><td>{label}</td><td className={cls || "mono"}>{val}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <div className="card" style={{ marginBottom: 16 }}>
                      <div className="card-header"><span className="card-title">스트레스 테스트</span></div>
                      <div className="card-body">
                        <div className="stress-grid">
                          {[
                            { label: "ARV -5%", val: fmt(arv * 0.95 - D.purchasePrice - renoCost - holdingCost - sellingCost * 0.95), ok: (arv * 0.95 - D.purchasePrice - renoCost - holdingCost - sellingCost * 0.95) > 0 },
                            { label: "ARV -10%", val: fmt(arv * 0.90 - D.purchasePrice - renoCost - holdingCost - sellingCost * 0.90), ok: (arv * 0.90 - D.purchasePrice - renoCost - holdingCost - sellingCost * 0.90) > 0 },
                            { label: "+60일 보유", val: fmt(flipProfit - monthlyInterest * 2), ok: (flipProfit - monthlyInterest * 2) > 0 },
                            { label: "수리비 +20%", val: fmt(arv - D.purchasePrice - renoCost * 1.2 - holdingCost - sellingCost), ok: (arv - D.purchasePrice - renoCost * 1.2 - holdingCost - sellingCost) > 0 },
                          ].map(s => (
                            <div key={s.label} className="stress-item">
                              <div className="stress-label">{s.label}</div>
                              <div className="stress-val" style={{ color: s.ok ? "var(--green)" : "var(--red)" }}>{s.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}
                      disabled={aiLoading}
                      onClick={() => runAI(`Flip 분석: 매입가 ${fmt(D.purchasePrice)}, ARV ${fmt(arv)}, 수리비 ${fmt(renoCost)}, 순이익 ${fmt(flipProfit)}, ROI ${pct(flipROI)}. Northern Virginia 시장 기준으로 이 딜의 핵심 리스크와 성공 조건을 한글로 설명해줘.`)}>
                      {aiLoading ? <><div className="spinner" />분석 중...</> : "✦ Flip 전략 AI 분석"}
                    </button>
                    {aiResult && <div className="ai-box"><div className="ai-header"><div className="ai-dot" /><span className="ai-label">AI 분석</span></div><div className="ai-text">{aiResult}</div></div>}
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. HOLD 분석 ──────────────────────────────────────── */}
            {tab === "hold" && (
              <div>
                <div className="grid2" style={{ gap: 20 }}>
                  <div className="card">
                    <div className="card-header"><span className="card-title">Hold 수익 계산 (연간)</span></div>
                    <div className="card-body">
                      <table className="tbl">
                        <tbody>
                          {[
                            ["월 렌트", fmt(D.estimatedRent), "gold"],
                            ["공실 손실 (8%)", fmt(-vacancy), "red"],
                            ["운영비 (12%)", fmt(-opex), "red"],
                            ["PM 비용 (9%)", fmt(-pm), "red"],
                            ["재산세", fmt(-D.propertyTax / 12) + "/월", "red"],
                            ["HOA", fmt(-D.hoa) + "/월", D.hoa > 0 ? "red" : ""],
                            ["월 대출 이자", fmt(-monthlyInterest * 1.15), "red"],
                            ["월 순현금흐름", fmt(monthlyCF), monthlyCF >= 500 ? "green" : monthlyCF >= 0 ? "blue" : "red"],
                            ["연 NOI", fmt(noi), "gold"],
                            ["Cap Rate", pct(capRate), capRate >= 6 ? "green" : "blue"],
                            ["Cash-on-Cash", pct(coc), coc >= 8 ? "green" : coc >= 4 ? "blue" : "red"],
                            ["DSCR", dscr.toFixed(2), dscr >= 1.2 ? "green" : "red"],
                          ].map(([label, val, cls]) => (
                            <tr key={label}><td>{label}</td><td className={cls || "mono"}>{val}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <div className="card" style={{ marginBottom: 16 }}>
                      <div className="card-header"><span className="card-title">Hold 스트레스 테스트</span></div>
                      <div className="card-body">
                        <div className="stress-grid">
                          {[
                            { label: "공실 2개월", val: fmt(monthlyCF - D.estimatedRent / 6), ok: (monthlyCF - D.estimatedRent / 6) > 0 },
                            { label: "렌트 -10%", val: fmt(monthlyCF - D.estimatedRent * 0.1), ok: (monthlyCF - D.estimatedRent * 0.1) > 0 },
                            { label: "유지비 +15%", val: fmt(monthlyCF - opex * 0.15), ok: (monthlyCF - opex * 0.15) > 0 },
                            { label: "세금 +10%", val: fmt(monthlyCF - D.propertyTax * 0.1 / 12), ok: (monthlyCF - D.propertyTax * 0.1 / 12) > 0 },
                          ].map(s => (
                            <div key={s.label} className="stress-item">
                              <div className="stress-label">{s.label}</div>
                              <div className="stress-val" style={{ color: s.ok ? "var(--green)" : "var(--red)" }}>{s.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header"><span className="card-title">5년 Equity 시나리오</span></div>
                      <div className="card-body">
                        <table className="tbl">
                          <tbody>
                            {[1, 2, 3, 5].map(yr => {
                              const appreciation = D.purchasePrice * Math.pow(1.04, yr) - D.purchasePrice;
                              const equity5 = equity + appreciation + (annualDebt * 0.2 * yr);
                              return <tr key={yr}><td>{yr}년 후 Equity</td><td className="green">{fmt(equity5)}</td></tr>;
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 4. 금융 비교 ──────────────────────────────────────── */}
            {tab === "finance" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {[
                    { key: "conventional", label: "🏦 일반 (Conventional)", color: "var(--blue)", desc: "낮은 금리 · 장기 안정" },
                    { key: "flip",         label: "📈 플립 (Fix & Flip)",    color: "var(--gold)", desc: "빠른 승인 · 높은 LTV" },
                    { key: "rental",       label: "🏠 임대 (DSCR/Rental)",   color: "var(--green)", desc: "소득검증 없음 · 장기" },
                  ].map(info => (
                    <button key={info.key} onClick={() => setFinCat(info.key)}
                      style={{ flex: 1, padding: "14px 10px", borderRadius: 14, border: "1px solid " + (finCat === info.key ? info.color : "var(--border)"), background: finCat === info.key ? info.color + "22" : "var(--bg2)", cursor: "pointer", fontFamily: "Sora,sans-serif", transition: "all 0.2s" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: finCat === info.key ? info.color : "var(--dim)", marginBottom: 3 }}>{info.label}</div>
                      <div style={{ fontSize: 9, color: "var(--dim)" }}>{info.desc}</div>
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--dim)" }}>
                    {rateUpdatedAt ? "🕐 업데이트: " + rateUpdatedAt : "실시간 금리 조회 가능"}
                  </div>
                  <button onClick={refreshRates} disabled={rateRefreshing}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100, border: "1px solid var(--gold)", background: "var(--gold)22", color: "var(--gold)", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>
                    {rateRefreshing ? <><div className="spinner"/>조회 중...</> : "🔄 금리 실시간 조회"}
                  </button>
                </div>

                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header"><span className="card-title">LTV 설정</span></div>
                  <div className="card-body">
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <input type="range" min={60} max={85} value={ltv} onChange={e => setLtv(+e.target.value)} style={{ flex: 1, accentColor: "var(--gold)" }} />
                      <span style={{ fontFamily: "DM Mono", fontSize: 20, color: "var(--gold)", minWidth: 60 }}>{ltv}%</span>
                      <span style={{ fontSize: 12, color: "var(--dim)" }}>대출 {fmt(D.purchasePrice * ltv / 100)}</span>
                    </div>
                  </div>
                </div>

                {LENDERS.filter(l => l.category === finCat).map((l, i) => {
                  const mi = D.purchasePrice * (l.ltv / 100) * (l.rate / 100 / 12);
                  const sixMo = mi * 6 + (D.propertyTax / 12) * 6;
                  const cc = finCat === "conventional" ? "var(--blue)" : finCat === "flip" ? "var(--gold)" : "var(--green)";
                  return (
                    <div key={i} className="card" style={{ marginBottom: 10 }}>
                      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--border)" }}>
                        <span style={{ background: "var(--bg4)", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: cc, flexShrink: 0 }}>{i+1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                            {l.name}
                            {l.badge && <span style={{ fontSize: 8, fontWeight: 800, padding: "3px 8px", borderRadius: 100, background: cc + "22", color: cc, letterSpacing: "0.1em" }}>{l.badge}</span>}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 2 }}>📞 {l.phone}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "DM Mono", fontSize: 20, color: cc, fontWeight: 600 }}>
                            {liveRates[l.name] ? liveRates[l.name] : l.rate}%
                            {liveRates[l.name] && <span style={{ fontSize: 9, color: "var(--green)", marginLeft: 4 }}>LIVE</span>}
                          </div>
                          <div style={{ fontSize: 9, color: "var(--dim)" }}>금리 · LTV {l.ltv}%</div>
                        </div>
                      </div>
                      <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontSize: 11, color: "var(--mid)", lineHeight: 1.6, borderLeft: "2px solid " + cc + "44", paddingLeft: 10 }}>{l.review}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", gap: 14 }}>
                            {[["월 이자", fmt(mi), cc], ["6개월 보유", fmt(sixMo), "var(--mid)"], ["클로징", l.speed, "var(--mid)"], ["Points", String(l.points), "var(--mid)"]].map(([label, val, color]) => (
                              <div key={label}>
                                <div style={{ fontSize: 8, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
                                <div style={{ fontFamily: "DM Mono", fontSize: 13, color }}>{val}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "var(--gold)" }}>{l.rating}</span>
                            <a href={"https://" + l.website} target="_blank" rel="noreferrer"
                              style={{ fontSize: 9, color: "var(--blue)", textDecoration: "none", background: "var(--blue2)", padding: "4px 10px", borderRadius: 100, fontWeight: 700 }}>웹사이트 →</a>
                            <a href={`mailto:${l.email || ""}?subject=Loan Inquiry - ISWELL PROPERTIES&body=Hello ${l.name},%0D%0A%0D%0AMy name is David Kim with ISWELL PROPERTIES.%0D%0AWe are interested in financing for a property we are acquiring.%0D%0A%0D%0A• Property Address: ${deal.address || "TBD"}%0D%0A• Purchase Price: $${deal.purchasePrice.toLocaleString()}%0D%0A• Lender: ${l.name}%0D%0A• Rate: ${l.rate}%%0D%0A• LTV: ${l.ltv}%%0D%0A• Closing Speed: ${l.speed}%0D%0A%0D%0AWe look forward to discussing the loan terms with you.%0D%0A%0D%0ABest regards,%0D%0ADavid Kim%0D%0AISWELL PROPERTIES%0D%0Aiswell.properties@gmail.com`}
                              style={{ fontSize: 9, color: "var(--green)", textDecoration: "none", background: "var(--green2)", padding: "4px 10px", borderRadius: 100, fontWeight: 700 }}>📧 문의</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-header"><span className="card-title">BRRRR 시나리오</span></div>
                  <div className="card-body">
                    <div className="grid4">
                      {[
                        { label: "초기 자기자본", val: fmt(equity) },
                        { label: "ARV 기준 재융자", val: fmt(arv * 0.75) },
                        { label: "Refi 후 회수", val: fmt(Math.max(0, arv * 0.75 - loanAmt)) },
                        { label: "잔여 자기자본", val: fmt(equity - Math.max(0, arv * 0.75 - loanAmt)) },
                      ].map(m => (
                        <div key={m.label} className="metric"><div className="metric-label">{m.label}</div><div className="metric-val gold">{m.val}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "contractor" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  {[
                    { key: "luxury", label: "🏆 Luxury / Heavy", color: "var(--gold)", sqftRange: "$80–$160/sqft" },
                    { key: "flip",   label: "📈 Flip / Medium",   color: "var(--blue)", sqftRange: "$45–$85/sqft" },
                    { key: "rental", label: "🏠 Rental / Light",  color: "var(--green)", sqftRange: "$15–$35/sqft" },
                  ].map(info => (
                    <button key={info.key} onClick={() => setGcCat(info.key)}
                      style={{ flex: 1, padding: "14px 10px", borderRadius: 14, border: "1px solid " + (gcCat === info.key ? info.color : "var(--border)"), background: gcCat === info.key ? info.color + "22" : "var(--bg2)", cursor: "pointer", fontFamily: "Sora,sans-serif" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: gcCat === info.key ? info.color : "var(--dim)", marginBottom: 4 }}>{info.label}</div>
                      <div style={{ fontSize: 10, color: "var(--dim)" }}>{info.sqftRange} · 10개사</div>
                    </button>
                  ))}
                </div>
                {CONTRACTORS.filter(c => c.category === gcCat).map((c, i) => {
                  const cc = gcCat === "luxury" ? "var(--gold)" : gcCat === "flip" ? "var(--blue)" : "var(--green)";
                  return (
                    <div key={i} className="card" style={{ marginBottom: 10 }}>
                      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--border)" }}>
                        <span style={{ background: "var(--bg4)", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: cc, flexShrink: 0 }}>{i+1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{c.name}</div>
                          <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 1 }}>{c.specialty}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "DM Mono", fontSize: 16, color: cc, fontWeight: 600 }}>{c.sqft}</div>
                          <div style={{ fontSize: 9, color: "var(--dim)" }}>per sqft</div>
                        </div>
                      </div>
                      <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontSize: 11, color: "var(--mid)", lineHeight: 1.6, borderLeft: "2px solid " + cc + "44", paddingLeft: 10 }}>{c.review}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", gap: 12 }}>
                            <span style={{ fontSize: 12, color: "var(--gold)" }}>{c.rating}</span>
                            <span style={{ fontSize: 11, color: "var(--dim)" }}>📞 {c.phone}</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div className="score-wrap" style={{ width: 100 }}>
                              <div className="score-bar"><div className="score-fill" style={{ width: c.score + "%" }} /></div>
                              <span style={{ fontFamily: "DM Mono", fontSize: 12, color: cc, minWidth: 28 }}>{c.score}</span>
                            </div>
                            <a href={"https://" + c.website} target="_blank" rel="noreferrer"
                              style={{ fontSize: 9, color: "var(--blue)", textDecoration: "none", background: "var(--blue2)", padding: "4px 10px", borderRadius: 100, fontWeight: 700 }}>웹사이트 →</a>
                            <a href={`mailto:${c.email || ""}?subject=Construction Estimate Request - ISWELL PROPERTIES&body=Hello ${c.name},%0D%0A%0D%0AMy name is David Kim with ISWELL PROPERTIES.
Email: iswell.properties@gmail.com%0D%0AWe are requesting a construction estimate for a property we are acquiring.%0D%0A%0D%0A• Property Address: ${deal.address || "TBD"}%0D%0A• Purchase Price: $${deal.purchasePrice.toLocaleString()}%0D%0A• Building Size: ${deal.sqft} sqft%0D%0A• Year Built: ${deal.yearBuilt}%0D%0A• Contractor: ${c.name}%0D%0A%0D%0APlease provide us with your estimate at your earliest convenience.%0D%0A%0D%0ABest regards,%0D%0ADavid Kim%0D%0AISWELL PROPERTIES%0D%0Aiswell.properties@gmail.com`}
                              style={{ fontSize: 9, color: "var(--green)", textDecoration: "none", background: "var(--green2)", padding: "4px 10px", borderRadius: 100, fontWeight: 700 }}>📧 견적요청</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                  disabled={aiLoading}
                  onClick={() => runAI("Northern Virginia 부동산 투자자. " + gcCat + " 건설사 계약 전 핵심 체크포인트 5가지 한글로.")}>
                  {aiLoading ? <><div className="spinner"/>분석 중...</> : "✦ AI 건설사 계약 가이드"}
                </button>
                {aiResult && <div className="ai-box" style={{ marginTop: 12 }}><div className="ai-header"><div className="ai-dot"/><span className="ai-label">AI 가이드</span></div><div className="ai-text">{aiResult}</div></div>}
              </div>
            )}
            {/* ── 6. 자재 단가 ──────────────────────────────────────── */}
            {tab === "materials" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {matCategories.map(c => (
                    <button key={c} className={`btn btn-sm ${matFilter === c ? "btn-gold" : "btn-ghost"}`} onClick={() => setMatFilter(c)}>{c}</button>
                  ))}
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Northern Virginia 자재 단가 (2025)</span>
                    <span style={{ fontSize: 10, color: "var(--dim)" }}>현재 등급: <span style={{ color: "var(--gold)" }}>{D.renoLevel}</span></span>
                  </div>
                  <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
                    <table className="tbl" style={{ minWidth: 500 }}>
                      <thead><tr><th>카테고리</th><th>자재/항목</th><th>단위</th><th>Light</th><th>Medium</th><th>Heavy</th><th>현재 등급 단가</th></tr></thead>
                      <tbody>
                        {filteredMats.map((m, i) => (
                          <tr key={i}>
                            <td><span className="badge badge-blue">{m.category}</span></td>
                            <td style={{ fontWeight: 600, color: "var(--text)" }}>{m.item}</td>
                            <td style={{ color: "var(--dim)", fontSize: 11 }}>{m.unit}</td>
                            <td className="mono">${m.light}</td>
                            <td className="mono">${m.medium}</td>
                            <td className="mono">${m.heavy}</td>
                            <td className="gold">${m[D.renoLevel.toLowerCase()]} / {m.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── 7. 공사 현황 ──────────────────────────────────────── */}
            {tab === "construction" && (
              <div>
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header">
                    <span className="card-title">공사 현황 트래커</span>
                    <div style={{ display: "flex", gap: 16 }}>
                      {[
                        { label: "총 예산", val: fmt(trackerBudget), cls: "gold" },
                        { label: "지출", val: fmt(trackerActual), cls: "blue" },
                        { label: "잔여", val: fmt(trackerBudget - trackerActual), cls: trackerBudget - trackerActual >= 0 ? "green" : "red" },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)" }}>{s.label}</div>
                          <div className={`tstat-val ${s.cls}`} style={{ fontSize: 16 }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card-body">
                    {/* Progress bar */}
                    <div style={{ background: "var(--bg4)", borderRadius: 4, height: 6, marginBottom: 20, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, trackerActual / (trackerBudget || 1) * 100)}%`, background: "linear-gradient(90deg, var(--blue), var(--green))", borderRadius: 4, transition: "width 0.3s" }} />
                    </div>

                    {/* Header */}
                    <div className="task-row" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4 }}>
                      {["공정명", "예산 ($)", "지출 ($)", "예정일", "상태", ""].map(h => (
                        <div key={h} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)" }}>{h}</div>
                      ))}
                    </div>

                    {tasks.map(t => (
                      <div key={t.id} className="task-row">
                        <input className="task-input" value={t.desc} onChange={e => updateTask(t.id, "desc", e.target.value)} />
                        <input className="task-input" type="number" value={t.budget} onChange={e => updateTask(t.id, "budget", e.target.value)} />
                        <input className="task-input" type="number" value={t.actual} onChange={e => updateTask(t.id, "actual", e.target.value)} style={{ color: "var(--blue)" }} />
                        <input className="task-input" type="date" value={t.due} onChange={e => updateTask(t.id, "due", e.target.value)} />
                        <button className={`status-pill status-${t.status === "대기" ? "pending" : t.status === "진행중" ? "progress" : "done"}`}
                          onClick={() => updateTask(t.id, "status", nextStatus(t.status))}>
                          {t.status}
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)", borderColor: "transparent" }}
                          onClick={() => setTasks(ts => ts.filter(x => x.id !== t.id))}>✕</button>
                      </div>
                    ))}

                    <div style={{ marginTop: 16 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setTasks(ts => [...ts, { id: Date.now(), desc: "새 공정", budget: 0, actual: 0, status: "대기", due: "" }])}>
                        + 공정 추가
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 8. 리스크 ─────────────────────────────────────────── */}
            {tab === "risk" && (
              <div>
                <div className="grid2" style={{ gap: 16, marginBottom: 16 }}>
                  {[
                    { label: "금리 리스크", val: `실질 이자율 ${lender.rate}%`, badge: lender.rate > 9 ? "HIGH" : lender.rate > 7.5 ? "MED" : "LOW", color: lender.rate > 9 ? "red" : lender.rate > 7.5 ? "gold" : "green" },
                    { label: "LTV 리스크", val: `현재 LTV ${ltv}%`, badge: ltv > 80 ? "HIGH" : ltv > 75 ? "MED" : "LOW", color: ltv > 80 ? "red" : ltv > 75 ? "gold" : "green" },
                    { label: "Flip ROI", val: pct(flipROI), badge: flipROI >= 18 ? "GOOD" : flipROI >= 10 ? "MED" : "LOW", color: flipROI >= 18 ? "green" : flipROI >= 10 ? "gold" : "red" },
                    { label: "DSCR", val: dscr.toFixed(2), badge: dscr >= 1.2 ? "GOOD" : dscr >= 1.0 ? "MED" : "RISK", color: dscr >= 1.2 ? "green" : dscr >= 1.0 ? "gold" : "red" },
                    { label: "월 현금흐름", val: fmt(monthlyCF), badge: monthlyCF >= 500 ? "GOOD" : monthlyCF >= 0 ? "MED" : "RISK", color: monthlyCF >= 500 ? "green" : monthlyCF >= 0 ? "gold" : "red" },
                    { label: "자본 필요액", val: fmt(equity), badge: equity < 200000 ? "LOW" : equity < 400000 ? "MED" : "HIGH", color: equity < 200000 ? "green" : equity < 400000 ? "gold" : "red" },
                  ].map(r => (
                    <div key={r.label} className="card">
                      <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div className="metric-label">{r.label}</div>
                          <div className="metric-val" style={{ color: `var(--${r.color})` }}>{r.val}</div>
                        </div>
                        <span className={`badge badge-${r.color === "green" ? "green" : r.color === "gold" ? "gold" : "red"}`}>{r.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginBottom: 16 }}
                  disabled={aiLoading}
                  onClick={() => runAI(`Northern Virginia 부동산 투자 리스크 분석. 매입가: ${fmt(D.purchasePrice)}, Flip ROI: ${pct(flipROI)}, DSCR: ${dscr.toFixed(2)}, 월 CF: ${fmt(monthlyCF)}, 금리: ${lender.rate}%. 한글로 주요 리스크 3가지와 대응 전략을 설명해줘.`)}>
                  {aiLoading ? <><div className="spinner" />...</> : "✦ AI 리스크 분석"}
                </button>
                {aiResult && <div className="ai-box"><div className="ai-header"><div className="ai-dot" /><span className="ai-label">AI 리스크 분석</span></div><div className="ai-text">{aiResult}</div></div>}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}


