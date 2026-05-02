import { useState } from "react";

const $ = (n) => {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(Math.round(n));
  return (n < 0 ? "-$" : "$") + abs.toLocaleString();
};
const pct = (n, dec = 1) => (!isFinite(n) || isNaN(n) ? "—" : (n * 100).toFixed(dec) + "%");
const xVal = (n) => (!isFinite(n) || isNaN(n) ? "—" : n.toFixed(2) + "x");

function calcPI(principal, annualRatePct, years) {
  if (principal <= 0 || annualRatePct <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

const VERDICT_CONFIG = {
  pursue:    { border: "#166534", badge: "#16a34a", label: "PURSUE",    symbol: "✓" },
  negotiate: { border: "#92400e", badge: "#d97706", label: "NEGOTIATE", symbol: "~" },
  pass:      { border: "#991b1b", badge: "#dc2626", label: "PASS",      symbol: "✗" },
};

function VBadge({ status }) {
  const c = VERDICT_CONFIG[status] || VERDICT_CONFIG.pass;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:c.badge, color:"#fff", borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700, letterSpacing:"0.06em" }}>
      {c.symbol} {c.label}
    </span>
  );
}

function NumInput({ label, value, onChange, prefix, suffix, step = 1000, note }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <label style={{ fontSize:10, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</label>
        {note && <span style={{ fontSize:9, color:"#374151", fontStyle:"italic" }}>{note}</span>}
      </div>
      <div style={{ display:"flex", alignItems:"center", background:"#1a2235", border:"1px solid #2d3748", borderRadius:6, padding:"5px 10px", gap:4 }}>
        {prefix && <span style={{ color:"#4b5563", fontSize:13 }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{ background:"transparent", border:"none", outline:"none", color:"#e2e8f0", fontSize:14, fontFamily:"'DM Mono',monospace", width:"100%", textAlign:"right" }}
        />
        {suffix && <span style={{ color:"#4b5563", fontSize:13 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function MetricCard({ label, value, good, warn, bad, sub }) {
  const color = bad ? "#f87171" : warn ? "#f59e0b" : good ? "#4ade80" : "#e2e8f0";
  return (
    <div style={{ background:"#131c2e", border:"1px solid #1e2d45", borderRadius:8, padding:"10px 14px" }}>
      <div style={{ fontSize:10, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:700, fontFamily:"'DM Mono',monospace", color }}>{value}</div>
      {sub && <div style={{ fontSize:9, color:"#374151", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function DataRow({ label, value, note, target, pass, highlight }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"7px 0", borderBottom:"1px solid #1a2235", background: highlight ? "rgba(245,158,11,0.04)" : "transparent" }}>
      <div style={{ fontSize:12, color: highlight ? "#f59e0b" : "#6b7280", flexShrink:0, paddingRight:8 }}>{label}</div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:12, fontFamily:"'DM Mono',monospace", fontWeight:500, color: pass === undefined ? "#cbd5e1" : pass ? "#4ade80" : "#f87171" }}>{value}</div>
        {target && <div style={{ fontSize:9, color:"#374151", marginTop:1 }}>target: {target}</div>}
        {note && <div style={{ fontSize:9, color:"#374151", marginTop:1 }}>{note}</div>}
      </div>
    </div>
  );
}

function SectionLabel({ children, color }) {
  return <div style={{ fontSize:10, color: color || "#4b5563", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{children}</div>;
}

function VerdictBox({ verdict, message }) {
  const c = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.pass;
  return (
    <div style={{ background:"#0d1117", borderRadius:8, border:`1px solid ${c.border}`, padding:"12px 14px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
      <div style={{ fontSize:12, color:"#6b7280", flex:1, lineHeight:1.6 }}>{message}</div>
      <VBadge status={verdict} />
    </div>
  );
}

function InputPanel({ children, title }) {
  return (
    <div>
      <SectionLabel>{title || "Inputs"}</SectionLabel>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{children}</div>
    </div>
  );
}

function ResultPanel({ children, title }) {
  return (
    <div>
      <SectionLabel>{title || "Results"}</SectionLabel>
      {children}
    </div>
  );
}

// ─── WARNING BOX ───────────────────────────────────────────────────────────
function WarningBox({ message }) {
  return (
    <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid #991b1b", borderRadius:6, padding:"10px 14px", marginBottom:12, fontSize:11, color:"#fca5a5", lineHeight:1.7 }}>
      ⚠ {message}
    </div>
  );
}

function InfoBox({ message, color }) {
  return (
    <div style={{ background:"rgba(245,158,11,0.07)", border:"1px solid #92400e", borderRadius:6, padding:"10px 14px", marginBottom:12, fontSize:11, color: color || "#fcd34d", lineHeight:1.7 }}>
      {message}
    </div>
  );
}

// ─── MARKET PRESETS ────────────────────────────────────────────────────────
const MARKET_PRESETS = {
  cleveland: {
    label: "Cleveland, OH",
    snowRemoval: 4000,
    landscaping: 3000,
    insurance: 5500,
    propTaxRate: 1.95,
    mgmtPct: 9,
    vacancyPct: 10,
    maintPerUnit: 400,
    leasingFeeMonths: 0.75,
    turnoverRate: 50,
    avgRent: 850,
    capRateMarket: 7.5,
    notes: "Higher property tax (Cuyahoga Co ~1.8–2.1%). Snow removal $3.5–5.5K/yr. Insurance moderate. Pay-to-Stay ordinance slows evictions.",
  },
  atlanta: {
    label: "Atlanta, GA",
    snowRemoval: 0,
    landscaping: 4000,
    insurance: 7500,
    propTaxRate: 0.85,
    mgmtPct: 9,
    vacancyPct: 10,
    maintPerUnit: 375,
    leasingFeeMonths: 0.75,
    turnoverRate: 50,
    avgRent: 1100,
    capRateMarket: 6.5,
    notes: "No snow cost. Higher insurance post-Helene ($5.5–9K/yr). Lower property tax (~0.77–1.1%). Annual reassessment at purchase price.",
  },
  columbus: {
    label: "Columbus, OH",
    snowRemoval: 3200,
    landscaping: 2800,
    insurance: 5000,
    propTaxRate: 1.55,
    mgmtPct: 9,
    vacancyPct: 9,
    maintPerUnit: 380,
    leasingFeeMonths: 0.75,
    turnoverRate: 45,
    avgRent: 950,
    capRateMarket: 7.0,
    notes: "Franklin Co ~1.55% effective rate. Pay-to-Stay applies. Intel/Honda jobs support rents. Moderate snow. Intel fab-driven demand.",
  },
  dayton: {
    label: "Dayton, OH",
    snowRemoval: 3800,
    landscaping: 2500,
    insurance: 4800,
    propTaxRate: 1.78,
    mgmtPct: 9,
    vacancyPct: 11,
    maintPerUnit: 420,
    leasingFeeMonths: 0.75,
    turnoverRate: 55,
    avgRent: 800,
    capRateMarket: 8.0,
    notes: "Montgomery Co ~1.78% rate. Lowest entry prices. Wright-Patterson AFB anchor. Higher turnover typical in Class C. Pay-to-Stay applies.",
  },
  custom: {
    label: "Custom Market",
    snowRemoval: 0,
    landscaping: 3000,
    insurance: 5500,
    propTaxRate: 1.20,
    mgmtPct: 9,
    vacancyPct: 10,
    maintPerUnit: 400,
    leasingFeeMonths: 0.75,
    turnoverRate: 50,
    avgRent: 900,
    capRateMarket: 7.0,
    notes: "Enter your own market figures.",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
export default function DealAnalyzer() {
  const [tab, setTab] = useState("realcosts");

  // ── Shared ──
  const [purchase, setPurchase]       = useState(475000);
  const [arv, setArv]                 = useState(500000);
  const [repairs, setRepairs]         = useState(25000);
  const [closingHold, setClosingHold] = useState(12000);
  const [units, setUnits]             = useState(7);

  // ── Flip ──
  const [flipMonths, setFlipMonths]       = useState(6);
  const [flipHoldMo, setFlipHoldMo]       = useState(1200);
  const [buyClosePct, setBuyClosePct]     = useState(2);
  const [sellClosePct, setSellClosePct]   = useState(8);
  const [hmDown, setHmDown]               = useState(15);

  // ── BRRRR ──
  const [rent, setRent]     = useState(850);
  const [ltv, setLtv]       = useState(75);
  const [rate, setRate]     = useState(7.5);
  const [term, setTerm]     = useState(30);
  const [tax, setTax]       = useState(750);
  const [ins, setIns]       = useState(460);
  const [vac, setVac]       = useState(10);
  const [mgmt, setMgmt]     = useState(9);
  const [maint, setMaint]   = useState(233);

  // ── Sober Living ──
  const [slBeds, setSlBeds]   = useState(4);
  const [slRate, setSlRate]   = useState(750);
  const [slOcc, setSlOcc]     = useState(90);
  const [slMgr, setSlMgr]     = useState(900);
  const [slUtil, setSlUtil]   = useState(400);
  const [slOther, setSlOther] = useState(200);
  const [slMortgSrc, setSlMortgSrc] = useState("brrrr");
  const [slMortgMan, setSlMortgMan] = useState(950);

  // ── REAL COSTS TAB ──────────────────────────────────────────────────────
  const [selectedMarket, setSelectedMarket] = useState("cleveland");
  const [rcPurchase, setRcPurchase]   = useState(475000);
  const [rcUnits, setRcUnits]         = useState(7);
  const [rcAvgRent, setRcAvgRent]     = useState(850);
  const [rcDownPct, setRcDownPct]     = useState(20);
  const [rcRate, setRcRate]           = useState(7.0);
  const [rcTerm, setRcTerm]           = useState(25);
  const [rcSellerCarry, setRcSellerCarry] = useState(true);

  // Operating cost overrides (seeded from preset)
  const [rcSnow, setRcSnow]           = useState(4000);
  const [rcLandscape, setRcLandscape] = useState(3000);
  const [rcInsurance, setRcInsurance] = useState(5500);
  const [rcPropTaxRate, setRcPropTaxRate] = useState(1.95);
  const [rcMgmtPct, setRcMgmtPct]     = useState(9);
  const [rcVacancy, setRcVacancy]     = useState(10);
  const [rcMaintUnit, setRcMaintUnit] = useState(400);
  const [rcTurnoverRate, setRcTurnoverRate] = useState(50);
  const [rcLeasingFee, setRcLeasingFee] = useState(0.75);
  const [rcOtherAnnual, setRcOtherAnnual] = useState(600);

  // Seller financing extra
  const [rcSellerRate, setRcSellerRate] = useState(7.0);
  const [rcBalloonYears, setRcBalloonYears] = useState(7);

  const applyPreset = (key) => {
    setSelectedMarket(key);
    const p = MARKET_PRESETS[key];
    setRcSnow(p.snowRemoval);
    setRcLandscape(p.landscaping);
    setRcInsurance(p.insurance);
    setRcPropTaxRate(p.propTaxRate);
    setRcMgmtPct(p.mgmtPct);
    setRcVacancy(p.vacancyPct);
    setRcMaintUnit(p.maintPerUnit);
    setRcTurnoverRate(p.turnoverRate);
    setRcAvgRent(p.avgRent);
  };

  // ── REAL COSTS CALCULATIONS ─────────────────────────────────────────────
  const rcGPR         = rcUnits * rcAvgRent * 12;
  const rcVacLoss     = rcGPR * (rcVacancy / 100);
  const rcEGI         = rcGPR - rcVacLoss;
  const rcMgmtFee     = rcEGI * (rcMgmtPct / 100);
  const rcTurnovers   = rcUnits * (rcTurnoverRate / 100);
  const rcLeasingTotal= rcTurnovers * rcAvgRent * rcLeasingFee;
  const rcPropTax     = rcPurchase * (rcPropTaxRate / 100);
  const rcMaint       = rcUnits * rcMaintUnit;
  const rcTotalOpEx   = rcMgmtFee + rcLeasingTotal + rcPropTax + rcInsurance + rcSnow + rcLandscape + rcMaint + rcOtherAnnual;
  const rcNOI         = rcEGI - rcTotalOpEx;
  const rcCapRate     = rcPurchase > 0 ? rcNOI / rcPurchase : 0;

  // Debt service
  const rcLoanAmt     = rcPurchase * (1 - rcDownPct / 100);
  const rcDownAmt     = rcPurchase * (rcDownPct / 100);
  const rcPI          = calcPI(rcLoanAmt, rcSellerCarry ? rcSellerRate : rcRate, rcTerm);
  const rcAnnualDS    = rcPI * 12;
  const rcCashFlow    = rcNOI - rcAnnualDS;
  const rcCoCReturn   = rcDownAmt > 0 ? rcCashFlow / rcDownAmt : 0;
  const rcDSCR        = rcAnnualDS > 0 ? rcNOI / rcAnnualDS : 0;

  // Seller vs seller T-12 trap
  const rcSellerEstOpEx = rcGPR * 0.18; // naive seller T-12 often only 18-22% expense ratio
  const rcSellerNOI     = rcEGI - rcSellerEstOpEx;
  const rcGap           = rcSellerNOI - rcNOI;

  // Expense ratio
  const rcExpRatio    = rcEGI > 0 ? rcTotalOpEx / rcEGI : 0;

  // Verdict
  const rcVerdict = rcCashFlow >= 6000 && rcDSCR >= 1.20 && rcCapRate >= 0.065
    ? "pursue"
    : rcCashFlow >= 0 && rcDSCR >= 1.0
    ? "negotiate"
    : "pass";

  // ─── Other tab calcs (keeping from original) ───────────────────────────
  const allIn     = purchase + repairs + closingHold;
  const allInPct  = arv > 0 ? allIn / arv : 0;
  const maxOffer70 = arv * 0.70 - repairs - 8000;
  const maxOffer65 = arv * 0.65 - repairs - 8000;
  const offerGap   = maxOffer70 - purchase;
  const quickV = purchase <= maxOffer70 ? "pursue" : purchase <= maxOffer70 * 1.12 ? "negotiate" : "pass";

  const buyClose   = purchase * buyClosePct / 100;
  const holdTotal  = flipHoldMo * flipMonths;
  const sellClose  = arv * sellClosePct / 100;
  const flipCost   = purchase + repairs + buyClose + holdTotal + sellClose;
  const flipProfit = arv - flipCost;
  const flipCashIn = (purchase * hmDown / 100) + buyClose + (repairs * 0.10);
  const flipROI    = flipCashIn > 0 ? flipProfit / flipCashIn : 0;
  const flipAnn    = flipMonths > 0 ? flipROI / (flipMonths / 12) : 0;
  const flipV = flipProfit >= 25000 && flipROI >= 0.15 ? "pursue" : flipProfit >= 12000 && flipROI >= 0.08 ? "negotiate" : "pass";

  const refiAmt    = arv * ltv / 100;
  const capLeft    = Math.max(0, allIn - refiAmt);
  const recycleRate= allIn > 0 ? Math.min(allIn, refiAmt) / allIn : 0;
  const pi         = calcPI(refiAmt, rate, term);
  const piti       = pi + tax + ins;
  const effRent    = rent * (1 - vac / 100);
  const mgmtCost   = effRent * mgmt / 100;
  const cashflow   = effRent - piti - mgmtCost - maint;
  const noi        = (effRent - mgmtCost - maint) * 12;
  const dscr       = pi > 0 ? noi / (pi * 12) : 0;
  const coc        = capLeft > 100 ? (cashflow * 12) / capLeft : (cashflow > 0 ? Infinity : -Infinity);
  const brrrV = allInPct <= 0.75 && dscr >= 1.2 && recycleRate >= 0.75 ? "pursue"
              : allInPct <= 0.82 && dscr >= 1.05 ? "negotiate" : "pass";

  const slGross   = slBeds * slRate * (slOcc / 100);
  const slMortg   = slMortgSrc === "brrrr" ? piti : slMortgMan;
  const slExp     = slMgr + slUtil + slOther + slMortg;
  const slNet     = slGross - slExp;
  const slVsTrad  = slNet - cashflow;
  const slCoc     = capLeft > 100 ? (slNet * 12) / capLeft : (slNet > 0 ? Infinity : -Infinity);
  const slV = slNet >= 800 ? "pursue" : slNet >= 300 ? "negotiate" : "pass";

  const TABS = [
    { id:"realcosts", label:"Real Cost Analysis" },
    { id:"quick",     label:"Quick Filter"  },
    { id:"flip",      label:"Fix & Flip"    },
    { id:"brrrr",     label:"BRRRR"         },
    { id:"sober",     label:"Sober Living"  },
    { id:"compare",   label:"Compare All"   },
  ];

  const colLayout = { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:20 };
  const grid2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 };
  const grid3 = { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 };

  return (
    <div style={{ background:"#0d1117", fontFamily:"'DM Mono',monospace", color:"#e2e8f0", minHeight:"100vh" }}>

      {/* ── Header ── */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"14px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#f59e0b", letterSpacing:"0.04em" }}>DEAL ANALYZER</div>
            <div style={{ fontSize:10, color:"#374151", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:2 }}>Flip · BRRRR · Sober Living · Real Cost Analysis</div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { label:"Purchase", val: $(purchase) },
              { label:"ARV",      val: $(arv)       },
              { label:"All-in %", val: pct(allInPct), color: allInPct<=0.70?"#4ade80":allInPct<=0.80?"#f59e0b":"#f87171" },
            ].map(s => (
              <div key={s.label} style={{ background:"#1a2235", borderRadius:6, padding:"5px 10px", fontSize:11, color:"#6b7280" }}>
                {s.label}: <span style={{ color: s.color || "#f59e0b", fontWeight:700 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Shared Inputs ── */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"12px 20px" }}>
        <SectionLabel>Property inputs — shared across all strategies</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10 }}>
          <NumInput label="Purchase Price"    value={purchase}    onChange={setPurchase}    prefix="$" step={5000} />
          <NumInput label="ARV"               value={arv}         onChange={setArv}         prefix="$" step={5000} />
          <NumInput label="Est. Repairs"      value={repairs}     onChange={setRepairs}     prefix="$" step={2500} />
          <NumInput label="Closing + Holding" value={closingHold} onChange={setClosingHold} prefix="$" step={500} />
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", display:"flex", overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"10px 18px", fontFamily:"inherit", fontSize:12, fontWeight: tab===t.id?700:400,
            color: tab===t.id ? (t.id==="realcosts"?"#34d399":"#f59e0b") : "#4b5563",
            background:"transparent", border:"none",
            borderBottom: tab===t.id ? `2px solid ${t.id==="realcosts"?"#34d399":"#f59e0b"}` : "2px solid transparent",
            cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.12s",
          }}>{t.label}{t.id==="realcosts" ? " ★" : ""}</button>
        ))}
      </div>

      <div style={{ padding:20 }}>

        {/* ════════════════ REAL COST ANALYSIS ════════════════ */}
        {tab==="realcosts" && (
          <div>
            {/* Market Selector */}
            <div style={{ marginBottom:20 }}>
              <SectionLabel color="#34d399">Market preset — loads realistic cost estimates for each market</SectionLabel>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {Object.entries(MARKET_PRESETS).map(([key, p]) => (
                  <button key={key} onClick={() => applyPreset(key)} style={{
                    padding:"7px 14px", fontFamily:"inherit", fontSize:11, fontWeight: selectedMarket===key?700:400,
                    background: selectedMarket===key ? "#34d399" : "#1a2235",
                    color: selectedMarket===key ? "#000" : "#6b7280",
                    border:`1px solid ${selectedMarket===key?"#34d399":"#2d3748"}`,
                    borderRadius:6, cursor:"pointer",
                  }}>{p.label}</button>
                ))}
              </div>
              {selectedMarket && (
                <div style={{ marginTop:8, background:"#131c2e", border:"1px solid #1e2d45", borderRadius:6, padding:"8px 12px", fontSize:11, color:"#4b5563", lineHeight:1.7 }}>
                  <span style={{ color:"#6b7280" }}>Market note:</span> {MARKET_PRESETS[selectedMarket].notes}
                </div>
              )}
            </div>

            <div style={colLayout}>
              {/* LEFT — Inputs */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Deal Basics */}
                <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:16 }}>
                  <SectionLabel color="#34d399">Deal basics</SectionLabel>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <NumInput label="Purchase Price"   value={rcPurchase}  onChange={setRcPurchase}  prefix="$" step={5000} />
                    <NumInput label="Number of Units"  value={rcUnits}     onChange={setRcUnits}     step={1} />
                    <NumInput label="Avg Rent / Unit / Mo" value={rcAvgRent} onChange={setRcAvgRent} prefix="$" step={25} note="Use T-12 actual, not pro forma" />
                    <NumInput label="Down Payment %"   value={rcDownPct}   onChange={setRcDownPct}   suffix="%" step={5} />
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      <div style={{ fontSize:10, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Financing type</div>
                      <div style={{ display:"flex", gap:8 }}>
                        {[["true","Seller Financing"],["false","Bank / DSCR"]].map(([v,l]) => (
                          <button key={v} onClick={()=>setRcSellerCarry(v==="true")} style={{
                            flex:1, padding:"7px 8px", fontFamily:"inherit", fontSize:11,
                            background: String(rcSellerCarry)===v ? "#34d399" : "#1a2235",
                            color: String(rcSellerCarry)===v ? "#000" : "#6b7280",
                            border:`1px solid ${String(rcSellerCarry)===v?"#34d399":"#2d3748"}`,
                            borderRadius:6, cursor:"pointer"
                          }}>{l}</button>
                        ))}
                      </div>
                    </div>
                    {rcSellerCarry ? (
                      <>
                        <NumInput label="Seller Rate"      value={rcSellerRate}     onChange={setRcSellerRate}     suffix="%" step={0.25} />
                        <NumInput label="Amortization (yrs)" value={rcTerm}         onChange={setRcTerm}           step={5} />
                        <NumInput label="Balloon (yrs)"    value={rcBalloonYears}   onChange={setRcBalloonYears}   step={1} note="Refinance target" />
                      </>
                    ) : (
                      <>
                        <NumInput label="Interest Rate"    value={rcRate}   onChange={setRcRate}   suffix="%" step={0.25} />
                        <NumInput label="Loan Term (yrs)"  value={rcTerm}   onChange={setRcTerm}   step={5} />
                      </>
                    )}
                  </div>
                </div>

                {/* Operating Costs */}
                <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:16 }}>
                  <SectionLabel color="#34d399">Operating costs — annual</SectionLabel>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <NumInput label="Property Mgmt %"      value={rcMgmtPct}      onChange={setRcMgmtPct}      suffix="%" step={0.5} note="Of collected rent" />
                    <NumInput label="Vacancy Rate %"       value={rcVacancy}      onChange={setRcVacancy}      suffix="%" step={1} />
                    <NumInput label="Turnover Rate %"      value={rcTurnoverRate} onChange={setRcTurnoverRate} suffix="%" step={5} note="Avg annual" />
                    <NumInput label="Leasing Fee (months)" value={rcLeasingFee}   onChange={setRcLeasingFee}   step={0.25} note="Per new placement" />
                    <NumInput label="Maintenance / Unit / Yr" value={rcMaintUnit} onChange={setRcMaintUnit}    prefix="$" step={25} />
                    <NumInput label="Snow Removal / Yr"    value={rcSnow}         onChange={setRcSnow}         prefix="$" step={250} note="$0 for warm markets" />
                    <NumInput label="Landscaping / Yr"     value={rcLandscape}    onChange={setRcLandscape}    prefix="$" step={250} />
                    <NumInput label="Insurance / Yr"       value={rcInsurance}    onChange={setRcInsurance}    prefix="$" step={250} note="Get real binder quote" />
                    <NumInput label="Property Tax Rate %"  value={rcPropTaxRate}  onChange={setRcPropTaxRate}  suffix="%" step={0.05} note="Post-sale reassessment rate" />
                    <NumInput label="Other / Admin / Yr"   value={rcOtherAnnual}  onChange={setRcOtherAnnual}  prefix="$" step={100} note="Legal, accounting, misc" />
                  </div>
                </div>
              </div>

              {/* RIGHT — Results */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Verdict */}
                <VerdictBox verdict={rcVerdict} message={
                  rcVerdict==="pursue"
                    ? `Deal pencils at real-world costs. NOI ${$(rcNOI)}/yr, cash flow ${$(rcCashFlow)}/yr, DSCR ${rcDSCR.toFixed(2)}x. Cap rate ${pct(rcCapRate)} on purchase price.`
                    : rcVerdict==="negotiate"
                    ? `Marginal at asking price. Needs ${$(Math.abs(rcCashFlow))}/yr more NOI or price reduction to clear minimum thresholds.`
                    : `Deal doesn't pencil at real costs. Cash flow ${$(rcCashFlow)}/yr. Reduce price, push rents, or renegotiate financing terms.`
                } />

                {/* T-12 Trap Warning */}
                {rcGap > 5000 && (
                  <WarningBox message={`T-12 TRAP: Seller's reported expenses are likely ~${$(rcSellerEstOpEx)}/yr (${Math.round(rcSellerEstOpEx/rcGPR*100)}% ratio). Your real operating costs are ~${$(rcTotalOpEx)}/yr. That's a ${$(rcGap)}/yr gap that will make the deal look ${$(rcGap/rcPurchase*100/1, 1)}% better on paper than it actually is. Always verify with bank statements.`} />
                )}

                {/* Key Metrics */}
                <div style={grid3}>
                  <MetricCard label="Annual NOI"      value={$(rcNOI)}       good={rcNOI>0} bad={rcNOI<=0} sub="After all real expenses" />
                  <MetricCard label="Annual Cash Flow" value={$(rcCashFlow)} good={rcCashFlow>=6000} warn={rcCashFlow>=0&&rcCashFlow<6000} bad={rcCashFlow<0} sub="After debt service" />
                  <MetricCard label="Cash-on-Cash"    value={pct(rcCoCReturn)} good={rcCoCReturn>=0.08} warn={rcCoCReturn>=0.04&&rcCoCReturn<0.08} bad={rcCoCReturn<0.04} />
                  <MetricCard label="DSCR"            value={xVal(rcDSCR)}  good={rcDSCR>=1.25} warn={rcDSCR>=1.0&&rcDSCR<1.25} bad={rcDSCR<1.0} />
                  <MetricCard label="Cap Rate"        value={pct(rcCapRate)} good={rcCapRate>=0.075} warn={rcCapRate>=0.065&&rcCapRate<0.075} bad={rcCapRate<0.065} sub="On purchase price" />
                  <MetricCard label="Expense Ratio"   value={pct(rcExpRatio)} good={rcExpRatio<=0.50} warn={rcExpRatio>0.50&&rcExpRatio<=0.60} bad={rcExpRatio>0.60} sub="Target ≤50%" />
                </div>

                {/* Income Waterfall */}
                <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:16 }}>
                  <SectionLabel color="#34d399">Income waterfall</SectionLabel>
                  <DataRow label="Gross Potential Rent (GPR)"  value={$(rcGPR)}      note={`${rcUnits} units × $${rcAvgRent} × 12`} />
                  <DataRow label="Vacancy Loss"                value={`(${$(rcVacLoss)})`} note={`${rcVacancy}% vacancy`} />
                  <DataRow label="Effective Gross Income (EGI)" value={$(rcEGI)} highlight />

                  <div style={{ marginTop:12, marginBottom:4 }}>
                    <SectionLabel color="#f59e0b">Operating expenses — real world</SectionLabel>
                  </div>
                  <DataRow label="Property Management"    value={`(${$(rcMgmtFee)})`}     note={`${rcMgmtPct}% of EGI`} />
                  <DataRow label="Leasing Fees (turnover)" value={`(${$(rcLeasingTotal)})`} note={`${Math.round(rcTurnovers)} turns × ${rcLeasingFee} mo rent`} />
                  <DataRow label="Property Tax"           value={`(${$(rcPropTax)})`}     note={`${rcPropTaxRate}% of purchase — POST-SALE RATE`} />
                  <DataRow label="Insurance"              value={`(${$(rcInsurance)})`}   note="Get real binder before LOI" />
                  <DataRow label="Snow Removal + Salting" value={`(${$(rcSnow)})`}        note={rcSnow===0?"N/A for this market":"Winter ops — out-of-state essential"} />
                  <DataRow label="Landscaping"            value={`(${$(rcLandscape)})`} />
                  <DataRow label="Maintenance Reserves"   value={`(${$(rcMaint)})`}      note={`$${rcMaintUnit}/unit/yr`} />
                  <DataRow label="Other / Admin"          value={`(${$(rcOtherAnnual)})`} />
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderTop:"1px solid #2d3748", marginTop:4 }}>
                    <span style={{ fontSize:12, color:"#f59e0b" }}>Total OpEx</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:"#f87171" }}>({$(rcTotalOpEx)})</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderTop:"1px solid #2d3748" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#34d399" }}>Net Operating Income (NOI)</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:14, color: rcNOI>=0?"#4ade80":"#f87171" }}>{$(rcNOI)}</span>
                  </div>
                </div>

                {/* Debt Service */}
                <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:16 }}>
                  <SectionLabel color="#34d399">Debt service</SectionLabel>
                  <DataRow label="Loan Amount"          value={$(rcLoanAmt)}     note={`${100-rcDownPct}% of purchase`} />
                  <DataRow label="Down Payment"         value={$(rcDownAmt)}     note={`${rcDownPct}% — your cash in`} />
                  <DataRow label={rcSellerCarry?"Seller Rate":"Interest Rate"}  value={`${rcSellerCarry?rcSellerRate:rcRate}%`} />
                  {rcSellerCarry && <DataRow label="Balloon Due"     value={`Year ${rcBalloonYears}`} note="Plan refinance by year 5" />}
                  <DataRow label="Monthly P&I"          value={$(rcPI)} />
                  <DataRow label="Annual Debt Service"  value={$(rcAnnualDS)} />
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderTop:"1px solid #2d3748", marginTop:4 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#34d399" }}>Annual Cash Flow</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:14, color: rcCashFlow>=0?"#4ade80":"#f87171" }}>{$(rcCashFlow)}</span>
                  </div>
                  <DataRow label="Monthly Cash Flow"    value={$(rcCashFlow/12)} target="≥ $500/mo" pass={rcCashFlow/12>=500} />
                  <DataRow label="DSCR"                 value={xVal(rcDSCR)}     target="≥ 1.20"    pass={rcDSCR>=1.20} />
                  <DataRow label="Cash-on-Cash Return"  value={pct(rcCoCReturn)} target="≥ 8%"      pass={rcCoCReturn>=0.08} />
                </div>

                {/* Out-of-State Investor Checklist */}
                <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:16 }}>
                  <SectionLabel color="#f59e0b">Out-of-state investor checklist</SectionLabel>
                  {[
                    { item:"Property tax modeled at POST-SALE reassessment rate", pass: rcPropTaxRate >= 1.0 || selectedMarket==="atlanta" },
                    { item:"Insurance quote from real binder (not estimate)", pass: null },
                    { item:"Snow removal budgeted if northern market", pass: selectedMarket==="atlanta" || rcSnow >= 2500 },
                    { item:"PM fee includes leasing + renewal fees", pass: rcLeasingFee > 0 },
                    { item:"T-12 verified against seller bank statements", pass: null },
                    { item:"Occupancy verified via lease audit", pass: null },
                    { item:"Rent comps verified via Rentometer + PM call", pass: null },
                    { item:"Physical inspection scheduled (every unit)", pass: null },
                    { item:`Pay-to-Stay / eviction rules confirmed for ${MARKET_PRESETS[selectedMarket]?.label}`, pass: null },
                  ].map((c, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderBottom:"1px solid #1a2235", fontSize:11 }}>
                      <span style={{ color: c.pass===true?"#4ade80":c.pass===false?"#f87171":"#374151", fontSize:13 }}>
                        {c.pass===true?"✓":c.pass===false?"✗":"○"}
                      </span>
                      <span style={{ color: c.pass===null?"#4b5563":"#94a3b8" }}>{c.item}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ════════════════ QUICK FILTER ════════════════ */}
        {tab==="quick" && (
          <div style={colLayout}>
            <InputPanel title="Formula reference">
              {[
                ["MAX OFFER (70% rule)", `(ARV × 0.70) − Repairs − $8,000`],
                ["MAX OFFER (65% BRRRR)", `(ARV × 0.65) − Repairs − $8,000`],
                ["ALL-IN % OF ARV", `(Purchase + Repairs + Closing) ÷ ARV`],
              ].map(([k,v]) => (
                <div key={k} style={{ background:"#131c2e", border:"1px solid #1e2d45", borderRadius:6, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:"#f59e0b", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", fontFamily:"'DM Mono',monospace" }}>{v}</div>
                </div>
              ))}
            </InputPanel>
            <ResultPanel title="Quick filter results">
              <VerdictBox verdict={quickV} message={
                quickV==="pursue" ? `Purchase is ${$(Math.abs(offerGap))} below your 70% max offer.`
                : quickV==="negotiate" ? `Need ${$(Math.abs(offerGap))} price reduction to hit 70% rule.`
                : `Purchase exceeds max offer by ${$(Math.abs(offerGap))}.`
              } />
              <div style={grid2}>
                <MetricCard label="Max Offer (70%)" value={$(maxOffer70)} good />
                <MetricCard label="Max Offer (65%)" value={$(maxOffer65)} good />
                <MetricCard label="Your Purchase"   value={$(purchase)} bad={purchase>maxOffer70} good={purchase<=maxOffer70} />
                <MetricCard label="Gap to Max"      value={$(offerGap)} good={offerGap>=0} bad={offerGap<0} />
              </div>
              <DataRow label="All-in cost"         value={$(allIn)} />
              <DataRow label="All-in % of ARV"     value={pct(allInPct)}  target="≤ 75%" pass={allInPct<=0.75} />
              <DataRow label="Spread (ARV − All-in)" value={$(arv-allIn)} target="≥ $30K" pass={arv-allIn>=30000} />
            </ResultPanel>
          </div>
        )}

        {/* ════════════════ FIX & FLIP ════════════════ */}
        {tab==="flip" && (
          <div style={colLayout}>
            <InputPanel title="Flip inputs">
              <NumInput label="Holding period (months)" value={flipMonths}   onChange={setFlipMonths}   step={1} />
              <NumInput label="Monthly holding cost"    value={flipHoldMo}   onChange={setFlipHoldMo}   prefix="$" step={100} />
              <NumInput label="Buy closing costs"       value={buyClosePct}  onChange={setBuyClosePct}  suffix="%" step={0.5} />
              <NumInput label="Sell closing costs"      value={sellClosePct} onChange={setSellClosePct} suffix="%" step={0.5} />
              <NumInput label="Hard money down %"       value={hmDown}       onChange={setHmDown}       suffix="%" step={5} />
            </InputPanel>
            <ResultPanel title="Flip results">
              <VerdictBox verdict={flipV} message={
                flipV==="pursue" ? `Strong flip. ${$(flipProfit)} net profit over ${flipMonths} months.`
                : flipV==="negotiate" ? `Marginal. Reduce purchase by ${$(Math.max(0,25000-flipProfit))} to hit $25K target.`
                : `Flip math doesn't work. Net profit ${$(flipProfit)}.`
              } />
              <div style={grid2}>
                <MetricCard label="Net Profit"     value={$(flipProfit)}  good={flipProfit>=25000} warn={flipProfit>=12000&&flipProfit<25000} bad={flipProfit<12000} />
                <MetricCard label="ROI"            value={pct(flipROI)}   good={flipROI>=0.15} bad={flipROI<0.08} />
                <MetricCard label="Annualized ROI" value={pct(flipAnn)}   good={flipAnn>=0.25} />
                <MetricCard label="Cash Invested"  value={$(flipCashIn)} />
              </div>
            </ResultPanel>
          </div>
        )}

        {/* ════════════════ BRRRR ════════════════ */}
        {tab==="brrrr" && (
          <div style={colLayout}>
            <InputPanel title="BRRRR inputs">
              <NumInput label="Market rent / mo"    value={rent}  onChange={setRent}  prefix="$" step={50} />
              <NumInput label="Refi LTV %"          value={ltv}   onChange={setLtv}   suffix="%" step={5} />
              <NumInput label="Refi interest rate"  value={rate}  onChange={setRate}  suffix="%" step={0.25} />
              <NumInput label="Loan term (years)"   value={term}  onChange={setTerm}  step={5} />
              <NumInput label="Property tax / mo"   value={tax}   onChange={setTax}   prefix="$" step={25} />
              <NumInput label="Insurance / mo"      value={ins}   onChange={setIns}   prefix="$" step={25} />
              <NumInput label="Vacancy rate %"      value={vac}   onChange={setVac}   suffix="%" step={1} />
              <NumInput label="Mgmt fee %"          value={mgmt}  onChange={setMgmt}  suffix="%" step={1} />
              <NumInput label="Maintenance / mo"    value={maint} onChange={setMaint} prefix="$" step={25} />
            </InputPanel>
            <ResultPanel title="BRRRR results">
              <VerdictBox verdict={brrrV} message={
                brrrV==="pursue" ? `Recycles ${pct(recycleRate)} of capital. DSCR ${dscr.toFixed(2)}x.`
                : brrrV==="negotiate" ? `Borderline. Reduce purchase or increase rent.`
                : `Doesn't pencil at current all-in % and rent levels.`
              } />
              <div style={grid3}>
                <MetricCard label="Refi Amount"   value={$(refiAmt)} good />
                <MetricCard label="Capital Left"  value={capLeft<500?"~$0":$(capLeft)} good={capLeft<5000} bad={capLeft>=20000} />
                <MetricCard label="% Recycled"    value={pct(recycleRate)} good={recycleRate>=0.80} bad={recycleRate<0.60} />
                <MetricCard label="Cash Flow/mo"  value={$(cashflow)} good={cashflow>=150} bad={cashflow<0} />
                <MetricCard label="DSCR"          value={xVal(dscr)} good={dscr>=1.25} bad={dscr<1.1} />
                <MetricCard label="CoC Return"    value={isFinite(coc)?pct(coc):"∞"} good={!isFinite(coc)||coc>=0.08} />
              </div>
              <DataRow label="All-in % of ARV"   value={pct(allInPct)}    target="≤ 75%"  pass={allInPct<=0.75} />
              <DataRow label="Monthly cash flow" value={$(cashflow)}       target="≥ $150" pass={cashflow>=150} />
              <DataRow label="DSCR"              value={xVal(dscr)}        target="≥ 1.20" pass={dscr>=1.20} />
              <DataRow label="Capital recycled"  value={pct(recycleRate)}  target="≥ 75%"  pass={recycleRate>=0.75} />
            </ResultPanel>
          </div>
        )}

        {/* ════════════════ SOBER LIVING ════════════════ */}
        {tab==="sober" && (
          <div style={colLayout}>
            <InputPanel title="Sober living inputs">
              <NumInput label="Number of beds"      value={slBeds}  onChange={setSlBeds}  step={1} />
              <NumInput label="Rate per bed / mo"   value={slRate}  onChange={setSlRate}  prefix="$" step={25} />
              <NumInput label="Occupancy %"         value={slOcc}   onChange={setSlOcc}   suffix="%" step={5} />
              <NumInput label="House manager / mo"  value={slMgr}   onChange={setSlMgr}   prefix="$" step={50} />
              <NumInput label="Utilities / mo"      value={slUtil}  onChange={setSlUtil}  prefix="$" step={25} />
              <NumInput label="Other expenses / mo" value={slOther} onChange={setSlOther} prefix="$" step={25} />
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ fontSize:10, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Mortgage source</div>
                <div style={{ display:"flex", gap:8 }}>
                  {[["brrrr","From BRRRR tab"],["manual","Enter manually"]].map(([v,l]) => (
                    <button key={v} onClick={()=>setSlMortgSrc(v)} style={{
                      flex:1, padding:"7px 8px", fontFamily:"inherit", fontSize:11,
                      background: slMortgSrc===v?"#f59e0b":"#1a2235",
                      color: slMortgSrc===v?"#000":"#6b7280",
                      border:"1px solid "+(slMortgSrc===v?"#f59e0b":"#2d3748"),
                      borderRadius:6, cursor:"pointer"
                    }}>{l}</button>
                  ))}
                </div>
                {slMortgSrc==="brrrr"
                  ? <div style={{ background:"#1a2235", borderRadius:6, padding:"7px 10px", fontSize:12, color:"#6b7280" }}>Using BRRRR PITI: <span style={{ color:"#f59e0b" }}>{$(piti)}/mo</span></div>
                  : <NumInput label="Total PITI / mo" value={slMortgMan} onChange={setSlMortgMan} prefix="$" step={50} />
                }
              </div>
            </InputPanel>
            <ResultPanel title="Sober living results">
              <VerdictBox verdict={slV} message={
                slV==="pursue" ? `${$(slNet)}/mo net — ${$(slVsTrad)} more than traditional rental.`
                : slV==="negotiate" ? `Marginal. Add a bed, raise rates, or increase occupancy.`
                : `Sober living doesn't pencil here.`
              } />
              <div style={grid2}>
                <MetricCard label="Gross Revenue"  value={$(slGross)} good />
                <MetricCard label="Net / Month"    value={$(slNet)} good={slNet>=800} warn={slNet>=300&&slNet<800} bad={slNet<0} />
                <MetricCard label="vs Traditional" value={(slVsTrad>=0?"+":"")+$(slVsTrad)} good={slVsTrad>0} bad={slVsTrad<0} />
                <MetricCard label="Net / Year"     value={$(slNet*12)} good={slNet>=800} />
              </div>
            </ResultPanel>
          </div>
        )}

        {/* ════════════════ COMPARE ALL ════════════════ */}
        {tab==="compare" && (() => {
          const strategies = [
            { id:"realcosts", label:"Real Cost Analysis", verdict:rcVerdict,
              metrics:[
                { l:"NOI/yr",      v:$(rcNOI),         pass:rcNOI>0 },
                { l:"Cash flow/yr",v:$(rcCashFlow),     pass:rcCashFlow>=6000 },
                { l:"DSCR",        v:xVal(rcDSCR),      pass:rcDSCR>=1.20 },
                { l:"CoC return",  v:pct(rcCoCReturn),  pass:rcCoCReturn>=0.08 },
              ]
            },
            { id:"quick", label:"Quick Filter", verdict:quickV,
              metrics:[
                { l:"All-in % ARV", v:pct(allInPct),   pass:allInPct<=0.75 },
                { l:"Price vs max", v:$(offerGap),      pass:offerGap>=0 },
                { l:"Spread",       v:$(arv-allIn),     pass:arv-allIn>=30000 },
              ]
            },
            { id:"flip", label:"Fix & Flip", verdict:flipV,
              metrics:[
                { l:"Net profit",  v:$(flipProfit),    pass:flipProfit>=25000 },
                { l:"ROI",         v:pct(flipROI),     pass:flipROI>=0.15 },
                { l:"Annualized",  v:pct(flipAnn),     pass:flipAnn>=0.25 },
              ]
            },
            { id:"brrrr", label:"BRRRR", verdict:brrrV,
              metrics:[
                { l:"Capital left",v:capLeft<500?"~$0":$(capLeft), pass:capLeft<10000 },
                { l:"% recycled",  v:pct(recycleRate), pass:recycleRate>=0.75 },
                { l:"Cash flow/mo",v:$(cashflow),      pass:cashflow>=150 },
                { l:"DSCR",        v:xVal(dscr),       pass:dscr>=1.20 },
              ]
            },
            { id:"sober", label:"Sober Living", verdict:slV,
              metrics:[
                { l:"Net/mo",      v:$(slNet),         pass:slNet>=800 },
                { l:"vs Trad.",    v:(slVsTrad>=0?"+":"")+$(slVsTrad), pass:slVsTrad>0 },
                { l:"Net/yr",      v:$(slNet*12),      pass:slNet>=800 },
              ]
            },
          ];
          const pursuing = strategies.filter(s=>s.verdict==="pursue");
          const negotiating = strategies.filter(s=>s.verdict==="negotiate");
          return (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:12, marginBottom:16 }}>
                {strategies.map(s => (
                  <div key={s.id} style={{ background:"#111827", borderRadius:10, border:`1px solid ${VERDICT_CONFIG[s.verdict].border}`, padding:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ fontSize:13, fontWeight:700, color: s.id==="realcosts"?"#34d399":"#e2e8f0" }}>{s.label}</div>
                      <VBadge status={s.verdict} />
                    </div>
                    {s.metrics.map((m,i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #1a2235", fontSize:11 }}>
                        <span style={{ color:"#4b5563" }}>{m.l}</span>
                        <span style={{ fontFamily:"'DM Mono',monospace", color: m.pass===undefined?"#94a3b8":m.pass?"#4ade80":"#f87171", fontWeight:500 }}>{m.v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ background:"#111827", borderRadius:10, border:"1px solid #1f2937", padding:16 }}>
                <SectionLabel>Strategy recommendation</SectionLabel>
                {pursuing.length===0 && negotiating.length===0
                  ? <div style={{ color:"#f87171", fontSize:13 }}>No strategies pencil at this price. Negotiate down or pass.</div>
                  : <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.9 }}>
                      {pursuing.length>0    && <div style={{ color:"#4ade80" }}>✓ PURSUE: {pursuing.map(s=>s.label).join(" + ")}</div>}
                      {negotiating.length>0 && <div style={{ color:"#f59e0b" }}>~ NEGOTIATE: {negotiating.map(s=>s.label).join(" + ")}</div>}
                    </div>
                }
              </div>
            </div>
          );
        })()}

      </div>

      <div style={{ padding:"12px 20px", borderTop:"1px solid #1a2235", fontSize:10, color:"#374151", lineHeight:1.8 }}>
        Real Cost Analysis uses market-specific estimates — always verify insurance with a real binder, property tax at post-sale reassessment rate, and rent comps against Rentometer + PM call before LOI.
        Targets: Cash flow ≥$6K/yr · DSCR ≥1.20 · CoC ≥8% · Cap rate ≥6.5% on purchase price
      </div>
    </div>
  );
}
