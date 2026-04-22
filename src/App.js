import { useState, useEffect, useRef } from "react";
import { MATERIALS, LENDERS, CONTRACTORS, TABS, CATEGORY_EN, BADGE_EN, REVIEW_EN, CONTRACTOR_REVIEW_EN } from "./data/constants";
import { L, fmt, pct } from "./data/languages";
async function callClaude(prompt) {
  try {
    const res = await fetch("/api/claude", {
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
.app{display:flex;height:100dvh;height:100vh;overflow:hidden;}

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
.btn-blue{background:linear-gradient(135deg,#4B8BFF,#7EB3FF);color:#fff;padding:11px 22px;border-radius:12px;font-size:12px;display:flex;align-items:center;gap:8px;}
.btn-blue:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(75,139,255,0.3);}
.btn-green{background:linear-gradient(135deg,#34D399,#6EDCB5);color:#0D0E10;padding:11px 22px;border-radius:12px;font-size:12px;display:flex;align-items:center;gap:8px;}
.btn-green:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(52,211,153,0.3);}
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
.lang-sidebar-btn{display:none;}
.mobile-more-btn{display:none;}
.mobile-more-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:calc(64px + env(safe-area-inset-bottom,0px));background:rgba(0,0,0,0.55);z-index:198;transition:opacity 0.25s;}
.mobile-more-overlay.open{display:block;}
.mobile-more-overlay.peek{display:block;opacity:0;pointer-events:auto;}
/* Bottom sheet: 3-state — peek / half / full */
.mobile-more-sheet{position:fixed;bottom:calc(64px + env(safe-area-inset-bottom,0px));left:0;right:0;height:88vh;background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;z-index:199;overflow:hidden;transform:translateY(100%);transition:transform 0.28s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;}
.mobile-more-sheet.state-peek{transform:translateY(calc(88vh - 62px));}
.mobile-more-sheet.state-half{transform:translateY(44vh);}
.mobile-more-sheet.state-full{transform:translateY(0);}
.mobile-tab-active-label{display:none;}
@media (max-width: 768px) {
  /* ── Layout ── */
  .app{flex-direction:column;height:100dvh;height:100vh;} /* dvh = safer on mobile Safari */
  .main{flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:0;} /* scroll lives HERE on mobile */
  /* ── Bottom tab bar: 5 items only ── */
  .sidebar{width:100%;height:64px;flex-direction:row;padding:0;gap:0;border-right:none;border-top:1px solid var(--border);border-bottom:none;flex-shrink:0;justify-content:space-around;align-items:stretch;order:3;position:fixed;bottom:0;left:0;right:0;background:var(--bg2);z-index:100;overflow:visible;padding-bottom:env(safe-area-inset-bottom,0px);height:calc(64px + env(safe-area-inset-bottom,0px));}
  .logo{display:none;}
  .nav-btn{flex-direction:column;gap:2px;padding:8px 4px 6px;font-size:9px;min-width:0;flex:1;align-items:center;text-align:center;white-space:nowrap;border-radius:0;border:none;height:100%;}
  .nav-btn.active{background:transparent;color:var(--gold);}
  .nav-btn.active .nav-emoji{transform:scale(1.1);}
  .nav-emoji{font-size:20px;width:auto;}
  /* Hide "More" tabs in main sidebar on mobile */
  .nav-btn-more-tab{display:none!important;}
  /* Show More button + lang btn */
  .mobile-more-btn{display:flex;flex-direction:column;gap:2px;padding:8px 4px 6px;font-size:9px;flex:1;align-items:center;justify-content:center;text-align:center;background:transparent;border:none;color:var(--dim);cursor:pointer;}
  .lang-sidebar-btn{display:flex;}
  .topbar-lang-btn{display:none!important;}
  /* ── Topbar ── */
  .topbar{padding:8px 12px 0;}
  .topbar-title{display:none;}
  .topbar-ai-lang{display:none!important;}
  .mobile-tab-active-label{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--text);padding:2px 0 8px;letter-spacing:0.03em;}
  /* KPI strip: compact 3-column, mobile-native feel */
  .topbar-stats{display:grid!important;grid-template-columns:1fr 1fr 1fr;gap:0;border-top:1px solid var(--border2);margin-top:0;}
  .tstat{padding:6px 4px;border-right:1px solid var(--border2);text-align:center;display:flex;flex-direction:column;align-items:center;gap:1px;}
  .tstat:last-child{border-right:none;}
  .tstat-label{font-size:7px;letter-spacing:0.08em;}
  .tstat-val{font-size:15px;}
  /* ── Content ── */
  .content{padding:10px;padding-bottom:calc(80px + env(safe-area-inset-bottom, 16px));} /* clears fixed 64px tab bar + iPhone home indicator */
  .card{padding:12px;}
  .card-header{padding:10px 12px;}
  .card-body{padding:10px 12px;}
  .grid-2{grid-template-columns:1fr!important;}
  input[type=range]{width:100%;}
  /* Tables */
  .tbl{font-size:10px;}
  .tbl th, .tbl td{padding:6px 8px;white-space:nowrap;}
  /* Task row */
  .task-row{grid-template-columns:1fr 1fr 1fr;gap:6px;padding:10px 0;}
  .task-row > *:first-child{grid-column:1/-1;}
  .grid2{grid-template-columns:1fr!important;}
}
/* Mobile segment nav bar */
.mobile-seg-bar{display:none;}
@media (max-width: 768px) {
  .mobile-seg-bar{display:flex;gap:6px;padding:8px 10px;background:var(--bg2);border-bottom:1px solid var(--border);flex-shrink:0;}
  .mobile-seg-btn{flex:1;padding:7px 4px;border-radius:10px;border:1px solid var(--border);background:var(--bg3);color:var(--dim);font-family:'Sora',sans-serif;font-size:9px;font-weight:700;cursor:pointer;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:all 0.15s;letter-spacing:0.03em;}
  .mobile-seg-btn.active{background:var(--gold2);color:var(--gold);border-color:var(--border2);}
}
@media (max-width: 480px) {
  .content{padding:8px;padding-bottom:calc(80px + env(safe-area-inset-bottom, 16px));}
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
  const [aiLang, setAiLang] = useState('ui'); // 'ui' | 'ko' | 'en' | 'bilingual'
  const [moreState, setMoreState] = useState('closed'); // 'closed' | 'peek' | 'half' | 'full'

  // Swipe navigation (core 4 tabs only)
  const CORE_TABS = ['deal', 'flip', 'hold', 'rebuild'];
  const swipeRef = useRef({});

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
  const [matFilter, setMatFilter] = useState("전체");
  const [gcCat, setGcCat] = useState("luxury");
  const [finCat, setFinCat] = useState("conventional");
  const [rateRefreshing, setRateRefreshing] = useState(false);
  const [rateUpdatedAt, setRateUpdatedAt] = useState(null);
  const [rateError, setRateError] = useState(null);
  const [liveRates, setLiveRates] = useState({});

  // 딜 스크리닝
  const [screenInput, setScreenInput] = useState({ address: "", price: 650000, sqft: 2200, beds: 4, baths: 2, reno: "Medium" });
  const [dealSources, setDealSources] = useState({}); // { price: 'paste'|'manual', sqft, beds, baths, address }
  const [laborMult, setLaborMult] = useState({ Light: 1.5, Medium: 2.0, Heavy: 2.5 });

  // Sheets data (Google Sheets 연동)
  const [contractorList, setContractorList] = useState(CONTRACTORS);
  const [lenderList, setLenderList] = useState(LENDERS);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsStatus, setSheetsStatus] = useState(null); // 'ok'|'error'|null

  // Admin panel state
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminSection, setAdminSection] = useState('contractors'); // 'contractors'|'lenders'
  const [adminEdit, setAdminEdit] = useState(null); // null | { mode:'add'|'edit', type, index, data }
  const ADMIN_PIN = '1234';

  // Sheets fetch on mount
  useEffect(() => {
    setSheetsLoading(true);
    fetch('/api/sheets')
      .then(r => r.json())
      .then(data => {
        if (data.contractors && data.contractors.length > 0) {
          setContractorList(data.contractors.map(c => ({ ...c, score: Number(c.score) || 80 })));
        }
        if (data.lenders && data.lenders.length > 0) {
          setLenderList(data.lenders.map(l => ({ ...l, rate: Number(l.rate) || 7, ltv: Number(l.ltv) || 75, points: Number(l.points) || 0 })));
        }
        setSheetsStatus('ok');
        setSheetsLoading(false);
      })
      .catch(() => { setSheetsStatus('error'); setSheetsLoading(false); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sheetsPost = async (payload) => {
    const r = await fetch('/api/sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return r.json();
  };

  const adminSave = async (type, mode, index, data) => {
    const setList = type === 'contractors' ? setContractorList : setLenderList;
    if (mode === 'add') {
      await sheetsPost({ type, action: 'add', data });
      setList(prev => [...prev, data]);
    } else if (mode === 'edit') {
      await sheetsPost({ type, action: 'update', rowIndex: index, data });
      setList(prev => prev.map((item, i) => i === index ? data : item));
    }
    setAdminEdit(null);
  };

  const adminDelete = async (type, index) => {
    const setList = type === 'contractors' ? setContractorList : setLenderList;
    await sheetsPost({ type, action: 'delete', rowIndex: index });
    setList(prev => prev.filter((_, i) => i !== index));
  };

  // Rebuild Analysis
  const [rebuild, setRebuild] = useState({
    lotSqft: 0,
    lotSource: 'default', // 'screening' > 'manual' > 'default' (priority order)
    aiLotSqft: 0,         // AI estimate — reference only, never overwrites lotSqft
    demoCost: 20000,
    permitCost: 8000,
    newSqft: 2200,
    newSqftSource: 'default', // 'preset' | 'manual' | 'default'
    costPerSqft: 400,
    buildMonths: 12,
    arvNew: 0,
    contingencyPct: 15,
    ltcPct: 70,
    ratePct: 7.0,
    drawSchedule: true,
  });
  const [rebuildAiResult, setRebuildAiResult] = useState(null);
  const [rebuildAiLoading, setRebuildAiLoading] = useState(false);
  const [rebuildEstLoading, setRebuildEstLoading] = useState(false);
  const [rebuildEstNote, setRebuildEstNote] = useState(null);
  const [dealType, setDealType] = useState('rebuild'); // 'renovation' | 'rebuild' | 'jv'
  const [rbScenario, setRbScenario] = useState('base'); // 'downside' | 'base' | 'upside'
  const [jvParams, setJvParams] = useState({ builderFee: 5, deferredFee: 3, profitSplit: 50, preferredReturn: 8 });
  const [arvSource, setArvSource] = useState('manual'); // 'manual' | 'comp'
  const [rebuildComps, setRebuildComps] = useState(null);
  const [rebuildCompsLoading, setRebuildCompsLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [screenResult, setScreenResult] = useState(null);

  // 내 물건 점검
  const [myProp, setMyProp] = useState({ purchase: 650000, reno: 80000, loan: 520000, rate: 7.0, holdMonths: 12, rent: 3200, arv: 750000 });
  const [myCheckLoading, setMyCheckLoading] = useState(false);
  const [myCheckResult, setMyCheckResult] = useState(null);

  // ── AI response cache (same inputs → reuse result, no redundant API calls) ──
  const screenCacheRef   = useRef({});
  const rebuildAiCacheRef = useRef({});
  const myCheckCacheRef  = useRef({});


  const refreshRates = async () => {
    setRateRefreshing(true);
    setRateError(null);
    try {
      const lenderNames = lenderList.map(l => l.name).join(', ');
      const prompt = `You are a real estate lending expert. Return ONLY a JSON object (no markdown, no explanation, no code block) with current approximate 2026 mortgage rates for these NoVA lenders: ${lenderNames}. Format: {"LenderName": rate_number, ...} where rate is a decimal like 7.25. Use realistic 2026 market rates.`;
      const text = await callClaude(prompt);
      if (!text || text === "분석 실패" || text === "연결 오류") throw new Error(text || "API 연결 실패");
      const clean = text.replace(/```json|```/g, '').trim();
      const json = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}')+1));
      setLiveRates(json);
      setRateUpdatedAt(new Date().toLocaleString('ko-KR'));
    } catch(e) {
      setRateError(e.message || "금리 조회 실패");
    }
    setRateRefreshing(false);
  };

  const D = deal;
  const lender = lenderList[selectedLender];
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
  // eslint-disable-next-line no-unused-vars
  const verdictClass = { FLIP: "flip", HOLD: "hold", BOTH: "both", PASS: "pass" }[verdict];
  const verdictColor = { FLIP: "#E2B84B", HOLD: "#4B8BFF", BOTH: "#34D399", PASS: "#F87171" }[verdict];

  const trackerBudget = tasks.reduce((s, t) => s + Number(t.budget || 0), 0);
  const trackerActual = tasks.reduce((s, t) => s + Number(t.actual || 0), 0);

  const matCategories = ["전체", ...new Set(MATERIALS.map(m => m.category))];
  const filteredMats = matFilter === "전체" ? MATERIALS : MATERIALS.filter(m => m.category === matFilter);


  // Zillow URL 슬러그에서 주소 직접 추출 (Claude 없이)
  // ── 텍스트 붙여넣기 파서 (Zillow/Redfin 매물 정보) ──────────────────
  const parsePastedText = (text) => {
    if (!text || text.trim().length < 10) return;
    const t = text.replace(/[\u00a0\u2009\u202f]/g, ' '); // normalize whitespace

    // Price: first $X,XXX,XXX amount that is NOT a Zestimate or /mo value
    let price = null;
    const priceMatches = [...t.matchAll(/\$([\d,]+(?:\.\d+)?)/g)];
    const prices = priceMatches
      .filter(m => {
        const after = t.slice(m.index + m[0].length, m.index + m[0].length + 20);
        return !after.match(/zestimate|\s*\/\s*mo/i);
      })
      .map(m => parseInt(m[1].replace(/,/g, '')))
      .filter(v => v >= 100000 && v <= 30000000);
    if (prices.length > 0) price = prices[0]; // first valid price (not Zestimate)

    // Sqft (living area — must NOT be preceded by "lot")
    const sqftM = t.match(/([\d,]+)\s*(?:sq\.?\s*ft\.?|sqft|square\s*feet)(?!\s*lot)/i);
    const sqft = sqftM ? parseInt(sqftM[1].replace(/,/g, '')) : null;

    // Beds
    const bedsM = t.match(/(\d+)\s*(?:bed(?:room)?s?|bds?)\b/i);
    const beds = bedsM ? parseInt(bedsM[1]) : null;

    // Baths
    const bathsM = t.match(/(\d+(?:\.\d+)?)\s*(?:bath(?:room)?s?|\bba\b)/i);
    const baths = bathsM ? parseFloat(bathsM[1]) : null;

    // Year Built
    const yearM = t.match(/built\s*(?:in\s*)?(\d{4})/i);
    const yearBuilt = yearM ? parseInt(yearM[1]) : null;

    // HOA: $X/mo HOA or HOA $X/mo
    const hoaM = t.match(/\$([\d,]+)\s*(?:\/\s*mo(?:nth)?)?\s*HOA/i)
      || t.match(/HOA[:\s]+\$([\d,]+)/i);
    const hoa = hoaM ? parseInt(hoaM[1].replace(/,/g, '')) : null;

    // Property Tax: $X/yr or $X estimated taxes
    const taxM = t.match(/\$([\d,]+)\s*(?:\/\s*(?:yr|year))?\s*(?:estimated\s*)?(?:annual\s*)?(?:property\s*)?tax(?:es)?/i)
      || t.match(/(?:property\s*)?tax(?:es)?[:\s]+\$([\d,]+)/i);
    const propTax = taxM ? parseInt(taxM[1].replace(/,/g, '')) : null;

    // Address: "1234 Street Name, City, ST 12345"
    const addrM = t.match(/(\d+[^,\n]{3,50},\s*[^,\n]+,\s*[A-Z]{2}\s*\d{5})/);
    const address = addrM ? addrM[1].trim() : null;

    // ── Lot Size ─────────────────────────────────────────────────────────────
    // Matches: "0.61 Acres Lot", "0.61 acre", "Lot Size: 0.61 Acres"
    const lotAcresM = t.match(/(?:lot\s*(?:size)?[:\s]*)?([\d.]+)\s*acres?(?:\s*lot)?/i);
    // Matches: "26,572 sq ft lot", "6,098 sqft lot"
    const lotSqftM  = t.match(/([\d,]+)\s*(?:sq\.?\s*ft\.?|sqft)\s*lot/i);

    let parsedLotSqft = null;
    if (lotAcresM) {
      const acres = parseFloat(lotAcresM[1]);
      if (acres > 0 && acres < 100) { // sanity: 0.01–100 acres
        parsedLotSqft = Math.round(acres * 43560);
      }
    } else if (lotSqftM) {
      const lsq = parseInt(lotSqftM[1].replace(/,/g, ''));
      if (lsq > 0 && lsq < 5000000) parsedLotSqft = lsq;
    }

    // Apply to screenInput and deal — always force-overwrite when parsed value found
    setScreenInput(s => ({
      ...s,
      price:     price     !== null ? price     : s.price,
      sqft:      sqft      !== null ? sqft      : s.sqft,
      beds:      beds      !== null ? beds      : s.beds,
      baths:     baths     !== null ? baths     : s.baths,
      address:   address   !== null ? address   : s.address,
      yearBuilt: yearBuilt !== null ? yearBuilt : s.yearBuilt,
    }));
    setDeal(d => ({
      ...d,
      purchasePrice: price     !== null ? price     : d.purchasePrice,
      sqft:          sqft      !== null ? sqft      : d.sqft,
      beds:          beds      !== null ? beds      : d.beds,
      baths:         baths     !== null ? baths     : d.baths,
      address:       address   !== null ? address   : d.address,
      yearBuilt:     yearBuilt !== null ? yearBuilt : d.yearBuilt,
      hoa:           hoa       !== null ? hoa       : d.hoa,
      propertyTax:   propTax   !== null ? propTax   : d.propertyTax,
    }));
    // Track source of each field parsed from paste
    const pastedSources = {};
    if (price     !== null) pastedSources.price   = 'paste';
    if (sqft      !== null) pastedSources.sqft    = 'paste';
    if (beds      !== null) pastedSources.beds    = 'paste';
    if (baths     !== null) pastedSources.baths   = 'paste';
    if (address   !== null) pastedSources.address = 'paste';
    setDealSources(s => ({ ...s, ...pastedSources }));

    // ── Sync lot size to rebuild tab ─────────────────────────────────────────
    // Always overwrite on new paste; source of truth = lotSqft (sqft int)
    // Only reset to 0 if a new price was detected (signals a truly new property)
    setRebuild(s => ({
      ...s,
      lotSqft:   parsedLotSqft !== null ? parsedLotSqft : (price ? 0 : s.lotSqft),
      lotSource: parsedLotSqft !== null ? 'screening' : (price ? 'default' : s.lotSource),
    }));

    // 자동 입력 완료 (텍스트는 유지)
  };

  const estimateRebuildCosts = async () => {
    const addr = deal.address || "";
    if (!addr || addr.trim().length < 5) {
      setRebuildEstNote("⚠️ " + (lang === "ko" ? "딜 스크리닝에서 주소를 먼저 입력해주세요." : "Please enter an address in Deal Screening first."));
      return;
    }
    setRebuildEstLoading(true);
    setRebuildEstNote(null);
    try {
      const county = addr.toLowerCase().includes("loudoun") ? "Loudoun County"
        : addr.toLowerCase().includes("arlington") ? "Arlington County"
        : addr.toLowerCase().includes("alexandria") ? "City of Alexandria"
        : addr.toLowerCase().includes("reston") || addr.toLowerCase().includes("herndon") || addr.toLowerCase().includes("mclean") || addr.toLowerCase().includes("vienna") || addr.toLowerCase().includes("great falls") || addr.toLowerCase().includes("burke") || addr.toLowerCase().includes("springfield") || addr.toLowerCase().includes("annandale") ? "Fairfax County"
        : addr.toLowerCase().includes("prince william") || addr.toLowerCase().includes("manassas") || addr.toLowerCase().includes("woodbridge") || addr.toLowerCase().includes("dale city") ? "Prince William County"
        : "Northern Virginia";
      const sqft = Number(deal.sqft) || 2200;
      const prompt = `You are a NoVA construction cost expert. Estimate realistic 2026 teardown-rebuild costs for this property:
Address: ${addr}
County: ${county}
Lot size: ${Number(rebuild.lotSqft) > 0 ? (Number(rebuild.lotSqft) / 43560).toFixed(3) + " acres (" + Number(rebuild.lotSqft).toLocaleString() + " sqft)" : "unknown (estimate from purchase price + location)"}
Existing building sqft: ${sqft} sqft
Purchase price (land value): $${Number(deal.purchasePrice || 650000).toLocaleString()}

Return ONLY valid JSON with these fields (no markdown, no explanation):
{
  "demoCost": number,
  "permitCost": number,
  "newSqft": number,
  "costPerSqft": number,
  "buildMonths": number,
  "arvNew": number,
  "contingencyPct": number,
  "lotSqft": number,
  "note": "brief explanation of estimates in 1-2 sentences",
  "noteKo": "same explanation in Korean"
}

IMPORTANT: Estimate lotSqft based on location and purchase price if not provided. Base newSqft primarily on lot size and local zoning FAR.

IMPORTANT: Use purchase price to determine property tier. A $1M-$2M purchase in McLean is a mid-tier suburban teardown, NOT an estate. Only $3M+ McLean purchases are estate-tier lots.

Use these 2026 NoVA market benchmarks:

TIER CLASSIFICATION by purchase price:
- Under $800K: Standard suburban teardown → existing sqft + 10-20%, standard construction
- $800K-$1.5M: Mid-tier teardown → existing sqft + 15-25%, quality construction
- $1.5M-$3M: Premium teardown → existing sqft + 20-40%, luxury construction
- $3M+: Estate/luxury teardown → major upsize possible, ultra-luxury construction

Demo/teardown: $15,000-$40,000 depending on house size and county
Permit fees: Fairfax $10,000-$22,000 / Loudoun $8,000-$16,000 / Arlington $12,000-$26,000 / Prince William $6,000-$14,000

Construction cost per sqft by tier:
- Standard ($500K-$900K purchase): $280-$380/sqft
- Quality ($900K-$1.5M): $380-$480/sqft
- Luxury ($1.5M-$3M): $450-$580/sqft
- Ultra-luxury ($3M+): $550-$800/sqft

New sqft guidance (BASED ON PURCHASE PRICE TIER, not just location):
- $500K-$900K: existing sqft × 1.1 to 1.2
- $900K-$1.5M: existing sqft × 1.2 to 1.35
- $1.5M-$3M: existing sqft × 1.3 to 1.5 (max ~5,500 sqft unless lot clearly supports more)
- $3M+ McLean/Great Falls estate lots: 5,500-9,000 sqft possible

ARV per sqft by area (2026):
- McLean 22101/22102: $600-$900/sqft (mid-tier), $900-$1,200/sqft (luxury estate)
- Great Falls 22066: $520-$750/sqft
- N.Arlington 22201/22207: $650-$900/sqft
- S.Arlington 22204/22206: $460-$620/sqft
- Alexandria/Falls Church: $550-$780/sqft
- Vienna/Oakton: $440-$640/sqft
- Reston/Herndon/Fairfax: $360-$520/sqft
- Burke/Springfield/Annandale: $310-$450/sqft
- Ashburn/Leesburg: $290-$420/sqft
- Woodbridge/Manassas: $240-$360/sqft

Build timeline: 12-16 months typical, 16-20 months for large builds
Contingency: 15% recommended

CRITICAL: Base newSqft on LOT SIZE (토지). Use Fairfax County FAR rules.

Fairfax County zoning FAR for single-family (2026):
- R-1 (1+ acre): builders typically build 6,500-9,500 sqft → FAR ~0.15-0.22
- R-2 (0.4-1 acre): builders typically build 5,500-8,000 sqft → FAR ~0.30-0.42
- R-3 (0.25-0.4 acre): builders typically build 4,500-6,500 sqft → FAR ~0.40-0.50
- R-4 (under 0.25 acre): builders typically build 3,500-5,000 sqft → FAR ~0.45-0.55

McLean-specific new build standards (actual market data):
- 0.2 acres (8,712 sqft lot): 4,000-5,200 sqft new build
- 0.25 acres (10,890 sqft lot): 4,500-5,800 sqft new build
- 0.3 acres (13,068 sqft lot): 5,200-6,500 sqft new build  ← COMMON McLean teardown lot
- 0.4 acres (17,424 sqft lot): 6,000-7,500 sqft new build
- 0.5 acres (21,780 sqft lot): 6,500-8,500 sqft new build
- 0.75+ acres: 7,500-9,500 sqft new build

If lot size is provided, calculate: newSqft = lotSqft × 0.42 to 0.50 for McLean/premium areas.
If lot size unknown, estimate from purchase price:
- McLean $1.5-2.5M → 0.25-0.35 acre lot → 5,000-6,000 sqft buildable
- McLean $2.5-4M → 0.35-0.6 acre lot → 6,000-7,500 sqft buildable
- McLean $4M+ → 0.6+ acre → 7,000-9,500 sqft possible
- Arlington/Alexandria $1-2M: 0.1-0.2 acre → 3,500-5,000 sqft
- Vienna/Fairfax $900K-$1.5M: 0.2-0.35 acre → 3,500-5,500 sqft
- Suburban NoVA $600K-$1M: 0.15-0.3 acre → 2,500-4,000 sqft

Use county-specific permit fees. Also return lotSqft estimate in the JSON.`;
      const text = await callClaude(prompt);
      const clean = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}')+1));
      setRebuild(s => ({
        ...s,
        demoCost: data.demoCost || s.demoCost,
        permitCost: data.permitCost || s.permitCost,
        newSqft: data.newSqft || s.newSqft,
        costPerSqft: data.costPerSqft || s.costPerSqft,
        buildMonths: data.buildMonths || s.buildMonths,
        arvNew: data.arvNew || s.arvNew,
        contingencyPct: data.contingencyPct || s.contingencyPct,
        // AI NEVER overwrites lotSqft — store in aiLotSqft (reference only)
        // Priority: screening > manual > default. AI is reference only.
        aiLotSqft: data.lotSqft || s.aiLotSqft,
      }));
      setRebuildEstNote((lang === "ko" ? (data.noteKo || data.note) : data.note) || "✅ 시세 기준 자동 입력 완료");
    } catch(e) {
      console.error('estimateRebuildCosts error:', e);
      setRebuildEstNote("❌ " + (lang === "ko" ? `추정 실패: ${e.message || "응답 파싱 오류"}. 다시 시도해주세요.` : `Estimation failed: ${e.message || "parse error"}. Please try again.`));
    }
    setRebuildEstLoading(false);
  };

  // Fetch live benchmarks from Google Sheets (updated monthly by scheduled task)
  const fetchMarketBenchmarks = async () => {
    try {
      const resp = await fetch('/api/benchmarks');
      const data = await resp.json();
      if (data.benchmarks && data.benchmarks.tiers) {
        return data.benchmarks;
      }
    } catch(e) {
      console.warn('Could not load live benchmarks, using defaults:', e.message);
    }
    return null;
  };

  // Build benchmark text block from live Sheets data (or fall back to hardcoded)
  const buildBenchmarkPrompt = (benchmarks) => {
    if (!benchmarks || !benchmarks.tiers) return null;
    return benchmarks.tiers.map(tier => {
      const areaLines = tier.areas.map(a =>
        `• ${a.name} ${a.zips}: $${a.psfMin}-${a.psfMax}/sqft (median $${a.psfMedian}) | ` +
        `Build: ${(a.sqftMin/1000).toFixed(1)}k-${(a.sqftMax/1000).toFixed(1)}k sqft | ` +
        `ARV: $${a.arvMin >= 1000000 ? (a.arvMin/1000000).toFixed(1)+'M' : (a.arvMin/1000).toFixed(0)+'K'}-` +
        `$${a.arvMax >= 1000000 ? (a.arvMax/1000000).toFixed(1)+'M' : (a.arvMax/1000).toFixed(0)+'K'}` +
        (a.note ? ` — ${a.note}` : '')
      ).join('\n');
      return `━━ TIER ${tier.tier}: ${tier.label.toUpperCase()} ━━\n${areaLines}`;
    }).join('\n\n');
  };

  const fetchNewConstructionComps = async () => {
    const addr = deal.address || "";
    if (!addr || addr.trim().length < 5) {
      setRebuildComps({ error: lang === "ko" ? "딜 스크리닝에서 주소를 먼저 입력해주세요." : "Enter address in Deal Screening first." });
      return;
    }
    setRebuildCompsLoading(true);
    setRebuildComps(null);
    try {
      const liveBench = await fetchMarketBenchmarks();
      const benchmarkText = buildBenchmarkPrompt(liveBench);
      const county = addr.toLowerCase().includes("loudoun") ? "Loudoun County"
        : addr.toLowerCase().includes("arlington") ? "Arlington County"
        : addr.toLowerCase().includes("alexandria") ? "City of Alexandria"
        : addr.toLowerCase().includes("reston") || addr.toLowerCase().includes("herndon") || addr.toLowerCase().includes("mclean") || addr.toLowerCase().includes("vienna") || addr.toLowerCase().includes("great falls") || addr.toLowerCase().includes("burke") || addr.toLowerCase().includes("springfield") || addr.toLowerCase().includes("annandale") ? "Fairfax County"
        : addr.toLowerCase().includes("prince william") || addr.toLowerCase().includes("manassas") || addr.toLowerCase().includes("woodbridge") || addr.toLowerCase().includes("dale city") ? "Prince William County"
        : "Northern Virginia";
      const newSqft = Number(rebuild.newSqft) || 2200;
      const targetSqft = newSqft;
      const compSqftMin = Math.round(targetSqft * 0.80);
      const compSqftMax = Math.round(targetSqft * 1.20);
      const prompt = `You are a NoVA new construction real estate market expert with 2025-2026 market data.
Analyze comparable properties for a REBUILD/new construction project.
Address: ${addr}
County: ${county}
Target new build size: ${targetSqft} sqft
Primary comp filter: ${compSqftMin}–${compSqftMax} sqft (±20% of target — strict zone)

Return ONLY valid JSON (no markdown, no explanation):
{
  "county": "string",
  "comps": [
    { "area": "neighborhood or city", "sqft": number, "soldPrice": number, "pricePerSqft": number, "year": "2025", "compType": "new_build", "builtYear": number, "note": "style/quality + sold date if known" },
    { "area": "...", "sqft": number, "soldPrice": number, "pricePerSqft": number, "year": "2025", "compType": "new_build", "builtYear": number, "note": "" },
    { "area": "...", "sqft": number, "soldPrice": number, "pricePerSqft": number, "year": "2024", "compType": "new_build", "builtYear": number, "note": "" },
    { "area": "...", "sqft": number, "soldPrice": number, "pricePerSqft": number, "year": "2023", "compType": "new_build", "builtYear": number, "note": "" },
    { "area": "...", "sqft": number, "soldPrice": number, "pricePerSqft": number, "year": "2025", "compType": "teardown", "builtYear": null, "note": "lot/land value" },
    { "area": "...", "sqft": number, "soldPrice": number, "pricePerSqft": number, "year": "2024", "compType": "teardown", "builtYear": null, "note": "teardown condition" },
    { "area": "...", "sqft": number, "soldPrice": number, "pricePerSqft": number, "year": "2025", "compType": "existing", "builtYear": number, "note": "existing resale context" },
    { "area": "...", "sqft": number, "soldPrice": number, "pricePerSqft": number, "year": "2025", "compType": "existing", "builtYear": number, "note": "existing resale context" }
  ],
  "medianPsf": number,
  "newBuildMedianPsf": number,
  "newBuildPsfRange": { "min": number, "max": number },
  "rangeMin": number,
  "rangeMax": number,
  "arvSuggested": number,
  "arvConfidence": "high" | "medium" | "low",
  "arvConfidenceReason": "brief English reason (mention comp count, sqft match, recency)",
  "arvConfidenceReasonKo": "brief Korean reason",
  "expandedFilter": false,
  "marketNote": "1-2 sentence market context in English",
  "marketNoteKo": "1-2 sentence market context in Korean"
}

compType STRICT QUALITY RULES:
- "new_build": Built 2020 or later (prefer 2022+ for premium accuracy). FINISHED, fully-custom luxury product — NOT spec home or semi-custom. sqft MUST be ${compSqftMin}–${compSqftMax} sqft. Provide 3-4 comps. ONLY these drive ARV.
  ⚠ Do NOT include: homes built before 2020, semi-custom or builder-grade homes, incomplete sales, or homes outside the sqft band.
- "teardown": Land/lot sale OR sold for demolition OR functionally obsolete structure. sqft = living area of demolished structure (not lot sqft). Provide 2 comps.
- "existing": Standard resale (not new build, not teardown). Provide 2 comps as context only. Does NOT affect ARV.

CALCULATION RULES (you must compute — do not guess):
- newBuildMedianPsf = true median $/sqft of new_build comps only (sort ascending by psf, take middle value or avg of 2 middle)
- arvSuggested = newBuildMedianPsf × ${targetSqft} (round to nearest $5,000)
- newBuildPsfRange.min / max = actual min and max psf of NEW_BUILD comps only
- arvConfidence (assign honestly — this is critical for investor decisions):
    "high"   = 3+ new_build comps in ${compSqftMin}–${compSqftMax} sqft range, ALL sold 2023 or later, PSF spread ≤ 20%
    "medium" = exactly 2 valid comps, OR any comp older than 2023, OR PSF spread 20-40%, OR had to expand sqft filter
    "low"    = 0-1 valid comp, OR PSF spread > 40%, OR no comps in target sqft range, OR market illiquid for this size

SQFT FILTER: new_build comps MUST be ${compSqftMin}–${compSqftMax} sqft.
If fewer than 3 comps exist in this range, expand to ±30% and set "expandedFilter": true.
NEVER substitute small homes (e.g. 2,000–2,500 sqft) as new_build comps for a ${targetSqft} sqft target.
NEVER fabricate comps — if market data is thin, return fewer comps and set confidence to "low".

${benchmarkText ||
`━━ TIER 1: McLean 22101/22102: $800-1,100/sqft | 7,000-10,000 sqft | ARV $5M-$10M+
━━ TIER 2: N.Arlington $650-900 | Alexandria/FC $550-780 | S.Arlington $460-620
━━ TIER 3: Vienna/Oakton $440-640 | Reston $390-530
━━ TIER 4: Herndon $350-490 | Chantilly $330-470 | Burke/Springfield $310-450
━━ TIER 5: Ashburn/Leesburg $290-420 | Sterling $280-380
━━ TIER 6: Woodbridge $250-355 | Manassas $235-330 | Stafford $215-310
Match ZIP/city to correct tier. Do NOT cap luxury ARVs.`}

For TIER 1-2 markets: use premium $/sqft — do NOT artificially cap ARVs.`;
      const text = await callClaude(prompt);
      const clean = text.replace(/```json|```/g, '').trim();
      const raw = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}')+1));

      // ── CLIENT-SIDE VALIDATION & RECALCULATION ──────────────────────────
      const tSqft = Number(rebuild.newSqft) || 2200;
      // Strict filter: ±25% client-side tolerance (prompt asks for ±20%, we allow slight buffer)
      const filterMin = Math.round(tSqft * 0.75);
      const filterMax = Math.round(tSqft * 1.25);

      // Validate each comp — downgrade bad new_build comps to 'existing'
      let filteredCount = 0;
      const validatedComps = (raw.comps || []).map(c => {
        if (c.compType === 'new_build') {
          const sqftOk  = c.sqft >= filterMin && c.sqft <= filterMax;
          const yearOk  = !c.builtYear || c.builtYear >= 2018;
          const psf     = c.pricePerSqft || (c.sqft > 0 ? Math.round(c.soldPrice / c.sqft) : 0);
          const psfOk   = psf >= 150 && psf <= 3000; // sanity: below $150 or above $3000/sqft = suspect
          if (!sqftOk) { filteredCount++; return { ...c, compType: 'existing', _flag: `sqft out of range (${c.sqft})`, note: `[sqft mismatch: ${c.sqft}] ${c.note || ''}`.trim() }; }
          if (!yearOk) { filteredCount++; return { ...c, compType: 'existing', _flag: `older build (${c.builtYear})`, note: `[pre-2018 build: ${c.builtYear}] ${c.note || ''}`.trim() }; }
          if (!psfOk)  { filteredCount++; return { ...c, compType: 'existing', _flag: `PSF suspect ($${psf})`, note: `[suspect PSF: $${psf}] ${c.note || ''}`.trim() }; }
        }
        return c;
      });

      // Recalculate medianPsf from validated new_build comps only
      const nbCompsValidated = validatedComps.filter(c => c.compType === 'new_build');
      let recalcPsf = raw.newBuildMedianPsf || raw.medianPsf || 0;
      if (nbCompsValidated.length > 0) {
        const psfs = nbCompsValidated.map(c => c.pricePerSqft || (c.soldPrice / c.sqft)).filter(p => p > 0).sort((a, b) => a - b);
        const mid = Math.floor(psfs.length / 2);
        recalcPsf = psfs.length % 2 === 0 ? Math.round((psfs[mid-1] + psfs[mid]) / 2) : Math.round(psfs[mid]);
      }
      const recalcArv = recalcPsf > 0 ? Math.round(recalcPsf * tSqft / 5000) * 5000 : raw.arvSuggested;
      const recalcPsfMin = nbCompsValidated.length > 0 ? Math.min(...nbCompsValidated.map(c => c.pricePerSqft || (c.soldPrice/c.sqft) || 0).filter(p => p > 0)) : 0;
      const recalcPsfMax = nbCompsValidated.length > 0 ? Math.max(...nbCompsValidated.map(c => c.pricePerSqft || (c.soldPrice/c.sqft) || 0).filter(p => p > 0)) : 0;
      // PSF spread ratio — wide spread = less reliable
      const psfSpreadPct = recalcPsf > 0 && recalcPsfMax > recalcPsfMin ? Math.round((recalcPsfMax - recalcPsfMin) / recalcPsf * 100) : 0;
      // Oldest comp year among new_build comps
      const compYears = nbCompsValidated.map(c => parseInt(c.year || '0')).filter(y => y > 2000);
      const oldestCompYear = compYears.length > 0 ? Math.min(...compYears) : 0;

      // ── Confidence override (client enforces, AI can only be downgraded) ──
      let finalConfidence = raw.arvConfidence || 'medium';
      let finalConfidenceReason = raw.arvConfidenceReason || '';
      let finalConfidenceReasonKo = raw.arvConfidenceReasonKo || '';

      if (nbCompsValidated.length === 0) {
        finalConfidence = 'low';
        finalConfidenceReason = filteredCount > 0
          ? `All ${filteredCount} AI comps failed quality filter (sqft, year, or PSF check)`
          : 'No valid new-build comps available for this size/market';
        finalConfidenceReasonKo = filteredCount > 0
          ? `AI 제공 ${filteredCount}개 comp 품질 검증 실패 (면적·연도·단가 기준)`
          : '해당 규모·시장의 신축 comp 없음';
      } else if (nbCompsValidated.length === 1) {
        if (finalConfidence === 'high') finalConfidence = 'medium';
        finalConfidenceReason = `Only 1 qualifying new-build comp${filteredCount > 0 ? `; ${filteredCount} comp(s) failed quality filter` : ''}`;
        finalConfidenceReasonKo = `유효 신축 comp 1개${filteredCount > 0 ? `; ${filteredCount}개 품질 미달` : ''}`;
      } else if (nbCompsValidated.length === 2) {
        if (finalConfidence === 'high') finalConfidence = 'medium';
        if (!finalConfidenceReason) { finalConfidenceReason = '2 comps — adequate but limited'; finalConfidenceReasonKo = '2개 comp — 충분하지 않음'; }
      }
      // Downgrade if PSF spread is too wide (unreliable data)
      if (psfSpreadPct > 40 && finalConfidence === 'high') { finalConfidence = 'medium'; finalConfidenceReason += ' (PSF spread >40%)'; }
      if (psfSpreadPct > 60) { finalConfidence = 'low'; finalConfidenceReason = `PSF spread ${psfSpreadPct}% — comps inconsistent`; finalConfidenceReasonKo = `PSF 편차 ${psfSpreadPct}% — comp 신뢰도 낮음`; }
      // Downgrade if all comps are old
      if (oldestCompYear > 0 && oldestCompYear <= 2022 && finalConfidence === 'high') {
        finalConfidence = 'medium'; finalConfidenceReason += ` (oldest comp: ${oldestCompYear})`;
      }

      const data = {
        ...raw,
        comps: validatedComps,
        newBuildMedianPsf: recalcPsf,
        medianPsf: recalcPsf,
        arvSuggested: recalcArv,
        newBuildPsfRange: { min: recalcPsfMin, max: recalcPsfMax },
        arvConfidence: finalConfidence,
        arvConfidenceReason: finalConfidenceReason,
        arvConfidenceReasonKo: finalConfidenceReasonKo,
        _nbCount: nbCompsValidated.length,
        _filteredCount: filteredCount,
        _targetSqft: tSqft,
        _filterMin: filterMin,
        _filterMax: filterMax,
        _psfSpreadPct: psfSpreadPct,
        _oldestCompYear: oldestCompYear,
        _expandedFilter: raw.expandedFilter || false,
      };
      setRebuildComps(data);
    } catch(e) {
      console.error('fetchNewConstructionComps error:', e);
      setRebuildComps({ error: lang === "ko" ? `조회 실패: ${e.message || "응답 오류"}` : `Failed: ${e.message || "parse error"}` });
    }
    setRebuildCompsLoading(false);
  };


  const updateTask = (id, field, val) => setTasks(t => t.map(x => x.id === id ? { ...x, [field]: val } : x));
  const nextStatus = (s) => {
    const map = { "pending": "progress", "progress": "done", "done": "pending" };
    return map[s] || "pending";
  };
  const t$ = L[lang]; // shorthand for current language
  // AI response language — follows UI lang by default, overridable via aiLang selector
  const aiLangInstr = aiLang === 'bilingual'
    ? 'Respond in both Korean and English (bilingual). Show Korean first, then English translation below.'
    : aiLang === 'ko' ? 'Respond in Korean (한국어로 답해줘).'
    : aiLang === 'en' ? 'Respond in English.'
    : lang === 'ko'   ? 'Respond in Korean (한국어로 답해줘).'
    : 'Respond in English.';

  // lang 전환 시 AI 결과 초기화 (언어 불일치 방지)
  useEffect(() => { setMyCheckResult(null); setScreenResult(null); }, [lang]);

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

  const handleSwipeStart = (e) => {
    if (!CORE_TABS.includes(tab)) return;
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleSwipeEnd = (e) => {
    if (!CORE_TABS.includes(tab) || swipeRef.current.x === undefined) return;
    const dx = e.changedTouches[0].clientX - swipeRef.current.x;
    const dy = e.changedTouches[0].clientY - swipeRef.current.y;
    swipeRef.current = {};
    // only fire if clearly horizontal (|dx|>60 and |dx|>|dy|)
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    const idx = CORE_TABS.indexOf(tab);
    if (dx < 0 && idx < CORE_TABS.length - 1) setTab(CORE_TABS[idx + 1]); // swipe left → next
    if (dx > 0 && idx > 0) setTab(CORE_TABS[idx - 1]);                    // swipe right → prev
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
            <button
              key={t.id}
              className={`nav-btn ${tab === t.id ? "active" : ""}${['deal','flip','hold','rebuild'].includes(t.id) ? '' : ' nav-btn-more-tab'}`}
              onClick={() => { setTab(t.id); setMoreState('closed'); }}
            >
              <span className="nav-emoji">{t.emoji}</span>
              {t$?.tabLabel(t)}
            </button>
          ))}
          {/* Mobile: More button (shows only on mobile via CSS) */}
          <button
            className={`mobile-more-btn${['deal','flip','hold','rebuild'].includes(tab) ? '' : ' active'}`}
            onClick={() => setMoreState(s => s === 'closed' ? 'peek' : 'closed')}
            style={['deal','flip','hold','rebuild'].includes(tab) ? {} : {color:'var(--gold)'}}
          >
            <span style={{fontSize:20}}>•••</span>
            <span style={{fontSize:9}}>{lang === "ko" ? "더보기" : "More"}</span>
          </button>
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
        {/* Mobile More overlay + sheet */}
        <div
          className={`mobile-more-overlay${moreState === 'half' || moreState === 'full' ? ' open' : moreState === 'peek' ? ' peek' : ''}`}
          onClick={() => setMoreState('closed')}
        />
        <div className={`mobile-more-sheet${moreState !== 'closed' ? ` state-${moreState}` : ''}`}>
          {/* ── Header: drag zone + title/close row ── */}
          <div style={{flexShrink:0, borderBottom:'1px solid var(--border)', userSelect:'none'}}>
            {/* ① Drag-only zone — pill bar, no child buttons, safe to use touch handlers */}
            <div
              style={{height:22, display:'flex', alignItems:'center', justifyContent:'center', cursor:'grab'}}
              onTouchStart={e => { e.currentTarget._hy = e.touches[0].clientY; }}
              onTouchEnd={e => {
                e.preventDefault();
                const dy = e.changedTouches[0].clientY - (e.currentTarget._hy ?? e.changedTouches[0].clientY);
                e.currentTarget._hy = undefined;
                if (Math.abs(dy) < 8) { setMoreState(s => s === 'peek' ? 'half' : 'closed'); return; }
                if (dy < -30) setMoreState(s => s === 'peek' ? 'half' : 'full');
                else if (dy > 30) setMoreState('closed');
              }}
            >
              <div style={{width:44, height:5, borderRadius:3, background:'var(--gold)', opacity:0.5}} />
            </div>
            {/* ② Title + X button row — no touch handlers here, click fires cleanly */}
            <div style={{display:'flex', alignItems:'center', padding:'0 14px 10px', gap:8}}>
              <div style={{flex:1, textAlign:'center', fontSize:11, fontWeight:700,
                letterSpacing:'0.1em', textTransform:'uppercase',
                color: moreState === 'peek' ? 'var(--gold)' : 'var(--mid)'}}>
                {moreState === 'peek'
                  ? (lang==='ko' ? '↑  도구 메뉴' : '↑  Tools')
                  : (lang==='ko' ? '도구 메뉴' : 'Tools')}
              </div>
              <button
                onClick={() => setMoreState('closed')}
                onTouchEnd={e => { e.preventDefault(); e.stopPropagation(); setMoreState('closed'); }}
                style={{
                  width:36, height:36, borderRadius:'50%', flexShrink:0,
                  background:'var(--bg4)', border:'1px solid rgba(255,255,255,0.15)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'var(--text)', fontSize:16, fontWeight:400,
                  cursor:'pointer', lineHeight:1, WebkitTapHighlightColor:'transparent',
                }}
                aria-label="Close"
              >✕</button>
            </div>
          </div>

          {/* ── Grid of extra tabs ── */}
          <div style={{overflowY:'auto', flex:1, padding:'8px 12px 24px'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
              {TABS.filter(t => !['deal','flip','hold','rebuild'].includes(t.id)).map(t => (
                <button key={t.id}
                  onClick={() => { setTab(t.id); setMoreState('closed'); }}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                    padding:'14px 8px', borderRadius:12,
                    border: tab===t.id ? '1px solid var(--gold)' : '1px solid var(--border2)',
                    background: tab===t.id ? 'rgba(226,184,75,0.1)' : 'var(--bg3)',
                    color: tab===t.id ? 'var(--gold)' : 'var(--text)',
                    cursor:'pointer', fontSize:9, fontWeight:700,
                  }}>
                  <span style={{fontSize:22}}>{t.emoji}</span>
                  <span>{t$?.tabLabel(t)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main" onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>

          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-title">
              {TABS.find(t => t.id === tab)?.emoji} {t$?.tabLabel(TABS.find(t => t.id === tab))}
              <button className="topbar-lang-btn" onClick={() => setLang(l => l === "ko" ? "en" : "ko")} style={{marginLeft:12,padding:"4px 16px",borderRadius:100,border:"1px solid rgba(255,255,255,0.25)",background:"rgba(255,255,255,0.1)",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:"0.1em",backdropFilter:"blur(4px)"}}>{lang === "ko" ? "EN" : "KO"}</button>
              {D.address && <span style={{ fontSize: 12, color: "var(--dim)", fontWeight: 400, marginLeft: 8 }}>{D.address}</span>}
              {/* AI Language selector — hidden on mobile */}
              <div className="topbar-ai-lang" style={{display:"flex",gap:3,marginLeft:12,alignItems:"center"}}>
                <span style={{fontSize:9,color:"var(--dim)",fontWeight:600,letterSpacing:"0.05em",marginRight:2}}>AI</span>
                {[{v:"ui",label:"UI"},{v:"en",label:"EN"},{v:"ko",label:"KO"},{v:"bilingual",label:"Bi"}].map(({v,label}) => (
                  <button key={v} onClick={() => setAiLang(v)} style={{
                    padding:"3px 8px",borderRadius:100,fontSize:9,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em",
                    border: aiLang === v ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.15)",
                    background: aiLang === v ? "rgba(226,184,75,0.18)" : "rgba(255,255,255,0.06)",
                    color: aiLang === v ? "var(--gold)" : "var(--dim)"
                  }}>{label}</button>
                ))}
              </div>
            </div>
            {/* Mobile: small active tab label (replaces hidden topbar-title) */}
            <div className="mobile-tab-active-label">
              <span>{TABS.find(t => t.id === tab)?.emoji}</span>
              <span>{t$?.tabLabel(TABS.find(t => t.id === tab))}</span>
              {D.address && <span style={{fontSize:10,color:"var(--dim)",fontWeight:400,marginLeft:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140}}>{D.address}</span>}
            </div>
            <div className="topbar-stats">
              {tab === "rebuild" ? (() => {
                const rb2 = rebuild;
                const sm2 = { downside: { arv: 0.9, cost: 1.1 }, base: { arv: 1, cost: 1 }, upside: { arv: 1.1, cost: 0.95 } }[rbScenario] || { arv: 1, cost: 1 };
                const isReno2 = dealType === "renovation";
                const demo2 = isReno2 ? Math.round((Number(rb2.demoCost) || 0) * 0.2) : (Number(rb2.demoCost) || 0);
                const permit2 = isReno2 ? Math.round((Number(rb2.permitCost) || 0) * 0.3) : (Number(rb2.permitCost) || 0);
                const buildSqft2 = isReno2 ? (Number(deal.sqft) || 0) : (Number(rb2.newSqft) || 0);
                const c2 = Math.round(buildSqft2 * (Number(rb2.costPerSqft) || 0) * (isReno2 ? 0.55 : 1.0) * sm2.cost);
                const hc2 = demo2 + permit2 + c2;
                const cont2 = Math.round(hc2 * (Number(rb2.contingencyPct) || 0) / 100);
                const bmo2 = isReno2 ? Math.max(3, Math.round((Number(rb2.buildMonths) || 12) * 0.4)) : (Number(rb2.buildMonths) || 12);
                const land2 = Number(deal.purchasePrice) || 0;
                const loan2 = Math.round((land2 + hc2 + cont2) * (Number(rb2.ltcPct) || 70) / 100);
                const carry2 = Math.round(loan2 * (rb2.drawSchedule ? 0.55 : 1) * (Number(rb2.ratePct) || 0) / 100 * bmo2 / 12);
                const nonLand2 = demo2 + permit2 + c2 + cont2 + carry2;
                const total2 = land2 + nonLand2;
                const arvNew2 = (arvSource === 'comp' && rebuildComps?.arvSuggested > 0)
                  ? Number(rebuildComps.arvSuggested)
                  : Number(rb2.arvNew) || 0;
                const arv2 = Math.round(arvNew2 * sm2.arv);
                const nsp2 = arv2 - Math.round(arv2 * 0.075);
                const prof2 = nsp2 - total2;
                const roi2 = total2 > 0 ? (prof2 / total2 * 100) : 0;
                const rbVerdict = roi2 >= 25 ? "GO" : roi2 >= 20 ? "WATCH" : "NO-GO";
                const rbColor = rbVerdict === "GO" ? "var(--green)" : rbVerdict === "WATCH" ? "var(--gold)" : "var(--red)";
                if (!arvNew2 || arvNew2 <= 0) {
                  return (
                    <>
                      <div className="tstat">
                        <div className="tstat-label">Rebuild Verdict</div>
                        <div className="tstat-val" style={{ color: "var(--dim)", fontSize: 12, fontWeight: 600 }}>Input Needed</div>
                      </div>
                      <div className="tstat">
                        <div className="tstat-label">Rebuild ROI</div>
                        <div className="tstat-val" style={{ color: "var(--dim)" }}>—</div>
                      </div>
                      <div className="tstat">
                        <div className="tstat-label">Rebuild Profit</div>
                        <div className="tstat-val" style={{ color: "var(--dim)" }}>—</div>
                      </div>
                    </>
                  );
                }
                return (
                  <>
                    <div className="tstat">
                      <div className="tstat-label">Rebuild Verdict</div>
                      <div className="tstat-val" style={{ color: rbColor, fontSize: 18 }}>{rbVerdict}</div>
                    </div>
                    <div className="tstat">
                      <div className="tstat-label">Rebuild ROI</div>
                      <div className={`tstat-val ${roi2 >= 25 ? "green" : roi2 >= 20 ? "gold" : "red"}`}>{pct(roi2)}</div>
                    </div>
                    <div className="tstat">
                      <div className="tstat-label">Rebuild Profit</div>
                      <div className={`tstat-val ${prof2 > 0 ? "green" : "red"}`}>{fmt(prof2)}</div>
                    </div>
                  </>
                );
              })() : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Mobile segment nav — core 4 tabs only, hidden on desktop */}
          {CORE_TABS.includes(tab) && (
            <div className="mobile-seg-bar">
              {CORE_TABS.map(id => {
                const tObj = TABS.find(t => t.id === id);
                return (
                  <button
                    key={id}
                    className={`mobile-seg-btn${tab === id ? ' active' : ''}`}
                    onClick={() => setTab(id)}
                  >
                    {tObj?.emoji} {t$?.tabLabel(tObj)}
                  </button>
                );
              })}
            </div>
          )}

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
                    {/* 텍스트 붙여넣기 */}
                    <div className="field">
                      <label className="label">📋 {lang === "ko" ? "Zillow / Redfin 매물 정보 붙여넣기" : "Paste Zillow / Redfin Property Info"}</label>
                      <textarea
                        rows={4}
                        className="input"
                        style={{ resize:'vertical', fontSize:11, lineHeight:1.6 }}
                        placeholder={lang === "ko"
                          ? "Zillow 또는 Redfin 매물 페이지에서 가격·주소·침실·욕실·sqft·연식·HOA·재산세 정보를 복사해서 붙여넣으세요. 자동으로 입력됩니다."
                          : "Copy & paste property details from Zillow or Redfin — price, address, beds, baths, sqft, year built, HOA, tax will auto-fill."}
                        value={pasteText}
                        onChange={e => setPasteText(e.target.value)}
                        onPaste={e => {
                          const v = e.clipboardData.getData('text').trim();
                          setPasteText(v);
                          setTimeout(() => parsePastedText(v), 50);
                        }}
                      />
                      {pasteText.trim() && (
                        <div style={{ display:'flex', gap:8 }}>
                          <button
                            className="btn btn-blue"
                            style={{ flex:1, justifyContent:'center' }}
                            onClick={() => parsePastedText(pasteText)}
                          >
                            ✨ {lang === "ko" ? "자동 입력" : "Auto Fill"}
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ justifyContent:'center' }}
                            onClick={() => setPasteText('')}
                          >
                            {lang === "ko" ? "지우기" : "Clear"}
                          </button>
                        </div>
                      )}
                      <div style={{ fontSize:10, color:'var(--dim)', lineHeight:1.5 }}>
                        💡 {lang === "ko" ? "붙여넣으면 자동으로 가격·주소·sqft 등이 입력됩니다. 아래 숫자 확인 후 수정 가능." : "Fields auto-fill on paste. Verify the numbers below before screening."}
                      </div>
                    </div>
                    {/* 주소 */}
                    <div className="field">
                      <label className="label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        📍 {lang === "ko" ? "주소" : "Address"}
                        {dealSources.address && (
                          <span style={{
                            fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                            background: dealSources.address === "paste" ? "rgba(75,199,110,0.18)" : "rgba(75,139,255,0.18)",
                            color: dealSources.address === "paste" ? "#4bc76e" : "var(--blue)",
                          }}>
                            {dealSources.address === "paste" ? "📋 paste" : "✎ manual"}
                          </span>
                        )}
                      </label>
                      <input
                        className="input"
                        type="text"
                        placeholder={lang === "ko" ? "예: 1742 Valley Ave, Mc Lean, VA 22101" : "e.g. 1742 Valley Ave, Mc Lean, VA 22101"}
                        value={screenInput.address || ""}
                        onChange={e => {
                          setScreenInput(s => ({ ...s, address: e.target.value }));
                          setDealSources(s => ({ ...s, address: "manual" }));
                        }}
                      />
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
                          <label className="label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            {label}
                            {dealSources[key] && (
                              <span style={{
                                fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                                background: dealSources[key] === "paste" ? "rgba(75,199,110,0.18)" : "rgba(75,139,255,0.18)",
                                color: dealSources[key] === "paste" ? "#4bc76e" : "var(--blue)",
                                letterSpacing: "0.02em",
                              }}>
                                {dealSources[key] === "paste" ? "📋 paste" : "✎ manual"}
                              </span>
                            )}
                          </label>
                          <input
                            className="input"
                            type="number"
                            value={screenInput[key] === 0 ? "" : screenInput[key]}
                            placeholder={screenInput[key] === 0 ? "0" : ""}
                            onFocus={e => { if (Number(e.target.value) === 0) e.target.value = ""; }}
                            onChange={e => {
                              setScreenInput(s => ({ ...s, [key]: e.target.value === "" ? 0 : +e.target.value }));
                              setDealSources(s => ({ ...s, [key]: "manual" }));
                            }}
                          />
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
                    {/* 가격 0 경고 */}
                    {(!screenInput.price || Number(screenInput.price) === 0) && (
                      <div style={{ background: "var(--red)22", border: "1px solid var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--red)", fontWeight: 700 }}>
                        ⚠️ {lang === "ko" ? "매입 희망가를 입력해주세요. 위에 매물 정보를 붙여넣거나 직접 입력하세요." : "Please enter the asking price. Paste property info above or enter manually."}
                      </div>
                    )}
                    {/* 스크리닝 버튼 */}
                    <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }}
                      disabled={screenLoading || !screenInput.price || Number(screenInput.price) === 0}
                      onClick={async () => {
                        const p = screenInput;
                        const screenCacheKey = `${p.price}_${p.sqft}_${p.beds}_${p.baths}_${p.reno}_${aiLang}_${lang}`;
                        if (screenCacheRef.current[screenCacheKey]) {
                          setScreenResult(screenCacheRef.current[screenCacheKey]); return;
                        }
                        setScreenLoading(true); setScreenResult(null);
                        const screenLang = aiLang === "en" ? "en" : aiLang === "ko" || aiLang === "bilingual" ? "ko" : lang;
                        const prompt = screenLang === "ko"
                          ? `당신은 NoVA(Northern Virginia) 부동산 투자 전문가입니다. 이 매물을 Flip / Hold / Rebuild 3가지 전략으로 각각 분석하세요.
매물: ${p.address || "NoVA 매물"}, 매입가: $${Number(p.price).toLocaleString()}, 면적: ${p.sqft}sqft, 침실: ${p.beds}/${p.baths}ba, 수리: ${p.reno}
반드시 유효한 JSON만 반환하세요 (마크다운 없이):
{"flip":{"verdict":"GO|WATCH|NO-GO","roi":"X%","maxPrice":숫자,"reason":"한 문장"},"hold":{"verdict":"GO|WATCH|NO-GO","monthlyCF":숫자,"maxPrice":숫자,"reason":"한 문장"},"rebuild":{"verdict":"GO|WATCH|NO-GO","reason":"한 문장"},"risks":["리스크1","리스크2","리스크3"]}
기준: Flip ROI ≥18% → GO, 10-18% → WATCH; Hold 월CF ≥$500 → GO, $0-500 → WATCH; Rebuild은 신축 가능성 기준. maxPrice = 해당 기준 달성 최대 매입가. reason은 10단어 이내로. 모든 텍스트 필드는 반드시 한국어.${aiLang === "bilingual" ? " Also provide a brief English note for each reason field." : ""}`
                          : `You are a NoVA real estate expert. Evaluate this property for 3 strategies: Flip, Hold (rental), Rebuild (teardown).
Property: ${p.address || "NoVA property"}, Asking: $${Number(p.price).toLocaleString()}, Sqft: ${p.sqft}, Beds: ${p.beds}/${p.baths}ba, Reno: ${p.reno}
Return ONLY valid JSON (no markdown):
{"flip":{"verdict":"GO|WATCH|NO-GO","roi":"X%","maxPrice":number,"reason":"one sentence"},"hold":{"verdict":"GO|WATCH|NO-GO","monthlyCF":number,"maxPrice":number,"reason":"one sentence"},"rebuild":{"verdict":"GO|WATCH|NO-GO","reason":"one sentence (max 10 words)"},"risks":["risk1","risk2","risk3"]}
Criteria: Flip ROI ≥18%=GO, 10-18%=WATCH; Hold CF ≥$500/mo=GO, $0-500=WATCH; Rebuild based on teardown viability. maxPrice = max purchase price to hit criteria. Keep each reason under 10 words.`;
                        const text = await callClaude(prompt);
                        try {
                          const clean = text.replace(/```json|```/g, '').trim();
                          const j = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1));
                          setScreenResult(j);
                          screenCacheRef.current[screenCacheKey] = j;
                          // Always sync deal state on new screening
                          setDeal(d => ({ ...d,
                            address: screenInput.address || d.address,
                            purchasePrice: Number(screenInput.price) || d.purchasePrice,
                            sqft: Number(screenInput.sqft) || d.sqft,
                            beds: Number(screenInput.beds) || d.beds,
                            baths: Number(screenInput.baths) || d.baths,
                            renoLevel: screenInput.reno || d.renoLevel,
                          }));
                        } catch { setScreenResult({ flip:{verdict:"WATCH",reason:text,roi:"—"},hold:{verdict:"WATCH",reason:"—"},rebuild:{verdict:"WATCH",reason:"—"},risks:[] }); }
                        setScreenLoading(false);
                      }}>
                      {screenLoading ? <><div className="spinner" />{lang === "ko" ? "분석 중..." : "Screening..."}</> : lang === "ko" ? "🔍 AI 딜 스크리닝" : "🔍 AI Screen This Deal"}
                    </button>
                  </div>
                </div>

                {/* ── STEP 2: 3-Strategy Summary Cards ── */}
                {screenResult && (() => {
                  const ko = lang === "ko";
                  const syncAndGo = (tabId) => {
                    setDeal(d => ({ ...d,
                      address: screenInput.address || d.address,
                      purchasePrice: Number(screenInput.price) || d.purchasePrice,
                      sqft: Number(screenInput.sqft) || d.sqft,
                      beds: Number(screenInput.beds) || d.beds,
                      baths: Number(screenInput.baths) || d.baths,
                      renoLevel: screenInput.reno || d.renoLevel,
                    }));
                    setTab(tabId);
                  };
                  const vColor = (v) =>
                    v === "GO" ? "var(--green)" :
                    v === "WATCH" || v === "WATCH" ? "var(--gold)" : "var(--red)";
                  const vIcon = (v) =>
                    v === "GO" ? "✅" :
                    v === "WATCH" || v === "WATCH" ? "⚠️" : "❌";
                  const strategies = [
                    {
                      id: "flip", emoji: "📈", label: ko ? "플립 (단기 매도)" : "Flip",
                      data: screenResult.flip || {},
                      stat: screenResult.flip?.roi ? `ROI ${screenResult.flip.roi}` : null,
                      maxPrice: screenResult.flip?.maxPrice,
                      maxLabel: ko ? "Flip 18% 최대가" : "Max price @ 18% ROI",
                      cta: ko ? "플립 분석 열기 →" : "Open Flip Analysis →",
                    },
                    {
                      id: "hold", emoji: "🏠", label: ko ? "홀드 (임대)" : "Hold (Rental)",
                      data: screenResult.hold || {},
                      stat: screenResult.hold?.monthlyCF ? `CF ${fmt(screenResult.hold.monthlyCF)}/mo` : null,
                      maxPrice: screenResult.hold?.maxPrice,
                      maxLabel: ko ? "Hold CF $500+ 최대가" : "Max price @ $500+/mo CF",
                      cta: ko ? "홀드 분석 열기 →" : "Open Hold Analysis →",
                    },
                    {
                      id: "rebuild", emoji: "🏗️", label: ko ? "신축 개발" : "Rebuild",
                      data: screenResult.rebuild || {},
                      stat: null,
                      maxPrice: null,
                      maxLabel: null,
                      cta: ko ? "재건축 분석 열기 →" : "Open Rebuild Analysis →",
                      rationale: (() => {
                        const ns = rebuild.newSqft || 2200;
                        const al = rebuild.arvNew || 0;
                        const ask = Number(screenInput.price) || 0;
                        const maxLand = al > 0 ? Math.round(al * 0.20) : null;
                        if (maxLand && maxLand > 0) {
                          const thresh = ask <= maxLand ? (ko ? "✅ 범위 내" : "✅ in range") : (ko ? "⚠️ 초과" : "⚠️ over");
                          return ko ? `신축 ${ns.toLocaleString()} sqft · Max land @20%: ${fmt(maxLand)} ${thresh}` : `${ns.toLocaleString()} sqft assumed · Max land @20%: ${fmt(maxLand)} ${thresh}`;
                        }
                        return ko ? `신축 ${ns.toLocaleString()} sqft 가정 · 재건축 탭 ARV 입력 시 land 한도 표시` : `${ns.toLocaleString()} sqft assumed · Enter ARV in Rebuild tab for land limit`;
                      })(),
                    },
                  ];
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {/* Overall Summary */}
                      {(() => {
                        const vPriority = { "GO": 3, "WATCH": 2, "NO-GO": 1 };
                        const allStrats = [
                          { id: "flip",    label: ko ? "플립"  : "Flip",    v: screenResult.flip?.verdict    || "NO-GO" },
                          { id: "hold",    label: ko ? "홀드"  : "Hold",    v: screenResult.hold?.verdict    || "NO-GO" },
                          { id: "rebuild", label: ko ? "신축"  : "Rebuild", v: screenResult.rebuild?.verdict || "NO-GO" },
                        ];
                        const best = allStrats.reduce((a, b) => (vPriority[a.v] || 0) >= (vPriority[b.v] || 0) ? a : b);
                        const overallV = best.v;
                        const overallColor = vColor(overallV);
                        const overallIcon = vIcon(overallV);
                        const bestMaxPrice = screenResult.flip?.maxPrice || screenResult.hold?.maxPrice || null;
                        const ask = Number(screenInput.price) || 0;
                        return (
                          <div style={{ background: `${overallColor}0d`, border: `1.5px solid ${overallColor}44`, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 80 }}>
                              <div style={{ fontSize: 9, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{ko ? "종합 판정" : "Overall Verdict"}</div>
                              <div style={{ fontSize: 20, fontWeight: 900, color: overallColor, lineHeight: 1.1 }}>{overallIcon} {overallV}</div>
                            </div>
                            <div style={{ width: 1, height: 40, background: "var(--border)", flexShrink: 0 }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <div style={{ fontSize: 9, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{ko ? "최적 전략" : "Best Current Path"}</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{best.label}</div>
                              <div style={{ fontSize: 9, color: "var(--dim)" }}>
                                {allStrats.map((s, i) => (
                                  <span key={s.id}>{i > 0 && " · "}<span style={{ color: vColor(s.v) }}>{s.label} {s.v}</span></span>
                                ))}
                              </div>
                            </div>
                            {bestMaxPrice && ask > 0 && (
                              <>
                                <div style={{ width: 1, height: 40, background: "var(--border)", flexShrink: 0 }} />
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <div style={{ fontSize: 9, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{ko ? "호가 vs 적정가" : "Ask vs Buy Box"}</div>
                                  <div style={{ fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ color: "var(--dim)" }}>{fmt(ask)}</span>
                                    <span style={{ color: "var(--border)" }}>→</span>
                                    <span style={{ color: ask <= bestMaxPrice ? "var(--green)" : "var(--red)" }}>{fmt(bestMaxPrice)}</span>
                                  </div>
                                  <div style={{ fontSize: 9, color: ask <= bestMaxPrice ? "var(--green)" : "var(--red)" }}>
                                    {ask <= bestMaxPrice
                                      ? (ko ? `✅ ${fmt(bestMaxPrice - ask)} 여유` : `✅ ${fmt(bestMaxPrice - ask)} room`)
                                      : (ko ? `↓ ${fmt(ask - bestMaxPrice)} 할인 필요` : `↓ ${fmt(ask - bestMaxPrice)} off needed`)}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}
                      {/* Top risks strip */}
                      {screenResult.risks?.length > 0 && (
                        <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap", marginTop: 1 }}>
                            {ko ? "리스크" : "Risks"}
                          </span>
                          {screenResult.risks.map((r, i) => (
                            <span key={i} style={{ fontSize: 10, color: "var(--mid)", lineHeight: 1.5 }}>
                              {i > 0 && <span style={{ color: "var(--border)", marginRight: 8 }}>·</span>}{r}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Strategy cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        {strategies.map(({ id, emoji, label, data, stat, maxPrice, maxLabel, cta, rationale }) => {
                          const v = data.verdict || "—";
                          const color = vColor(v);
                          return (
                            <div key={id} style={{
                              background: "var(--bg2)", border: `1px solid ${color}44`,
                              borderRadius: 12, padding: "14px 14px 12px",
                              display: "flex", flexDirection: "column", gap: 8,
                            }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{emoji} {label}</span>
                                <span style={{ fontSize: 12, fontWeight: 900, color, background: `${color}18`, padding: "2px 8px", borderRadius: 6 }}>
                                  {vIcon(v)} {v}
                                </span>
                              </div>
                              {stat && (
                                <div style={{ fontFamily: "DM Mono", fontSize: 15, fontWeight: 700, color }}>{stat}</div>
                              )}
                              {data.reason && (
                                <div style={{ fontSize: 10, color: "var(--dim)", lineHeight: 1.55, flex: 1 }}>{data.reason}</div>
                              )}
                              {maxPrice && (
                                <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "6px 10px" }}>
                                  <div style={{ fontSize: 8, color: "var(--dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{maxLabel}</div>
                                  <div style={{ fontFamily: "DM Mono", fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>{fmt(maxPrice)}</div>
                                  <div style={{ fontSize: 9, color: "var(--red)", marginTop: 2 }}>
                                    ↓ {fmt(Number(screenInput.price) - maxPrice)} ({(((Number(screenInput.price) - maxPrice) / Number(screenInput.price)) * 100).toFixed(1)}%) {ko ? "할인 필요" : "off asking"}
                                  </div>
                                </div>
                              )}
                              {rationale && (
                                <div style={{ fontSize: 9, color: "var(--dim)", lineHeight: 1.5, borderTop: "1px solid var(--border)", paddingTop: 5, marginTop: 2 }}>
                                  {rationale}
                                </div>
                              )}
                              <button
                                onClick={() => syncAndGo(id)}
                                style={{
                                  marginTop: "auto", width: "100%", padding: "7px 0", borderRadius: 8,
                                  border: `1px solid ${color}55`, background: `${color}12`,
                                  color, fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em",
                                }}>
                                {cta}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

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

                {/* ── 🔧 수리 추천 카드 (연도수 기반 자동 계산) ── */}
                {D.yearBuilt > 1900 && (() => {
                  const ko = lang === "ko";
                  const yr = new Date().getFullYear();
                  const age = yr - D.yearBuilt;
                  const lvl = D.renoLevel || "Medium";
                  const lvlKey = lvl.toLowerCase();

                  // 각 시스템 수명 + 자재 단가 (MATERIALS 기반)
                  // 자재단가 기준: 2026년 NoVA 시장 업데이트 (Jan 2026)
                  const systems = [
                    { name: ko ? "지붕" : "Roof",         life: 22, cost: Math.round(D.sqft * 0.9 * ({ light:5.0, medium:7.5, heavy:12 }[lvlKey])),      unit: "sqft 기반", icon: "🏠" },
                    { name: "HVAC",                       life: 17, cost: ({ light:7000, medium:12000, heavy:18000 }[lvlKey]),                             unit: "unit", icon: "❄️" },
                    { name: ko ? "전기 패널" : "Electrical", life: 32, cost: ({ light:2500, medium:5000, heavy:9000 }[lvlKey]),                           unit: "unit", icon: "⚡" },
                    { name: ko ? "창문" : "Windows",      life: 22, cost: (D.beds * 2 + 4) * ({ light:500, medium:900, heavy:1800 }[lvlKey]),             unit: `${D.beds*2+4}개`, icon: "🪟" },
                    { name: ko ? "배관" : "Plumbing",     life: 45, cost: ({ light:2800, medium:7000, heavy:16000 }[lvlKey]),                             unit: "부분", icon: "🔧" },
                    { name: ko ? "주방" : "Kitchen",      life: 25, cost: Math.round(D.sqft * 0.08 * ({ light:350, medium:800, heavy:1500 }[lvlKey]) / 10 * 3 + ({ light:6000, medium:17000, heavy:30000 }[lvlKey])), unit: "", icon: "🍳" },
                    { name: ko ? `욕실 (${D.baths}개)` : `Bath (${D.baths})`, life: 22, cost: D.baths * ({ light:3500, medium:10000, heavy:22000 }[lvlKey]), unit: `${D.baths}개`, icon: "🚿" },
                    { name: ko ? "바닥재" : "Flooring",   life: 15, cost: Math.round(D.sqft * ({ light:3.5, medium:5.5, heavy:9 }[lvlKey])),             unit: "sqft 기반", icon: "🪵" },
                    { name: ko ? "페인트" : "Paint",      life: 8,  cost: Math.round(D.sqft * ({ light:1.8, medium:2.8, heavy:4.5 }[lvlKey])),           unit: "sqft 기반", icon: "🎨" },
                  ];

                  // 상태 판정
                  const getStatus = (life) => {
                    if (age >= life * 1.1) return { label: ko ? "🔴 교체 필요" : "🔴 Replace",  cls: "red",  priority: 2 };
                    if (age >= life * 0.75) return { label: ko ? "🟡 점검 필요" : "🟡 Inspect", cls: "gold", priority: 1 };
                    return                        { label: ko ? "🟢 양호"      : "🟢 OK",       cls: "green", priority: 0 };
                  };

                  const withStatus = systems.map(s => ({ ...s, status: getStatus(s.life) }));
                  const urgent = withStatus.filter(s => s.status.priority === 2);
                  const watch  = withStatus.filter(s => s.status.priority === 1);
                  const totalMatUrgent = urgent.reduce((s, x) => s + x.cost, 0);
                  const totalMatWatch  = watch.reduce((s, x) => s + x.cost * 0.5, 0);
                  const mult = laborMult[lvl] || 2.0;
                  const totalLaborUrgent = Math.round(totalMatUrgent * (mult - 1));
                  const totalLaborWatch  = Math.round(totalMatWatch  * (mult - 1));
                  const totalUrgent = totalMatUrgent + totalLaborUrgent;
                  const totalWatch  = totalMatWatch  + totalLaborWatch;

                  // 컨트랙터 매칭 (수리등급별)
                  const catMap = { Light: "flip", Medium: "flip", Heavy: "luxury" };
                  const matchedGC = contractorList.find(c => c.category === catMap[lvl]);

                  return (
                    <div className="card" style={{ marginTop: 0 }}>
                      <div className="card-header">
                        <span className="card-title">🔧 {ko ? `예상 수리 항목 (築 ${age}년, ${D.yearBuilt}년 준공)` : `Reno Estimate (${age}yr old, built ${D.yearBuilt})`}</span>
                      </div>
                      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {/* 시스템별 상태 테이블 */}
                        <table className="tbl">
                          <thead>
                            <tr>
                              <th>{ko ? "항목" : "System"}</th>
                              <th>{ko ? "상태" : "Status"}</th>
                              <th>{ko ? "자재비" : "Materials"}</th>
                              <th>{ko ? "인건비" : "Labor"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {withStatus.map((s, i) => (
                              <tr key={i}>
                                <td>{s.icon} {s.name}</td>
                                <td className={s.status.cls}>{s.status.label}</td>
                                <td className={s.status.priority > 0 ? s.status.cls : ""}>{s.status.priority > 0 ? fmt(s.cost) : "—"}</td>
                                <td className={s.status.priority > 0 ? "dim" : ""}>{s.status.priority > 0 ? fmt(Math.round(s.cost * (mult - 1))) : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* 인건비 배수 슬라이더 */}
                        <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--dim)" }}>👷 {ko ? `인건비 배수 (×${mult.toFixed(1)})` : `Labor Multiplier (×${mult.toFixed(1)})`}</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--gold)" }}>×{mult.toFixed(1)}</span>
                          </div>
                          <input type="range" min="1.0" max="3.5" step="0.1"
                            value={mult}
                            onChange={e => setLaborMult(m => ({ ...m, [lvl]: parseFloat(e.target.value) }))}
                            style={{ width: "100%", accentColor: "var(--gold)" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--dim)", marginTop: 4 }}>
                            <span>×1.0 {ko ? "(자재만)" : "(mat only)"}</span>
                            <span>×1.5 Light</span>
                            <span>×2.0 Medium</span>
                            <span>×2.5 Heavy</span>
                            <span>×3.5 {ko ? "(최고급)" : "(luxury)"}</span>
                          </div>
                        </div>

                        {/* 총계 — 자재비 / 인건비 / 합계 */}
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 9, color: "var(--dim)", fontWeight: 700, marginBottom: 4 }}>🪵 {ko ? "자재비" : "Materials"}</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--blue)" }}>{fmt(totalMatUrgent + totalMatWatch)}</div>
                          </div>
                          <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 9, color: "var(--dim)", fontWeight: 700, marginBottom: 4 }}>👷 {ko ? "인건비" : "Labor"}</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--gold)" }}>{fmt(totalLaborUrgent + totalLaborWatch)}</div>
                          </div>
                          <div style={{ flex: 1, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 9, color: "var(--dim)", fontWeight: 700, marginBottom: 4 }}>✅ {ko ? "총 예상 수리비" : "Total Reno"}</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--green)" }}>{fmt(totalUrgent + totalWatch)}</div>
                          </div>
                        </div>

                        {/* 컨트랙터 매칭 */}
                        {matchedGC && (
                          <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 9, color: "var(--dim)", fontWeight: 700, marginBottom: 3 }}>🏗️ {ko ? `추천 컨트랙터 (${lvl} 기준)` : `Matched Contractor (${lvl})`}</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{matchedGC.name}</div>
                              <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 2 }}>{matchedGC.specialty} · {matchedGC.sqft}/sqft · {matchedGC.rating}</div>
                            </div>
                            <a href={`https://${matchedGC.website}`} target="_blank" rel="noreferrer"
                              style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, textDecoration: "none" }}>
                              {ko ? "웹사이트 →" : "Website →"}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

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
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100, border: "1px solid var(--gold)", background: "var(--gold2)", color: "var(--gold)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
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

                {lenderList.filter(l => l.category === finCat).map((l, i) => {
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
                {contractorList.filter(c => c.category === gcCat).map((c, i) => {
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
                        const p = myProp;
                        const mcCacheKey = `${p.purchase}_${p.reno}_${p.loan}_${p.rate}_${p.holdMonths}_${p.rent}_${p.arv}_${aiLang}_${lang}`;
                        if (myCheckCacheRef.current[mcCacheKey]) { setMyCheckResult(myCheckCacheRef.current[mcCacheKey]); return; }
                        setMyCheckLoading(true); setMyCheckResult(null);
                        const totalCost = Number(p.purchase) + Number(p.reno);
                        const myCheckLang = aiLang === "en" ? "en" : aiLang === "ko" || aiLang === "bilingual" ? "ko" : lang;
                        const prompt = myCheckLang === "ko"
                          ? `Northern Virginia 부동산 투자 분석. 매입가: $${Number(p.purchase).toLocaleString()}, 공사비: $${Number(p.reno).toLocaleString()}, 대출: $${Number(p.loan).toLocaleString()}, 금리: ${p.rate}%, 보유: ${p.holdMonths}개월, 월렌트: $${Number(p.rent).toLocaleString()}, 현재ARV: $${Number(p.arv).toLocaleString()}. 총 투자: $${totalCost.toLocaleString()}. 이 딜의 매각 vs 임대 중 어떤 전략이 나은지 분석해줘. 손익분기점과 핵심 리스크(2개) 포함해서 3~4문장으로 짧게 한글로.${aiLang === "bilingual" ? " Also provide a brief English summary at the end." : ""}`
                          : `NoVA property analysis. Purchase: $${Number(p.purchase).toLocaleString()}, Reno: $${Number(p.reno).toLocaleString()}, Loan: $${Number(p.loan).toLocaleString()}, Rate: ${p.rate}%, Hold: ${p.holdMonths}mo, Rent: $${Number(p.rent).toLocaleString()}/mo, ARV: $${Number(p.arv).toLocaleString()}. Total invested: $${totalCost.toLocaleString()}. Should I sell now or hold and rent? Include breakeven and top 2 risks. Be brief — 3-4 sentences max. ${aiLangInstr}`;
                        const text = await callClaude(prompt);
                        setMyCheckResult(text);
                        myCheckCacheRef.current[mcCacheKey] = text;
                        setMyCheckLoading(false);
                      }}>
                      {myCheckLoading ? <><div className="spinner" />{t$?.mycheck.analyzing}</> : t$?.mycheck.analyzeBtn}
                    </button>
                  </div>
                </div>

                {myCheckResult && (
                  <div className="ai-box"><div className="ai-header"><div className="ai-dot" /><span className="ai-label">{t$?.mycheck.verdictLabel}</span><span style={{fontSize:8,color:"var(--dim)",marginLeft:"auto",fontStyle:"italic"}}>Reference only</span></div><div className="ai-text">{myCheckResult}</div></div>
                )}
              </div>
            )}

            {/* ── 🏗️ 재건축 분석 ─────────────────────────────────── */}
            {tab === "rebuild" && (() => {
              const ko = lang === "ko";
              const rb = rebuild;

              // ── Scenario multipliers ──────────────────────────────────────
              const scenarioMults = {
                downside: { arv: 0.90, cost: 1.10 },
                base:     { arv: 1.00, cost: 1.00 },
                upside:   { arv: 1.10, cost: 0.95 },
              };
              const sm = scenarioMults[rbScenario];
              const ltcPct = Number(rb.ltcPct) || 70;

              // ── Deal-type adjusted inputs ─────────────────────────────────
              // Renovation: minimal demo, shorter timeline, lower permit, existing sqft
              // Rebuild: full demo, full new construction, full permit
              // JV: same as rebuild but profit split with builder
              const isReno = dealType === "renovation";
              const isJV   = dealType === "jv";

              const landCost   = Number(deal.purchasePrice) || 0;
              const demo       = isReno ? Math.round((Number(rb.demoCost) || 0) * 0.2)
                                        : (Number(rb.demoCost) || 0);
              const permit     = isReno ? Math.round((Number(rb.permitCost) || 0) * 0.3)
                                        : (Number(rb.permitCost) || 0);
              const buildMo    = isReno ? Math.max(3, Math.round((Number(rb.buildMonths) || 12) * 0.4))
                                        : (Number(rb.buildMonths) || 12);
              // Renovation uses existing sqft at lower cost/sqft; rebuild uses newSqft
              const buildSqft  = isReno ? (Number(deal.sqft) || Number(rb.newSqft) || 0)
                                        : (Number(rb.newSqft) || 0);
              const renoMultiplier = isReno ? 0.55 : 1.0; // reno cost is ~55% of new build cost
              const rawConstruction = buildSqft * (Number(rb.costPerSqft) || 0) * renoMultiplier;
              const construction   = Math.round(rawConstruction * sm.cost);
              const hardCost       = demo + permit + construction;
              const contingency    = Math.round(hardCost * (Number(rb.contingencyPct) || 0) / 100);

              // ── Financing ─────────────────────────────────────────────────
              const loanBase   = landCost + hardCost + contingency;
              const loanAmt    = Math.round(loanBase * ltcPct / 100);
              const drawFactor = rb.drawSchedule ? 0.55 : 1.0;
              const carryingCost = Math.round(
                loanAmt * drawFactor * (Number(rb.ratePct) || 0) / 100 * buildMo / 12
              );

              // ── Cost structure ────────────────────────────────────────────
              // nonLandCost = ALL costs except land (what builder/developer controls)
              const nonLandCost = demo + permit + construction + contingency + carryingCost;
              const totalAllIn  = landCost + nonLandCost;
              const equity      = totalAllIn - loanAmt;

              // ── Sales ─────────────────────────────────────────────────────
              const rawArv      = (arvSource === 'comp' && rebuildComps?.arvSuggested > 0)
                ? Number(rebuildComps.arvSuggested)
                : Number(rb.arvNew) || 0;
              const arvMissing  = !rawArv || rawArv <= 0; // guard: do not calculate when ARV not entered
              const arv         = arvMissing ? 0 : Math.round(rawArv * sm.arv);
              const sellingCostPct = 0.075; // 6% broker + 1.5% seller closing
              // sellingCost is % of sale price, not fixed
              const sellingCost    = arvMissing ? 0 : Math.round(arv * sellingCostPct);
              const netSalesProceeds = arvMissing ? 0 : arv - sellingCost; // NSP

              // ── Profit & ROI ──────────────────────────────────────────────
              // All downstream values are null when ARV is missing — never show 0-based garbage
              const profit      = arvMissing ? null : netSalesProceeds - totalAllIn;
              const roiOnTotal  = arvMissing ? null : (totalAllIn > 0 ? ((netSalesProceeds - totalAllIn) / totalAllIn * 100) : 0);
              const cocRoi      = arvMissing ? null : (equity > 0 ? (profit / equity * 100) : 0);
              const totalMonths = buildMo + 3; // build + 3mo stabilization/sale
              const annRoi      = arvMissing ? null : (totalMonths > 0 ? (roiOnTotal / totalMonths * 12) : 0);

              // ── Feasibility reverse-engineering ───────────────────────────
              // Key identity:  totalAllIn = (1+F)[L + HC(1+k)]
              //   where F = finFactor, k = contFactor, HC = hardCost
              //
              // (1) Max Land — hold HC & ARV fixed, solve for L:
              //     NSP = (1+roi)·totalAllIn = (1+roi)(1+F)[L + HC(1+k)]
              //     L_max = NSP / [(1+roi)(1+F)] − HC(1+k)
              //
              // (2) Max HC — hold L & ARV fixed, solve for HC:
              //     HC_max = [NSP/(1+roi) − L(1+F)] / [(1+k)(1+F)]
              //            = (maxNL − L·F) / [(1+k)(1+F)]        ← in code below
              //
              // (3) Required ARV — hold L & HC fixed (totalAllIn unchanged, LTC loan):
              //     ARV_req = totalAllIn(1+roi) / (1−sellingPct)
              //
              // NOTE: finFactor and contFactor are pre-computed here so calcMaxLand
              //       can use them (they were previously defined later in the block).
              const finFactor  = (ltcPct / 100) * (rb.drawSchedule ? 0.55 : 1.0) * (Number(rb.ratePct) || 0) / 100 * buildMo / 12;
              const contFactor = (Number(rb.contingencyPct) || 0) / 100;

              // Break-even land = max land at 0% ROI
              const breakEvenLand = arvMissing || netSalesProceeds <= 0 ? 0
                : Math.max(0, Math.round(netSalesProceeds / (1 + finFactor) - hardCost * (1 + contFactor)));

              const calcMaxLand = (roi) => {
                if (arvMissing || netSalesProceeds <= 0) return 0;
                // Correct formula: L_max = NSP / [(1+roi)(1+F)] − HC(1+k)
                return Math.max(0, Math.round(
                  netSalesProceeds / ((1 + roi) * (1 + finFactor)) - hardCost * (1 + contFactor)
                ));
              };
              const calcRequiredSale = (roi) =>
                Math.round(totalAllIn * (1 + roi) / (1 - sellingCostPct));

              const maxLand20 = calcMaxLand(0.20);
              const maxLand25 = calcMaxLand(0.25);
              const maxLand30 = calcMaxLand(0.30);
              const reqSale20 = calcRequiredSale(0.20);
              const reqSale25 = calcRequiredSale(0.25);

              const gapTo20   = landCost - maxLand20;
              const gapTo25   = landCost - maxLand25;

              // ── Construction Cost Feasibility ────────────────────────────
              // HC_max = (maxNL − L·F) / [(1+k)(1+F)]  where maxNL = NSP/(1+roi) − L
              // (finFactor and contFactor already defined above)
              const calcMaxHardCost = (roi) => {
                if (arvMissing || netSalesProceeds <= 0) return 0;
                const maxNL = netSalesProceeds / (1 + roi) - landCost;
                if (maxNL <= 0) return 0;
                return Math.max(0, Math.round((maxNL - landCost * finFactor) / ((1 + contFactor) * (1 + finFactor))));
              };
              const maxHC20 = calcMaxHardCost(0.20);
              const maxHC25 = calcMaxHardCost(0.25);
              const currentCostSqft = buildSqft > 0 ? Math.round(construction / buildSqft) : 0;
              const maxCostSqft20   = (buildSqft > 0 && maxHC20 > demo + permit) ? Math.round((maxHC20 - demo - permit) / buildSqft) : 0;
              const maxCostSqft25   = (buildSqft > 0 && maxHC25 > demo + permit) ? Math.round((maxHC25 - demo - permit) / buildSqft) : 0;
              const gapCostSqft20   = currentCostSqft - maxCostSqft20;
              const gapCostSqft25   = currentCostSqft - maxCostSqft25;

              // ── Upside scenario check (ARV +10%, cost ×0.95) ────────────
              const upsideArvRaw  = arvMissing ? 0 : Math.round(rawArv * 1.10);
              const upsideNsp     = upsideArvRaw - Math.round(upsideArvRaw * 0.075);
              const upsideConst   = Math.round(rawConstruction * 0.95);
              const upsideHC      = demo + permit + upsideConst;
              const upsideCont    = Math.round(upsideHC * contFactor);
              const upsideLoan    = Math.round((landCost + upsideHC + upsideCont) * ltcPct / 100);
              const upsideCarry   = Math.round(upsideLoan * (rb.drawSchedule ? 0.55 : 1) * (Number(rb.ratePct) || 0) / 100 * buildMo / 12);
              const upsideTotal   = landCost + demo + permit + upsideConst + upsideCont + upsideCarry;
              const upsideProfit  = upsideNsp - upsideTotal;
              const upsideRoi     = (!arvMissing && upsideTotal > 0) ? (upsideProfit / upsideTotal * 100) : 0;
              const upside_clears_min = !arvMissing && upsideRoi >= 20;

              // ── Verdict (conservative: 20% minimum, 25% preferred) ────────
              // null when ARV is missing — prevents 0-based false NO-GO
              const verdict = arvMissing ? null :
                roiOnTotal >= 25 ? "GO" :
                roiOnTotal >= 20 ? "WATCH" : "NO-GO";
              const verdictColor =
                verdict === "GO"     ? "var(--green)" :
                verdict === "WATCH"  ? "var(--gold)"  :
                verdict === "NO-GO"  ? "var(--red)"   : "var(--dim)";

              // ── Builder JV (uses hardCost as fee basis) ───────────────────
              const jvBuilderFee    = Math.round(hardCost * (Number(jvParams.builderFee) || 0) / 100);
              const jvDeferredFee   = Math.round(arv * (Number(jvParams.deferredFee) || 0) / 100);
              const jvPrefReturn    = Math.round(equity * (Number(jvParams.preferredReturn) || 0) / 100);
              const jvNetProfit     = profit - jvBuilderFee - jvDeferredFee;
              const splitPct        = (Number(jvParams.profitSplit) || 50) / 100;
              const jvSponsorProfit = jvNetProfit > jvPrefReturn
                ? jvPrefReturn + (jvNetProfit - jvPrefReturn) * splitPct
                : Math.min(jvNetProfit, jvPrefReturn);
              const jvBuilderProfit = jvNetProfit > jvPrefReturn
                ? (jvNetProfit - jvPrefReturn) * (1 - splitPct) + jvBuilderFee + jvDeferredFee
                : Math.max(0, jvNetProfit - jvSponsorProfit) + jvBuilderFee + jvDeferredFee;
              const jvSponsorRoi    = equity > 0 ? (jvSponsorProfit / equity * 100) : 0;
              // JV ROI improved? (sponsor earns more than going-it-alone on equity)
              const jvImproves      = isJV && jvSponsorRoi > cocRoi;

              // ── Tooltip component ─────────────────────────────────────────
              const Tip = ({ text }) => (
                <span title={text} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 14, height: 14, borderRadius: "50%", background: "rgba(75,139,255,0.15)",
                  color: "var(--blue)", fontSize: 9, fontWeight: 800, cursor: "help",
                  marginLeft: 4, flexShrink: 0, lineHeight: 1,
                }}>?</span>
              );

              // ── Input component ───────────────────────────────────────────
              const RbInput = ({ labelKo, labelEn, field, prefix, suffix, min, max, step, tip, stateKey }) => {
                const stateObj = stateKey === 'jv' ? jvParams : rb;
                const setter   = stateKey === 'jv'
                  ? (e) => setJvParams(s => ({ ...s, [field]: e.target.value }))
                  : (e) => setRebuild(s => ({ ...s, [field]: e.target.value }));
                return (
                  <div>
                    <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
                      {ko ? labelKo : labelEn}{tip && <Tip text={tip} />}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      {prefix && <span style={{ fontSize: 12, color: "var(--dim)" }}>{prefix}</span>}
                      <input className="task-input" style={{ flex: 1 }} type="number"
                        min={min} max={max} step={step || 1}
                        value={stateObj[field]}
                        onChange={setter} />
                      {suffix && <span style={{ fontSize: 12, color: "var(--dim)" }}>{suffix}</span>}
                    </div>
                  </div>
                );
              };

              // ── Scenario calc helper ──────────────────────────────────────
              const calcScenario = (arvMult, costMult) => {
                const sConst   = Math.round(rawConstruction * costMult);
                const sHard    = demo + permit + sConst;
                const sCont    = Math.round(sHard * (Number(rb.contingencyPct)||0) / 100);
                const sLoan    = Math.round((landCost + sHard + sCont) * ltcPct / 100);
                const sCarry   = Math.round(sLoan * drawFactor * (Number(rb.ratePct)||0) / 100 * buildMo / 12);
                const sNonLand = demo + permit + sConst + sCont + sCarry;
                const sTotal   = landCost + sNonLand;
                const sEquity  = sTotal - sLoan;
                const sArv     = Math.round(rawArv * arvMult);
                const sSell    = Math.round(sArv * sellingCostPct);
                const sNSP     = sArv - sSell;
                const sProfit  = sNSP - sTotal;
                const sRoi     = sTotal > 0 ? (sProfit / sTotal * 100) : 0;
                const sCoc     = sEquity > 0 ? (sProfit / sEquity * 100) : 0;
                const sMaxL20  = sNSP > 0 ? Math.round(sNSP / 1.20 - sNonLand) : 0;
                const sVerdict = sRoi >= 25 ? "GO" : sRoi >= 20 ? "WATCH" : "NO-GO";
                return { arv: sArv, nsp: sNSP, total: sTotal, equity: sEquity,
                         profit: sProfit, roi: sRoi, coc: sCoc, maxL20: sMaxL20, verdict: sVerdict };
              };

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <PropHeader />

                  {/* ── Deal Type ── */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🏷️ {ko ? "딜 유형" : "Deal Type"}</span>
                      <span style={{ fontSize: 10, color: "var(--dim)" }}>
                        {isReno && (ko ? "Demo 20% · 기간 40% · 공사비 55% 적용" : "Demo 20% · Timeline 40% · Cost 55% of rebuild")}
                        {dealType === "rebuild" && (ko ? "Full Teardown & New Construction" : "Full Teardown & New Construction")}
                        {isJV   && (ko ? "빌더 파트너십 구조" : "Builder Partnership Structure")}
                      </span>
                    </div>
                    <div className="card-body" style={{ paddingTop: 12, paddingBottom: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {[
                          { id: "renovation", ko: "수리 플립", en: "Renovation Flip" },
                          { id: "rebuild",    ko: "신축 재건축", en: "Tear-down Rebuild" },
                          { id: "jv",         ko: "JV 빌더 파트너십", en: "Builder JV" },
                        ].map(d => (
                          <button key={d.id} className={`reno-btn ${dealType === d.id ? "active" : ""}`}
                            onClick={() => setDealType(d.id)}>
                            {ko ? d.ko : d.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* ── Comp Summary / Market Reality ── */}
                  <div className="card">
                    <div className="card-header" style={{ flexWrap: "wrap", gap: 8 }}>
                      <span className="card-title">🏘️ {ko ? "신축 시세 비교" : "New Build Comps"}</span>
                      {/* Target sqft inline — drives comp filter range */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 0, flex: "0 0 auto" }}>
                        <span style={{ fontSize: 9, color: "var(--dim)", whiteSpace: "nowrap" }}>{ko ? "목표 면적" : "Target sqft"}</span>
                        <input
                          type="number" min={500} step={100}
                          value={rebuild.newSqft}
                          onChange={e => setRebuild(s => ({ ...s, newSqft: +e.target.value || 2200, newSqftSource: 'manual' }))}
                          style={{
                            width: 72, padding: "2px 6px", borderRadius: 5, fontSize: 11,
                            background: "var(--surface2)", border: "1px solid var(--border)",
                            color: "var(--text)", fontFamily: "DM Mono", textAlign: "right",
                          }}
                        />
                        <span style={{ fontSize: 9, color: "var(--dim)" }}>sqft</span>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={fetchNewConstructionComps} disabled={rebuildCompsLoading}>
                        {rebuildCompsLoading ? <><div className="spinner" />{ko ? "조회중..." : "Fetching..."}</> : `🔍 ${ko ? "시세 조회" : "Fetch Comps"}`}
                      </button>
                    </div>
                    <div className="card-body">
                      {!rebuildComps && !rebuildCompsLoading && (
                        <div style={{ textAlign: "center", padding: "16px 0", color: "var(--dim)", fontSize: 11, lineHeight: 1.7 }}>
                          <div style={{ fontSize: 22, marginBottom: 6 }}>📊</div>
                          <div>{ko ? "주변 신축 실거래가를 조회하면 시장에서 적정 ARV를 확인할 수 있습니다." : "Fetch nearby new-build comps to anchor your ARV estimate."}</div>
                          <div style={{ marginTop: 4, color: "var(--dim)", fontSize: 10 }}>{ko ? "ARV는 comps가 정하고, ROI는 그 아래에서 딜이 되는지 검증합니다." : "Market sets the ARV — feasibility follows from there."}</div>
                        </div>
                      )}
                      {rebuildComps?.error && (
                        <div style={{ background: "var(--red2)", borderRadius: 10, padding: "10px 14px", fontSize: 11, color: "var(--red)" }}>⚠️ {rebuildComps.error}</div>
                      )}
                      {rebuildComps && !rebuildComps.error && (
                        <>
                          {/* Market Analysis note */}
                          <div className="ai-box" style={{ marginBottom: 12 }}>
                            <div className="ai-header">
                              <div className="ai-dot" />
                              <span className="ai-label">{ko ? "시장 분석" : "Market Context"}</span>
                              {(() => {
                                const ns = Number(rebuild.newSqft) || 2200;
                                const lo = Math.round(ns * 0.85);
                                const hi = Math.round(ns * 1.25);
                                return (
                                  <span style={{ fontSize: 8, color: "var(--green)", marginLeft: "auto", fontWeight: 700 }}>
                                    {ko ? `신축 comp 기준: ${lo.toLocaleString()}–${hi.toLocaleString()} sqft` : `New build comps: ${lo.toLocaleString()}–${hi.toLocaleString()} sqft`}
                                  </span>
                                );
                              })()}
                            </div>
                            <div className="ai-text">{ko ? rebuildComps.marketNoteKo : rebuildComps.marketNote}</div>
                          </div>
                          {/* Comps table — grouped by type */}
                          {(() => {
                            const allComps = rebuildComps.comps || [];
                            const groups = [
                              { type: 'new_build', label: ko ? '🏗️ 신축 ARV 기준' : '🏗️ New Build Comps', sublabel: ko ? 'ARV 산정 기준' : 'Drives ARV estimate', color: 'var(--green)', bg: 'rgba(75,199,110,0.07)' },
                              { type: 'teardown',  label: ko ? '🏚️ Teardown / 토지 참고' : '🏚️ Teardown / Land Comps', sublabel: ko ? '토지 가치 참고용' : 'Land value reference', color: 'var(--gold)', bg: 'rgba(226,184,75,0.07)' },
                              { type: 'existing',  label: ko ? '🏠 기존 주택 (참고)' : '🏠 Existing Homes (Reference)', sublabel: ko ? 'ARV에 영향 없음' : 'Not used for ARV', color: 'var(--dim)', bg: 'rgba(255,255,255,0.03)' },
                            ];
                            return groups.map(({ type, label, sublabel, color, bg }) => {
                              const groupComps = allComps.filter(c => c.compType === type);
                              if (groupComps.length === 0) return null;
                              return (
                                <div key={type} style={{ marginBottom: 14 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '4px 8px', background: bg, borderRadius: 6, borderLeft: `3px solid ${color}` }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
                                    <span style={{ fontSize: 9, color: 'var(--dim)', fontStyle: 'italic' }}>{sublabel}</span>
                                  </div>
                                  <table className="tbl" style={{ marginBottom: 0 }}>
                                    <thead><tr>
                                      <th>{ko ? "지역" : "Area"}</th>
                                      <th style={{ textAlign: "right" }}>sqft</th>
                                      <th style={{ textAlign: "right" }}>{ko ? "매도가" : "Sold"}</th>
                                      <th style={{ textAlign: "right" }}>$/sqft</th>
                                      <th style={{ textAlign: "right" }}>{ko ? "연도" : "Year"}</th>
                                    </tr></thead>
                                    <tbody>
                                      {groupComps.map((c, i) => (
                                        <tr key={i} style={{ opacity: type === 'existing' ? 0.7 : 1 }}>
                                          <td style={{ maxWidth: 130 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                              <span>{c.area}</span>
                                              {c.note && <span style={{ fontSize: 9, color: 'var(--dim)', fontStyle: 'italic' }}>{c.note}</span>}
                                            </div>
                                          </td>
                                          <td className="mono" style={{ textAlign: "right", color: type === 'new_build' ? color : undefined }}>{(c.sqft||0).toLocaleString()}</td>
                                          <td className="gold" style={{ textAlign: "right" }}>{fmt(c.soldPrice)}</td>
                                          <td style={{ textAlign: "right", color: type === 'new_build' ? 'var(--green)' : 'var(--dim)', fontFamily: 'DM Mono', fontSize: 11 }}>${(c.pricePerSqft||0).toLocaleString()}</td>
                                          <td className="mono" style={{ textAlign: "right", opacity: 0.7 }}>{c.year}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            });
                          })()}
                          {/* ARV Range: Conservative / Base / Aggressive */}
                          {rebuildComps.arvSuggested > 0 && (() => {
                            const psf           = rebuildComps.newBuildMedianPsf || rebuildComps.medianPsf || 0;
                            const psfMin        = rebuildComps.newBuildPsfRange?.min || 0;
                            const psfMax        = rebuildComps.newBuildPsfRange?.max || 0;
                            const ns            = Number(rebuild.newSqft) || 2200;
                            const nbCount       = rebuildComps._nbCount ?? (rebuildComps.comps || []).filter(c => c.compType === 'new_build').length;
                            const filteredCount = rebuildComps._filteredCount || 0;
                            const psfSpreadPct  = rebuildComps._psfSpreadPct || 0;
                            const oldestYear    = rebuildComps._oldestCompYear || 0;
                            const expandedFilter= rebuildComps._expandedFilter || false;
                            const conf          = rebuildComps.arvConfidence || 'medium';
                            const confReason    = ko ? (rebuildComps.arvConfidenceReasonKo || rebuildComps.arvConfidenceReason || '') : (rebuildComps.arvConfidenceReason || '');
                            const fMin = rebuildComps._filterMin || Math.round(ns * 0.75);
                            const fMax = rebuildComps._filterMax || Math.round(ns * 1.25);

                            // ARV range — data-driven when possible, capped to prevent wild swings
                            const base = rebuildComps.arvSuggested;
                            // Spread depends on comp count: more comps = tighter data, use psfMin/Max but cap
                            const spreadPct = nbCount >= 3 ? 0.10 : nbCount === 2 ? 0.08 : 0.13;
                            const capLow  = 1 - spreadPct;      // conservative floor
                            const capHigh = 1 + spreadPct;      // aggressive ceiling
                            // Use actual psfMin/Max when available, but clamp to cap
                            const consFromData = psfMin > 0 ? Math.round(psfMin * ns / 5000) * 5000 : 0;
                            const aggrFromData = psfMax > 0 ? Math.round(psfMax * ns / 5000) * 5000 : 0;
                            const cons = consFromData > 0
                              ? Math.max(consFromData, Math.round(base * capLow / 5000) * 5000)
                              : Math.round(base * capLow / 5000) * 5000;
                            const aggr = aggrFromData > 0
                              ? Math.min(aggrFromData, Math.round(base * capHigh / 5000) * 5000)
                              : Math.round(base * capHigh / 5000) * 5000;

                            const confColor = conf === 'high' ? 'var(--green)' : conf === 'medium' ? 'var(--gold)' : 'var(--red)';
                            const confBg    = conf === 'high' ? 'rgba(75,199,110,0.12)' : conf === 'medium' ? 'rgba(226,184,75,0.12)' : 'rgba(232,74,95,0.12)';
                            const confIcon  = conf === 'high' ? '✅' : conf === 'medium' ? '⚠️' : '🔴';
                            const confLabel = conf === 'high' ? (ko ? '높음' : 'High') : conf === 'medium' ? (ko ? '보통' : 'Medium') : (ko ? '낮음' : 'Low');

                            // Effective PSF for each tier (inferred from ARV / sqft)
                            const consPsf = ns > 0 ? Math.round(cons / ns) : 0;
                            const basePsf = ns > 0 ? Math.round(base / ns) : 0;
                            const aggrPsf = ns > 0 ? Math.round(aggr / ns) : 0;
                            const tiers = [
                              { key: 'cons', label: ko ? "보수적" : "Conservative",
                                val: cons, color: "var(--blue)", psf: consPsf,
                                desc: psfMin > 0 ? (ko ? `실제 comp 최저 PSF` : `Actual low comp PSF`) : (ko ? `중앙값 -${Math.round(spreadPct*100)}%` : `Median -${Math.round(spreadPct*100)}%`) },
                              { key: 'base', label: ko ? "중앙값 기준" : "Median Base",
                                val: base, color: "var(--gold)", psf: basePsf,
                                desc: ko ? `신축 comp 중앙 $/sqft` : `New-build comp median psf` },
                              { key: 'aggr', label: ko ? "공격적" : "Aggressive",
                                val: aggr, color: "var(--green)", psf: aggrPsf,
                                desc: psfMax > 0 ? (ko ? `실제 comp 최고 PSF` : `Actual high comp PSF`) : (ko ? `중앙값 +${Math.round(spreadPct*100)}%` : `Median +${Math.round(spreadPct*100)}%`) },
                            ];

                            return (
                              <div style={{ marginTop: 4 }}>
                                {/* ── Confidence banner — prominent ── */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, padding: '8px 12px', background: confBg, borderRadius: 8, border: `1px solid ${confColor}44` }}>
                                  <span style={{ fontSize: 14, lineHeight: 1 }}>{confIcon}</span>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: confColor, letterSpacing: '0.04em' }}>
                                      {ko ? 'ARV 신뢰도' : 'ARV Confidence'}: {confLabel}
                                    </div>
                                    {confReason && <div style={{ fontSize: 9, color: 'var(--mid)', marginTop: 2, lineHeight: 1.5 }}>{confReason}</div>}
                                  </div>
                                </div>

                                {/* ── Warning banners — filter expansion, filtered comps ── */}
                                {expandedFilter && (
                                  <div style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 10px', background:'rgba(226,184,75,0.1)', border:'1px solid rgba(226,184,75,0.3)', borderRadius:6, marginBottom:8, fontSize:9, color:'var(--gold)' }}>
                                    <span>⚡</span>
                                    <span>{ko ? `Comp 부족으로 필터 범위 확장됨 (±30%)` : `Sqft filter expanded to ±30% — limited comps in target range`}</span>
                                  </div>
                                )}
                                {filteredCount > 0 && (
                                  <div style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 10px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:6, marginBottom:8, fontSize:9, color:'var(--red)' }}>
                                    <span>🚫</span>
                                    <span>{ko ? `AI 제공 comp ${filteredCount}개가 품질 검증 실패 (면적·연도·단가 기준)로 제외됨` : `${filteredCount} AI-provided comp(s) removed — failed sqft, year, or PSF quality check`}</span>
                                  </div>
                                )}

                                {/* ── ARV basis chips ── */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                                  {[
                                    { label: ko ? '신축 comps' : 'New-build comps', val: `${nbCount}`, color: nbCount >= 3 ? 'var(--green)' : nbCount >= 2 ? 'var(--gold)' : 'var(--red)', suffix: ko ? '개' : '' },
                                    { label: ko ? '목표 면적' : 'Target sqft', val: `${ns.toLocaleString()} sqft`, color: 'var(--text)' },
                                    { label: ko ? 'Comp 필터' : 'Comp filter', val: `${fMin.toLocaleString()}–${fMax.toLocaleString()} sqft`, color: expandedFilter ? 'var(--gold)' : 'var(--dim)' },
                                    { label: ko ? '중앙 $/sqft' : 'Median $/sqft', val: psf > 0 ? `$${psf.toLocaleString()}` : '—', color: 'var(--gold)' },
                                    ...(psfMin > 0 && psfMax > psfMin ? [{ label: ko ? 'PSF 범위' : 'PSF range', val: `$${psfMin.toLocaleString()}–$${psfMax.toLocaleString()}`, color: psfSpreadPct > 40 ? 'var(--red)' : 'var(--dim)' }] : []),
                                    ...(oldestYear > 0 ? [{ label: ko ? '최근 comp' : 'Oldest comp', val: `${oldestYear}년`, color: oldestYear >= 2023 ? 'var(--green)' : oldestYear >= 2022 ? 'var(--gold)' : 'var(--red)' }] : []),
                                  ].map(({ label, val, color, suffix }) => (
                                    <div key={label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', display: 'flex', gap: 4, alignItems: 'baseline' }}>
                                      <span style={{ fontSize: 8, color: 'var(--dim)', whiteSpace: 'nowrap' }}>{label}</span>
                                      <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: 'DM Mono', whiteSpace: 'nowrap' }}>{val}{suffix || ''}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* 3-tier ARV cards */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                                  {tiers.map(({ key, label, val, color, psf: tpsf, desc }) => (
                                    <div key={key} style={{ background: `${color}0d`, border: `1px solid ${color}33`, borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
                                      <div style={{ fontSize: 8, color, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
                                      <div style={{ fontFamily: "DM Mono", fontSize: 14, fontWeight: 700, color }}>{fmt(val)}</div>
                                      {tpsf > 0 && <div style={{ fontSize: 8, color: 'var(--dim)', fontFamily: 'DM Mono' }}>${tpsf.toLocaleString()}/sqft</div>}
                                      <div style={{ fontSize: 8, color: 'var(--dim)', fontStyle: 'italic', marginBottom: 2 }}>{desc}</div>
                                      <button onClick={() => { setRebuild(s => ({ ...s, arvNew: val })); setArvSource('comp'); }}
                                        style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, border: `1px solid ${color}55`,
                                          background: `${color}12`, color, cursor: "pointer", fontWeight: 700, letterSpacing: "0.05em" }}>
                                        {ko ? "이 ARV 적용" : "Use this ARV"}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>



                  {/* ── Scenario Toggle ── */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📊 {ko ? "시나리오" : "Scenario"}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { key: "downside", label: ko ? "▼ 하락" : "▼ Down",  desc: ko ? "ARV -10%, 공사비 +10%" : "ARV -10%, Cost +10%" },
                          { key: "base",     label: ko ? "◆ 기준" : "◆ Base",  desc: ko ? "입력값 기준" : "As entered" },
                          { key: "upside",   label: ko ? "▲ 상승" : "▲ Up",    desc: ko ? "ARV +10%, 공사비 -5%" : "ARV +10%, Cost -5%" },
                        ].map(s => (
                          <button key={s.key} title={s.desc} onClick={() => setRbScenario(s.key)} style={{
                            padding: "4px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                            fontFamily: "'Sora',sans-serif", cursor: "pointer",
                            border: rbScenario === s.key ? "1px solid var(--gold)" : "1px solid var(--border)",
                            background: rbScenario === s.key ? "var(--gold2)" : "var(--bg3)",
                            color: rbScenario === s.key ? "var(--gold)" : "var(--dim)",
                          }}>{s.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--dim)" }}>
                        {rbScenario === "downside" && (ko ? "▼ ARV -10%, 공사비 +10% 가정 — 보수적 시나리오" : "▼ ARV -10%, Construction Cost +10% — conservative case")}
                        {rbScenario === "base"     && (ko ? "◆ 입력값 그대로 기준 분석" : "◆ Base case — as entered")}
                        {rbScenario === "upside"   && (ko ? "▲ ARV +10%, 공사비 -5% 가정 — 낙관적 시나리오" : "▲ ARV +10%, Construction Cost -5% — optimistic case")}
                      </span>
                    </div>
                  </div>

                  {/* ── Inputs ── */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">⚙️ {ko ? "프로젝트 입력값" : "Project Inputs"}</span>
                      <button className="btn btn-ghost btn-sm" onClick={estimateRebuildCosts} disabled={rebuildEstLoading}>
                        {rebuildEstLoading ? <><div className="spinner" />{ko ? "계산중..." : "Estimating..."}</> : `✨ ${ko ? "AI 자동입력" : "AI Auto-Fill"}`}
                      </button>
                    </div>
                    <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {rebuildEstNote && (
                        <div style={{ fontSize: 11, color: "var(--gold)", background: "var(--gold3)", borderRadius: 8, padding: "8px 12px" }}>{rebuildEstNote}</div>
                      )}
                      {isReno && (
                        <div style={{ fontSize: 11, color: "var(--blue)", background: "rgba(75,139,255,0.06)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(75,139,255,0.15)" }}>
                          ℹ️ {ko ? "수리 플립 모드: Demo 20%, 공사 기간 40%, 공사비 55% 자동 적용. 기존 sqft 사용." : "Renovation mode: Demo 20%, Timeline 40%, Cost 55% applied. Uses existing sqft."}
                        </div>
                      )}
                      {/* Lot Size */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                            {ko ? "토지 면적 (sqft)" : "Lot Size (sqft)"}<Tip text={ko ? "Fairfax County FAR 계산에 사용" : "Used for Fairfax County FAR calculation"} />
                            <span style={{
                              fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", padding: "1px 5px", borderRadius: 4,
                              background: rb.lotSource === 'screening' ? "rgba(52,211,153,0.2)" : rb.lotSource === 'manual' ? "rgba(75,139,255,0.2)" : "rgba(255,255,255,0.07)",
                              color: rb.lotSource === 'screening' ? "var(--green)" : rb.lotSource === 'manual' ? "var(--blue)" : "var(--dim)",
                            }}>
                              {rb.lotSource === 'screening' ? "✓ screening" : rb.lotSource === 'manual' ? "✎ manual" : "default"}
                            </span>
                          </label>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                            <input className="task-input" type="number" min={0} value={rb.lotSqft}
                              onChange={e => setRebuild(s => ({ ...s, lotSqft: e.target.value, lotSource: 'manual' }))} style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, color: "var(--dim)" }}>sqft</span>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            {ko ? "토지 면적 (에이커)" : "Lot (acres)"}
                          </label>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                            <input className="task-input" type="number" min={0} step={0.001}
                              value={rb.lotSqft > 0 ? (Number(rb.lotSqft) / 43560).toFixed(3) : ""}
                              onChange={e => setRebuild(s => ({ ...s, lotSqft: Math.round(parseFloat(e.target.value || 0) * 43560), lotSource: 'manual' }))}
                              style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, color: "var(--dim)" }}>ac</span>
                          </div>
                        </div>
                        {/* AI lot reference */}
                        {rb.aiLotSqft > 0 && (
                          <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6,
                            background: "rgba(248,191,90,0.08)", border: "1px solid rgba(248,191,90,0.2)", marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, whiteSpace: "nowrap" }}>AI ref:</span>
                            <span style={{ fontFamily: "DM Mono", fontSize: 11, color: "var(--dim)" }}>
                              {rb.aiLotSqft.toLocaleString()} sqft ({(rb.aiLotSqft / 43560).toFixed(3)} ac)
                            </span>
                            <span style={{ fontSize: 9, color: "var(--dim)", fontStyle: "italic", flex: 1 }}>
                              {ko ? "— 참고용, 계산에 미반영" : "— reference only, not used in calc"}
                            </span>
                            {rb.lotSource === 'default' && (
                              <button className="btn btn-ghost btn-sm" style={{ fontSize: 9, padding: "2px 8px" }}
                                onClick={() => setRebuild(s => ({ ...s, lotSqft: s.aiLotSqft, lotSource: 'manual' }))}>
                                {ko ? "적용" : "Apply"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <RbInput labelKo="철거비" labelEn="Demo Cost" field="demoCost" prefix="$"
                          tip={isReno ? "Renovation mode: 20% of entered value applied" : "Full teardown cost — county-based $15K-$40K"} />
                        <RbInput labelKo="설계/허가비" labelEn="Permits & Design" field="permitCost" prefix="$"
                          tip={isReno ? "Renovation: 30% of entered value applied" : "Fairfax $10K-$22K / Arlington $12K-$26K"} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {/* New Build SQFT — editable + preset buttons */}
                        <div>
                          <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
                            {ko ? (isReno ? "기존 면적" : "신축 면적") : (isReno ? "Existing Sqft" : "New Build (sqft)")}
                            <Tip text={isReno ? "Uses existing sqft for renovation cost calc" : "Target buildable sqft — Fairfax FAR: 0.38–0.50× lot size. Always editable."} />
                            {!isReno && <span style={{
                              fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", padding: "1px 5px", borderRadius: 4, marginLeft: "auto",
                              background: rb.newSqftSource === 'preset' ? "rgba(226,184,75,0.2)" : rb.newSqftSource === 'manual' ? "rgba(75,139,255,0.2)" : "rgba(255,255,255,0.07)",
                              color: rb.newSqftSource === 'preset' ? "var(--gold)" : rb.newSqftSource === 'manual' ? "var(--blue)" : "var(--dim)",
                            }}>
                              {rb.newSqftSource === 'preset' ? "✓ preset" : rb.newSqftSource === 'manual' ? "✎ manual" : "default"}
                            </span>}
                          </label>
                          {/* Presets — Conservative / Base / Aggressive */}
                          {!isReno && (() => {
                            const ls = Number(rb.lotSqft) || 0;
                            const price = Number(deal.purchasePrice) || 0;
                            // FAR-based if lot known; price-tier fallback if not
                            const cons = ls > 0 ? Math.round(ls * 0.38 / 100) * 100
                              : price > 2000000 ? 5000 : price > 1200000 ? 4200 : 3500;
                            const base = ls > 0 ? Math.round(ls * 0.44 / 100) * 100
                              : price > 2000000 ? 6000 : price > 1200000 ? 5200 : 4200;
                            const aggr = ls > 0 ? Math.round(ls * 0.50 / 100) * 100
                              : price > 2000000 ? 7000 : price > 1200000 ? 6200 : 5000;
                            const current = Number(rb.newSqft) || 0;
                            return (
                              <div style={{ display: "flex", gap: 3, marginTop: 4, marginBottom: 5 }}>
                                {[
                                  { label: ko ? "보수" : "Cons", val: cons, color: "var(--blue)" },
                                  { label: ko ? "기준" : "Base", val: base, color: "var(--gold)" },
                                  { label: ko ? "공격" : "Aggr", val: aggr, color: "var(--green)" },
                                ].map(({ label, val, color }) => (
                                  <button key={label} onClick={() => setRebuild(s => ({ ...s, newSqft: val, newSqftSource: 'preset' }))}
                                    style={{
                                      flex: 1, padding: "3px 2px", borderRadius: 5, cursor: "pointer",
                                      border: `1px solid ${current === val ? color : "var(--border)"}`,
                                      background: current === val ? `${color}22` : "transparent",
                                      color: current === val ? color : "var(--dim)",
                                      fontSize: 8, fontWeight: 700, lineHeight: 1.3, textAlign: "center",
                                    }}>
                                    <div>{label}</div>
                                    <div style={{ fontFamily: "DM Mono", fontSize: 8 }}>{val.toLocaleString()}</div>
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input className="task-input" type="number" min={0} step={100}
                              value={rb.newSqft}
                              onChange={e => setRebuild(s => ({ ...s, newSqft: e.target.value }))}
                              style={{ flex: 1 }} />
                            <span style={{ fontSize: 11, color: "var(--dim)" }}>sqft</span>
                          </div>
                          {!isReno && (
                            <div style={{ fontSize: 8, color: "var(--dim)", marginTop: 3, fontStyle: "italic" }}>
                              {ko ? "기본값은 참고용 — 직접 입력 권장" : "Default is a starting assumption — edit freely"}
                            </div>
                          )}
                        </div>
                        <RbInput labelKo="공사비/sqft" labelEn="Cost/sqft" field="costPerSqft" prefix="$" suffix="/sqft"
                          tip={isReno ? "Renovation: auto-adjusted to 55% of entered $/sqft" : "2026 NoVA: Standard $280-380 / Quality $380-480 / Luxury $450-580 / Ultra $550-800"} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        <RbInput labelKo="공사 기간" labelEn="Build Months" field="buildMonths" suffix="mo"
                          tip={isReno ? "Renovation: 40% of entered months applied" : "Typical: 12-16mo rebuild, 16-20mo for large builds"} />
                        {/* ARV 3-mode input */}
                        <div>
                          <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", marginBottom: 4 }}>
                            {ko ? "예상 신축 ARV" : "ARV (New Build)"}
                            <Tip text="Manual = type your own estimate. Comp = uses comp-fetched value. AI ref = shown for reference only." />
                          </label>
                          {/* Source toggle */}
                          <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                            {[['manual', ko ? '직접입력' : 'Manual'], ['comp', ko ? '시세기반' : 'Comp']].map(([key, label]) => (
                              <button key={key} onClick={() => setArvSource(key)}
                                style={{ flex: 1, padding: "3px 0", borderRadius: 6,
                                  border: `1px solid ${arvSource === key ? "var(--blue)" : "var(--border)"}`,
                                  background: arvSource === key ? "rgba(75,139,255,0.15)" : "transparent",
                                  color: arvSource === key ? "var(--blue)" : "var(--dim)",
                                  fontSize: 9, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em" }}>
                                {label}
                              </button>
                            ))}
                          </div>
                          {arvSource === 'manual' && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 12, color: "var(--dim)" }}>$</span>
                              <input className="task-input" type="number" min={0} step={5000}
                                value={rb.arvNew || ""}
                                placeholder={ko ? "ARV 입력" : "Enter ARV"}
                                onChange={e => setRebuild(s => ({ ...s, arvNew: e.target.value }))}
                                style={{ flex: 1 }} />
                            </div>
                          )}
                          {arvSource === 'comp' && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 12, color: "var(--dim)" }}>$</span>
                              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between",
                                background: "rgba(75,139,255,0.07)", border: "1px solid rgba(75,139,255,0.3)",
                                borderRadius: 6, padding: "5px 8px" }}>
                                <span style={{ fontFamily: "DM Mono", fontSize: 13, color: rebuildComps?.arvSuggested > 0 ? "var(--blue)" : "var(--dim)" }}>
                                  {rebuildComps?.arvSuggested > 0 ? rebuildComps.arvSuggested.toLocaleString() : (ko ? "Comps 조회 필요 →" : "Fetch comps first →")}
                                </span>
                                {rebuildComps?.arvSuggested > 0 && <span style={{ fontSize: 8, color: "var(--blue)", fontWeight: 700 }}>COMP</span>}
                              </div>
                            </div>
                          )}
                          {rebuildComps?.arvSuggested > 0 && (
                            <div style={{ marginTop: 4, fontSize: 9, color: "var(--dim)", display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ color: "var(--gold)", fontWeight: 700 }}>AI ref:</span>
                              <span style={{ fontFamily: "DM Mono" }}>${rebuildComps.arvSuggested.toLocaleString()}</span>
                              <span style={{ fontStyle: "italic" }}>{ko ? "(참고용)" : "(reference only)"}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
                            {ko ? "예비비 %" : "Contingency %"}
                            <Tip text="Applied to Hard Costs only (demo + permits + construction). NOT applied to land or carrying cost." />
                          </label>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                            <input className="task-input" type="number" min={0} max={30} step={1}
                              value={rb.contingencyPct}
                              onChange={e => setRebuild(s => ({ ...s, contingencyPct: e.target.value }))} style={{ flex: 1 }} />
                            <span style={{ fontSize: 10, color: "var(--blue)" }}>% HC</span>
                          </div>
                        </div>
                      </div>

                      {/* Financing */}
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10, display: "flex", alignItems: "center" }}>
                          {ko ? "금융 조건" : "Financing"}
                          <Tip text="LTC = Loan-to-Cost (% of total project cost). Different from LTV (Loan-to-Value of finished property)." />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                          <div>
                            <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
                              LTC %<Tip text="Loan-to-Cost: lender covers this % of total project cost (land + hard cost + contingency)" />
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                              <input className="task-input" type="number" min={0} max={90} step={1}
                                value={rb.ltcPct} onChange={e => setRebuild(s => ({ ...s, ltcPct: e.target.value }))} style={{ flex: 1 }} />
                              <span style={{ fontSize: 11, color: "var(--dim)" }}>%</span>
                            </div>
                          </div>
                          <RbInput labelKo="금리 %" labelEn="Rate %" field="ratePct" suffix="%" min={0} max={20} step={0.1}
                            tip="Annual construction loan interest rate. Hard money typically 9-12%, bank construction 7-9%." />
                          <div>
                            <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
                              {ko ? "이자 방식" : "Interest Method"}
                              <Tip text="Draw Schedule: interest accrues only on drawn funds (avg ~55% of loan balance). More accurate than full-balance method." />
                            </label>
                            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                              <input type="checkbox" checked={rb.drawSchedule}
                                onChange={e => setRebuild(s => ({ ...s, drawSchedule: e.target.checked }))}
                                style={{ accentColor: "var(--green)", width: 14, height: 14 }} />
                              <span style={{ fontSize: 10, color: rb.drawSchedule ? "var(--green)" : "var(--dim)" }}>
                                {ko ? "Draw Sch. (55%)" : "Draw Sch. (55%)"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Builder JV Params */}
                      {isJV && (
                        <div style={{ borderTop: "1px solid rgba(75,139,255,0.2)", paddingTop: 12 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--blue)", marginBottom: 10, display: "flex", alignItems: "center" }}>
                            🤝 {ko ? "JV 구조 설정" : "JV Structure"}
                            <Tip text="Builder JV: sponsor provides land + capital, builder provides construction expertise. Economics split via fees + profit share." />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div>
                              <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
                                {ko ? "빌더 수수료 (Hard Cost %)" : "Builder Fee (% of Hard Cost)"}
                                <Tip text="Builder management fee as % of Hard Cost (demo + permits + construction). Hard Cost basis, not just construction." />
                              </label>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                                <input className="task-input" type="number" min={0} max={20} step={0.5}
                                  value={jvParams.builderFee} onChange={e => setJvParams(s => ({ ...s, builderFee: e.target.value }))} style={{ flex: 1 }} />
                                <span style={{ fontSize: 11, color: "var(--dim)" }}>%</span>
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
                                {ko ? "후불 수수료 (ARV %)" : "Deferred Fee (% of ARV)"}
                                <Tip text="Paid at sale from gross proceeds. Incentivizes builder to maximize sale price." />
                              </label>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                                <input className="task-input" type="number" min={0} max={10} step={0.5}
                                  value={jvParams.deferredFee} onChange={e => setJvParams(s => ({ ...s, deferredFee: e.target.value }))} style={{ flex: 1 }} />
                                <span style={{ fontSize: 11, color: "var(--dim)" }}>%</span>
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
                                {ko ? "스폰서 우선 배당 %" : "Sponsor Preferred Return %"}
                                <Tip text="Sponsor (land owner) earns this % return on equity before builder participates in upside profits." />
                              </label>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                                <input className="task-input" type="number" min={0} max={30} step={1}
                                  value={jvParams.preferredReturn} onChange={e => setJvParams(s => ({ ...s, preferredReturn: e.target.value }))} style={{ flex: 1 }} />
                                <span style={{ fontSize: 11, color: "var(--dim)" }}>%</span>
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
                                {ko ? "초과수익 스폰서 배분 %" : "Excess Profit Split (Sponsor %)"}
                                <Tip text="After preferred return, remaining profit is split: sponsor gets this %, builder gets the rest." />
                              </label>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                                <input className="task-input" type="number" min={0} max={100} step={5}
                                  value={jvParams.profitSplit} onChange={e => setJvParams(s => ({ ...s, profitSplit: e.target.value }))} style={{ flex: 1 }} />
                                <span style={{ fontSize: 11, color: "var(--dim)" }}>%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── DEAL FEASIBILITY ── */}
                  {arvMissing && (
                    <div className="card" style={{ border: "1px solid rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.05)" }}>
                      <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px" }}>
                        <span style={{ fontSize: 22 }}>🏷️</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 4 }}>
                            {ko ? "ARV를 입력하면 분석이 시작됩니다" : "Enter ARV (New Build) to run analysis"}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--dim)", lineHeight: 1.6 }}>
                            {ko
                              ? "예상 신축 ARV(매도가)를 입력해야 수익률, 최대 토지 매입가, Verdict가 계산됩니다. 위 Comps 조회로 시장 ARV 범위를 먼저 확인하세요."
                              : "ARV (After Repair Value for new construction) is required to calculate ROI, max land basis, and deal verdict. Use the Comp Summary above to anchor your estimate."}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {rawArv > 0 && (
                    <div className="card" style={{ border: `1px solid ${verdictColor}55`, boxShadow: `0 0 28px ${verdictColor}14` }}>
                      <div className="card-header" style={{ borderBottom: `1px solid ${verdictColor}22` }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ color: verdictColor, fontSize: 14, fontWeight: 900, letterSpacing: "0.05em" }}>
                            {verdict === "GO"     ? "✅ GO — Clears 25% Preferred Return" :
                             verdict === "WATCH" ? "⚠️ WATCH — Below 25%, Above 20% Minimum" :
                                                    "❌ NO-GO — Below 20% Minimum Threshold"}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--dim)" }}>
                            {ko ? "20% = 최소 기준 · 25% = 선호 기준 · 현재" : "20% = minimum threshold · 25% = preferred · Current"}{" "}
                            <span style={{ fontFamily: "DM Mono", color: verdictColor, fontWeight: 700 }}>
                              ROI {roiOnTotal != null ? roiOnTotal.toFixed(1) : "—"}%
                            </span>
                          </span>
                        </div>
                        
                      </div>
                      <div className="card-body">

                        {/* Verdict Summary */}
                        <div style={{ background: `${verdictColor}0d`, border: `1px solid ${verdictColor}2a`, borderRadius: 10, padding: "14px 16px", marginBottom: 18, fontSize: 12, color: "var(--text)", lineHeight: 1.8 }}>
                          {verdict === "GO" && (
                            <span>
                              {ko
                                ? `✅ 현재 토지 매입가(${fmt(landCost)})는 25% 기준 Max(${fmt(maxLand25)})보다 ${fmt(maxLand25 - landCost)} 낮습니다. `
                                : `✅ Current land basis (${fmt(landCost)}) is ${fmt(maxLand25 - landCost)} below the 25% preferred max (${fmt(maxLand25)}). `}
                              {ko
                                ? `공사비(${fmt(construction)} · $${currentCostSqft}/sqft)도 20% 및 25% 기준 모두 적정 범위 이내입니다.`
                                : `Construction cost ($${currentCostSqft}/sqft) is within range for both 20% and 25% targets. Deal clears all thresholds.`}
                            </span>
                          )}
                          {verdict === "WATCH" && (
                            <span>
                              {ko
                                ? `⚠️ 현재 토지 매입가(${fmt(landCost)})가 25% 기준 Max(${fmt(maxLand25)})를 ${fmt(gapTo25)} 초과합니다. `
                                : `⚠️ Current land basis (${fmt(landCost)}) exceeds the 25% preferred max (${fmt(maxLand25)}) by ${fmt(gapTo25)}. `}
                              {ko
                                ? `25% 달성을 위해 토지를 ${fmt(maxLand25)}까지 낮추거나, 매도가를 ${fmt(reqSale25)}까지 올려야 합니다. `
                                : `To make this deal work at 25% ROI, land must fall to ${fmt(maxLand25)} or resale must rise to ${fmt(reqSale25)}. `}
                              {gapCostSqft25 > 0
                                ? (ko ? `공사비($${currentCostSqft}/sqft)도 25% 기준($${maxCostSqft25}/sqft)을 $${gapCostSqft25}/sqft 초과합니다. ` : `Construction cost ($${currentCostSqft}/sqft) also exceeds the 25% max ($${maxCostSqft25}/sqft) by $${gapCostSqft25}/sqft. `)
                                : (ko ? `공사비($${currentCostSqft}/sqft)는 적정 범위입니다. (20% 기준 충족)` : `Construction cost is within range. (Clears the 20% minimum.)`)}
                            </span>
                          )}
                          {verdict === "NO-GO" && (
                            <span>
                              {ko
                                ? `🚫 현재 토지 매입가(${fmt(landCost)})가 20% 기준 Max(${fmt(maxLand20)})를 ${fmt(Math.abs(gapTo20))} 초과합니다. `
                                : `🚫 Current land basis (${fmt(landCost)}) exceeds the 20% max allowable (${fmt(maxLand20)}) by ${fmt(Math.abs(gapTo20))}. `}
                              {ko
                                ? `최소 20% ROI를 위해 토지를 ${fmt(maxLand20)}까지 낮추거나, 매도가를 ${fmt(reqSale20)}까지 높여야 합니다. `
                                : `To make this deal work, land must fall to ${fmt(maxLand20)} or resale must rise to ${fmt(reqSale20)}. `}
                              {gapCostSqft20 > 0 && (ko
                                ? `공사비($${currentCostSqft}/sqft)도 20% 기준($${maxCostSqft20}/sqft)을 $${gapCostSqft20}/sqft 초과합니다. `
                                : `Construction cost ($${currentCostSqft}/sqft) also exceeds the 20% max ($${maxCostSqft20}/sqft) by $${gapCostSqft20}/sqft. `)}
                              {!upside_clears_min && (ko
                                ? `📌 상승 시나리오(ARV +10%, 공사비 -5%)에서도 최소 기준(20%)을 충족하지 못합니다.`
                                : `📌 Even under upside assumptions (+10% ARV, -5% cost), this deal does not clear the 20% minimum threshold.`)}
                              {upside_clears_min && (ko
                                ? `✳️ 단, 상승 시나리오(ARV +10%, 공사비 -5%)에서는 최소 기준(20%)을 충족합니다.`
                                : `✳️ Under upside assumptions (+10% ARV, -5% cost), this deal can clear the 20% minimum.`)}
                            </span>
                          )}
                        </div>

                        {/* ── How to Make It Work — compact action card ── */}
                        {(verdict === "NO-GO" || verdict === "WATCH") && (() => {
                          const isNogo     = verdict === "NO-GO";
                          const target     = isNogo ? 20 : 25;
                          const tColor     = isNogo ? "var(--red)" : "var(--gold)";
                          const tBg        = isNogo ? "rgba(248,113,113,0.07)" : "rgba(226,184,75,0.07)";
                          const tBorder    = isNogo ? "rgba(248,113,113,0.25)" : "rgba(226,184,75,0.25)";
                          const maxLandT   = isNogo ? maxLand20  : maxLand25;
                          const maxCostT   = isNogo ? maxCostSqft20 : maxCostSqft25;
                          const reqSaleT   = isNogo ? reqSale20  : reqSale25;
                          const landGap    = Math.max(0, landCost - maxLandT);
                          const costGap    = Math.max(0, currentCostSqft - maxCostT);
                          const saleGap    = Math.max(0, reqSaleT - arv);
                          const landOk     = landGap === 0;
                          const costOk     = costGap === 0 || maxCostT <= 0;
                          const saleOk     = saleGap === 0;
                          // combo: cut each gap by 50%
                          const comboLand  = Math.round(landGap * 0.5 / 5000) * 5000;
                          const comboCost  = Math.round(costGap * 0.5);
                          const showCombo  = (!landOk || !costOk) && (!landOk || !saleOk || !costOk);

                          const Row = ({ ok, label, value, gap, gapLabel }) => (
                            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                              <span style={{ fontSize:11, width:16, textAlign:"center", flexShrink:0 }}>{ok ? "✅" : "❌"}</span>
                              <span style={{ fontSize:11, color:"var(--dim)", minWidth:100 }}>{label}</span>
                              <span style={{ fontFamily:"DM Mono", fontSize:14, fontWeight:700, color: ok ? "var(--green)" : tColor, flex:1 }}>{value}</span>
                              {!ok && gap && (
                                <span style={{ fontSize:10, color:"var(--dim)", whiteSpace:"nowrap", background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"2px 7px" }}>
                                  {gapLabel}
                                </span>
                              )}
                            </div>
                          );

                          return (
                            <div style={{ background: tBg, border:`1px solid ${tBorder}`, borderRadius:12, padding:"14px 16px", marginBottom:18 }}>
                              {/* Header */}
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                                <span style={{ fontSize:11, fontWeight:800, color: tColor, letterSpacing:"0.03em" }}>
                                  🔧 {ko ? `딜을 살리려면 (${target}% ROI 기준)` : `How to Make It Work  ·  ${target}% ROI target`}
                                </span>
                                <span style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--dim)" }}>
                                  {ko ? "현재" : "now"} {roiOnTotal != null ? roiOnTotal.toFixed(1) : "—"}% → {target}%
                                </span>
                              </div>
                              <div style={{ fontSize:9, color:"var(--dim)", marginBottom:12, letterSpacing:"0.05em" }}>
                                {ko ? "아래 중 하나만 충족해도 딜이 살아남." : "Meet any one condition — or mix — to rescue the deal."}
                              </div>

                              {/* Action rows */}
                              <div>
                                <Row
                                  ok={landOk}
                                  label={ko ? "토지 매입가" : "Land basis"}
                                  value={`≤ ${fmt(maxLandT)}`}
                                  gap={true}
                                  gapLabel={ko ? `${fmt(landGap)} 인하 필요` : `−${fmt(landGap)}`}
                                />
                                {maxCostT > 0 && (
                                  <Row
                                    ok={costOk}
                                    label={ko ? "공사비" : "Construction"}
                                    value={`≤ $${maxCostT.toLocaleString()}/sqft`}
                                    gap={true}
                                    gapLabel={ko ? `$${costGap}/sqft 인하` : `−$${costGap}/sqft`}
                                  />
                                )}
                                <Row
                                  ok={saleOk}
                                  label={ko ? "매도가 (ARV)" : "Resale (ARV)"}
                                  value={`≥ ${fmt(reqSaleT)}`}
                                  gap={true}
                                  gapLabel={ko ? `${fmt(saleGap)} 상승 필요` : `+${fmt(saleGap)} needed`}
                                />
                                {/* Combo row */}
                                {showCombo && (comboLand > 0 || comboCost > 0) && (
                                  <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0 0" }}>
                                    <span style={{ fontSize:11, width:16, textAlign:"center", flexShrink:0 }}>💡</span>
                                    <div style={{ fontSize:11, color:"var(--dim)", lineHeight:1.6 }}>
                                      {ko
                                        ? <>또는 함께 개선:{comboLand > 0 && <><span style={{fontFamily:"DM Mono",color:"var(--text)",fontWeight:700}}> 토지 {fmt(comboLand)} 인하</span></>}{comboLand > 0 && comboCost > 0 && " + "}{comboCost > 0 && <><span style={{fontFamily:"DM Mono",color:"var(--text)",fontWeight:700}}>공사비 ${comboCost}/sqft 인하</span></>} → {target}% 달성</>
                                        : <>Or split the gap:{comboLand > 0 && <><span style={{fontFamily:"DM Mono",color:"var(--text)",fontWeight:700}}> land −{fmt(comboLand)}</span></>}{comboLand > 0 && comboCost > 0 && " + "}{comboCost > 0 && <><span style={{fontFamily:"DM Mono",color:"var(--text)",fontWeight:700}}>cost −${comboCost}/sqft</span></>} → hits {target}%</>
                                      }
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Max Land Basis — 3 tiers */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 8, display: "flex", alignItems: "center" }}>
                            {ko ? "최대 허용 토지 매입가" : "Max Allowable Land Basis"}
                            <Tip text="Max Land = Net Sales Proceeds / (1 + targetROI) - Non-Land Cost. Corrected formula: sellingCost deducted from ARV first." />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {[
                              { roi: 0.20, label: "20%", maxLand: maxLand20, pref: false },
                              { roi: 0.25, label: "25% ★", maxLand: maxLand25, pref: true },
                              { roi: 0.30, label: "30%", maxLand: maxLand30, pref: false },
                            ].map(({ label, maxLand, pref }) => {
                              const gap = landCost - maxLand;
                              const ok = landCost <= maxLand;
                              return (
                                <div key={label} style={{
                                  background: "var(--bg3)", borderRadius: 12, padding: "12px 14px",
                                  border: `1px solid ${ok ? "rgba(52,211,153,0.4)" : pref ? "rgba(248,113,113,0.3)" : "var(--border)"}`,
                                }}>
                                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: pref ? "var(--gold)" : "var(--dim)", marginBottom: 6 }}>
                                    Max Land @ {label}{pref ? " ← preferred" : ""}
                                  </div>
                                  <div style={{ fontFamily: "DM Mono", fontSize: 17, fontWeight: 600, color: ok ? "var(--green)" : "var(--red)" }}>
                                    {fmt(maxLand)}
                                  </div>
                                  <div style={{ fontSize: 9, marginTop: 4, color: ok ? "var(--green)" : "var(--red)" }}>
                                    {ok ? `✅ ${fmt(maxLand - landCost)} headroom` : `❌ ${fmt(gap)} over`}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Construction Cost Feasibility */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 8, display: "flex", alignItems: "center" }}>
                            {ko ? "공사비 적정성 분석" : "Construction Cost Feasibility"}
                            <Tip text="Given fixed land basis, what is the max $/sqft construction cost to hit target ROI? Helps diagnose whether land price or construction cost (or both) is the problem." />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                            {/* Current */}
                            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
                              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 5 }}>
                                {ko ? "현재 공사비/sqft" : "Current Cost/sqft"}
                              </div>
                              <div style={{ fontFamily: "DM Mono", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
                                ${currentCostSqft.toLocaleString()}
                              </div>
                              <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 2 }}>{buildSqft.toLocaleString()} sqft</div>
                            </div>
                            {/* Max @ 20% */}
                            {(() => {
                              const ok = currentCostSqft <= maxCostSqft20;
                              return (
                                <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 12px",
                                  border: `1px solid ${ok ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.3)"}` }}>
                                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 5 }}>
                                    {ko ? "Max 공사비 @ 20%" : "Max Cost/sqft @ 20%"}
                                  </div>
                                  <div style={{ fontFamily: "DM Mono", fontSize: 16, fontWeight: 600, color: ok ? "var(--green)" : "var(--red)" }}>
                                    {maxCostSqft20 > 0 ? `$${maxCostSqft20.toLocaleString()}` : "—"}
                                  </div>
                                  <div style={{ fontSize: 9, marginTop: 2, color: ok ? "var(--green)" : "var(--red)" }}>
                                    {maxCostSqft20 > 0 ? (ok ? `✅ $${Math.abs(gapCostSqft20)}/sqft below` : `❌ $${gapCostSqft20}/sqft over`) : "—"}
                                  </div>
                                </div>
                              );
                            })()}
                            {/* Max @ 25% */}
                            {(() => {
                              const ok = currentCostSqft <= maxCostSqft25;
                              return (
                                <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 12px",
                                  border: `1px solid ${ok ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.15)"}` }}>
                                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 5 }}>
                                    {ko ? "Max 공사비 @ 25% ★" : "Max Cost/sqft @ 25% ★"}
                                  </div>
                                  <div style={{ fontFamily: "DM Mono", fontSize: 16, fontWeight: 600, color: ok ? "var(--green)" : "var(--red)" }}>
                                    {maxCostSqft25 > 0 ? `$${maxCostSqft25.toLocaleString()}` : "—"}
                                  </div>
                                  <div style={{ fontSize: 9, marginTop: 2, color: ok ? "var(--green)" : "var(--red)" }}>
                                    {maxCostSqft25 > 0 ? (ok ? `✅ $${Math.abs(gapCostSqft25)}/sqft below` : `❌ $${gapCostSqft25}/sqft over`) : "—"}
                                  </div>
                                </div>
                              );
                            })()}
                            {/* Diagnosis */}
                            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
                              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 5 }}>
                                {ko ? "문제 진단" : "Root Cause"}
                              </div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text)", lineHeight: 1.5 }}>
                                {verdict === "GO" ? (ko ? "✅ 토지·공사비 모두 OK" : "✅ Land & cost both OK") :
                                 (gapTo20 > 0 && gapCostSqft20 > 0) ? (ko ? "🚫 토지가 + 공사비 과다" : "🚫 Land AND cost too high") :
                                 gapTo20 > 0 ? (ko ? "🏠 주로 토지가 문제" : "🏠 Land price is issue") :
                                 gapCostSqft20 > 0 ? (ko ? "🔨 주로 공사비 문제" : "🔨 Construction cost issue") :
                                 (ko ? "⚠️ 25% 기준 미달" : "⚠️ Below 25% preferred")}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Key KPIs row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                          <div style={{ background: "var(--bg3)", borderRadius: 12, padding: "12px 14px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 6, display: "flex", alignItems: "center" }}>
                              {ko ? "손익분기 토지가" : "Break-even Land"}
                              <Tip text="NSP - Non-Land Cost. Buy below this and you won't lose money (but 0% ROI)." />
                            </div>
                            <div style={{ fontFamily: "DM Mono", fontSize: 16, color: landCost <= breakEvenLand ? "var(--green)" : "var(--red)" }}>{fmt(breakEvenLand)}</div>
                            <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 3 }}>{ko ? "0% ROI 기준" : "Zero profit threshold"}</div>
                          </div>
                          <div style={{ background: "var(--bg3)", borderRadius: 12, padding: "12px 14px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 6, display: "flex", alignItems: "center" }}>
                              {ko ? "20% ROI 필요 매도가" : "Req. Sale @ 20% ROI"}
                              <Tip text="Sale × (1 - 7.5%) = TotalAllIn × 1.20 → Sale = TotalAllIn × 1.20 / 0.925" />
                            </div>
                            <div style={{ fontFamily: "DM Mono", fontSize: 16, color: arv >= reqSale20 ? "var(--green)" : "var(--gold)" }}>{fmt(reqSale20)}</div>
                            <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 3 }}>{ko ? `현재 ARV: ${fmt(arv)}` : `Current ARV: ${fmt(arv)}`}</div>
                          </div>
                          <div style={{ background: "var(--bg3)", borderRadius: 12, padding: "12px 14px", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6, display: "flex", alignItems: "center" }}>
                              {ko ? "25% ROI 필요 매도가" : "Req. Sale @ 25% ROI ★"}
                              <Tip text="Preferred threshold. Sale × (1 - 7.5%) = TotalAllIn × 1.25" />
                            </div>
                            <div style={{ fontFamily: "DM Mono", fontSize: 16, color: arv >= reqSale25 ? "var(--green)" : "var(--red)" }}>{fmt(reqSale25)}</div>
                            <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 3 }}>{ko ? "선호 기준 (25%)" : "Preferred threshold"}</div>
                          </div>
                        </div>

                        {/* Current Land vs Gap */}
                        <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 8, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                              {ko ? "현재 토지 매입가" : "Current Land Basis"}
                            </div>
                            <div style={{ fontFamily: "DM Mono", fontSize: 20, color: "var(--text)", marginTop: 4 }}>{fmt(landCost)}</div>
                          </div>
                          <div style={{ fontSize: 24, color: verdictColor }}>{verdict === "GO" ? "✓" : verdict === "WATCH" ? "↕" : "✗"}</div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 8, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                              {ko ? "25% 목표 대비 차이" : "Gap to 25% Target"}
                            </div>
                            <div style={{ fontFamily: "DM Mono", fontSize: 20, color: gapTo25 > 0 ? "var(--red)" : "var(--green)", marginTop: 4 }}>
                              {gapTo25 > 0 ? `-${fmt(gapTo25)}` : `+${fmt(Math.abs(gapTo25))}`}
                            </div>
                          </div>
                        </div>

                        {/* ROI trio */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                          <div className="metric">
                            <div className="metric-label" style={{ display: "flex", alignItems: "center" }}>
                              {ko ? "총투자 대비 ROI" : "ROI on Total Cost"}
                              <Tip text="Net Profit / Total All-In Cost. Primary metric for development viability." />
                            </div>
                            <div className="metric-val" style={{ color: roiOnTotal >= 25 ? "var(--green)" : roiOnTotal >= 20 ? "var(--gold)" : "var(--red)" }}>
                              {roiOnTotal.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 2 }}>{profit != null ? fmt(profit) : "—"} profit</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label" style={{ display: "flex", alignItems: "center" }}>
                              {ko ? "Cash-on-Cash ROI" : "Cash-on-Cash ROI"}
                              <Tip text="Net Profit / Equity (Cash) Invested. Higher when leverage is used." />
                            </div>
                            <div className="metric-val" style={{ color: cocRoi >= 35 ? "var(--green)" : cocRoi >= 20 ? "var(--gold)" : "var(--red)" }}>
                              {cocRoi.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 2 }}>{fmt(equity)} equity</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label" style={{ display: "flex", alignItems: "center" }}>
                              {ko ? "단순 연환산 ROI" : "Approx. Annualized ROI"}
                              <Tip text="Simple annualized approximation only — not a full IRR calculation. Actual IRR accounts for timing of cash flows." />
                            </div>
                            <div className="metric-val" style={{ color: annRoi >= 25 ? "var(--green)" : annRoi >= 15 ? "var(--gold)" : "var(--red)" }}>
                              {annRoi.toFixed(1)}%/yr
                            </div>
                            <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 2 }}>{ko ? `(${totalMonths}mo, not IRR)` : `(${totalMonths}mo, not IRR)`}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Cost Breakdown ── */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📋 {ko ? "비용 내역 & 가정" : "Cost Breakdown & Assumptions"}</span>
                      {rbScenario !== "base" && (
                        <span style={{ fontSize: 9, color: "var(--gold)", background: "var(--gold2)", padding: "2px 8px", borderRadius: 6 }}>
                          {rbScenario === "downside" ? "▼ Downside" : "▲ Upside"}
                        </span>
                      )}
                    </div>
                    <div className="card-body">
                      <table className="tbl" style={{ marginBottom: 16 }}>
                        <thead>
                          <tr>
                            <th>{ko ? "항목" : "Item"}</th>
                            <th style={{ textAlign: "right" }}>{ko ? "금액" : "Amount"}</th>
                            <th style={{ textAlign: "right" }}>% All-In</th>
                            <th style={{ color: "var(--blue)" }}>{ko ? "가정 / 근거" : "Assumption"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>🏠 {ko ? "토지 매입가" : "Land / Purchase"}</td>
                            <td className="gold" style={{ textAlign: "right" }}>{fmt(landCost)}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{totalAllIn > 0 ? (landCost/totalAllIn*100).toFixed(1) : 0}%</td>
                            <td style={{ fontSize: 9, color: "var(--dim)" }}>From Deal Screening</td>
                          </tr>
                          <tr>
                            <td>🔨 {ko ? "철거비" : "Demo"}{isReno && <span style={{ fontSize: 9, color: "var(--blue)", marginLeft: 4 }}>(×20%)</span>}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{fmt(demo)}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{totalAllIn > 0 ? (demo/totalAllIn*100).toFixed(1) : 0}%</td>
                            <td style={{ fontSize: 9, color: "var(--dim)" }}>{isReno ? "Reno: 20% of full demo" : "$15K-$40K county-based"}</td>
                          </tr>
                          <tr>
                            <td>📄 {ko ? "설계/허가비" : "Permits & Design"}{isReno && <span style={{ fontSize: 9, color: "var(--blue)", marginLeft: 4 }}>(×30%)</span>}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{fmt(permit)}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{totalAllIn > 0 ? (permit/totalAllIn*100).toFixed(1) : 0}%</td>
                            <td style={{ fontSize: 9, color: "var(--dim)" }}>{isReno ? "Reno: 30% of full permit" : "Fairfax $10K-$22K / Arlington $12K-$26K"}</td>
                          </tr>
                          <tr>
                            <td>🏗️ {ko ? "공사비" : "Construction"}
                              <span style={{ fontSize: 9, color: "var(--dim)", marginLeft: 4 }}>
                                ({buildSqft.toLocaleString()} sqft × ${Number(rb.costPerSqft)||0}{isReno ? "×55%" : ""}{rbScenario !== "base" ? `×${sm.cost}` : ""})
                              </span>
                            </td>
                            <td className="mono" style={{ textAlign: "right" }}>{fmt(construction)}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{totalAllIn > 0 ? (construction/totalAllIn*100).toFixed(1) : 0}%</td>
                            <td style={{ fontSize: 9, color: "var(--dim)" }}>2026 NoVA benchmark $/sqft</td>
                          </tr>
                          <tr>
                            <td>🛡️ {ko ? "예비비" : "Contingency"} <span style={{ fontSize: 9, color: "var(--blue)" }}>({rb.contingencyPct}% of HC only)</span></td>
                            <td className="mono" style={{ textAlign: "right" }}>{fmt(contingency)}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{totalAllIn > 0 ? (contingency/totalAllIn*100).toFixed(1) : 0}%</td>
                            <td style={{ fontSize: 9, color: "var(--dim)" }}>Hard Costs only — not land, not carry</td>
                          </tr>
                          <tr>
                            <td>💳 {ko ? "금융비용" : "Carrying Cost"}
                              <span style={{ fontSize: 9, color: rb.drawSchedule ? "var(--green)" : "var(--dim)", marginLeft: 4 }}>
                                {rb.drawSchedule ? "(draw 55%)" : "(full bal.)"}
                              </span>
                            </td>
                            <td className="mono" style={{ textAlign: "right" }}>{fmt(carryingCost)}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{totalAllIn > 0 ? (carryingCost/totalAllIn*100).toFixed(1) : 0}%</td>
                            <td style={{ fontSize: 9, color: "var(--dim)" }}>LTC {ltcPct}% · {rb.ratePct}%/yr · {buildMo}mo</td>
                          </tr>
                          <tr style={{ borderTop: "2px solid var(--border2)" }}>
                            <td style={{ fontWeight: 700 }}>{ko ? "총 투자 (All-In)" : "Total All-In"}</td>
                            <td className="gold" style={{ textAlign: "right", fontWeight: 700 }}>{fmt(totalAllIn)}</td>
                            <td className="mono" style={{ textAlign: "right" }}>100%</td>
                            <td></td>
                          </tr>
                          <tr style={{ background: "rgba(75,139,255,0.04)" }}>
                            <td style={{ color: "var(--dim)", paddingLeft: 20 }}>↳ {ko ? "대출 (LTC 기준)" : "Loan (LTC-based)"}</td>
                            <td className="blue" style={{ textAlign: "right" }}>{fmt(loanAmt)}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{totalAllIn > 0 ? (loanAmt/totalAllIn*100).toFixed(1) : 0}%</td>
                            <td style={{ fontSize: 9, color: "var(--dim)" }}>LTC of total cost ≠ LTV of finished value</td>
                          </tr>
                          <tr style={{ background: "rgba(52,211,153,0.04)" }}>
                            <td style={{ color: "var(--dim)", paddingLeft: 20 }}>↳ {ko ? "자기자본 (Cash)" : "Equity / Cash Required"}</td>
                            <td className="green" style={{ textAlign: "right" }}>{fmt(equity)}</td>
                            <td className="mono" style={{ textAlign: "right" }}>{totalAllIn > 0 ? (equity/totalAllIn*100).toFixed(1) : 0}%</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Sales */}
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                        <div className="section-title">
                          💰 {ko ? "매도 분석" : "Sales Analysis"}
                          <Tip text="Selling cost (7.5%) is % of Sale Price, not a fixed amount. Required Sale formula corrected: Sale = AllIn × (1+ROI) / (1 - 7.5%)" />
                        </div>
                        <table className="tbl">
                          <tbody>
                            <tr>
                              <td>{ko ? "예상 신축 ARV" : "ARV (New Build)"}
                                {rbScenario !== "base" && <span style={{ fontSize: 9, color: "var(--gold)", marginLeft: 4 }}>×{sm.arv}</span>}
                              </td>
                              <td className="gold" style={{ textAlign: "right" }}>{fmt(arv)}</td>
                              <td style={{ fontSize: 9, color: "var(--dim)" }}>Comp-based / AI estimate</td>
                            </tr>
                            <tr>
                              <td>{ko ? "매도 비용 (7.5% of ARV)" : "Selling Costs (7.5% of Sale)"}
                                <span style={{ fontSize: 9, color: "var(--dim)", marginLeft: 4 }}>6% broker + 1.5% closing</span>
                              </td>
                              <td className="red" style={{ textAlign: "right" }}>({fmt(sellingCost)})</td>
                              <td style={{ fontSize: 9, color: "var(--dim)" }}>NoVA standard</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: 600 }}>NSP — {ko ? "순 매도 수익" : "Net Sales Proceeds"}</td>
                              <td className="green" style={{ textAlign: "right", fontWeight: 700 }}>{fmt(netSalesProceeds)}</td>
                              <td style={{ fontSize: 9, color: "var(--dim)" }}>ARV − Selling Costs</td>
                            </tr>
                            <tr>
                              <td>{ko ? "총 투자비 차감" : "Less: Total All-In"}</td>
                              <td className="red" style={{ textAlign: "right" }}>({fmt(totalAllIn)})</td>
                              <td></td>
                            </tr>
                            <tr style={{ borderTop: "2px solid var(--border2)" }}>
                              <td style={{ fontWeight: 700 }}>{ko ? "순이익" : "Net Profit"}</td>
                              <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "DM Mono", color: profit > 0 ? "var(--green)" : "var(--red)" }}>
                                {profit == null ? "—" : profit > 0 ? fmt(profit) : `(${fmt(Math.abs(profit))})`}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* ── Scenario Comparison ── */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">📊 {ko ? "시나리오 비교" : "Scenario Comparison"}</span>
                    </div>
                    <div className="card-body">
                      <table className="tbl">
                        <thead>
                          <tr>
                            <th>{ko ? "시나리오" : "Scenario"}</th>
                            <th style={{ textAlign: "right" }}>ARV</th>
                            <th style={{ textAlign: "right" }}>NSP</th>
                            <th style={{ textAlign: "right" }}>{ko ? "총비용" : "All-In"}</th>
                            <th style={{ textAlign: "right" }}>{ko ? "순이익" : "Profit"}</th>
                            <th style={{ textAlign: "right" }}>ROI</th>
                            <th style={{ textAlign: "right" }}>CoC</th>
                            <th style={{ textAlign: "right" }}>{ko ? "Max토지@20%" : "MaxLand@20%"}</th>
                            <th style={{ textAlign: "right" }}>{ko ? "판정" : "Verdict"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: "downside", label: ko ? "▼ 하락" : "▼ Down",  ...calcScenario(0.90, 1.10) },
                            { key: "base",     label: ko ? "◆ 기준" : "◆ Base",  ...calcScenario(1.00, 1.00) },
                            { key: "upside",   label: ko ? "▲ 상승" : "▲ Up",    ...calcScenario(1.10, 0.95) },
                          ].map(s => {
                            const vc = s.verdict === "GO" ? "var(--green)" : s.verdict === "WATCH" ? "var(--gold)" : "var(--red)";
                            const isActive = rbScenario === s.key;
                            return (
                              <tr key={s.key} onClick={() => setRbScenario(s.key)} style={{ cursor: "pointer", background: isActive ? "rgba(226,184,75,0.05)" : undefined }}>
                                <td style={{ color: isActive ? "var(--gold)" : "var(--mid)", fontWeight: isActive ? 700 : 400 }}>
                                  {s.label}{isActive && " ◄"}
                                </td>
                                <td className="mono" style={{ textAlign: "right" }}>{rawArv > 0 ? fmt(s.arv) : "—"}</td>
                                <td className="mono" style={{ textAlign: "right" }}>{rawArv > 0 ? fmt(s.nsp) : "—"}</td>
                                <td className="mono" style={{ textAlign: "right" }}>{fmt(s.total)}</td>
                                <td style={{ textAlign: "right", fontFamily: "DM Mono", color: s.profit > 0 ? "var(--green)" : "var(--red)" }}>
                                  {rawArv > 0 ? (s.profit > 0 ? fmt(s.profit) : `(${fmt(Math.abs(s.profit))})`) : "—"}
                                </td>
                                <td style={{ textAlign: "right", fontFamily: "DM Mono", color: rawArv > 0 ? vc : "var(--dim)" }}>
                                  {rawArv > 0 ? `${s.roi.toFixed(1)}%` : "—"}
                                </td>
                                <td style={{ textAlign: "right", fontFamily: "DM Mono", color: "var(--mid)" }}>
                                  {rawArv > 0 ? `${s.coc.toFixed(1)}%` : "—"}
                                </td>
                                <td style={{ textAlign: "right", fontFamily: "DM Mono", color: rawArv > 0 ? (landCost <= s.maxL20 ? "var(--green)" : "var(--red)") : "var(--dim)" }}>
                                  {rawArv > 0 ? fmt(s.maxL20) : "—"}
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 700, fontSize: 11, color: rawArv > 0 ? vc : "var(--dim)" }}>
                                  {rawArv > 0 ? s.verdict : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 8 }}>
                        {ko ? "* 행 클릭 → 해당 시나리오 전환 | NSP = Net Sales Proceeds | CoC = Cash-on-Cash ROI" : "* Click row to switch scenario | NSP = Net Sales Proceeds | CoC = Cash-on-Cash ROI"}
                      </div>
                    </div>
                  </div>

                  {/* ── Builder JV ── */}
                  {isJV && rawArv > 0 && (
                    <div className="card" style={{ border: "1px solid rgba(75,139,255,0.25)" }}>
                      <div className="card-header">
                        <span className="card-title" style={{ color: "var(--blue)" }}>🤝 {ko ? "JV 수익 배분 분석" : "Builder JV Economics"}</span>
                        {jvImproves && <span style={{ fontSize: 9, color: "var(--green)", background: "var(--green2)", padding: "2px 8px", borderRadius: 6 }}>✅ {ko ? "JV로 스폰서 수익 개선" : "JV improves sponsor returns"}</span>}
                      </div>
                      <div className="card-body">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                          <div className="metric">
                            <div className="metric-label" style={{ display: "flex", alignItems: "center" }}>
                              {ko ? "빌더 수수료 (HC 기준)" : "Builder Fee (HC basis)"}
                              <Tip text="Builder management fee = % of Hard Cost (demo + permits + construction)" />
                            </div>
                            <div className="metric-val" style={{ color: "var(--blue)" }}>{fmt(jvBuilderFee)}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">{ko ? "후불 수수료 (ARV 기준)" : "Deferred Fee (ARV basis)"}</div>
                            <div className="metric-val" style={{ color: "var(--blue)" }}>{fmt(jvDeferredFee)}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label" style={{ display: "flex", alignItems: "center" }}>
                              {ko ? "JV 후 순이익" : "Net Profit (post-fees)"}
                              <Tip text="Gross profit minus builder fee and deferred fee — this is distributed between sponsor and builder." />
                            </div>
                            <div className="metric-val" style={{ color: jvNetProfit > 0 ? "var(--green)" : "var(--red)" }}>
                              {jvNetProfit > 0 ? fmt(jvNetProfit) : `(${fmt(Math.abs(jvNetProfit))})`}
                            </div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">{ko ? "스폰서 우선 배당 (Pref)" : "Sponsor Preferred Return"}</div>
                            <div className="metric-val" style={{ color: "var(--gold)" }}>{fmt(jvPrefReturn)}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">{ko ? "스폰서 최종 수익" : "Sponsor Total Return"}</div>
                            <div className="metric-val" style={{ color: "var(--green)" }}>{fmt(jvSponsorProfit)}</div>
                            <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 2 }}>CoC: {jvSponsorRoi.toFixed(1)}%</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">{ko ? "빌더 최종 수익" : "Builder Total Return"}</div>
                            <div className="metric-val" style={{ color: "var(--blue)" }}>{fmt(jvBuilderProfit)}</div>
                          </div>
                        </div>
                        <div style={{ marginTop: 12, fontSize: 11, color: "var(--dim)", background: "var(--bg3)", borderRadius: 8, padding: "10px 14px", lineHeight: 1.6 }}>
                          {ko
                            ? `빌더 수수료(Hard Cost ${jvParams.builderFee}%) + 후불 수수료(ARV ${jvParams.deferredFee}%) 차감 후, 스폰서에게 자기자본 ${jvParams.preferredReturn}% 우선 배당. 초과 수익은 스폰서 ${jvParams.profitSplit}% / 빌더 ${100 - jvParams.profitSplit}% 배분.`
                            : `After builder fee (${jvParams.builderFee}% HC) + deferred fee (${jvParams.deferredFee}% ARV), sponsor earns ${jvParams.preferredReturn}% preferred return on equity. Remaining profit splits ${jvParams.profitSplit}% sponsor / ${100 - jvParams.profitSplit}% builder.`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🤖 {ko ? "AI 딜 분석" : "AI Deal Analysis"}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => {
                        if (arvMissing) { alert(lang === "ko" ? "ARV를 먼저 입력해주세요." : "Please enter ARV before running AI analysis."); return; }
                        const rbCacheKey = `${dealType}_${rbScenario}_${landCost}_${nonLandCost}_${arv}_${aiLang}_${lang}`;
                        if (rebuildAiCacheRef.current[rbCacheKey]) { setRebuildAiResult(rebuildAiCacheRef.current[rbCacheKey]); return; }
                        const prompt = `You are a NoVA real estate development expert. Analyze this ${dealType} deal with rigorous development logic:\n\nDeal Type: ${dealType} | Scenario: ${rbScenario}\nLand: ${fmt(landCost)} | Non-Land Cost: ${fmt(nonLandCost)}\nTotal All-In: ${fmt(totalAllIn)} | ARV: ${fmt(arv)} | NSP: ${fmt(netSalesProceeds)}\nNet Profit: ${fmt(profit)}\n\nROI on Total: ${roiOnTotal.toFixed(1)}% | CoC ROI: ${cocRoi.toFixed(1)}% | Annualized (approx): ${annRoi.toFixed(1)}%/yr\n\nFeasibility:\n- Break-even land: ${fmt(breakEvenLand)}\n- Max land @20%: ${fmt(maxLand20)} | Gap: ${fmt(gapTo20)} ${gapTo20 > 0 ? "OVER" : "under"}\n- Max land @25%: ${fmt(maxLand25)} | Gap: ${fmt(gapTo25)} ${gapTo25 > 0 ? "OVER" : "under"}\n- Required Sale @20%: ${fmt(reqSale20)} | @25%: ${fmt(reqSale25)}\n\nVerdict: ${verdict} (20%=min, 25%=preferred)\n\nAnswer these 4 questions directly (${aiLangInstr}):\n1. Is this deal viable? Why exactly (with numbers)?\n2. What are the top 2-3 risks?\n3. What specific changes (price, cost, structure) would make it work?\n4. JV structure improve the economics?

Be concise — 5-7 lines max.`;
                        setRebuildAiLoading(true);
                        callClaude(prompt).then(r => { setRebuildAiResult(r); rebuildAiCacheRef.current[rbCacheKey] = r; setRebuildAiLoading(false); });
                      }} disabled={rebuildAiLoading}>
                        {rebuildAiLoading ? <><div className="spinner" />{ko ? "분석중..." : "Analyzing..."}</> : `✨ ${ko ? "AI 분석" : "Analyze"}`}
                      </button>
                    </div>
                    {rebuildAiResult && (
                      <div className="card-body">
                        <div className="ai-box">
                          <div className="ai-header"><div className="ai-dot" /><span className="ai-label">AI {ko ? "딜 분석" : "Analysis"}</span><span style={{fontSize:8,color:"var(--dim)",marginLeft:"auto",fontStyle:"italic"}}>Reference only</span></div>
                          <div className="ai-text">{rebuildAiResult}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Builders */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">🔨 {ko ? "재건축 건설사 추천" : "Recommended Builders"}</span>
                    </div>
                    <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {contractorList.filter(c => c.category === "luxury").slice(0, 5).map((c, i) => (
                        <div key={i} style={{ background: "var(--bg3)", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                            <div><div style={{ fontWeight: 800, fontSize: 13 }}>{c.name}</div><div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>{c.specialty}</div></div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--blue)" }}>{c.sqft}<span style={{ fontSize: 9, color: "var(--dim)" }}> sqft</span></div>
                              <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 700 }}>{c.rating}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--dim)", lineHeight: 1.5, marginBottom: 6 }}>{c.review}</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <a href={`tel:${c.phone}`} style={{ fontSize: 10, color: "var(--blue)", textDecoration: "none" }}>📞 {c.phone}</a>
                            <a href={`mailto:${c.email}`} style={{ fontSize: 10, color: "var(--gold)", textDecoration: "none" }}>✉️ {c.email}</a>
                            <a href={`https://${c.website}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "var(--green)", textDecoration: "none" }}>🌐 {c.website}</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lenders */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">💰 {ko ? "재건축 금융사 추천" : "Construction Financing"}</span>
                    </div>
                    <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {lenderList.filter(l => l.category === "flip").slice(0, 5).map((l, i) => (
                        <div key={i} style={{ background: "var(--bg3)", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div><div style={{ fontWeight: 800, fontSize: 13 }}>{l.name}</div>{l.badge && <span style={{ fontSize: 9, fontWeight: 800, background: "var(--gold)", color: "#000", padding: "2px 6px", borderRadius: 4 }}>{l.badge}</span>}</div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--blue)" }}>{l.rate}%<span style={{ fontSize: 10, color: "var(--dim)", fontWeight: 400 }}>/yr</span></div>
                              <div style={{ fontSize: 10, color: "var(--dim)" }}>LTV {l.ltv}% · {l.speed}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--dim)", lineHeight: 1.5, marginBottom: 6 }}>{l.review}</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <a href={`tel:${l.phone}`} style={{ fontSize: 10, color: "var(--blue)", textDecoration: "none" }}>📞 {l.phone}</a>
                            <a href={`mailto:${l.email}`} style={{ fontSize: 10, color: "var(--gold)", textDecoration: "none" }}>✉️ {l.email}</a>
                            <a href={`https://${l.website}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "var(--green)", textDecoration: "none" }}>🌐 {l.website}</a>
                          </div>
                        </div>
                      ))}
                      <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 14px", fontSize: 11, color: "var(--dim)", lineHeight: 1.6 }}>
                        💡 {ko ? "재건축 = Construction Loan 필요. 공사 완료 후 Permanent Loan 전환 가능." : "Teardown-rebuild requires Construction Loan. Ask about Construction-to-Permanent options."}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}


            {/* ── ⚙️ 어드민 ─────────────────────────────────────────── */}
            {tab === "admin" && (() => {
              const ko = lang === "ko";

              // PIN lock screen
              if (!adminUnlocked) return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16 }}>
                  <div style={{ fontSize: 40 }}>⚙️</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{ko ? "어드민 패널" : "Admin Panel"}</div>
                  <div style={{ fontSize: 13, color: "var(--dim)" }}>{ko ? "PIN을 입력하세요" : "Enter your PIN"}</div>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="····"
                    className="task-input"
                    style={{ width: 120, textAlign: "center", fontSize: 24, letterSpacing: 8 }}
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { if (adminPin === ADMIN_PIN) { setAdminUnlocked(true); setAdminPin(''); setPinError(false); } else { setPinError(true); setAdminPin(''); } } }}
                  />
                  <button className="btn btn-gold" onClick={() => { if (adminPin === ADMIN_PIN) { setAdminUnlocked(true); setAdminPin(''); setPinError(false); } else { setPinError(true); setAdminPin(''); } }}>
                    {ko ? "입력" : "Enter"}
                  </button>
                  {pinError && <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 700 }}>❌ {ko ? "잘못된 PIN" : "Wrong PIN"}</div>}
                  <div style={{ fontSize: 10, color: "var(--dim)" }}>PIN: 1234</div>
                </div>
              );

              const currentList = adminSection === 'contractors' ? contractorList : lenderList;
              const contractorFields = [
                { key: 'category', label: ko ? '카테고리' : 'Category', hint: 'luxury / flip / rental' },
                { key: 'name', label: ko ? '업체명' : 'Name' },
                { key: 'specialty', label: ko ? '전문분야' : 'Specialty' },
                { key: 'phone', label: ko ? '전화' : 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'website', label: 'Website' },
                { key: 'sqft', label: ko ? '단가/sqft' : 'Price/sqft', hint: '$80–$120' },
                { key: 'score', label: ko ? '점수' : 'Score', hint: '0–100' },
                { key: 'rating', label: ko ? '별점' : 'Rating', hint: '4.9★ (200+)' },
                { key: 'review', label: ko ? '설명' : 'Review' },
              ];
              const lenderFields = [
                { key: 'category', label: ko ? '카테고리' : 'Category', hint: 'conventional / flip / rental' },
                { key: 'name', label: ko ? '업체명' : 'Name' },
                { key: 'rate', label: ko ? '금리 (%)' : 'Rate (%)', hint: '7.0' },
                { key: 'ltv', label: 'LTV (%)', hint: '75' },
                { key: 'speed', label: ko ? '처리속도' : 'Speed', hint: '25일' },
                { key: 'phone', label: ko ? '전화' : 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'website', label: 'Website' },
                { key: 'badge', label: ko ? '배지' : 'Badge', hint: '추천 / 최저금리' },
                { key: 'rating', label: ko ? '별점' : 'Rating', hint: '4.9★' },
                { key: 'review', label: ko ? '설명' : 'Review' },
              ];
              const fields = adminSection === 'contractors' ? contractorFields : lenderFields;

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[['contractors', ko ? '🔨 건설사' : '🔨 Contractors'], ['lenders', ko ? '💰 금융사' : '💰 Lenders']].map(([key, label]) => (
                        <button key={key} onClick={() => { setAdminSection(key); setAdminEdit(null); }}
                          style={{ padding: "8px 18px", borderRadius: 100, border: "1px solid " + (adminSection === key ? "var(--gold)" : "var(--border)"), background: adminSection === key ? "var(--gold)22" : "var(--bg2)", color: adminSection === key ? "var(--gold)" : "var(--dim)", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>
                          {label} <span style={{ fontSize: 11 }}>({adminSection === key ? currentList.length : (key === 'contractors' ? contractorList.length : lenderList.length)})</span>
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {sheetsLoading && <span style={{ fontSize: 11, color: "var(--dim)" }}>⏳ {ko ? "동기화 중..." : "Syncing..."}</span>}
                      {sheetsStatus === 'ok' && !sheetsLoading && <span style={{ fontSize: 11, color: "var(--green)" }}>✅ Sheets {ko ? "연결됨" : "connected"}</span>}
                      {sheetsStatus === 'error' && <span style={{ fontSize: 11, color: "var(--red)" }}>⚠️ Sheets {ko ? "오류" : "error"}</span>}
                      <button className="btn btn-gold" style={{ padding: "6px 14px", fontSize: 12 }}
                        onClick={() => setAdminEdit({ mode: 'add', type: adminSection, index: -1, data: {} })}>
                        + {ko ? "추가" : "Add"}
                      </button>
                      <button onClick={() => setAdminUnlocked(false)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--dim)", fontSize: 11, cursor: "pointer" }}>
                        🔒
                      </button>
                    </div>
                  </div>

                  {/* Edit / Add Form */}
                  {adminEdit && (
                    <div className="card" style={{ border: "1px solid var(--gold)" }}>
                      <div className="card-header">
                        <span className="card-title">{adminEdit.mode === 'add' ? (ko ? '➕ 새 항목 추가' : '➕ Add New') : (ko ? '✏️ 수정' : '✏️ Edit')}</span>
                        <button onClick={() => setAdminEdit(null)} style={{ background: "none", border: "none", color: "var(--dim)", fontSize: 18, cursor: "pointer" }}>✕</button>
                      </div>
                      <div className="card-body">
                        <div className="grid2" style={{ gap: 10, marginBottom: 14 }}>
                          {fields.map(f => (
                            <div key={f.key}>
                              <label style={{ fontSize: 10, color: "var(--dim)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{f.label}{f.hint ? <span style={{ color: "var(--dim)", fontWeight: 400 }}> ({f.hint})</span> : ''}</label>
                              <input
                                className="task-input"
                                style={{ width: "100%", marginTop: 4 }}
                                value={adminEdit.data[f.key] || ''}
                                onChange={e => setAdminEdit(prev => ({ ...prev, data: { ...prev.data, [f.key]: e.target.value } }))}
                              />
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-gold" style={{ flex: 1, justifyContent: "center" }}
                            onClick={() => adminSave(adminEdit.type, adminEdit.mode, adminEdit.index, adminEdit.data)}>
                            {ko ? "💾 저장" : "💾 Save"}
                          </button>
                          <button className="btn btn-ghost" onClick={() => setAdminEdit(null)} style={{ padding: "8px 20px" }}>
                            {ko ? "취소" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currentList.map((item, i) => (
                      <div key={i} className="card" style={{ marginBottom: 0 }}>
                        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ background: "var(--bg4)", borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "var(--gold)", flexShrink: 0 }}>{i+1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                            <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 2 }}>
                              <span style={{ background: "var(--bg3)", borderRadius: 4, padding: "1px 6px", marginRight: 6 }}>{item.category}</span>
                              {adminSection === 'contractors' ? item.specialty : `${item.rate}% · LTV ${item.ltv}%`}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <button onClick={() => setAdminEdit({ mode: 'edit', type: adminSection, index: i, data: { ...item } })}
                              style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid var(--blue)", background: "var(--blue2)", color: "var(--blue)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              ✏️
                            </button>
                            <button onClick={() => adminDelete(adminSection, i)}
                              style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid var(--red)", background: "var(--red)22", color: "var(--red)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })()}



          </div>
        </div>
      </div>
    </>
  );
}
