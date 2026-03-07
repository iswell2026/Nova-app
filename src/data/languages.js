// ── NOVA languages.js ─────────────────────────────────────────────────────

const L = {
  ko: {
    tabLabel: (t) => t.labelKo,
    topbar: { monthlyCF: "월 현금흐름" },
    deal: {
      cardTitle: "매물 기본 정보", renoTitle: "수리 등급",
      address: "주소", purchasePrice: "매입가 ($)", area: "면적 (sqft)",
      yearBuilt: "연식", hoa: "HOA/월", estRent: "예상 렌트 ($/월)", propTax: "재산세 ($/년)",
    },
    verdict: {
      flip:  (roi, profit) => `Flip ROI ${roi} — 기준(18%) 충족. 6개월 내 예상 순이익 ${profit}`,
      hold:  (cf, dscr)   => `월 현금흐름 ${cf}, DSCR ${dscr} — Hold 조건 충족`,
      both:  (roi, cf)    => `Flip ROI ${roi} / 월 CF ${cf} — 두 전략 모두 가능`,
      pass:  (roi, cf)    => `Flip ROI ${roi}, 월 CF ${cf} — 기준 미달. 매입가 협상 필요`,
    },
    flip: {
      cardTitle: "Flip 수익 계산", stressTitle: "스트레스 테스트",
      aiBtn: "✦ Flip 전략 AI 분석", aiLabel: "AI 분석",
      rows: ["매입가","수리비 (10% 포함)","보유 비용 (6개월)","판매 수수료 (7.5%)","총 투자비","예상 ARV","순이익","자기자본 ROI","연환산 수익률"],
      stress: ["ARV -5%","ARV -10%","+60일 보유","수리비 +20%"],
    },
    hold: {
      cardTitle: "Hold 수익 계산 (연간)", stressTitle: "Hold 스트레스 테스트", equityTitle: "5년 Equity 시나리오",
      rows: ["월 렌트","공실 손실 (8%)","운영비 (12%)","PM 비용 (9%)","재산세","HOA","월 대출 이자","월 순현금흐름","연 NOI","Cap Rate","Cash-on-Cash","DSCR"],
      stress: ["공실 2개월","렌트 -10%","유지비 +15%","세금 +10%"],
      yearEquity: (yr) => `${yr}년 후 Equity`,
    },
    finance: {
      conventional: "🏦 일반 (Conventional)", conventionalDesc: "낮은 금리 · 장기 안정",
      flip: "📈 플립 ..", refreshBtn: "🔄 금리 실시간 조회",
      lenderMeta: ["월 이자","6개월 보유","클로징","Points"],
      website: "웹사이트 →", contact: "📧 문의",
    },
    brrrr: {
      title: "BRRRR 시나리오",
      labels: ["초기 자기자본","ARV 기준 재융자","Refi 후 회수","잔여 자기자본"],
    },
    contractor: {
      aiBtn: "✦ AI 건설사 계약 가이드", aiLabel: "AI 가이드",
      analyzing: "분석 중...",
      website: "웹사이트 →", contact: "📧 견적요청",
    },
    materials: {
      cardTitle: "Northern Virginia 자재 단가 (2025)",
      gradeLabel: (g) => `현재 등급: ${g}`,
      headers: ["카테고리","자재/항목","단위","Light","Medium","Heavy","현재 등급 단가"],
    },
    construction: {
      cardTitle: "공사 현황 트래커",
      budget: "총 예산", spent: "지출", remaining: "잔여",
      headers: ["공정명","예산 ($)","지출 ($)","예정일","상태",""],
      addBtn: "+ 공정 추가",    bedsLabel: "침실", bathsLabel: "욕실", renoLabel: "수리 등급",
      analyzeBtn: "🔍 AI 딜 스크리닝", analyzing: "분석 중...",
      verdictLabel: "판정", risksLabel: "Top 3 리스크", roiLabel: "ROI 범위",
      goLabel: "GO", passLabel: "PASS", watchLabel: "WATCH",
    },
    mycheck: {
      cardTitle: "내 물건 점검", subTitle: "매각 vs 임대 분석",
      purchaseLabel: "매입가 ($)", renoLabel: "공사비 ($)",
      loanLabel: "대출금액 ($)", rateLabel: "금리 (%)",
      holdLabel: "보유 기간 (개월)", rentLabel: "월 렌트 ($)",
      arvLabel: "현재 ARV ($)",
      analyzeBtn: "💼 AI 매각 vs 임대 분석", analyzing: "분석 중...",
      sellLabel: "지금 매각", holdLabel2: "임대 유지",
      breakevenLabel: "손익분기", verdictLabel: "AI 추천",
    },
  },
  en: {
    tabLabel: (t) => t.labelEn,
    topbar: { monthlyCF: "Monthly CF" },
    deal: {
      cardTitle: "Property Info", renoTitle: "Reno Level",
      address: "Address)",
    },
    verdict: {
      flip:  (roi, profit) => `Flip ROI ${roi} — ≥18% ✓. Est. net profit ${profit} in 6mo`,
      hold:  (cf, dscr)   => `Monthly CF ${cf}, DSCR ${dscr} — Hold criteria met`,
      both:  (roi, cf)    => `Flip ROI ${roi} / Monthly CF ${cf} — Both strategies viable`,
      pass:  (roi, cf)    => `Flip ROI ${roi}, Monthly CF ${cf} — Below threshold. Review needed`,
    },
    metrics: { arv: "Est. ARV", renoCost: "Reno Cost (+10%)", equity: "Required Equity", flipProfit: "Net Flip Profit" },
    ai: { analyzing: "AI Analyzing...", analyzing2: "Analyzing...", dealBtn: "✦ AI Analysis", resultLabel: "AI Analysis" },
    flip: {
      cardTitle: "Flip P&L", stressTitle: "Stress Test",
      aiBtn: "✦ AI Flip Strategy", aiLabel: "AI Analysis",
      rows: ["Purchase Price","Reno Cost (+10%)","Holding Cost (6mo)","Selling Fee (7.5%)","Total Cost","Est. ARV","Net Profit","Equity ROI","Annual ROI"],
      stress: ["ARV -5%","ARV -10%","+60d Hold","Reno +20%"],
    },
    hold: {
      cardTitle: "Hold P&L (Annual)", stressTitle: "Hold Stress Test", equityTitle: "5-Year Equity",
      rows: ["Monthly Rent","Vacancy (8%)","OpEx (12%)","PM Fee (9%)","Property Tax","HOA","Monthly Interest","Monthly CF","Annual NOI","Cap Rate","Cash-on-Cash","DSCR"],
      stress: ["2-mo Vacancy","Rent -10%","Maint. +15%","Tax +10%"],
      yearEquity: (yr) => `Equity After ${yr}yr`,
    },
    finance: {
      conventional: "🏦 Conventional", conventionalDesc: "Low rate · Long-term stable",
      flip: "📈 Fix & Flip", flipDesc: "Fast approval · High LTV",
      rental: "🏠 DSCR/Rental", rentalDesc: "No income verify · Long-term",
      ltvTitle: "LTV Setting", loanLabel: "Loan",
      rateLabel: "Rate · LTV",
      updated: (t) => `🕐 Updated: ${t}`, noUpdate: "Live rate lookup available",
      refreshing: "Loading...", refreshBtn: "🔄 Refresh Rates",
      lenderMeta: ["Mo. Interest","6mo Hold","Closing","Points"],
      website: "Website →", contact: "📧 Inquire",
    },
    brrrr: {
      title: "BRRRR Analysis",
      labels: ["Initial Equity","Refi (ARV-based)","Refi Proceeds","Remaining Equity"],
    },
    contractor: {
      aiBtn: "✦ AI Contractor Guide", aiLabel: "AI Guide",
      analyzing: "Analyzing...",
      website: "Website →", contact: "📧 Request Quote",
    },
    materials: {
      cardTitle: "Northern Virginia Material Prices (2025)",
      gradeLabel: (g) => `Current Grade: ${g}`,
      headers: ["Category","Material/Item","Unit","Light","Medium","Heavy","Current Grade"],
    },
    construction: {
      cardTitle: "Construction Tracker",
      budget: "Budget", spent: "Spent", remaining: "Remaining",
      headers: ["Task","Budget ($)","Actual ($)","Due Date","Status",""],
      addBtn: "+ Add Task", newTask: "New Task",
      statuses: { pending: "Pending", progress: "In Progress", done: "Done" },
    },
    screen: {
      cardTitle: "Deal Screening", placeholder: "Paste Zillow/MLS URL or enter address + price",
      urlLabel: "Property URL / Address", priceLabel: "Asking Price ($)", sqftLabel: "Sqft",
      bedsLabel: "Beds", bathsLabel: "Baths", renoLabel: "Reno Level",
      analyzeBtn: "🔍 AI Screen This Deal", analyzing: "Screening...",
      verdictLabel: "Verdict", risksLabel: "Top 3 Risks", roiLabel: "ROI Range",
      goLabel: "GO", passLabel: "PASS", watchLabel: "WATCH",
    },
    mycheck: {
      cardTitle: "My Property Check", subTitle: "Sell vs Hold Analysis",
      purchaseLabel: "Purchase Price ($)", renoLabel: "Reno Cost ($)",
      loanLabel: "Loan Amount ($)", rateLabel: "Interest Rate (%)",
      holdLabel: "Hold Period (months)", rentLabel: "Monthly Rent ($)",
      arvLabel: "Current ARV ($)",
      analyzeBtn: "💼 AI Sell vs Hold Analysis", analyzing: "Analyzing...",
      sellLabel: "Sell Now", holdLabel2: "Hold & Rent",
      breakevenLabel: "Breakeven", verdictLabel: "AI Recommendation",
    },
  },
};

const fmt = (n) => "$" + Math.round(n).toLocaleString();
const pct = (n) => n.toFixed(1) + "%";

export { L, fmt, pct };
