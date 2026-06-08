"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const API = "https://wingo-backend-gtqa.onrender.com";
const ROUND_SECONDS = 60;

function getPeriodId() {
  const now = Date.now();
  const slot = Math.floor(now / (ROUND_SECONDS * 1000));
  const d = new Date(now).toISOString().slice(0,10).replace(/-/g,"");
  return `${d}${String(slot).slice(-6)}`;
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(60);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [manualColor, setManualColor] = useState("green");
  const [manualNum, setManualNum] = useState(0);
  const [setting, setSetting] = useState(false);
  const [nextManual, setNextManual] = useState<{color:string,num:number}|null>(null);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { router.push("/"); return; }
    fetchResults();
    const id = setInterval(() => {
      const now = Date.now();
      const secs = Math.floor(now/1000);
      const left = ROUND_SECONDS - (secs % ROUND_SECONDS);
      setTimer(left);
      setCurrentPeriod(getPeriodId());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/api/admin/results`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.results) setResults(res.data.results);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const setManualResult = async () => {
    if (!confirm(`Set MANUAL result?\nPeriod: ${currentPeriod}\nColor: ${manualColor}\nNumber: ${manualNum}\n\nThis will override the auto result!`)) return;
    setSetting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(`${API}/api/admin/results/manual`, {
        period: currentPeriod, result: manualColor, number: manualNum
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success) {
        setNextManual({ color: manualColor, num: manualNum });
        alert(`✅ Manual result set!\nColor: ${manualColor}, Number: ${manualNum}\nWill apply at end of current round.`);
        fetchResults();
      } else { alert(res.data?.error || "Failed"); }
    } catch { alert("Network error"); }
    finally { setSetting(false); }
  };

  const COLORS = ["green","red","violet"];
  const colorStyle: any = {
    green:  { bg:"rgba(74,222,128,0.12)",  color:"var(--green)",  border:"rgba(74,222,128,0.3)" },
    red:    { bg:"rgba(248,113,113,0.12)", color:"var(--red)",    border:"rgba(248,113,113,0.3)" },
    violet: { bg:"rgba(192,132,252,0.12)", color:"#c084fc",       border:"rgba(192,132,252,0.3)" },
  };
  const colorDot: any = { green:"🟢", red:"🔴", violet:"🟣" };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Game Control</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>Period: <span style={{ fontFamily:"'Space Mono',monospace", color:"var(--indigo2)" }}>{currentPeriod}</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {nextManual && (
              <div style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:8, padding:"5px 12px", fontSize:12, color:"var(--amber)" }}>
                ⚡ Manual set: {colorDot[nextManual.color]} {nextManual.num}
              </div>
            )}
            <div style={{
              fontFamily:"'Space Mono',monospace", fontSize:20, fontWeight:700,
              color: timer<=10 ? "var(--red)" : "var(--green)",
              background:"var(--bg3)", border:"1px solid var(--border)",
              padding:"6px 16px", borderRadius:8
            }}>
              {String(Math.floor(timer/60)).padStart(2,"0")}:{String(timer%60).padStart(2,"0")}
            </div>
            <button onClick={fetchResults} className="btn-ghost" style={{ fontSize:12, padding:"7px 12px" }}>↻</button>
          </div>
        </div>

        <div className="page-body fade-up">

          {/* Manual Control */}
          <div className="data-card" style={{ marginBottom:20, padding:"20px 24px" }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:"var(--amber)" }}>⚙</span> Manual Result Override
              <span className="badge badge-amber" style={{ marginLeft:8 }}>ADMIN CONTROL</span>
              <span className="badge badge-red" style={{ marginLeft:4 }}>CURRENT ROUND</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:16, alignItems:"end" }}>
              {/* Color */}
              <div>
                <div style={{ fontSize:11, color:"var(--text2)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>Color Result</div>
                <div style={{ display:"flex", gap:8 }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setManualColor(c)}
                      style={{
                        flex:1, padding:"12px 8px", borderRadius:8, fontWeight:700, fontSize:13,
                        border:`1px solid ${manualColor===c ? colorStyle[c].border : "var(--border)"}`,
                        background: manualColor===c ? colorStyle[c].bg : "var(--bg3)",
                        color: manualColor===c ? colorStyle[c].color : "var(--text2)",
                        textTransform:"capitalize", cursor:"pointer", transition:"all 0.15s"
                      }}>
                      {colorDot[c]} {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number */}
              <div>
                <div style={{ fontSize:11, color:"var(--text2)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>Number (0-9)</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[0,1,2,3,4,5,6,7,8,9].map(n => (
                    <button key={n} onClick={() => setManualNum(n)}
                      style={{
                        width:36, height:36, borderRadius:8,
                        fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:14,
                        border:`1px solid ${manualNum===n ? "var(--indigo)" : "var(--border)"}`,
                        background: manualNum===n ? "rgba(99,102,241,0.15)" : "var(--bg3)",
                        color: manualNum===n ? "var(--indigo2)" : "var(--text2)",
                        cursor:"pointer", transition:"all 0.15s"
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set button */}
              <button onClick={setManualResult} disabled={setting} className="btn-primary"
                style={{ padding:"13px 20px", whiteSpace:"nowrap" }}>
                {setting ? "Setting..." : "⚡ Set Result"}
              </button>
            </div>

            <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.15)", borderRadius:8, fontSize:12, color:"var(--text2)" }}>
              ⚠️ This overrides the auto-generated result for the current period. Use carefully — all bets will be settled based on this result.
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            {[
              { label:"Total Rounds", value:results.length,                                                          color:"var(--indigo2)" },
              { label:"Green Results",value:results.filter(r=>r.color==="green").length,                             color:"var(--green)" },
              { label:"Red Results",  value:results.filter(r=>r.color==="red").length,                               color:"var(--red)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding:"16px 18px" }}>
                <div style={{ fontSize:11, color:"var(--text2)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>{s.label}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Results Table */}
          <div className="data-card">
            <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", fontSize:14, fontWeight:700 }}>
              Game History ({results.length} rounds)
            </div>
            {loading ? (
              <div style={{ padding:40, textAlign:"center", color:"var(--text2)" }}>Loading...</div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Period</th><th>Result</th><th>Number</th><th>Manual?</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const cs = colorStyle[r.color] || colorStyle.green;
                      return (
                        <tr key={r.id || i}>
                          <td style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"var(--text2)" }}>{r.period_id}</td>
                          <td>
                            <span style={{
                              display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px",
                              borderRadius:20, background:cs.bg, color:cs.color,
                              border:`1px solid ${cs.border}`, fontSize:12, fontWeight:700, textTransform:"capitalize"
                            }}>
                              {colorDot[r.color]} {r.color}
                            </span>
                          </td>
                          <td style={{ fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:18 }}>{r.result}</td>
                          <td>
                            {r.is_manual ? <span className="badge badge-amber">Manual</span> : <span style={{ color:"var(--text2)", fontSize:12 }}>Auto</span>}
                          </td>
                          <td style={{ color:"var(--text2)", fontSize:12 }}>{r.createdAt || r.created_at?.slice(0,16).replace("T"," ")}</td>
                        </tr>
                      );
                    })}
                    {results.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", color:"var(--text2)", padding:30 }}>No rounds yet</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
                          }
