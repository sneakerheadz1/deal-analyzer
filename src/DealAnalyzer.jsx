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

// ─── Default SOW line items (Atlanta market ranges) ───────────────────────────
const DEFAULT_SOW = [
  // category, id, label, low, mid, high, unit, qty, enabled
  { cat:"Exterior", id:"roof",       label:"Roof replacement",        low:6000,  mid:10000, high:15000, unit:"lump",  qty:1,    enabled:false },
  { cat:"Exterior", id:"ext_paint",  label:"Exterior paint",          low:3000,  mid:5000,  high:8000,  unit:"lump",  qty:1,    enabled:false },
  { cat:"Exterior", id:"windows",    label:"Windows (each)",          low:300,   mid:500,   high:800,   unit:"each",  qty:10,   enabled:false },
  { cat:"Exterior", id:"gutters",    label:"Gutters / fascia",        low:1500,  mid:2500,  high:4000,  unit:"lump",  qty:1,    enabled:false },
  { cat:"Exterior", id:"landscape",  label:"Landscaping / cleanout",  low:1000,  mid:2500,  high:5000,  unit:"lump",  qty:1,    enabled:true  },
  { cat:"Interior", id:"lvp",        label:"LVP flooring (per sqft)", low:4,     mid:7,     high:11,    unit:"sqft",  qty:1200, enabled:true  },
  { cat:"Interior", id:"int_paint",  label:"Interior paint (per sqft)",low:1.5,  mid:2.5,   high:4,     unit:"sqft",  qty:1500, enabled:true  },
  { cat:"Interior", id:"drywall",    label:"Drywall repair",          low:1500,  mid:3000,  high:6000,  unit:"lump",  qty:1,    enabled:false },
  { cat:"Interior", id:"doors",      label:"Interior doors (each)",   low:200,   mid:350,   high:600,   unit:"each",  qty:6,    enabled:false },
  { cat:"Interior", id:"trim",       label:"Trim / baseboards",       low:1000,  mid:2000,  high:4000,  unit:"lump",  qty:1,    enabled:false },
  { cat:"Kitchen",  id:"cabinets",   label:"Cabinets",                low:5000,  mid:10000, high:20000, unit:"lump",  qty:1,    enabled:true  },
  { cat:"Kitchen",  id:"counters",   label:"Countertops",             low:2000,  mid:3500,  high:6000,  unit:"lump",  qty:1,    enabled:true  },
  { cat:"Kitchen",  id:"appliances", label:"Appliances",              low:2000,  mid:4000,  high:8000,  unit:"lump",  qty:1,    enabled:true  },
  { cat:"Kitchen",  id:"kit_plumb",  label:"Kitchen plumbing / sink", low:800,   mid:1500,  high:3000,  unit:"lump",  qty:1,    enabled:true  },
  { cat:"Kitchen",  id:"backsplash", label:"Backsplash / tile",       low:500,   mid:1200,  high:2500,  unit:"lump",  qty:1,    enabled:false },
  { cat:"Bathroom", id:"bath_full",  label:"Full bathroom remodel",   low:6000,  mid:9000,  high:15000, unit:"each",  qty:2,    enabled:true  },
  { cat:"Bathroom", id:"bath_half",  label:"Half bath refresh",       low:1500,  mid:3000,  high:5000,  unit:"each",  qty:1,    enabled:false },
  { cat:"Systems",  id:"hvac",       label:"HVAC (full replace)",     low:5000,  mid:9000,  high:16000, unit:"lump",  qty:1,    enabled:false },
  { cat:"Systems",  id:"hvac_svc",   label:"HVAC service / tune-up",  low:300,   mid:600,   high:1200,  unit:"lump",  qty:1,    enabled:true  },
  { cat:"Systems",  id:"electric",   label:"Electrical update",       low:5000,  mid:10000, high:20000, unit:"lump",  qty:1,    enabled:false },
  { cat:"Systems",  id:"panel",      label:"Panel upgrade (200A)",    low:2500,  mid:4000,  high:7000,  unit:"lump",  qty:1,    enabled:false },
  { cat:"Systems",  id:"plumbing",   label:"Plumbing update",         low:5000,  mid:12000, high:25000, unit:"lump",  qty:1,    enabled:false },
  { cat:"Systems",  id:"wtr_htr",    label:"Water heater replace",    low:800,   mid:1400,  high:2500,  unit:"lump",  qty:1,    enabled:false },
  { cat:"Other",    id:"demo",        label:"Demo / haul away",        low:1500,  mid:3000,  high:6000,  unit:"lump",  qty:1,    enabled:true  },
  { cat:"Other",    id:"permits",     label:"Permits / inspections",   low:500,   mid:1200,  high:3000,  unit:"lump",  qty:1,    enabled:true  },
  { cat:"Other",    id:"contingency", label:"Contingency buffer",      low:5000,  mid:8000,  high:15000, unit:"lump",  qty:1,    enabled:true  },
];

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

// ─── Rehab Estimator Sub-components ──────────────────────────────────────────

const REHAB_LEVELS = {
  light:  { label:"Light Cosmetic",  low:15, mid:22,  high:30,  color:"#4ade80", desc:"Paint, flooring, fixtures. No systems or layout changes." },
  medium: { label:"Medium Rehab",    low:30, mid:45,  high:60,  color:"#f59e0b", desc:"Kitchen + baths + cosmetic. Possibly one system." },
  heavy:  { label:"Heavy / Full Gut",low:60, mid:90,  high:120, color:"#f87171", desc:"Systems, structural, full interior overhaul." },
};

function QuickEstimator({ sqft, setSqft, rehabLevel, setRehabLevel, repairs, onSync }) {
  const lv = REHAB_LEVELS[rehabLevel];
  const estLow  = sqft * lv.low;
  const estMid  = sqft * lv.mid;
  const estHigh = sqft * lv.high;
  const diff = estMid - repairs;
  const pctOff = repairs > 0 ? (estMid - repairs) / repairs : 0;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:20 }}>
      {/* Inputs */}
      <div>
        <SectionLabel>Quick $/sqft estimator — Atlanta market ranges</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <NumInput label="Property sq footage" value={sqft} onChange={setSqft} step={100} />

          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <div style={{ fontSize:10, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Rehab level</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {Object.entries(REHAB_LEVELS).map(([k, v]) => (
                <button key={k} onClick={() => setRehabLevel(k)} style={{
                  padding:"10px 12px", fontFamily:"'DM Mono',monospace", fontSize:11,
                  background: rehabLevel===k ? "#1a2235" : "#0d1117",
                  border: `1px solid ${rehabLevel===k ? v.color : "#2d3748"}`,
                  borderRadius:6, cursor:"pointer", textAlign:"left",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                }}>
                  <div>
                    <span style={{ color: rehabLevel===k ? v.color : "#6b7280", fontWeight:700 }}>{v.label}</span>
                    <div style={{ fontSize:9, color:"#374151", marginTop:2, lineHeight:1.5 }}>{v.desc}</div>
                  </div>
                  <span style={{ color:"#4b5563", fontSize:11, whiteSpace:"nowrap", marginLeft:8 }}>
                    ${v.low}–${v.high}/sqft
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Per-category reference card */}
          <div style={{ background:"#131c2e", border:"1px solid #1e2d45", borderRadius:8, padding:"12px 14px", marginTop:4 }}>
            <SectionLabel>Add-on adjusters (on top of base)</SectionLabel>
            {[
              ["Each full bathroom",   "+$6K – $15K"],
              ["Kitchen (full replace)","+$10K – $25K"],
              ["HVAC system",          "+$5K – $16K"],
              ["Electrical update",    "+$5K – $20K"],
              ["Plumbing update",      "+$5K – $25K"],
              ["Roof replacement",     "+$6K – $15K"],
              ["Each window",          "+$300 – $800"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #1a2235", fontSize:11 }}>
                <span style={{ color:"#4b5563" }}>{k}</span>
                <span style={{ fontFamily:"'DM Mono',monospace", color:"#94a3b8" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <SectionLabel>Estimate range</SectionLabel>
        <div style={{ background:"#111827", border:`1px solid ${lv.color}22`, borderRadius:10, padding:16, marginBottom:12 }}>
          <div style={{ fontSize:10, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>{lv.label} · {sqft.toLocaleString()} sqft</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
            {[
              { l:"Low",  v:estLow,  note:`$${lv.low}/sqft`  },
              { l:"Mid",  v:estMid,  note:`$${lv.mid}/sqft`  },
              { l:"High", v:estHigh, note:`$${lv.high}/sqft` },
            ].map(m => (
              <div key={m.l} style={{ background:"#0d1117", borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
                <div style={{ fontSize:9, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{m.l}</div>
                <div style={{ fontSize:15, fontWeight:700, fontFamily:"'DM Mono',monospace", color:lv.color }}>{$(m.v)}</div>
                <div style={{ fontSize:9, color:"#374151", marginTop:2 }}>{m.note}</div>
              </div>
            ))}
          </div>

          {/* vs shared repairs */}
          <div style={{ background:"#0d1117", borderRadius:6, padding:"10px 12px" }}>
            <div style={{ fontSize:10, color:"#6b7280", marginBottom:6 }}>vs your current repairs estimate</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:"#4b5563" }}>Your estimate</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:700, color:"#e2e8f0" }}>{$(repairs)}</div>
              </div>
              <div style={{ fontSize:20, color:"#374151" }}>→</div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, color:"#4b5563" }}>Quick mid est.</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:700, color:lv.color }}>{$(estMid)}</div>
              </div>
            </div>
            <div style={{ marginTop:8, padding:"6px 10px", borderRadius:4,
              background: Math.abs(pctOff) < 0.15 ? "#16a34a22" : Math.abs(pctOff) < 0.35 ? "#d9770622" : "#dc262622",
              border: `1px solid ${Math.abs(pctOff) < 0.15 ? "#166534" : Math.abs(pctOff) < 0.35 ? "#92400e" : "#991b1b"}`,
            }}>
              <div style={{ fontSize:11, color:"#94a3b8" }}>
                {Math.abs(pctOff) < 0.15
                  ? `✓ Within 15% — estimates are in alignment`
                  : diff > 0
                    ? `⚠ Quick estimate is ${$(Math.abs(diff))} HIGHER than your repair budget — may be underestimated`
                    : `⚠ Quick estimate is ${$(Math.abs(diff))} LOWER than your repair budget — may have budget cushion`
                }
              </div>
            </div>
          </div>
        </div>

        <div style={{ background:"#131c2e", border:"1px solid #1e2d45", borderRadius:6, padding:"10px 12px", fontSize:11, color:"#4b5563", lineHeight:1.8 }}>
          <span style={{ color:"#6b7280" }}>How to use this:</span><br/>
          Walk the property → pick a level → check the range against your deal. If you're between levels, average the two. Systems like HVAC or electrical add on top of the base range.
        </div>
      </div>
    </div>
  );
}

function SOWBuilder({ sowItems, setSowItems, repairs, onSync }) {
  const cats = [...new Set(DEFAULT_SOW.map(i => i.cat))];
  const total = sowItems.reduce((sum, item) => {
    if (!item.enabled) return sum;
    const est = item.override != null ? item.override : item.qty * item.mid;
    return sum + est;
  }, 0);

  const updateItem = (id, field, val) => {
    setSowItems(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it));
  };

  const catColor = { Exterior:"#60a5fa", Interior:"#a78bfa", Kitchen:"#f59e0b", Bathroom:"#34d399", Systems:"#f87171", Other:"#94a3b8" };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:20 }}>
      {/* Line items */}
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <SectionLabel>Scope of work — line-by-line builder (Atlanta market mid-range defaults)</SectionLabel>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ fontSize:11, color:"#6b7280" }}>SOW Total: <span style={{ color:"#f59e0b", fontWeight:700 }}>{$(total)}</span></div>
            <button onClick={() => onSync(total)} style={{
              padding:"4px 10px", fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700,
              background:"#f59e0b", color:"#000", border:"none", borderRadius:4, cursor:"pointer"
            }}>SYNC → Repairs</button>
          </div>
        </div>

        {cats.map(cat => {
          const items = sowItems.filter(i => i.cat === cat);
          const catTotal = items.filter(i=>i.enabled).reduce((s,i)=> s + (i.override!=null?i.override:i.qty*i.mid), 0);
          return (
            <div key={cat} style={{ marginBottom:12, background:"#111827", border:"1px solid #1f2937", borderRadius:8, overflow:"hidden" }}>
              <div style={{ padding:"8px 14px", borderBottom:"1px solid #1f2937", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, fontWeight:700, color:catColor[cat]||"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em" }}>{cat}</span>
                <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:catTotal>0?"#e2e8f0":"#374151" }}>{catTotal>0?$(catTotal):"—"}</span>
              </div>

              {/* Header row */}
              <div style={{ display:"grid", gridTemplateColumns:"24px 1fr 80px 70px 70px 90px", gap:6, padding:"5px 14px", fontSize:9, color:"#374151", textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:"1px solid #131c2e" }}>
                <div></div><div>Item</div><div style={{textAlign:"right"}}>Qty/Unit</div><div style={{textAlign:"right"}}>Range Low</div><div style={{textAlign:"right"}}>Range High</div><div style={{textAlign:"right"}}>Your Est.</div>
              </div>

              {items.map(item => {
                const est = item.override != null ? item.override : item.qty * item.mid;
                return (
                  <div key={item.id} style={{ display:"grid", gridTemplateColumns:"24px 1fr 80px 70px 70px 90px", gap:6, padding:"6px 14px", borderBottom:"1px solid #131c2e", alignItems:"center", opacity:item.enabled?1:0.35 }}>
                    {/* Checkbox */}
                    <div
                      onClick={() => updateItem(item.id, "enabled", !item.enabled)}
                      style={{ width:14, height:14, border:`1px solid ${item.enabled?catColor[cat]||"#f59e0b":"#374151"}`, borderRadius:3, cursor:"pointer", background:item.enabled?(catColor[cat]||"#f59e0b")+"33":"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}
                    >
                      {item.enabled && <span style={{ color:catColor[cat]||"#f59e0b", fontSize:9, fontWeight:700 }}>✓</span>}
                    </div>
                    {/* Label */}
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{item.label}</div>
                    {/* Qty */}
                    <div style={{ textAlign:"right" }}>
                      <input
                        type="number" value={item.qty} min={0}
                        onChange={e => updateItem(item.id, "qty", parseFloat(e.target.value)||0)}
                        disabled={!item.enabled}
                        style={{ background:"#131c2e", border:"1px solid #2d3748", borderRadius:4, color:"#e2e8f0", fontSize:10, fontFamily:"'DM Mono',monospace", padding:"2px 5px", width:70, textAlign:"right", outline:"none" }}
                      />
                      <div style={{ fontSize:8, color:"#374151" }}>{item.unit}</div>
                    </div>
                    {/* Low */}
                    <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#374151", textAlign:"right" }}>{$(item.qty*item.low)}</div>
                    {/* High */}
                    <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#374151", textAlign:"right" }}>{$(item.qty*item.high)}</div>
                    {/* Your Est */}
                    <div style={{ textAlign:"right" }}>
                      <input
                        type="number"
                        value={item.override != null ? item.override : Math.round(item.qty * item.mid)}
                        onChange={e => updateItem(item.id, "override", parseFloat(e.target.value)||0)}
                        disabled={!item.enabled}
                        style={{ background:"#1a2235", border:"1px solid #2d3748", borderRadius:4, color: item.enabled?"#f59e0b":"#374151", fontSize:11, fontFamily:"'DM Mono',monospace", padding:"3px 6px", width:80, textAlign:"right", outline:"none", fontWeight:700 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Grand total bar */}
        <div style={{ background:"#111827", border:"1px solid #f59e0b33", borderRadius:8, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:10, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>SOW Total Estimate</div>
            <div style={{ fontSize:10, color:"#374151", marginTop:2 }}>
              vs your repairs input: <span style={{ color: Math.abs(total-repairs)/Math.max(repairs,1) < 0.15 ? "#4ade80" : "#f87171" }}>{total>repairs?`+${$(total-repairs)}`:`-${$(repairs-total)}`}</span>
            </div>
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:24, fontWeight:700, color:"#f59e0b" }}>{$(total)}</div>
        </div>

        <div style={{ marginTop:10, background:"#131c2e", borderRadius:6, padding:"10px 12px", fontSize:11, color:"#4b5563", lineHeight:1.8 }}>
          <span style={{ color:"#6b7280" }}>Red flags in a contractor bid:</span> &nbsp;
          ❌ Lump sum only (no line items) &nbsp; ❌ Missing entire categories (e.g., no electrical line) &nbsp; ❌ No labor/material split &nbsp; ❌ No timeline &nbsp;
          <span style={{ color:"#f59e0b" }}>→ Always give them THIS scope list and ask them to bid against it line by line.</span>
        </div>
      </div>
    </div>
  );
}

function BidComparison({ sowTotal }) {
  const [bids, setBids] = useState([
    { name:"GC 1", total:0, hasItemized:false, inclMaterials:true, timeline:8, notes:"" },
    { name:"GC 2", total:0, hasItemized:false, inclMaterials:true, timeline:0, notes:"" },
    { name:"GC 3", total:0, hasItemized:false, inclMaterials:true, timeline:0, notes:"" },
  ]);

  const updateBid = (idx, field, val) => {
    setBids(prev => prev.map((b, i) => i===idx ? {...b, [field]:val} : b));
  };

  const filledBids = bids.filter(b => b.total > 0);
  const totals = filledBids.map(b => b.total);
  const medianBid = totals.length > 0 ? totals.sort((a,b)=>a-b)[Math.floor(totals.length/2)] : 0;

  const getBidFlag = (bid) => {
    if (bid.total <= 0) return null;
    const ratio = bid.total / medianBid;
    if (ratio < 0.72) return { label:"TOO LOW", color:"#f87171", note:"Likely cutting corners or scope gaps. Ask for detailed SOW." };
    if (ratio > 1.35) return { label:"HIGH",    color:"#f59e0b", note:"May include overhead/warranty. Ask what's different." };
    return                 { label:"MARKET",   color:"#4ade80", note:"In range. Verify SOW completeness." };
  };

  const ToggleBtn = ({ active, onToggle, yes, no }) => (
    <div style={{ display:"flex", gap:4 }}>
      {[true, false].map(v => (
        <button key={String(v)} onClick={() => onToggle(v)} style={{
          flex:1, padding:"4px 6px", fontFamily:"'DM Mono',monospace", fontSize:10,
          background: active===v ? (v?"#16a34a33":"#dc262633") : "#1a2235",
          color: active===v ? (v?"#4ade80":"#f87171") : "#4b5563",
          border:`1px solid ${active===v ? (v?"#166534":"#991b1b") : "#2d3748"}`,
          borderRadius:4, cursor:"pointer"
        }}>{v ? yes : no}</button>
      ))}
    </div>
  );

  return (
    <div>
      <SectionLabel>Contractor bid comparison — always get ≥ 3 bids on the same scope</SectionLabel>

      {/* Instruction strip */}
      <div style={{ background:"#131c2e", border:"1px solid #1e2d45", borderRadius:6, padding:"10px 14px", marginBottom:14, fontSize:11, color:"#4b5563", lineHeight:1.7 }}>
        <span style={{ color:"#f59e0b" }}>Rule:</span> Give every contractor the <strong style={{color:"#94a3b8"}}>same written scope of work</strong> from the SOW Builder tab. 
        Never say "give me a quote" — hand them your line-item list and ask them to bid against it. 
        A bid 30%+ below median is a red flag. A lump-sum with no breakdown is a red flag.
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginBottom:14 }}>
        {bids.map((bid, idx) => {
          const flag = getBidFlag(bid);
          return (
            <div key={idx} style={{ background:"#111827", border:`1px solid ${flag ? flag.color+"44" : "#1f2937"}`, borderRadius:10, padding:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <input
                  value={bid.name}
                  onChange={e => updateBid(idx, "name", e.target.value)}
                  style={{ background:"transparent", border:"none", outline:"none", color:"#e2e8f0", fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace", width:"60%" }}
                />
                {flag && <span style={{ fontSize:9, fontWeight:700, color:flag.color, background:flag.color+"22", padding:"2px 7px", borderRadius:3, letterSpacing:"0.07em" }}>{flag.label}</span>}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {/* Total bid */}
                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  <label style={{ fontSize:9, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Total bid</label>
                  <div style={{ display:"flex", alignItems:"center", background:"#1a2235", border:`1px solid ${flag?flag.color+"55":"#2d3748"}`, borderRadius:6, padding:"5px 10px", gap:4 }}>
                    <span style={{ color:"#4b5563", fontSize:13 }}>$</span>
                    <input type="number" value={bid.total||""} placeholder="0"
                      onChange={e => updateBid(idx, "total", parseFloat(e.target.value)||0)}
                      style={{ background:"transparent", border:"none", outline:"none", color:"#e2e8f0", fontSize:14, fontFamily:"'DM Mono',monospace", width:"100%", textAlign:"right" }}
                    />
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  <div>
                    <div style={{ fontSize:9, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>Has line items?</div>
                    <ToggleBtn active={bid.hasItemized} onToggle={v => updateBid(idx,"hasItemized",v)} yes="Yes ✓" no="No ✗" />
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>Incl. materials?</div>
                    <ToggleBtn active={bid.inclMaterials} onToggle={v => updateBid(idx,"inclMaterials",v)} yes="Yes" no="Labor only" />
                  </div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  <label style={{ fontSize:9, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Timeline (weeks)</label>
                  <input type="number" value={bid.timeline||""} placeholder="0"
                    onChange={e => updateBid(idx, "timeline", parseFloat(e.target.value)||0)}
                    style={{ background:"#1a2235", border:"1px solid #2d3748", borderRadius:6, padding:"5px 10px", color:"#e2e8f0", fontSize:12, fontFamily:"'DM Mono',monospace", textAlign:"right", outline:"none" }}
                  />
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  <label style={{ fontSize:9, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em" }}>Notes / concerns</label>
                  <textarea value={bid.notes} onChange={e => updateBid(idx,"notes",e.target.value)} rows={2}
                    placeholder="Missing HVAC line, lump sum..."
                    style={{ background:"#1a2235", border:"1px solid #2d3748", borderRadius:6, padding:"5px 8px", color:"#94a3b8", fontSize:10, fontFamily:"'DM Mono',monospace", resize:"vertical", outline:"none" }}
                  />
                </div>

                {flag && bid.total > 0 && (
                  <div style={{ fontSize:10, color:flag.color, background:flag.color+"11", borderRadius:4, padding:"5px 8px", lineHeight:1.5 }}>
                    {flag.note}
                    {!bid.hasItemized && <div style={{ marginTop:3, color:"#f87171" }}>⚠ No line items — ask for itemized breakdown before signing anything.</div>}
                    {!bid.inclMaterials && bid.total > 0 && <div style={{ marginTop:3, color:"#f59e0b" }}>ℹ Labor only — add 35–50% for materials to compare apples-to-apples.</div>}
                  </div>
                )}

                {/* vs SOW / vs median */}
                {bid.total > 0 && sowTotal > 0 && (
                  <div style={{ fontSize:10, color:"#374151", borderTop:"1px solid #1a2235", paddingTop:6 }}>
                    vs SOW est: <span style={{ color: bid.total <= sowTotal*1.1 ? "#4ade80" : "#f87171" }}>{bid.total<=sowTotal?`-${$(sowTotal-bid.total)}`:`+${$(bid.total-sowTotal)}`}</span>
                    {medianBid > 0 && bid.total !== medianBid && (
                      <span style={{ marginLeft:8 }}>vs median: <span style={{ color: Math.abs(bid.total-medianBid)/medianBid < 0.15 ? "#4ade80":"#f59e0b" }}>{bid.total<=medianBid?`-${$(medianBid-bid.total)}`:`+${$(bid.total-medianBid)}`}</span></span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analysis summary */}
      {filledBids.length >= 2 && (
        <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:16 }}>
          <SectionLabel>Bid analysis</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:8, marginBottom:12 }}>
            <MetricCard label="Lowest bid"    value={$(Math.min(...totals))} />
            <MetricCard label="Highest bid"   value={$(Math.max(...totals))} />
            <MetricCard label="Median bid"    value={$(medianBid)} />
            <MetricCard label="Spread"        value={$(Math.max(...totals)-Math.min(...totals))} warn={Math.max(...totals)/Math.min(...totals) > 1.3} bad={Math.max(...totals)/Math.min(...totals) > 1.6} />
            {sowTotal > 0 && <MetricCard label="SOW estimate" value={$(sowTotal)} />}
          </div>
          <div style={{ fontSize:11, color:"#4b5563", lineHeight:1.8 }}>
            {Math.max(...totals)/Math.min(...totals) > 1.5
              ? <span style={{color:"#f87171"}}>⚠ Wide spread ({pct((Math.max(...totals)-Math.min(...totals))/medianBid)}) — bids may be scoping the job differently. Ensure all contractors are bidding the same SOW before comparing.</span>
              : <span style={{color:"#4ade80"}}>✓ Bids are reasonably tight. The mid-range bid is typically the most reliable.</span>
            }
            <div style={{marginTop:6, color:"#374151"}}>
              Pro move: Take the median bid and negotiate 5–10% off materials by sourcing them yourself through Home Depot Pro or Lowe's Pro. Contractors mark up materials 15–30%.
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop:10, background:"#131c2e", borderRadius:6, padding:"10px 12px", fontSize:11, color:"#4b5563", lineHeight:1.8 }}>
        <span style={{ color:"#6b7280" }}>Cost-reduction tactics:</span>&nbsp;
        Keep layout the same (moving plumbing = $$$) · Standardize finishes across units · Source your own materials · "Good enough" over luxury for rentals (LVP over hardwood, quartz over marble)
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

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

  // ── Rehab Estimator ──
  const [rehabMode, setRehabMode]   = useState("quick");
  const [sqft, setSqft]             = useState(1500);
  const [rehabLevel, setRehabLevel] = useState("medium");
  const [sowItems, setSowItems]     = useState(DEFAULT_SOW.map(i => ({...i})));

  const sowTotal = sowItems.reduce((sum, item) => {
    if (!item.enabled) return sum;
    return sum + (item.override != null ? item.override : item.qty * item.mid);
  }, 0);

  // ─────────────── CALCULATIONS ───────────────

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
    { id:"quick",  label:"Quick Filter"  },
    { id:"flip",   label:"Fix & Flip"    },
    { id:"brrrr",  label:"BRRRR"         },
    { id:"sober",  label:"Sober Living"  },
    { id:"rehab",  label:"Rehab Est. 🔨" },
    { id:"compare",label:"Compare All"   },
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
            <div style={{ fontSize:10, color:"#374151", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:2 }}>Flip · BRRRR · Sober Living · Rehab Est. · Live Calc</div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { label:"Purchase", val: $(purchase) },
              { label:"ARV",      val: $(arv)      },
              { label:"All-in %", val: pct(allInPct), color: allInPct<=0.70?"#4ade80":allInPct<=0.80?"#f59e0b":"#f87171" },
              { label:"Rehab Est.", val: sowTotal>0?$(sowTotal):"—", color: sowTotal>0&&Math.abs(sowTotal-repairs)/Math.max(repairs,1)>0.25?"#f87171":"#4ade80" },
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
            color: tab===t.id ? (t.id==="rehab"?"#f59e0b":"#f59e0b") : "#4b5563",
            background: tab===t.id && t.id==="rehab" ? "#1a2235" : "transparent",
            border:"none",
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

        {/* ════════════════ REHAB ESTIMATOR ════════════════ */}
        {tab==="rehab" && (
          <div>
            {/* Sub-tab bar */}
            <div style={{ display:"flex", gap:0, marginBottom:16, background:"#111827", borderRadius:8, border:"1px solid #1f2937", overflow:"hidden" }}>
              {[
                { id:"quick", label:"1 · Quick $/sqft",      desc:"Walk-and-estimate in 60 seconds" },
                { id:"sow",   label:"2 · SOW Line Items",     desc:"Full scope-of-work builder" },
                { id:"bids",  label:"3 · Bid Comparison",     desc:"Validate your contractors" },
              ].map(m => (
                <button key={m.id} onClick={()=>setRehabMode(m.id)} style={{
                  flex:1, padding:"10px 14px", fontFamily:"'DM Mono',monospace",
                  background: rehabMode===m.id ? "#1a2235" : "transparent",
                  borderBottom: rehabMode===m.id ? "2px solid #f59e0b" : "2px solid transparent",
                  border:"none", borderRight:"1px solid #1f2937",
                  cursor:"pointer", textAlign:"left",
                }}>
                  <div style={{ fontSize:11, fontWeight:700, color: rehabMode===m.id?"#f59e0b":"#4b5563" }}>{m.label}</div>
                  <div style={{ fontSize:9, color:"#374151", marginTop:2 }}>{m.desc}</div>
                </button>
              ))}
            </div>

            {rehabMode==="quick" && (
              <QuickEstimator
                sqft={sqft} setSqft={setSqft}
                rehabLevel={rehabLevel} setRehabLevel={setRehabLevel}
                repairs={repairs}
                onSync={val => setRepairs(val)}
              />
            )}
            {rehabMode==="sow" && (
              <SOWBuilder
                sowItems={sowItems} setSowItems={setSowItems}
                repairs={repairs}
                onSync={val => setRepairs(val)}
              />
            )}
            {rehabMode==="bids" && (
              <BidComparison sowTotal={sowTotal} />
            )}
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

          const pursuing   = strategies.filter(s=>s.verdict==="pursue");
          const negotiating= strategies.filter(s=>s.verdict==="negotiate");

          return (
            <div>
              {/* Rehab alignment banner */}
              {sowTotal > 0 && (
                <div style={{ background:"#111827", border:`1px solid ${Math.abs(sowTotal-repairs)/Math.max(repairs,1)>0.25?"#991b1b":"#166534"}`, borderRadius:8, padding:"10px 14px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:12, color:"#6b7280" }}>
                    Rehab Est. (SOW) is <strong style={{color:"#e2e8f0"}}>{$(sowTotal)}</strong> vs your repairs input of <strong style={{color:"#e2e8f0"}}>{$(repairs)}</strong>.
                    {Math.abs(sowTotal-repairs)/Math.max(repairs,1)>0.25
                      ? <span style={{color:"#f87171"}}> Gap is {pct(Math.abs(sowTotal-repairs)/repairs)} — consider syncing before finalizing strategy.</span>
                      : <span style={{color:"#4ade80"}}> Estimates are aligned (within 25%).</span>
                    }
                  </div>
                  {Math.abs(sowTotal-repairs)/Math.max(repairs,1)>0.25 && (
                    <button onClick={()=>setRepairs(sowTotal)} style={{ padding:"4px 10px", fontFamily:"'DM Mono',monospace", fontSize:10, fontWeight:700, background:"#f59e0b", color:"#000", border:"none", borderRadius:4, cursor:"pointer", whiteSpace:"nowrap", marginLeft:10 }}>
                      SYNC SOW → Repairs
                    </button>
                  )}
                </div>
              )}

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
