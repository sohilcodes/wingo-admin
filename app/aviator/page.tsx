"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const API = "https://wingo-backend-gtqa.onrender.com";

export default function AviatorAdminPage() {
  const router = useRouter();
  const [rounds, setRounds] = useState<any[]>([]);
  const [crashPoint, setCrashPoint] = useState("2.00");
  const [loading, setLoading] = useState(false);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, totalBet: 0, totalWin: 0 });

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { router.push("/"); return; }
    fetchRounds();
    fetchCurrentRound();
    const iv = setInterval(() => { fetchCurrentRound(); }, 3000);
    return () => clearInterval(iv);
  }, []);

  const fetchCurrentRound = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/api/aviator/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentRound(res.data?.round || null);
    } catch {}
  };

  const fetchRounds = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/api/aviator/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.rounds) {
        setRounds(res.data.rounds);
        const total = res.data.rounds.length;
        setStats(prev => ({ ...prev, total }));
      }
    } catch {}
  };

  const createRound = async () => {
    const cp = parseFloat(crashPoint);
    if (isNaN(cp) || cp < 1.01) return alert("Crash point must be > 1.01");
    if (!confirm(`Create new Aviator round with crash point ${cp}x?`)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(`${API}/api/aviator/admin/create-round`, {
        crashPoint: cp
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data?.success) {
        alert(`✅ Round created! Crash point: ${cp}x`);
        fetchRounds();
        fetchCurrentRound();
      } else {
        alert(res.data?.error || "Failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const startRound = async (roundId: string) => {
    if (!confirm("Start this round? Players can now place bets!")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(`${API}/api/aviator/admin/start-round`, {
        roundId
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data?.success) {
        alert("✅ Round started!");
        fetchCurrentRound();
        fetchRounds();
      } else {
        alert(res.data?.error || "Failed");
      }
    } catch {
      alert("Network error");
    }
  };

  const crashRound = async (roundId: string) => {
    if (!confirm("Crash this round NOW?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(`${API}/api/aviator/admin/crash-round`, {
        roundId
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data?.success) {
        alert("💥 Round crashed!");
        fetchCurrentRound();
        fetchRounds();
      } else {
        alert(res.data?.error || "Failed");
      }
    } catch {
      alert("Network error");
    }
  };

  const statusColor: any = {
    waiting: "var(--amber)",
    flying: "var(--green)",
    crashed: "var(--red)"
  };

  const getCrashColor = (cp: number) => {
    if (cp < 1.5) return "var(--red)";
    if (cp < 3) return "var(--amber)";
    if (cp < 10) return "var(--green)";
    return "var(--cyan)";
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>✈️ Aviator Control</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>Manage Aviator game rounds and crash points</div>
          </div>
          <button onClick={fetchRounds} className="btn-ghost" style={{ fontSize: 12, padding: "7px 12px" }}>↻ Refresh</button>
        </div>

        <div className="page-body fade-up">

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Total Rounds", value: stats.total, color: "var(--indigo2)" },
              { label: "Current Status", value: currentRound?.status?.toUpperCase() || "NO ROUND", color: currentRound ? statusColor[currentRound.status] : "var(--text2)" },
              { label: "Current Crash Point", value: currentRound ? `${currentRound.crash_point}x` : "—", color: currentRound ? getCrashColor(currentRound.crash_point) : "var(--text2)" },
              { label: "Round ID", value: currentRound?.id?.slice(0, 8) || "—", color: "var(--cyan)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Create Round */}
          <div className="data-card" style={{ marginBottom: 20 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700 }}>
              ➕ Create New Round
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
                    Crash Point (x)
                  </label>
                  <input
                    type="number" step="0.01" min="1.01"
                    value={crashPoint}
                    onChange={e => setCrashPoint(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 8,
                      background: "var(--bg3)", border: "1px solid var(--border)",
                      color: "var(--text)", fontSize: 16, fontWeight: 700,
                      fontFamily: "'Space Mono', monospace", boxSizing: "border-box"
                    }}
                  />
                  <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 4 }}>
                    Min: 1.01x — Players will lose if they don't cash out before this
                  </div>
                </div>

                {/* Quick presets */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1 }}>Quick Presets</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[1.2, 1.5, 2.0, 3.0, 5.0, 10.0].map(cp => (
                      <button key={cp} onClick={() => setCrashPoint(cp.toFixed(2))}
                        style={{
                          padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700,
                          background: parseFloat(crashPoint) === cp ? "var(--indigo)" : "var(--bg3)",
                          border: `1px solid ${parseFloat(crashPoint) === cp ? "var(--indigo)" : "var(--border)"}`,
                          color: parseFloat(crashPoint) === cp ? "#fff" : "var(--text2)",
                          cursor: "pointer"
                        }}>{cp}x</button>
                    ))}
                  </div>
                </div>

                <button onClick={createRound} disabled={loading}
                  style={{
                    padding: "12px 24px", borderRadius: 8, border: "none",
                    background: "var(--green)", color: "#fff", fontWeight: 700, fontSize: 14,
                    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                    whiteSpace: "nowrap"
                  }}>
                  {loading ? "Creating..." : "✈️ Create Round"}
                </button>
              </div>

              {/* Warning */}
              <div style={{
                marginTop: 16, background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--red)"
              }}>
                ⚠️ Set crash point carefully. Lower crash point = more house profit. Higher crash point = players win more.
              </div>
            </div>
          </div>

          {/* Current Round Control */}
          {currentRound && (
            <div className="data-card" style={{ marginBottom: 20 }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700 }}>
                🎮 Current Round Control
              </div>
              <div style={{ padding: "20px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>Round ID</div>
                  <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--cyan)" }}>{currentRound.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>Status</div>
                  <div style={{ fontWeight: 700, color: statusColor[currentRound.status] || "var(--text)" }}>
                    {currentRound.status?.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>Crash Point</div>
                  <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 18, color: getCrashColor(currentRound.crash_point) }}>
                    {currentRound.crash_point}x
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {currentRound.status === "waiting" && (
                    <button onClick={() => startRound(currentRound.id)}
                      style={{
                        padding: "10px 20px", borderRadius: 8, border: "none",
                        background: "var(--green)", color: "#fff", fontWeight: 700, cursor: "pointer"
                      }}>
                      ▶️ Start Round
                    </button>
                  )}
                  {currentRound.status === "flying" && (
                    <button onClick={() => crashRound(currentRound.id)}
                      style={{
                        padding: "10px 20px", borderRadius: 8, border: "none",
                        background: "var(--red)", color: "#fff", fontWeight: 700, cursor: "pointer",
                        animation: "pulse 1s ease-in-out infinite"
                      }}>
                      💥 Crash Now!
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Round History */}
          <div className="data-card">
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700 }}>
              📋 Round History ({rounds.length})
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Round ID</th>
                    <th>Crash Point</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--cyan)" }}>
                        {r.id?.slice(0, 16)}...
                      </td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: getCrashColor(r.crash_point) }}>
                        {r.crash_point}x
                      </td>
                      <td>
                        <span style={{
                          padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: (statusColor[r.status] || "var(--text2)") + "22",
                          color: statusColor[r.status] || "var(--text2)"
                        }}>{r.status}</span>
                      </td>
                      <td style={{ color: "var(--text2)", fontSize: 12 }}>
                        {r.created_at?.slice(0, 16).replace("T", " ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(248,113,113,0); }
        }
      `}</style>
    </div>
  );
      }
    
