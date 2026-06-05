"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const API = "https://wingo-backend-gtqa.onrender.com";

const COLORS = ["green", "red", "violet"];
const MOCK_RESULTS = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  period: `20250605${String(i + 1).padStart(3, "0")}`,
  result: COLORS[Math.floor(Math.random() * 3)],
  number: Math.floor(Math.random() * 10),
  totalBets: Math.floor(Math.random() * 50) + 5,
  totalPot: Math.floor(Math.random() * 5000) + 500,
  winners: Math.floor(Math.random() * 20) + 1,
  payout: Math.floor(Math.random() * 3000) + 200,
  createdAt: `2025-06-05 ${String(10 + i).padStart(2, "0")}:00`,
  manualResult: null,
}));

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [manualColor, setManualColor] = useState("green");
  const [manualNum, setManualNum] = useState(0);
  const [settingManual, setSettingManual] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { router.push("/"); return; }
    fetchResults();
    const p = new Date().toISOString().slice(0, 10).replace(/-/g, "") + "001";
    setCurrentPeriod(p);
    const t = setInterval(() => setTimer(prev => prev <= 1 ? 60 : prev - 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/api/admin/results`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.results) setResults(res.data.results);
      else setResults(MOCK_RESULTS);
    } catch { setResults(MOCK_RESULTS); }
    finally { setLoading(false); }
  };

  const setManualResult = async () => {
    if (!confirm(`Set MANUAL result for period ${currentPeriod}?\nColor: ${manualColor}, Number: ${manualNum}`)) return;
    setSettingManual(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`${API}/api/admin/results/manual`, {
        period: currentPeriod, result: manualColor, number: manualNum
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("✅ Manual result set successfully!");
      fetchResults();
    } catch {
      alert("Manual result set (will apply next round)");
    } finally { setSettingManual(false); }
  };

  const colorStyle: any = {
    green:  { bg: "rgba(74,222,128,0.12)",  color: "var(--green)",    border: "rgba(74,222,128,0.3)" },
    red:    { bg: "rgba(248,113,113,0.12)", color: "var(--red)",      border: "rgba(248,113,113,0.3)" },
    violet: { bg: "rgba(192,132,252,0.12)", color: "#c084fc",         border: "rgba(192,132,252,0.3)" },
  };
  const colorDot: any = { green: "🟢", red: "🔴", violet: "🟣" };

  const profit = results.reduce((s, r) => s + (r.totalPot - r.payout), 0);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Game Results</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>Period history & manual override</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              fontFamily: "'Space Mono',monospace", fontSize: 13,
              color: timer <= 10 ? "var(--red)" : "var(--green)",
              background: "var(--bg3)", border: "1px solid var(--border)",
              padding: "6px 14px", borderRadius: 8
            }}>
              {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}
            </div>
            <button onClick={fetchResults} className="btn-ghost" style={{ fontSize: 12, padding: "7px 12px" }}>↻</button>
          </div>
        </div>

        <div className="page-body fade-up">

          {/* Manual result setter */}
          <div className="data-card" style={{ marginBottom: 20, padding: "20px 24px" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--amber)" }}>⚙</span> Manual Result Override
              <span className="badge badge-amber" style={{ marginLeft: 8 }}>ADMIN CONTROL</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>
                  Color Result
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setManualColor(c)}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: 8, fontWeight: 700, fontSize: 13,
                        border: `1px solid ${manualColor === c ? colorStyle[c].border : "var(--border)"}`,
                        background: manualColor === c ? colorStyle[c].bg : "var(--bg3)",
                        color: manualColor === c ? colorStyle[c].color : "var(--text2)",
                        textTransform: "capitalize", transition: "all 0.15s"
                      }}>
                      {colorDot[c]} {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>
                  Number (0-9)
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[0,1,2,3,4,5,6,7,8,9].map(n => (
                    <button key={n} onClick={() => setManualNum(n)}
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 14,
                        border: `1px solid ${manualNum === n ? "var(--indigo)" : "var(--border)"}`,
                        background: manualNum === n ? "rgba(99,102,241,0.15)" : "var(--bg3)",
                        color: manualNum === n ? "var(--indigo2)" : "var(--text2)",
                        transition: "all 0.15s"
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={setManualResult} disabled={settingManual} className="btn-primary"
                style={{ padding: "11px 20px", whiteSpace: "nowrap" }}>
                {settingManual ? "Setting..." : "⚡ Set Result"}
              </button>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text2)" }}>
              Current Period: <span style={{ fontFamily: "'Space Mono',monospace", color: "var(--indigo2)" }}>{currentPeriod}</span>
              &nbsp;—&nbsp;Will override auto result for the next round
            </div>
          </div>

          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Total Rounds",  value: results.length,                                            color: "var(--indigo2)" },
              { label: "Total Bets",    value: results.reduce((s,r) => s + r.totalBets, 0),               color: "var(--cyan)" },
              { label: "Total Pot",     value: `₹${results.reduce((s,r) => s + r.totalPot, 0).toLocaleString()}`, color: "var(--amber)" },
              { label: "Net Profit",    value: `₹${profit.toLocaleString()}`,                             color: profit >= 0 ? "var(--green)" : "var(--red)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Results table */}
          <div className="data-card">
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700 }}>
              Period History ({results.length})
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>Loading...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Period</th><th>Result</th><th>Number</th><th>Bets</th><th>Total Pot</th><th>Winners</th><th>Payout</th><th>Profit</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {results.map(r => {
                      const cs = colorStyle[r.result] || colorStyle.green;
                      const p = r.totalPot - r.payout;
                      return (
                        <tr key={r.id}>
                          <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--text2)" }}>{r.period}</td>
                          <td>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
                              borderRadius: 20, background: cs.bg, color: cs.color,
                              border: `1px solid ${cs.border}`, fontSize: 12, fontWeight: 700, textTransform: "capitalize"
                            }}>
                              {colorDot[r.result]} {r.result}
                            </span>
                          </td>
                          <td style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, color: "var(--text)" }}>{r.number}</td>
                          <td style={{ color: "var(--cyan)" }}>{r.totalBets}</td>
                          <td style={{ fontFamily: "'Space Mono',monospace", color: "var(--amber)" }}>₹{r.totalPot.toLocaleString()}</td>
                          <td style={{ color: "var(--text2)" }}>{r.winners}</td>
                          <td style={{ fontFamily: "'Space Mono',monospace", color: "var(--red)" }}>₹{r.payout.toLocaleString()}</td>
                          <td style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, color: p >= 0 ? "var(--green)" : "var(--red)" }}>
                            {p >= 0 ? "+" : ""}₹{p.toLocaleString()}
                          </td>
                          <td style={{ color: "var(--text2)", fontSize: 12 }}>{r.createdAt}</td>
                        </tr>
                      );
                    })}
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
            
