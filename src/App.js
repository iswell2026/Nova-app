import { useState, useEffect } from "react";
import { MATERIALS, LENDERS, CONTRACTORS, TABS, CATEGORY_EN, BADGE_EN, REVIEW_EN, CONTRACTOR_REVIEW_EN } from "./data/constants";
import { L, fmt, pct } from "./data/languages";
async function callClaude(prompt) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
    });
    const data = await res.json();
    return data.content?.[0]?.text || "분석 실패";
  } catch(e) { return "연결 오류"; }
}


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

/* STRESS TEST TAB */
.stress-section{display:flex;flex-direction:column;gap:16px;}
.stress-baseline{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.stress-tbl-wrap{overflow-x:auto;}
.stress-delta{font-size:9px;margin-left:3px;font-family:'DM Mono',monospace;}
.stress-delta.pos{color:var(--green);}
.stress-delta.neg{color:var(--red);}
.stress-row-worst{background:rgba(248,113,113,0.04);}
.stress-group-header{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold);opacity:0.75;padding:8px 14px 4px;background:var(--bg3);}
@media(max-width:768px){.stress-baseline{grid-template-columns:1fr 1fr!important;}}

/* SPINNER */
.spinner{width:14px;height:14px;border:2px solid rgba(226,184,75,0.2);border-top-color:var(--gold);border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0;}
.spinner-blue{border-color:rgba(75,139,255,0.2);border-top-color:var(--blue);}
@keyframes spin{to{transform:rotate(360deg);}}

.section-title{font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);opacity:0.6;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.divider{height:1px;background:var(--border);margin:20px 0;}
.space{height:16px;}
/* MOBILE RESPONSIVE */
/* Hide sidebar lang btn on desktop (it's in topbar there) */
.lang-sidebar-btn{display:none;}
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
  /* Show lang btn in mobile tabbar */
  .lang-sidebar-btn{display:flex;}
  /* Hide topbar lang btn on mobile (it's in the tabbar) */
  .topbar-lang-btn{display:none!important;}
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
  const [lang, setLang] = useState("ko");

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
    { id: 1, descKo: "철거 및 폐기물",    descEn: "Demo & Debris",               budget: 5000,  actual: 0, status: "pending", due: "" },
    { id: 2, descKo: "배관/전기 Rough-in", descEn: "Plumbing/Electric Rough-in",  budget: 12000, actual: 0, status: "pending", due: "" },
    { id: 3, descKo: "드라이월/도장",      descEn: "Drywall/Paint",               budget: 15000, actual: 0, status: "pending", due: "" },
    { id: 4, descKo: "주방/욕실 Fixtures", descEn: "Kitchen/Bath Fixtures",        budget: 25000, actual: 0, status: "pending", due: "" },
    { id: 5, descKo: "바닥재/마감",        descEn: "Flooring/Finish",             budget: 18000, actual: 0, status: "pending", due: "" },
  ]);

  // AI
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [matFilter, setMatFilter] = useState("전체");
  const [gcCat, setGcCat] = useState("luxury");
  const [finCat, setFinCat] = useState("conventional");
  const [rateRefreshing, setRateRefreshing] = useState(false);
  const [rateUpdatedAt, setRateUpdatedAt] = useState(null);
  const [rateError, setRateError] = useState(null);
  const [liveRates, setLiveRates] = useState({});

  // 딜 스크리닝
  const [screenInput, setScreenInput] = useState({ url: "", price: 650000, sqft: 2200, beds: 4, baths: 2, reno: "Medium" });
  const [screenLoading, setScreenLoading] = useState(false);
  const [screenResult, setScreenResult] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // 내 물건 점검
  const [myProp, setMyProp] = useState({ purchase: 650000, reno: 80000, loan: 520000, rate: 7.0, holdMonths: 12, rent: 3200, arv: 750000 });
  const [myCheckLoading, setMyCheckLoading] = useState(false);
  const [myCheckResult, setMyCheckResult] = useState(null);

  const refreshRates = async () => {
    setRateRefreshing(true);
    setRateError(null);
    try {
      const lenderNames = LENDERS.map(l => l.name).join(', ');
      const prompt = `You are a real estate lending expert. Return ONLY a JSON object (no markdown, no explanation, no code block) with estimated 2025 interest rates for these lenders in Northern Virginia. Use the EXACT lender name as the key. Format: {"LenderName": rate_as_number}\nLenders: ${lenderNames}\nReturn only valid JSON, nothing else.`;
      const text = await callClaude(prompt);
      if (!text || text === "분석 실패" || text === "연결 오류" || text.startsWith("오류:")) throw new Error(text || "API 연결 실패");
      const clean = text.replace(/```json|```/g, '').trim();
      const jsonStart = clean.indexOf('{');
      const jsonEnd = clean.lastIndexOf('}') + 1;
      if (jsonStart === -1) throw new Error(`응답 오류: ${clean.slice(0, 80)}`);
      const json = JSON.parse(clean.slice(jsonStart, jsonEnd));
      setLiveRates(json);
      setRateUpdatedAt(new Date().toLocaleString('ko-KR'));
    } catch(e) {
      console.error(e);
      setRateError(e.message || "금리 조회 실패");
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


  const parseZillowUrl = async (url) => {
    if (!url || url.trim().length < 5) return;
    setScreenLoading(true);
    try {
      const text = await callClaude('You are a real estate data assistant. Given this property URL or address: ' + url + '. Extract the LISTING PRICE (seller asking price), sqft, beds, baths. Return ONLY JSON: {"price":number,"sqft":number,"beds":number,"baths":number}. No markdown, no explanation.');
      const clean = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}')+1));
      setScreenInput(s => ({ ...s, price: data.price||s.price, sqft: data.sqft||s.sqft, beds: data.beds||s.beds, baths: data.baths||s.baths }));
    } catch(e) { console.error(e); }
    setScreenLoading(false);
  };
  const runAI = async (prompt) => {
    setAiLoading(true);
    const r = await callClaude(prompt);
    setAiResult(r);
    setAiLoading(false);
  };

  const updateTask = (id, field, val) => setTasks(t => t.map(x => x.id === id ? { ...x, [field]: val } : x));
  const nextStatus = (s) => {
    const map = { "pending": "progress", "progress": "done", "done": "pending" };
    return map[s] || "pending";
  };
  const t$ = L[lang]; // shorthand for current language

  // lang 전환 시 AI 결과 초기화 (언어 불일치 방지)
  useEffect(() => { setAiResult(""); setMyCheckResult(null); setScreenResult(null); setShowDetail(false); }, [lang]);

  // ── 딜 연동 헤더 (Flip / Hold / Stress 탭 공통) ────────────────────────
  const PropHeader = () => {
    const ko = lang === "ko";
    const hasAddr = D.address && D.address.trim().length > 0;
    const chips = [
      { label: ko ? "매입가" : "Purchase",  val: fmt(D.purchasePrice) },
      { label: ko ? "면적"   : "Sqft",      val: D.sqft.toLocaleString() + " sqft" },
      { label: ko ? "수리"   : "Reno",      val: D.renoLevel },
      { label: ko ? "침실/욕실" : "Bd/Ba",  val: `${D.beds}bd / ${D.baths}ba` },
      { label: ko ? "예상렌트" : "Est.Rent", val: fmt(D.estimatedRent) + "/mo" },
      { label: ko ? "재산세"  : "Tax/yr",   val: fmt(D.propertyTax) },
    ];
    return (
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border2)",
        borderRadius: 14, padding: "12px 18px", marginBottom: 16,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: hasAddr ? "var(--text)" : "var(--dim)" }}>
              {hasAddr ? D.address : (ko ? "주소 미입력" : "No address entered")}
            </span>
          </div>
          <button
            onClick={() => setTab("deal")}
            style={{
              background: "transparent", border: "1px solid var(--border2)",
              color: "var(--gold)", borderRadius: 8, padding: "3px 12px",
              fontSize: 9, fontWeight: 700, cursor: "pointer",
              letterSpacing: "0.1em", fontFamily: "'Sora',sans-serif",
            }}
          >
            ✎ {ko ? "딜 탭 수정" : "Edit in Deal"}
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {chips.map((c, i) => (
            <div key={i} style={{
              background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "4px 10px", display: "flex", gap: 5, alignItems: "center",
            }}>
              <span style={{ fontSize: 8, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{c.label}</span>
              <span style={{ fontSize: 11, color: "var(--text)", fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>{c.val}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── STRESS TEST helper ────────────────────────────────────────────────────
  const calcStress = (arvMult = 1, renoMult = 1, extraMonths = 0, rateDelta = 0, extraVacMo = 0) => {
    const sArv      = arv * arvMult;
    const sReno     = renoCost * renoMult;
    const sRate     = (lender.rate + rateDelta) / 100 / 12;
    const sMonthly  = loanAmt * sRate;
    const sHold     = holdMonths + extraMonths;
    const sHoldCost = sMonthly * sHold + (D.propertyTax / 12) * sHold + 200 * sHold;
    const sEquity   = D.purchasePrice * (1 - ltv / 100) + sReno;
    const sFlipPro  = sArv - D.purchasePrice - sReno - sHoldCost - sArv * 0.075;
    const sFlipROI  = (sFlipPro / sEquity) * 100;
    const sVac      = vacancy + (extraVacMo * D.estimatedRent / 12);
    const sNoi      = D.estimatedRent * 12 - sVac * 12 - opex * 12 - pm * 12 - D.propertyTax - D.hoa * 12;
    const sDebt     = sMonthly * 12 * 1.15;
    return {
      flipProfit: sFlipPro,
      flipROI:    sFlipROI,
      monthlyCF:  (sNoi - sDebt) / 12,
      dscr:       sDebt > 0 ? sNoi / sDebt : 0,
    };
  };
  const stressStatus = (s) => {
    if (s.flipROI >= 15 && s.dscr >= 1.2 && s.monthlyCF >= 0)        return { icon: "✅", label: "OK",    color: "var(--green)" };
    if (s.flipROI >= 8  || (s.dscr >= 1.0 && s.monthlyCF >= -500))   return { icon: "⚠️", label: "WATCH", color: "var(--gold)"  };
    return                                                              { icon: "❌", label: "FAIL",  color: "var(--red)"   };
  };

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
              {t$?.tabLabel(t)}
            </button>
          ))}
          {/* Lang toggle in sidebar (visible on mobile tabbar) */}
          <button
            className="nav-btn lang-sidebar-btn"
            onClick={() => setLang(l => l === "ko" ? "en" : "ko")}
            title={lang === "ko" ? "Switch to English" : "한국어로 전환"}
          >
            <span className="nav-emoji" style={{fontSize:16}}>🌐</span>
            {lang === "ko" ? "EN" : "KO"}
          </button>
        </aside>

        {/* MAIN */}
        <div className="main">

          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-title">
              {TABS.find(t => t.id === tab)?.emoji} {t$?.tabLabel(TABS.find(t => t.id === tab))}
              <button className="topbar-lang-btn" onClick={() => setLang(l => l === "ko" ? "en" : "ko")} style={{marginLeft:12,padding:"4px 16px",borderRadius:100,border:"1px solid rgba(255,255,255,0.25)",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:"0.1em",backdropFilter:"blur(4px)"}}>{lang === "ko" ? "EN" : "KO"}</button>
              {D.address && <span style={{ fontSize: 12, color: "var(--dim)", fontWeight: 400, marginLeft: 8 }}>{D.address}</span>}
            </div>
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
                <div className="tstat-label">{t$?.topbar.monthlyCF}</div>
                <div className={`tstat-val ${monthlyCF >= 500 ? "green" : monthlyCF >= 0 ? "blue" : "red"}`}>{fmt(monthlyCF)}</div>
              </div>
            </div>
          </div>

          <div className="content">

            {/* ── 1. 매물 입력 ─────────────────────────────────────── */}
            {tab === "deal" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* ── STEP 1: 빠른 스크리닝 입력 ── */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">🔍 {lang === "ko" ? "빠른 딜 스크리닝" : "Quick Deal Screen"}</span>
                    <span style={{ fontSize: 11, color: "var(--dim)" }}>{lang === "ko" ? "나쁜 딜 빠르게 걸러내기" : "Fast bad deal filter"}</span>
                  </div>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* URL / 주소 */}
                    <div className="field">
                      <label className="label">{lang === "ko" ? "Zillow/MLS URL 또는 주소 직접 입력" : "Zillow/MLS URL or Address"}</label>
                      <input className="input" placeholder={lang === "ko" ? "예: zillow.com/... 또는 123 Oak St, Fairfax VA" : "e.g. zillow.com/... or 123 Oak St, Fairfax VA"}
                        value={screenInput.url} onChange={e => setScreenInput(s => ({ ...s, url: e.target.value }))} onPaste={e => { const v = e.clipboardData.getData('text'); setScreenInput(s => ({ ...s, url: v })); setTimeout(() => parseZillowUrl(v), 100); }} />
                      <button className='btn btn-gold' onClick={() => parseZillowUrl(screenInput.url)} disabled={screenLoading} style={{width:'100%',justifyContent:'center',marginTop:8}}>{screenLoading ? '파싱중...' : '🔍 주소/URL 자동입력'}</button>
                      <button className='btn btn-ghost' onClick={() => parseZillowUrl(screenInput.url)} disabled={screenLoading} style={{marginTop:6,borderColor:'var(--border2)',color:'var(--gold)'}}>{screenLoading ? '파싱중...' : '🔍 자동입력'}</button>
                    </div>
                    {/* 기본 정보 */}
                    <div className="grid4" style={{ gap: 10 }}>
                      {[
                        { label: lang === "ko" ? "매입 희망가 ($)" : "Asking Price ($)", key: "price" },
                        { label: "Sqft", key: "sqft" },
                        { label: lang === "ko" ? "침실" : "Beds", key: "beds" },
                        { label: lang === "ko" ? "욕실" : "Baths", key: "baths" },
                      ].map(({ label, key }) => (
                        <div key={key} className="field">
                          <label className="label">{label}</label>
                          <input className="input" type="number" value={screenInput[key]} onChange={e => setScreenInput(s => ({ ...s, [key]: +e.target.value }))} />
                        </div>
                      ))}
                    </div>
                    {/* 수리 등급 */}
                    <div>
                      <label className="label">{lang === "ko" ? "수리 등급" : "Reno Level"}</label>
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        {["Light","Medium","Heavy"].map(r => (
                          <button key={r} onClick={() => setScreenInput(s => ({ ...s, reno: r }))}
                            style={{ padding: "6px 18px", borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: "pointer",
                              border: `1px solid ${screenInput.reno === r ? "var(--gold)" : "var(--border)"}`,
                              background: screenInput.reno === r ? "var(--gold)22" : "transparent",
                              color: screenInput.reno === r ? "var(--gold)" : "var(--dim)" }}>
                            {r} <span style={{ fontWeight: 400, opacity: 0.7 }}>${({Light:28,Medium:65,Heavy:115}[r])}/sqft</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* 스크리닝 버튼 */}
                    <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }}
                      disabled={screenLoading}
                      onClick={async () => {
                        setScreenLoading(true); setScreenResult(null); setShowDetail(false);
                        const p = screenInput;
                        const prompt = lang === "ko"
                          ? `당신은 NoVA(Northern Virginia) 부동산 투자 전문가입니다. ISWELL 기준(Flip ROI ≥18%, 월 현금흐름 ≥$500, DSCR ≥1.2)으로 이 매물을 분석하세요.
매물: ${p.url || "NoVA 매물"}, 매입 희망가: $${Number(p.price).toLocaleString()}, 면적: ${p.sqft}sqft, 침실: ${p.beds}/${p.baths}욕실, 수리: ${p.reno}
반드시 유효한 JSON만 반환하세요 (마크다운 없이): {"verdict":"GO|WATCH|PASS","verdictReason":"한 문장 판단 이유","risks":["주요 리스크1","주요 리스크2","주요 리스크3"],"roiRange":{"optimistic":"X%","realistic":"Y%","worst":"Z%"},"maxFlipPrice":숫자,"maxHoldPrice":숫자,"recommendation":"2-3문장 투자 추천"}
maxFlipPrice = Flip ROI 18% 달성을 위한 최대 매입가. maxHoldPrice = 월 $500+ 현금흐름을 위한 최대 매입가. 모든 텍스트 필드는 반드시 한국어로 작성.`
                          : `You are a NoVA real estate investment expert. Analyze this deal strictly using ISWELL criteria (Flip ROI ≥18%, Monthly CF ≥$500, DSCR ≥1.2) for Northern Virginia market.
Property: ${p.url || "NoVA property"}, Asking: $${Number(p.price).toLocaleString()}, Sqft: ${p.sqft}, Beds: ${p.beds}/${p.baths}ba, Reno: ${p.reno}
Return ONLY valid JSON (no markdown): {"verdict":"GO|WATCH|PASS","verdictReason":"one sentence reason","risks":["top risk1","top risk2","top risk3"],"roiRange":{"optimistic":"X%","realistic":"Y%","worst":"Z%"},"maxFlipPrice":number,"maxHoldPrice":number,"recommendation":"2-3 sentence recommendation"}
maxFlipPrice = max purchase price to achieve 18% flip ROI. maxHoldPrice = max purchase price for $500+/mo cash flow.`;
                        const text = await callClaude(prompt);
                        try {
                          const clean = text.replace(/```json|```/g, '').trim();
                          const j = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1));
                          setScreenResult(j);
                        } catch { setScreenResult({ verdict: "PASS", verdictReason: text, risks: [], roiRange: {}, recommendation: text }); }
                        setScreenLoading(false);
                      }}>
                      {screenLoading ? <><div className="spinner" />{lang === "ko" ? "분석 중..." : "Screening..."}</> : lang === "ko" ? "🔍 AI 딜 스크리닝" : "🔍 AI Screen This Deal"}
                    </button>
                  </div>
                </div>

                {/* ── STEP 2: 스크리닝 결과 ── */}
                {screenResult && (
                  <div className="card">
                    <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {/* 판정 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 16, background: screenResult.verdict === "GO" ? "var(--green)18" : screenResult.verdict === "WATCH" ? "var(--gold)18" : "var(--red)18", borderRadius: 12, padding: "16px 20px" }}>
                        <div style={{ fontSize: 40, fontWeight: 900, color: screenResult.verdict === "GO" ? "var(--green)" : screenResult.verdict === "WATCH" ? "var(--gold)" : "var(--red)", minWidth: 80 }}>{screenResult.verdict}</div>
                        <div style={{ fontSize: 13, color: "var(--mid)", lineHeight: 1.6 }}>{screenResult.verdictReason}</div>
                      </div>

                      {/* PASS → 목표 매입가 역산 */}
                      {(screenResult.verdict === "PASS" || screenResult.verdict === "WATCH") && (screenResult.maxFlipPrice || screenResult.maxHoldPrice) && (
                        <div>
                          <div className="metric-label" style={{ marginBottom: 8 }}>
                            {lang === "ko" ? "💡 GO 되려면 얼마에 사야 할까?" : "💡 What price makes this a GO?"}
                          </div>
                          <div className="grid2" style={{ gap: 10 }}>
                            {screenResult.maxFlipPrice && (
                              <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "12px 14px" }}>
                                <div className="metric-label">Flip 18% 달성 최대가</div>
                                <div className="metric-val green" style={{ fontSize: 20 }}>{fmt(screenResult.maxFlipPrice)}</div>
                                <div style={{ fontSize: 10, color: "var(--red)", marginTop: 4 }}>
                                  현재가 대비 {fmt(Number(screenInput.price) - screenResult.maxFlipPrice)} ({(((Number(screenInput.price) - screenResult.maxFlipPrice) / Number(screenInput.price)) * 100).toFixed(1)}%) 할인 필요
                                </div>
                              </div>
                            )}
                            {screenResult.maxHoldPrice && (
                              <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "12px 14px" }}>
                                <div className="metric-label">Hold CF $500+ 최대가</div>
                                <div className="metric-val blue" style={{ fontSize: 20 }}>{fmt(screenResult.maxHoldPrice)}</div>
                                <div style={{ fontSize: 10, color: "var(--red)", marginTop: 4 }}>
                                  현재가 대비 {fmt(Number(screenInput.price) - screenResult.maxHoldPrice)} ({(((Number(screenInput.price) - screenResult.maxHoldPrice) / Number(screenInput.price)) * 100).toFixed(1)}%) 할인 필요
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Top 3 리스크 */}
                      {screenResult.risks?.length > 0 && (
                        <div>
                          <div className="metric-label" style={{ marginBottom: 8 }}>{lang === "ko" ? "Top 3 리스크" : "Top 3 Risks"}</div>
                          {screenResult.risks.map((r, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                              <span style={{ color: "var(--red)", fontWeight: 800, fontSize: 12, minWidth: 18 }}>{i+1}.</span>
                              <span style={{ fontSize: 12, color: "var(--mid)", lineHeight: 1.5 }}>{r}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ROI Range */}
                      {screenResult.roiRange && Object.keys(screenResult.roiRange).length > 0 && (
                        <div>
                          <div className="metric-label" style={{ marginBottom: 8 }}>{lang === "ko" ? "ROI 범위" : "ROI Range"}</div>
                          <div style={{ display: "flex", gap: 10 }}>
                            {[["Optimistic","optimistic","green"],["Realistic","realistic","gold"],["Worst","worst","red"]].map(([label, key, color]) => (
                              <div key={key} style={{ flex: 1, textAlign: "center", background: "var(--bg3)", borderRadius: 10, padding: "10px 8px" }}>
                                <div style={{ fontSize: 9, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: `var(--${color})` }}>{screenResult.roiRange[key] || "—"}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI 추천 */}
                      {screenResult.recommendation && (
                        <div className="ai-box"><div className="ai-header"><div className="ai-dot" /><span className="ai-label">{lang === "ko" ? "AI 추천" : "AI Recommendation"}</span></div><div className="ai-text">{screenResult.recommendation}</div></div>
                      )}

                      {/* GO/WATCH → 상세 분석 버튼 */}
                      {(screenResult.verdict === "GO" || screenResult.verdict === "WATCH") && (
                        <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }}
                          onClick={() => {
                            setDeal(d => ({ ...d,
                              address: screenInput.url,
                              purchasePrice: Number(screenInput.price),
                              sqft: Number(screenInput.sqft),
                              beds: Number(screenInput.beds),
                              baths: Number(screenInput.baths),
                              renoLevel: screenInput.reno,
                            }));
                            setShowDetail(true);
                          }}>
                          {lang === "ko" ? "📊 상세 분석 시작 (Flip / Hold 탭 연동)" : "📊 Start Detailed Analysis"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 3: 상세 분석 (GO/WATCH 통과 후) ── */}
                {showDetail && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", opacity: 0.7, marginBottom: 12 }}>
                      {lang === "ko" ? "📊 상세 분석 — Flip / Hold / 리스크 탭 연동" : "📊 Detailed Analysis — connected to Flip / Hold / Risk tabs"}
                    </div>
                    <div className="grid2" style={{ gap: 20 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="card">
                          <div className="card-header"><span className="card-title">{t$?.deal.cardTitle}</span></div>
                          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div className="field">
                              <label className="label">{t$?.deal.address}</label>
                              <input className="input" placeholder="1234 Oak St, Fairfax, VA 22031" value={D.address} onChange={e => setDeal(d => ({ ...d, address: e.target.value }))} />
                            </div>
                            <div className="grid2">
                              <div className="field"><label className="label">{t$?.deal.purchasePrice}</label><input className="input" type="number" value={D.purchasePrice} onChange={e => setDeal(d => ({ ...d, purchasePrice: +e.target.value }))} /></div>
                              <div className="field"><label className="label">{t$?.deal.area}</label><input className="input" type="number" value={D.sqft} onChange={e => setDeal(d => ({ ...d, sqft: +e.target.value }))} /></div>
                            </div>
                            <div className="grid4">
                              <div className="field"><label className="label">{t$?.deal.yearBuilt}</label><input className="input" type="number" value={D.yearBuilt} onChange={e => setDeal(d => ({ ...d, yearBuilt: +e.target.value }))} /></div>
                              <div className="field"><label className="label">Beds</label><input className="input" type="number" value={D.beds} onChange={e => setDeal(d => ({ ...d, beds: +e.target.value }))} /></div>
                              <div className="field"><label className="label">Baths</label><input className="input" type="number" value={D.baths} onChange={e => setDeal(d => ({ ...d, baths: +e.target.value }))} /></div>
                              <div className="field"><label className="label">{t$?.deal.hoa}</label><input className="input" type="number" value={D.hoa} onChange={e => setDeal(d => ({ ...d, hoa: +e.target.value }))} /></div>
                            </div>
                            <div className="grid2">
                              <div className="field"><label className="label">{t$?.deal.estRent}</label><input className="input" type="number" value={D.estimatedRent} onChange={e => setDeal(d => ({ ...d, estimatedRent: +e.target.value }))} /></div>
                              <div className="field"><label className="label">{t$?.deal.propTax}</label><input className="input" type="number" value={D.propertyTax} onChange={e => setDeal(d => ({ ...d, propertyTax: +e.target.value }))} /></div>
                            </div>
                            <div className="reno-grid">
                              {["Light","Medium","Heavy"].map(l => (
                                <button key={l} className={`reno-btn ${D.renoLevel === l ? "active" : ""}`} onClick={() => setDeal(d => ({ ...d, renoLevel: l }))}>
                                  {l}<div style={{ fontSize: 9, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>${({Light:28,Medium:65,Heavy:115}[l])}/sqft</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className={`verdict ${verdictClass}`}>
                          <div className="verdict-badge" style={{ color: verdictColor }}>{verdict}</div>
                          <div className="verdict-text">
                            {verdict === "FLIP" && t$?.verdict.flip(pct(flipROI), fmt(flipProfit))}
                            {verdict === "HOLD" && t$?.verdict.hold(fmt(monthlyCF), dscr.toFixed(2))}
                            {verdict === "BOTH" && t$?.verdict.both(pct(flipROI), fmt(monthlyCF))}
                            {verdict === "PASS" && t$?.verdict.pass(pct(flipROI), fmt(monthlyCF))}
                          </div>
                        </div>
                        <div className="grid2">
                          {[
                            { label: t$?.metrics.arv,        val: fmt(arv),        cls: "gold" },
                            { label: t$?.metrics.renoCost,   val: fmt(renoCost),   cls: "blue" },
                            { label: t$?.metrics.equity,     val: fmt(equity),     cls: "blue" },
                            { label: t$?.metrics.flipProfit, val: fmt(flipProfit), cls: flipProfit > 0 ? "green" : "red" },
                            { label: "Cap Rate",             val: pct(capRate),    cls: capRate >= 6 ? "green" : "blue" },
                            { label: "DSCR",                 val: dscr.toFixed(2), cls: dscr >= 1.2 ? "green" : "red" },
                          ].map(m => (
                            <div key={m.label} className="metric">
                              <div className="metric-label">{m.label}</div>
                              <div className={`metric-val ${m.cls}`}>{m.val}</div>
                            </div>
                          ))}
                        </div>
                        <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }}
                          disabled={aiLoading}
                          onClick={() => runAI(lang === "ko"
                            ? `Northern Virginia 부동산 투자 분석. 주소: ${D.address || "Fairfax VA"}, 매입가: ${fmt(D.purchasePrice)}, ARV: ${fmt(arv)}, Flip ROI: ${pct(flipROI)}, 월 현금흐름: ${fmt(monthlyCF)}, DSCR: ${dscr.toFixed(2)}. 한글로 투자 판단 3줄 요약.`
                            : `NoVA real estate analysis. Address: ${D.address || "Fairfax VA"}, Purchase: ${fmt(D.purchasePrice)}, ARV: ${fmt(arv)}, Flip ROI: ${pct(flipROI)}, Monthly CF: ${fmt(monthlyCF)}, DSCR: ${dscr.toFixed(2)}. Summarize investment verdict in 3 lines.`)}>
                          {aiLoading ? <><div className="spinner" />{t$?.ai.analyzing}</> : t$?.ai.dealBtn}
                        </button>
                        {aiResult && <div className="ai-box"><div className="ai-header"><div className="ai-dot" /><span className="ai-label">{t$?.ai.resultLabel}</span></div><div className="ai-text">{aiResult}</div></div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 2. FLIP 분석 ──────────────────────────────────────── */}
            {tab === "flip" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <PropHeader />
                <div className="card">
                  <div className="card-header"><span className="card-title">{t$?.flip.cardTitle}</span></div>
                  <div className="card-body">
                    <table className="tbl">
                      <tbody>
                        {(t$?.flip.rows || []).map((label, i) => {
                          const vals = [fmt(D.purchasePrice), fmt(renoCost), fmt(holdingCost), fmt(sellingCost), fmt(D.purchasePrice + renoCost + holdingCost), fmt(arv), fmt(flipProfit), pct(flipROI), pct(flipROI / (holdMonths / 12))];
                          const clss = ["","","","red","","gold", flipProfit > 0 ? "green" : "red", flipROI >= 18 ? "green" : flipROI >= 10 ? "gold" : "red", flipROI >= 18 ? "green" : "blue"];
                          return <tr key={i}><td>{label}</td><td className={clss[i] || "mono"}>{vals[i]}</td></tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}
                  disabled={aiLoading}
                  onClick={() => runAI(lang === "ko"
                    ? `Flip 분석: 매입가 ${fmt(D.purchasePrice)}, ARV ${fmt(arv)}, 수리비 ${fmt(renoCost)}, 순이익 ${fmt(flipProfit)}, ROI ${pct(flipROI)}. Northern Virginia 시장 기준으로 이 딜의 핵심 리스크와 성공 조건을 한글로 설명해줘.`
                    : `Flip analysis: Purchase ${fmt(D.purchasePrice)}, ARV ${fmt(arv)}, Reno ${fmt(renoCost)}, Net profit ${fmt(flipProfit)}, ROI ${pct(flipROI)}. Explain key risks and success conditions for this NoVA deal.`)}>
                  {aiLoading ? <><div className="spinner" />{t$?.ai.analyzing2}</> : t$?.flip.aiBtn}
                </button>
                {aiResult && <div className="ai-box"><div className="ai-header"><div className="ai-dot" /><span className="ai-label">{t$?.flip.aiLabel}</span></div><div className="ai-text">{aiResult}</div></div>}
              </div>
            )}

            {/* ── 3. HOLD 분석 ──────────────────────────────────────── */}
            {tab === "hold" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <PropHeader />
                <div className="grid2" style={{ gap: 20 }}>
                  <div className="card">
                    <div className="card-header"><span className="card-title">{t$?.hold.cardTitle}</span></div>
                    <div className="card-body">
                      <table className="tbl">
                        <tbody>
                          {(t$?.hold.rows || []).map((label, i) => {
                            const holdVals = [fmt(D.estimatedRent), fmt(-vacancy), fmt(-opex), fmt(-pm), fmt(-D.propertyTax / 12) + "/mo", fmt(-D.hoa) + "/mo", fmt(-monthlyInterest * 1.15), fmt(monthlyCF), fmt(noi), pct(capRate), pct(coc), dscr.toFixed(2)];
                            const holdClss = ["gold","red","red","red","red", D.hoa > 0 ? "red" : "", "red", monthlyCF >= 500 ? "green" : monthlyCF >= 0 ? "blue" : "red", "gold", capRate >= 6 ? "green" : "blue", coc >= 8 ? "green" : coc >= 4 ? "blue" : "red", dscr >= 1.2 ? "green" : "red"];
                            return <tr key={i}><td>{label}</td><td className={holdClss[i] || "mono"}>{holdVals[i]}</td></tr>;
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header"><span className="card-title">{t$?.hold.equityTitle}</span></div>
                    <div className="card-body">
                      <table className="tbl">
                        <tbody>
                          {[1, 2, 3, 5].map(yr => {
                            const appreciation = D.purchasePrice * Math.pow(1.04, yr) - D.purchasePrice;
                            const equity5 = equity + appreciation + (annualDebt * 0.2 * yr);
                            return <tr key={yr}><td>{t$?.hold.yearEquity(yr)}</td><td className="green">{fmt(equity5)}</td></tr>;
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 🔥 스트레스 테스트 ──────────────────────────────────── */}
            {tab === "stress" && (() => {
              const ko = lang === "ko";
              const base = { flipProfit, flipROI, monthlyCF, dscr };
              const Δ = (curr, ref, fmtFn) => {

                const d = curr - ref;
                const cls = d >= 0 ? "pos" : "neg";
                const sign = d >= 0 ? "+" : "−";
                return <span className={`stress-delta ${cls}`}>({sign}{fmtFn(Math.abs(d))})</span>;
              };
              const groups = [
                {
                  label: ko ? "📉 ARV 하락" : "📉 ARV Drop",
                  desc:  ko ? "매도 가격이 예상보다 낮을 때" : "Sale price comes in below estimate",
                  rows: [
                    { label: "ARV −5%",  s: calcStress(0.95) },
                    { label: "ARV −10%", s: calcStress(0.90) },
                  ],
                },
                {
                  label: ko ? "🔨 수리비 초과" : "🔨 Reno Overrun",
                  desc:  ko ? "공사비가 예산을 초과할 때" : "Construction cost exceeds budget",
                  rows: [
                    { label: ko ? "수리비 +10%" : "Reno +10%", s: calcStress(1, 1.10) },
                    { label: ko ? "수리비 +20%" : "Reno +20%", s: calcStress(1, 1.20) },
                  ],
                },
                {
                  label: ko ? "⏱️ 보유 연장" : "⏱️ Hold Delay",
                  desc:  ko ? "공사·매도 기간이 늘어날 때" : "Project or sale takes longer than planned",
                  rows: [
                    { label: ko ? "+1개월" : "+1mo Hold", s: calcStress(1, 1, 1) },
                    { label: ko ? "+2개월" : "+2mo Hold", s: calcStress(1, 1, 2) },
                  ],
                },
                {
                  label: ko ? "📈 금리 상승" : "📈 Rate Rise",
                  desc:  ko ? "금리가 인상될 때 보유 비용 영향" : "Higher interest rate increases holding cost",
                  rows: [
                    { label: "+0.5%", s: calcStress(1, 1, 0, 0.5) },
                    { label: "+1.0%", s: calcStress(1, 1, 0, 1.0) },
                  ],
                },
                {
                  label: ko ? "🏠 공실 증가" : "🏠 Vacancy Up",
                  desc:  ko ? "연간 공실이 늘어날 때 Hold 수익 영향" : "More vacancy months hurt Hold cash flow",
                  rows: [
                    { label: ko ? "+1개월/년" : "+1mo/yr", s: calcStress(1, 1, 0, 0, 1) },
                    { label: ko ? "+2개월/년" : "+2mo/yr", s: calcStress(1, 1, 0, 0, 2) },
                  ],
                },
                {
                  label: ko ? "💀 최악 시나리오" : "💀 Worst Case",
                  desc:  ko ? "ARV −10% · 수리비 +20% · 보유 +2개월 · 금리 +1% · 공실 +2개월" : "ARV −10% · Reno +20% · Hold +2mo · Rate +1% · Vacancy +2mo",
                  worst: true,
                  rows: [
                    { label: ko ? "복합 최악" : "All Combined", s: calcStress(0.90, 1.20, 2, 1.0, 2) },
                  ],
                },
              ];
              return (
                <div className="stress-section">
                  <PropHeader />
                  {/* Baseline */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">{ko ? "📊 현재 기준값" : "📊 Baseline"}</span>
                      <span style={{ fontSize: 9, color: "var(--dim)" }}>{ko ? "딜 탭 입력값 기준 · AI 불필요, 즉시 계산" : "Based on Deal tab inputs · No AI, instant math"}</span>
                    </div>
                    <div className="card-body">
                      <div className="stress-baseline">
                        {[
                          { label: ko ? "Flip 순이익" : "Flip Profit",    val: fmt(flipProfit),   color: flipProfit >= 0 ? "var(--green)" : "var(--red)" },
                          { label: "Flip ROI",                             val: pct(flipROI),      color: flipROI >= 18 ? "var(--gold)" : flipROI >= 10 ? "var(--blue)" : "var(--red)" },
                          { label: ko ? "월 현금흐름" : "Monthly CF",      val: fmt(monthlyCF),    color: monthlyCF >= 500 ? "var(--green)" : monthlyCF >= 0 ? "var(--blue)" : "var(--red)" },
                          { label: "DSCR",                                  val: dscr.toFixed(2),  color: dscr >= 1.2 ? "var(--green)" : dscr >= 1.0 ? "var(--blue)" : "var(--red)" },
                        ].map((m, i) => (
                          <div key={i} className="metric">
                            <div className="metric-label">{m.label}</div>
                            <div className="metric-val" style={{ color: m.color, fontSize: 17 }}>{m.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scenario groups */}
                  {groups.map((g, gi) => (
                    <div key={gi} className="card" style={g.worst ? { border: "1px solid rgba(248,113,113,0.22)" } : {}}>
                      <div className="card-header" style={g.worst ? { background: "rgba(248,113,113,0.06)" } : {}}>
                        <span className="card-title">{g.label}</span>
                        <span style={{ fontSize: 9, color: "var(--dim)", maxWidth: 380, textAlign: "right" }}>{g.desc}</span>
                      </div>
                      <div className="card-body" style={{ padding: "8px 0 4px" }}>
                        <div className="stress-tbl-wrap">
                          <table className="tbl" style={{ width: "100%" }}>
                            <thead>
                              <tr>
                                <th style={{ paddingLeft: 20 }}>{ko ? "시나리오" : "Scenario"}</th>
                                <th>{ko ? "Flip 순이익" : "Flip Profit"}</th>
                                <th>Flip ROI</th>
                                <th>{ko ? "월 현금흐름" : "Monthly CF"}</th>
                                <th>DSCR</th>
                                <th>{ko ? "판정" : "Status"}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {g.rows.map((r, ri) => {
                                const st = stressStatus(r.s);
                                return (
                                  <tr key={ri} className={g.worst ? "stress-row-worst" : ""}>
                                    <td style={{ paddingLeft: 20, color: "var(--text)", fontWeight: 600, fontSize: 11 }}>{r.label}</td>
                                    <td className={r.s.flipProfit >= base.flipProfit ? "green" : r.s.flipProfit >= 0 ? "mono" : "red"}>
                                      {fmt(r.s.flipProfit)}
                                      {Δ(r.s.flipProfit, base.flipProfit, (d) => "$" + Math.round(d).toLocaleString())}
                                    </td>
                                    <td className={r.s.flipROI >= 15 ? "green" : r.s.flipROI >= 8 ? "gold" : "red"}>
                                      {pct(r.s.flipROI)}
                                      {Δ(r.s.flipROI, base.flipROI, (d) => d.toFixed(1) + "%")}
                                    </td>
                                    <td className={r.s.monthlyCF >= 0 ? "green" : "red"}>
                                      {fmt(r.s.monthlyCF)}
                                      {Δ(r.s.monthlyCF, base.monthlyCF, (d) => "$" + Math.round(d).toLocaleString())}
                                    </td>
                                    <td className={r.s.dscr >= 1.2 ? "green" : r.s.dscr >= 1.0 ? "blue" : "red"}>
                                      {r.s.dscr.toFixed(2)}
                                      {Δ(r.s.dscr, base.dscr, (d) => d.toFixed(2))}
                                    </td>
                                    <td>
                                      <span style={{ color: st.color, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                        {st.icon} {st.label}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Footer note */}
                  <div style={{ fontSize: 10, color: "var(--dim)", textAlign: "center", paddingBottom: 8 }}>
                    {ko
                      ? "✅ OK = Flip ROI ≥15% & DSCR ≥1.2 & 월CF ≥$0 · ⚠️ WATCH = Flip ROI ≥8% 또는 DSCR ≥1.0 · ❌ FAIL = 기준 미달"
                      : "✅ OK = Flip ROI ≥15% & DSCR ≥1.2 & CF ≥$0 · ⚠️ WATCH = Flip ROI ≥8% or DSCR ≥1.0 · ❌ FAIL = Below threshold"}
                  </div>
                </div>
              );
            })()}

            {/* ── 4. 금융 비교 ──────────────────────────────────────── */}
            {tab === "finance" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {[
                    { key: "conventional", label: t$?.finance.conventional, color: "var(--blue)", desc: t$?.finance.conventionalDesc },
                    { key: "flip",         label: t$?.finance.flip,         color: "var(--gold)", desc: t$?.finance.flipDesc },
                    { key: "rental",       label: t$?.finance.rental,       color: "var(--green)", desc: t$?.finance.rentalDesc },
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
                    {rateUpdatedAt ? t$?.finance.updated(rateUpdatedAt) : t$?.finance.noUpdate}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <button onClick={refreshRates} disabled={rateRefreshing}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100, border: "1px solid var(--gold)", background: "var(--gold)22", color: "var(--gold)", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>
                      {rateRefreshing ? <><div className="spinner"/>{t$?.finance.refreshing}</> : t$?.finance.refreshBtn}
                    </button>
                    {rateError && <span style={{fontSize:10,color:"var(--red)",maxWidth:200,textAlign:"right"}}>{rateError}</span>}
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header"><span className="card-title">{t$?.finance.ltvTitle}</span></div>
                  <div className="card-body">
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <input type="range" min={60} max={85} value={ltv} onChange={e => setLtv(+e.target.value)} style={{ flex: 1, accentColor: "var(--gold)" }} />
                      <span style={{ fontFamily: "DM Mono", fontSize: 20, color: "var(--gold)", minWidth: 60 }}>{ltv}%</span>
                      <span style={{ fontSize: 12, color: "var(--dim)" }}>{t$?.finance.loanLabel} {fmt(D.purchasePrice * ltv / 100)}</span>
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
                            {l.badge && <span style={{ fontSize: 8, fontWeight: 800, padding: "3px 8px", borderRadius: 100, background: cc + "22", color: cc, letterSpacing: "0.1em" }}>{lang === "ko" ? l.badge : (BADGE_EN[l.badge] || l.badge)}</span>}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 2 }}>📞 {l.phone}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "DM Mono", fontSize: 20, color: cc, fontWeight: 600 }}>
                            {liveRates[l.name] ? liveRates[l.name] : l.rate}%
                            {liveRates[l.name] && <span style={{ fontSize: 9, color: "var(--green)", marginLeft: 4 }}>LIVE</span>}
                          </div>
                          <div style={{ fontSize: 9, color: "var(--dim)" }}>{t$?.finance.rateLabel} {l.ltv}%</div>
                        </div>
                      </div>
                      <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontSize: 11, color: "var(--mid)", lineHeight: 1.6, borderLeft: "2px solid " + cc + "44", paddingLeft: 10 }}>{lang === "ko" ? l.review : (REVIEW_EN[l.name] || l.review)}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", gap: 14 }}>
                            {(t$?.finance.lenderMeta || []).map((lmeta, mi_i) => {
                              const metaVals = [fmt(mi), fmt(sixMo), lang === "ko" ? l.speed : l.speed.replace("일","d"), String(l.points)];
                              const metaColors = [cc, "var(--mid)", "var(--mid)", "var(--mid)"];
                              return (
                              <div key={mi_i}>
                                <div style={{ fontSize: 8, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lmeta}</div>
                                <div style={{ fontFamily: "DM Mono", fontSize: 13, color: metaColors[mi_i] }}>{metaVals[mi_i]}</div>
                              </div>
                            );})}
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "var(--gold)" }}>{l.rating}</span>
                            <a href={"https://" + l.website} target="_blank" rel="noreferrer"
                              style={{ fontSize: 9, color: "var(--blue)", textDecoration: "none", background: "var(--blue2)", padding: "4px 10px", borderRadius: 100, fontWeight: 700 }}>{t$?.finance.website}</a>
                            <a href={`mailto:${l.email || ""}?subject=Loan Inquiry - ISWELL PROPERTIES&body=Hello ${l.name},%0D%0A%0D%0AMy name is David Kim with ISWELL PROPERTIES.%0D%0AWe are interested in financing for a property we are acquiring.%0D%0A%0D%0A• Property Address: ${deal.address || "TBD"}%0D%0A• Purchase Price: $${deal.purchasePrice.toLocaleString()}%0D%0A• Lender: ${l.name}%0D%0A• Rate: ${l.rate}%%0D%0A• LTV: ${l.ltv}%%0D%0A• Closing Speed: ${l.speed}%0D%0A%0D%0AWe look forward to discussing the loan terms with you.%0D%0A%0D%0ABest regards,%0D%0ADavid Kim%0D%0AISWELL PROPERTIES%0D%0Aiswell.properties@gmail.com`}
                              style={{ fontSize: 9, color: "var(--green)", textDecoration: "none", background: "var(--green2)", padding: "4px 10px", borderRadius: 100, fontWeight: 700 }}>{t$?.finance.contact}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-header"><span className="card-title">{t$?.brrrr.title}</span></div>
                  <div className="card-body">
                    <div className="grid4">
                      {(t$?.brrrr.labels || []).map((label, i) => {
                        const bVals = [fmt(equity), fmt(arv * 0.75), fmt(Math.max(0, arv * 0.75 - loanAmt)), fmt(equity - Math.max(0, arv * 0.75 - loanAmt))];
                        return (
                        <div key={i} className="metric"><div className="metric-label">{label}</div><div className="metric-val gold">{bVals[i]}</div></div>
                      );})}
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
                      <div style={{ fontSize: 10, color: "var(--dim)" }}>{info.sqftRange} · {lang === "ko" ? "10개사" : "10 co."}</div>
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
                        <div style={{ fontSize: 11, color: "var(--mid)", lineHeight: 1.6, borderLeft: "2px solid " + cc + "44", paddingLeft: 10 }}>{lang === "ko" ? c.review : (CONTRACTOR_REVIEW_EN[c.name] || c.review)}</div>
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
                              style={{ fontSize: 9, color: "var(--blue)", textDecoration: "none", background: "var(--blue2)", padding: "4px 10px", borderRadius: 100, fontWeight: 700 }}>{t$?.contractor.website}</a>
                            <a href={`mailto:${c.email || ""}?subject=Construction Estimate Request - ISWELL PROPERTIES&body=Hello ${c.name},%0D%0A%0D%0AMy name is David Kim with ISWELL PROPERTIES.
Email: iswell.properties@gmail.com%0D%0AWe are requesting a construction estimate for a property we are acquiring.%0D%0A%0D%0A• Property Address: ${deal.address || "TBD"}%0D%0A• Purchase Price: $${deal.purchasePrice.toLocaleString()}%0D%0A• Building Size: ${deal.sqft} sqft%0D%0A• Year Built: ${deal.yearBuilt}%0D%0A• Contractor: ${c.name}%0D%0A%0D%0APlease provide us with your estimate at your earliest convenience.%0D%0A%0D%0ABest regards,%0D%0ADavid Kim%0D%0AISWELL PROPERTIES%0D%0Aiswell.properties@gmail.com`}
                              style={{ fontSize: 9, color: "var(--green)", textDecoration: "none", background: "var(--green2)", padding: "4px 10px", borderRadius: 100, fontWeight: 700 }}>{t$?.contractor.contact}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                  disabled={aiLoading}
                  onClick={() => runAI(lang === "ko"
                    ? `Northern Virginia 부동산 투자자. ${gcCat} 건설사 계약 전 핵심 체크포인트 5가지 한글로.`
                    : `NoVA real estate investor. List 5 key checkpoints before signing a ${gcCat} contractor contract.`)}>
                  {aiLoading ? <><div className="spinner"/>{t$?.contractor.analyzing}</> : t$?.contractor.aiBtn}
                </button>
                {aiResult && <div className="ai-box" style={{ marginTop: 12 }}><div className="ai-header"><div className="ai-dot"/><span className="ai-label">{t$?.contractor.aiLabel}</span></div><div className="ai-text">{aiResult}</div></div>}
              </div>
            )}
            {/* ── 6. 자재 단가 ──────────────────────────────────────── */}
            {tab === "materials" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {matCategories.map(c => (
                    <button key={c} className={`btn btn-sm ${matFilter === c ? "btn-gold" : "btn-ghost"}`} onClick={() => setMatFilter(c)}>
                      {lang === "ko" ? c : (c === "전체" ? "All" : CATEGORY_EN[c] || c)}
                    </button>
                  ))}
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title">{t$?.materials.cardTitle}</span>
                    <span style={{ fontSize: 10, color: "var(--dim)" }}>{t$?.materials.gradeLabel(D.renoLevel)}</span>
                  </div>
                  <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
                    <table className="tbl" style={{ minWidth: 500 }}>
                      <thead><tr>{(t$?.materials.headers || []).map(h => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {filteredMats.map((m, i) => (
                          <tr key={i}>
                            <td><span className="badge badge-blue">{lang === "ko" ? m.category : (CATEGORY_EN[m.category] || m.category)}</span></td>
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
                    <span className="card-title">{t$?.construction.cardTitle}</span>
                    <div style={{ display: "flex", gap: 16 }}>
                      {[
                        { label: t$?.construction.budget,   val: fmt(trackerBudget), cls: "gold" },
                        { label: t$?.construction.spent,    val: fmt(trackerActual), cls: "blue" },
                        { label: t$?.construction.remaining, val: fmt(trackerBudget - trackerActual), cls: trackerBudget - trackerActual >= 0 ? "green" : "red" },
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
                      {(t$?.construction.headers || []).map(h => (
                        <div key={h} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)" }}>{h}</div>
                      ))}
                    </div>

                    {tasks.map(tk => {
                      return (
                      <div key={tk.id} className="task-row">
                        <input className="task-input"
                          value={lang === "ko" ? (tk.descKo || tk.desc || "") : (tk.descEn || tk.desc || "")}
                          onChange={e => updateTask(tk.id, lang === "ko" ? "descKo" : "descEn", e.target.value)} />
                        <input className="task-input" type="number" value={tk.budget} onChange={e => updateTask(tk.id, "budget", e.target.value)} />
                        <input className="task-input" type="number" value={tk.actual} onChange={e => updateTask(tk.id, "actual", e.target.value)} style={{ color: "var(--blue)" }} />
                        <input className="task-input" type="date" value={tk.due} onChange={e => updateTask(tk.id, "due", e.target.value)} />
                        <button className={`status-pill status-${tk.status}`}
                          onClick={() => updateTask(tk.id, "status", nextStatus(tk.status))}>
                          {t$?.construction.statuses[tk.status] || tk.status}
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)", borderColor: "transparent" }}
                          onClick={() => setTasks(ts => ts.filter(x => x.id !== tk.id))}>✕</button>
                      </div>
                    );})}

                    <div style={{ marginTop: 16 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setTasks(ts => [...ts, { id: Date.now(), descKo: "새 공정", descEn: "New Task", budget: 0, actual: 0, status: "pending", due: "" }])}>
                        {t$?.construction.addBtn}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 💼 내 물건 점검 ─────────────────────────────────── */}
            {tab === "mycheck" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">{t$?.mycheck.cardTitle}</span>
                    <span style={{ fontSize: 11, color: "var(--dim)" }}>{t$?.mycheck.subTitle}</span>
                  </div>
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="grid2" style={{ gap: 10 }}>
                      {[
                        { label: t$?.mycheck.purchaseLabel, key: "purchase" },
                        { label: t$?.mycheck.renoLabel,     key: "reno" },
                        { label: t$?.mycheck.loanLabel,     key: "loan" },
                        { label: t$?.mycheck.rateLabel,     key: "rate" },
                        { label: t$?.mycheck.holdLabel,     key: "holdMonths" },
                        { label: t$?.mycheck.rentLabel,     key: "rent" },
                        { label: t$?.mycheck.arvLabel,      key: "arv" },
                      ].map(({ label, key }) => (
                        <div key={key}>
                          <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</label>
                          <input className="task-input" style={{ width: "100%", marginTop: 4 }} type="number" value={myProp[key]} onChange={e => setMyProp(s => ({ ...s, [key]: e.target.value }))} />
                        </div>
                      ))}
                    </div>

                    {/* 간단 자동 계산 요약 */}
                    {(() => {
                      const p = myProp;
                      const totalCost = Number(p.purchase) + Number(p.reno);
                      const monthlyInt = Number(p.loan) * (Number(p.rate)/100/12);
                      const holdCost = monthlyInt * Number(p.holdMonths) + (7800/12) * Number(p.holdMonths);
                      const sellProfit = Number(p.arv) - totalCost - holdCost - Number(p.arv)*0.075;
                      const monthlyRentNet = Number(p.rent) - monthlyInt - (7800/12) - Number(p.rent)*0.21;
                      return (
                        <div className="grid2" style={{ gap: 10, marginTop: 4 }}>
                          <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "12px 14px" }}>
                            <div className="metric-label">{t$?.mycheck.sellLabel}</div>
                            <div className="metric-val" style={{ color: sellProfit >= 0 ? "var(--green)" : "var(--red)", fontSize: 22, marginTop: 4 }}>{fmt(sellProfit)}</div>
                          </div>
                          <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "12px 14px" }}>
                            <div className="metric-label">{t$?.mycheck.holdLabel2} (월 CF)</div>
                            <div className="metric-val" style={{ color: monthlyRentNet >= 0 ? "var(--green)" : "var(--red)", fontSize: 22, marginTop: 4 }}>{fmt(monthlyRentNet)}/mo</div>
                          </div>
                        </div>
                      );
                    })()}

                    <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                      disabled={myCheckLoading}
                      onClick={async () => {
                        setMyCheckLoading(true); setMyCheckResult(null);
                        const p = myProp;
                        const totalCost = Number(p.purchase) + Number(p.reno);
                        const prompt = lang === "ko"
                          ? `Northern Virginia 부동산 투자 분석. 매입가: $${Number(p.purchase).toLocaleString()}, 공사비: $${Number(p.reno).toLocaleString()}, 대출: $${Number(p.loan).toLocaleString()}, 금리: ${p.rate}%, 보유: ${p.holdMonths}개월, 월렌트: $${Number(p.rent).toLocaleString()}, 현재ARV: $${Number(p.arv).toLocaleString()}. 총 투자: $${totalCost.toLocaleString()}. 이 딜의 매각 vs 임대 중 어떤 전략이 나은지 분석해줘. 손익분기점과 핵심 리스크도 포함해서 한글로 답해줘.`
                          : `NoVA property analysis. Purchase: $${Number(p.purchase).toLocaleString()}, Reno: $${Number(p.reno).toLocaleString()}, Loan: $${Number(p.loan).toLocaleString()}, Rate: ${p.rate}%, Hold: ${p.holdMonths}mo, Rent: $${Number(p.rent).toLocaleString()}/mo, ARV: $${Number(p.arv).toLocaleString()}. Total invested: $${totalCost.toLocaleString()}. Should I sell now or hold and rent? Include breakeven and top risks.`;
                        const text = await callClaude(prompt);
                        setMyCheckResult(text);
                        setMyCheckLoading(false);
                      }}>
                      {myCheckLoading ? <><div className="spinner" />{t$?.mycheck.analyzing}</> : t$?.mycheck.analyzeBtn}
                    </button>
                  </div>
                </div>

                {myCheckResult && (
                  <div className="ai-box"><div className="ai-header"><div className="ai-dot" /><span className="ai-label">{t$?.mycheck.verdictLabel}</span></div><div className="ai-text">{myCheckResult}</div></div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
