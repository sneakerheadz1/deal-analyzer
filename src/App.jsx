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

function NumInput({ label, value, onChange, prefix, suffix, step = 1000 }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <label style={{ fontSize:10, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</label>
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

function MetricCard({ label, value, good, warn, bad }) {
  const color = bad ? "#f87171" : warn ? "#f59e0b" : good ? "#4ade80" : "#e2e8f0";
  return (
    <div style={{ background:"#131c2e", border:"1px solid #1e2d45", borderRadius:8, padding:"10px 14px" }}>
      <div style={{ fontSize:10, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:700, fontFamily:"'DM Mono',monospace", color }}>{value}</div>
    </div>
  );
}

function DataRow({ label, value, note, target, pass }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"7px 0", borderBottom:"1px solid #1a2235" }}>
      <div style={{ fontSize:12, color:"#6b7280", flexShrink:0, paddingRight:8 }}>{label}</div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:12, fontFamily:"'DM Mono',monospace", fontWeight:500, color: pass === undefined ? "#cbd5e1" : pass ? "#4ade80" : "#f87171" }}>{value}</div>
        {target && <div style={{ fontSize:9, color:"#374151", marginTop:1 }}>target: {target}</div>}
        {note && <div style={{ fontSize:9, color:"#374151", marginTop:1 }}>{note}</div>}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize:10, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{children}</div>;
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

export default function DealAnalyzer() {
  const [tab, setTab] = useState("quick");

  // ── Shared ──
  const [purchase, setPurchase]     = useState(115000);
  const [arv, setArv]               = useState(215000);
  const [repairs, setRepairs]       = useState(35000);
  const [closingHold, setClosingHold] = useState(9000);

  // ── Flip ──
  const [flipMonths, setFlipMonths]       = useState(6);
  const [flipHoldMo, setFlipHoldMo]       = useState(1200);
  const [buyClosePct, setBuyClosePct]     = useState(2);
  const [sellClosePct, setSellClosePct]   = useState(8);
  const [hmDown, setHmDown]               = useState(15);

  // ── BRRRR ──
  const [rent, setRent]         = useState(1550);
  const [ltv, setLtv]           = useState(75);
  const [rate, setRate]         = useState(8.0);
  const [term, setTerm]         = useState(30);
  const [tax, setTax]           = useState(150);
  const [ins, setIns]           = useState(100);
  const [vac, setVac]           = useState(10);
  const [mgmt, setMgmt]         = useState(8);
  const [maint, setMaint]       = useState(100);

  // ── Sober Living ──
  const [slBeds, setSlBeds]   = useState(4);
  const [slRate, setSlRate]   = useState(750);
  const [slOcc, setSlOcc]     = useState(90);
  const [slMgr, setSlMgr]     = useState(900);
  const [slUtil, setSlUtil]   = useState(400);
  const [slOther, setSlOther] = useState(200);
  const [slMortgSrc, setSlMortgSrc] = useState("brrrr");
  const [slMortgMan, setSlMortgMan] = useState(950);

  // ─────────────── CALCULATIONS ───────────────

  // Shared
  const allIn     = purchase + repairs + closingHold;
  const allInPct  = arv > 0 ? allIn / arv : 0;

  // Quick Filter
  const maxOffer70 = arv * 0.70 - repairs - 8000;
  const maxOffer65 = arv * 0.65 - repairs - 8000;
  const offerGap   = maxOffer70 - purchase;
  const quickV = purchase <= maxOffer70 ? "pursue" : purchase <= maxOffer70 * 1.12 ? "negotiate" : "pass";

  // Fix & Flip
  const buyClose   = purchase * buyClosePct / 100;
  const holdTotal  = flipHoldMo * flipMonths;
  const sellClose  = arv * sellClosePct / 100;
  const flipCost   = purchase + repairs + buyClose + holdTotal + sellClose;
  const flipProfit = arv - flipCost;
  const flipCashIn = (purchase * hmDown / 100) + buyClose + (repairs * 0.10);
  const flipROI    = flipCashIn > 0 ? flipProfit / flipCashIn : 0;
  const flipAnn    = flipMonths > 0 ? flipROI / (flipMonths / 12) : 0;
  const flipV = flipProfit >= 25000 && flipROI >= 0.15 ? "pursue" : flipProfit >= 12000 && flipROI >= 0.08 ? "negotiate" : "pass";

  // BRRRR
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

  // Sober Living
  const slGross   = slBeds * slRate * (slOcc / 100);
  const slMortg   = slMortgSrc === "brrrr" ? piti : slMortgMan;
  const slExp     = slMgr + slUtil + slOther + slMortg;
  const slNet     = slGross - slExp;
  const slVsTrad  = slNet - cashflow;
  const slCoc     = capLeft > 100 ? (slNet * 12) / capLeft : (slNet > 0 ? Infinity : -Infinity);
  const slV = slNet >= 800 ? "pursue" : slNet >= 300 ? "negotiate" : "pass";

  const TABS = [
    { id:"quick", label:"Quick Filter" },
    { id:"flip",  label:"Fix & Flip"  },
    { id:"brrrr", label:"BRRRR"       },
    { id:"sober", label:"Sober Living"},
    { id:"compare", label:"Compare All"},
  ];

  const colLayout = { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:20 };
  const grid2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 };

  return (
    <div style={{ background:"#0d1117", fontFamily:"'DM Mono',monospace", color:"#e2e8f0", minHeight:"100vh" }}>

      {/* ── Header ── */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"14px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#f59e0b", letterSpacing:"0.04em" }}>DEAL ANALYZER</div>
            <div style={{ fontSize:10, color:"#374151", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:2 }}>Flip · BRRRR · Sober Living · Live Calc</div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { label:"Purchase", val: $(purchase) },
              { label:"ARV",      val: $(arv)      },
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
          <NumInput label="Purchase Price"     value={purchase}   onChange={setPurchase}   prefix="$" step={5000} />
          <NumInput label="ARV"                value={arv}        onChange={setArv}        prefix="$" step={5000} />
          <NumInput label="Est. Repairs"       value={repairs}    onChange={setRepairs}    prefix="$" step={2500} />
          <NumInput label="Closing + Holding"  value={closingHold} onChange={setClosingHold} prefix="$" step={500} />
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", display:"flex", overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"10px 18px", fontFamily:"inherit", fontSize:12, fontWeight: tab===t.id?700:400,
            color: tab===t.id?"#f59e0b":"#4b5563", background:"transparent", border:"none",
            borderBottom: tab===t.id?"2px solid #f59e0b":"2px solid transparent",
            cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.12s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding:20 }}>

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
              <div style={{ background:"#131c2e", border:"1px solid #1e2d45", borderRadius:6, padding:"10px 12px", fontSize:11, color:"#4b5563", lineHeight:1.8 }}>
                <span style={{ color:"#6b7280" }}>Decision rule:</span><br/>
                &lt; 70% ARV → strong BRRRR candidate<br/>
                70–80% ARV → negotiate or flip only<br/>
                &gt; 80% ARV → pass unless sober living income changes math
              </div>
            </InputPanel>

            <ResultPanel title="Quick filter results">
              <VerdictBox verdict={quickV} message={
                quickV==="pursue" ? `Purchase is ${$(Math.abs(offerGap))} below your 70% max offer. Proceed to full strategy analysis.`
                : quickV==="negotiate" ? `You need ${$(Math.abs(offerGap))} price reduction to hit 70% rule. Make a lower offer.`
                : `Purchase exceeds max offer by ${$(Math.abs(offerGap))}. Only viable if sober living dramatically changes NOI.`
              } />
              <div style={grid2}>
                <MetricCard label="Max Offer (70%)" value={$(maxOffer70)} good />
                <MetricCard label="Max Offer (65%)" value={$(maxOffer65)} good />
                <MetricCard label="Your Purchase"   value={$(purchase)} bad={purchase>maxOffer70} good={purchase<=maxOffer70} />
                <MetricCard label="Gap to Max"      value={$(offerGap)} good={offerGap>=0} bad={offerGap<0} />
              </div>
              <DataRow label="All-in cost"       value={$(allIn)} />
              <DataRow label="All-in % of ARV"   value={pct(allInPct)}   target="≤ 75%"   pass={allInPct<=0.75} />
              <DataRow label="Spread (ARV − All-in)" value={$(arv-allIn)} target="≥ $30K" pass={arv-allIn>=30000} />
              <DataRow label="Max offer (70%)"   value={$(maxOffer70)} />
              <DataRow label="Max offer (65%)"   value={$(maxOffer65)} />
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
              <div style={{ background:"#131c2e", border:"1px solid #1e2d45", borderRadius:8, padding:"12px 14px", marginTop:4 }}>
                <SectionLabel>Cost breakdown</SectionLabel>
                <DataRow label="Purchase"      value={$(purchase)} />
                <DataRow label="Repairs"       value={$(repairs)} />
                <DataRow label="Buy closing"   value={$(buyClose)} />
                <DataRow label="Holding costs" value={$(holdTotal)} note={`${flipMonths} mo × ${$(flipHoldMo)}`} />
                <DataRow label="Sell closing"  value={$(sellClose)} />
                <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderTop:"1px solid #2d3748", marginTop:4 }}>
                  <span style={{ fontSize:12, fontWeight:700 }}>Total cost</span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:"#f59e0b" }}>{$(flipCost)}</span>
                </div>
              </div>
            </InputPanel>

            <ResultPanel title="Flip results">
              <VerdictBox verdict={flipV} message={
                flipV==="pursue" ? `Strong flip. ${$(flipProfit)} net profit over ${flipMonths} months.`
                : flipV==="negotiate" ? `Marginal. Reduce purchase by ${$(Math.max(0,25000-flipProfit))} to hit $25K target.`
                : `Flip math doesn't work. Net profit ${$(flipProfit)} — target is $25K+.`
              } />
              <div style={grid2}>
                <MetricCard label="Net Profit"     value={$(flipProfit)}  good={flipProfit>=25000} warn={flipProfit>=12000&&flipProfit<25000} bad={flipProfit<12000} />
                <MetricCard label="Cash Invested"  value={$(flipCashIn)} />
                <MetricCard label="ROI"            value={pct(flipROI)}   good={flipROI>=0.15} warn={flipROI>=0.08&&flipROI<0.15} bad={flipROI<0.08} />
                <MetricCard label="Annualized ROI" value={pct(flipAnn)}   good={flipAnn>=0.25} />
              </div>
              <DataRow label="Net profit"        value={$(flipProfit)}  target="≥ $25,000"  pass={flipProfit>=25000} />
              <DataRow label="ROI on cash in"    value={pct(flipROI)}   target="≥ 15%"      pass={flipROI>=0.15} />
              <DataRow label="Annualized ROI"    value={pct(flipAnn)}   target="≥ 25%"      pass={flipAnn>=0.25} />
              <DataRow label="Profit % of ARV"   value={pct(arv>0?flipProfit/arv:0)} target="≥ 12%" pass={arv>0&&flipProfit/arv>=0.12} />
              <DataRow label="ARV"               value={$(arv)} />
              <DataRow label="Total cost"        value={$(flipCost)} />
              <div style={{ marginTop:10, background:"#131c2e", borderRadius:6, padding:"10px 12px", fontSize:11, color:"#4b5563", lineHeight:1.7 }}>
                <span style={{ color:"#6b7280" }}>HML assumption:</span> Lender covers 85% of purchase + 90% of repairs. You fund {hmDown}% down + buy-side closing + 10% of repairs.
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
                brrrV==="pursue" ? `Recycles ${pct(recycleRate)} of capital. ${capLeft<500?"Nearly $0":$(capLeft)} left in deal. DSCR ${dscr.toFixed(2)}x.`
                : brrrV==="negotiate" ? `Borderline. Reduce purchase or increase rent to improve DSCR/recycle rate.`
                : `All-in % too high vs ARV, or rent too low for DSCR. Doesn't pencil.`
              } />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
                <MetricCard label="Refi Amount"   value={$(refiAmt)}                   good />
                <MetricCard label="Capital Left"  value={capLeft<500?"~$0":$(capLeft)} good={capLeft<5000} warn={capLeft>=5000&&capLeft<20000} bad={capLeft>=20000} />
                <MetricCard label="% Recycled"    value={pct(recycleRate)}              good={recycleRate>=0.80} warn={recycleRate>=0.60&&recycleRate<0.80} bad={recycleRate<0.60} />
                <MetricCard label="Cash Flow/mo"  value={$(cashflow)}                   good={cashflow>=150} warn={cashflow>=0&&cashflow<150} bad={cashflow<0} />
                <MetricCard label="DSCR"          value={xVal(dscr)}                    good={dscr>=1.25} warn={dscr>=1.1&&dscr<1.25} bad={dscr<1.1} />
                <MetricCard label="CoC Return"    value={isFinite(coc)?pct(coc):"∞"}   good={!isFinite(coc)||coc>=0.08} />
              </div>
              <DataRow label="All-in % of ARV"    value={pct(allInPct)}     target="≤ 75%"   pass={allInPct<=0.75} />
              <DataRow label="Refi amount"        value={$(refiAmt)}        note={`at ${ltv}% LTV`} />
              <DataRow label="Mortgage P&I/mo"    value={$(pi)} />
              <DataRow label="Total PITI/mo"      value={$(piti)} />
              <DataRow label="Effective rent"     value={$(effRent)}        note={`after ${vac}% vacancy`} />
              <DataRow label="Monthly cash flow"  value={$(cashflow)}       target="≥ $150"   pass={cashflow>=150} />
              <DataRow label="DSCR"               value={xVal(dscr)}        target="≥ 1.20"   pass={dscr>=1.20} />
              <DataRow label="Capital recycled"   value={pct(recycleRate)}  target="≥ 75%"    pass={recycleRate>=0.75} />
              <DataRow label="CoC return"         value={isFinite(coc)?pct(coc):"∞"} target="≥ 8%" pass={!isFinite(coc)||coc>=0.08} />
            </ResultPanel>
          </div>
        )}

        {/* ════════════════ SOBER LIVING ════════════════ */}
        {tab==="sober" && (
          <div style={colLayout}>
            <InputPanel title="Sober living inputs">
              <NumInput label="Number of beds"     value={slBeds}  onChange={setSlBeds}  step={1} />
              <NumInput label="Rate per bed / mo"  value={slRate}  onChange={setSlRate}  prefix="$" step={25} />
              <NumInput label="Occupancy %"        value={slOcc}   onChange={setSlOcc}   suffix="%" step={5} />
              <NumInput label="House manager / mo" value={slMgr}   onChange={setSlMgr}   prefix="$" step={50} />
              <NumInput label="Utilities / mo"     value={slUtil}  onChange={setSlUtil}  prefix="$" step={25} />
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
                slV==="pursue" ? `${$(slNet)}/mo net — ${$(slVsTrad)} more than traditional rental on same property.`
                : slV==="negotiate" ? `Marginal. Add a bed, raise rates, or increase occupancy to improve.`
                : `Sober living doesn't pencil here. Check bed count and local market rates.`
              } />
              <div style={grid2}>
                <MetricCard label="Gross Revenue"  value={$(slGross)} good />
                <MetricCard label="Total Expenses" value={$(slExp)} />
                <MetricCard label="Net / Month"    value={$(slNet)}    good={slNet>=800} warn={slNet>=300&&slNet<800} bad={slNet<0} />
                <MetricCard label="Net / Year"     value={$(slNet*12)} good={slNet>=800} />
                <MetricCard label="vs Traditional" value={(slVsTrad>=0?"+":"")+$(slVsTrad)} good={slVsTrad>0} bad={slVsTrad<0} />
                <MetricCard label="CoC (sober)"    value={capLeft>100&&isFinite(slCoc)?pct(slCoc):"—"} good />
              </div>
              <div style={{ fontSize:10, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4, marginTop:4 }}>Expense detail</div>
              <DataRow label="Gross revenue"   value={$(slGross)}  note={`${slBeds}bd × $${slRate} × ${slOcc}%`} />
              <DataRow label="House manager"   value={$(slMgr)} />
              <DataRow label="Utilities"       value={$(slUtil)} />
              <DataRow label="Other / admin"   value={$(slOther)} />
              <DataRow label="PITI (mortgage)" value={$(slMortg)} />
              <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderTop:"1px solid #2d3748", marginTop:4 }}>
                <span style={{ fontSize:13, fontWeight:700 }}>Net monthly</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:14, color: slNet>=0?"#4ade80":"#f87171" }}>{$(slNet)}</span>
              </div>
              <div style={{ marginTop:10, background:"#131c2e", borderRadius:6, padding:"10px 12px", fontSize:11, color:"#4b5563", lineHeight:1.7 }}>
                <span style={{ color:"#6b7280" }}>Lift vs traditional:</span> Same property, same PITI — sober living generates <span style={{ color: slVsTrad>0?"#4ade80":"#f87171" }}>{(slVsTrad>=0?"+":"")+$(slVsTrad)}/mo</span> more than a conventional BRRRR hold.
              </div>
            </ResultPanel>
          </div>
        )}

        {/* ════════════════ COMPARE ALL ════════════════ */}
        {tab==="compare" && (() => {
          const strategies = [
            {
              id:"quick", label:"Quick Filter", verdict:quickV,
              metrics:[
                { l:"Max offer (70%)", v:$(maxOffer70) },
                { l:"All-in % ARV",   v:pct(allInPct), pass:allInPct<=0.75 },
                { l:"Price vs max",   v:$(offerGap),   pass:offerGap>=0 },
                { l:"Spread",         v:$(arv-allIn),  pass:arv-allIn>=30000 },
              ]
            },
            {
              id:"flip", label:"Fix & Flip", verdict:flipV,
              metrics:[
                { l:"Net profit",    v:$(flipProfit), pass:flipProfit>=25000 },
                { l:"ROI",          v:pct(flipROI),  pass:flipROI>=0.15 },
                { l:"Annualized",   v:pct(flipAnn),  pass:flipAnn>=0.25 },
                { l:"Hold period",  v:flipMonths+"mo" },
              ]
            },
            {
              id:"brrrr", label:"BRRRR", verdict:brrrV,
              metrics:[
                { l:"Capital left", v:capLeft<500?"~$0":$(capLeft), pass:capLeft<10000 },
                { l:"% recycled",   v:pct(recycleRate), pass:recycleRate>=0.75 },
                { l:"Cash flow/mo", v:$(cashflow),  pass:cashflow>=150 },
                { l:"DSCR",        v:xVal(dscr),    pass:dscr>=1.20 },
              ]
            },
            {
              id:"sober", label:"Sober Living", verdict:slV,
              metrics:[
                { l:"Gross/mo",     v:$(slGross) },
                { l:"Net/mo",      v:$(slNet),      pass:slNet>=800 },
                { l:"vs Trad.",    v:(slVsTrad>=0?"+":"")+$(slVsTrad), pass:slVsTrad>0 },
                { l:"Net/yr",      v:$(slNet*12),   pass:slNet>=800 },
              ]
            },
          ];

          const pursuing  = strategies.filter(s=>s.verdict==="pursue");
          const negotiating = strategies.filter(s=>s.verdict==="negotiate");

          return (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:12, marginBottom:16 }}>
                {strategies.map(s => (
                  <div key={s.id} style={{ background:"#111827", borderRadius:10, border:`1px solid ${VERDICT_CONFIG[s.verdict].border}`, padding:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{s.label}</div>
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
                  ? <div style={{ color:"#f87171", fontSize:13 }}>No strategies pencil at this price. Negotiate the purchase down or pass on this deal.</div>
                  : <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.9 }}>
                      {pursuing.length>0    && <div style={{ color:"#4ade80" }}>✓ PURSUE: {pursuing.map(s=>s.label).join(" + ")}</div>}
                      {negotiating.length>0 && <div style={{ color:"#f59e0b" }}>~ NEGOTIATE: {negotiating.map(s=>s.label).join(" + ")}</div>}
                      {slNet > cashflow && slNet > 0 && (
                        <div style={{ marginTop:10, background:"#0d1117", borderRadius:6, padding:"10px 12px", fontSize:12, color:"#6b7280", lineHeight:1.7 }}>
                          Sober living generates <span style={{ color:"#f59e0b" }}>{(slVsTrad>=0?"+":"")+$(slVsTrad)}/mo more</span> than traditional BRRRR on this property.
                          If layout and location qualify, prioritize sober living over conventional hold.
                        </div>
                      )}
                    </div>
                }
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ padding:"12px 20px", borderTop:"1px solid #1a2235", fontSize:10, color:"#374151", lineHeight:1.8 }}>
        Targets: Flip ≥$25K net profit · BRRRR all-in ≤75% ARV + DSCR ≥1.20 · Sober Living ≥$800/mo net
        · All formulas based on REI Operator Playbook · Adjust inputs for your specific market and lender terms
      </div>
    </div>
  );
}