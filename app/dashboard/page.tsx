"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const API = "https://wingo-backend-gtqa.onrender.com";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { router.push("/"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    const h = { Authorization: `Bearer ${token}` };
    try {
      const [statsRes, depsRes, withRes] = await Promise.all([
        axios.get(`${API}/api/admin/stats`, { headers: h }),
        axios.get(`${API}/api/admin/deposits`, { headers: h }),
        axios.get(`${API}/api/admin/withdrawals`, { headers: h }),
      ]);
      if (statsRes.data?.success) setStats(statsRes.data);
      if (depsRes.data?.deposits) setRecentDeposits(depsRes.data.deposits.slice(0, 5));
      if (withRes.data?.withdrawals) setRecentWithdrawals(withRes.data.withdrawals.slice(0, 5));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const mask = (m: string) => m ? m.slice(0,3) + "****" + m.slice(-3) : "—";

  const statCards = stats ? [
    { label: "Total Users",       value: stats.totalUsers?.toLocaleString() || "0",          icon: "◈", color: "var(--indigo2)", sub: "Registered accounts" },
    { label: "Total Deposits",    value: `₹${(stats.totalDeposits||0).toLocaleString()}`,    icon: "↓", color: "var(--green)",   sub: `${stats.pendingDeposits||0} pending` },
    { label: "Total Withdrawals", value: `₹${(stats.totalWithdrawals||0).toLocaleString()}`, icon: "↑", color: "var(--red)",    sub: `${stats.pendingWithdrawals||0} pending` },
    { label: "Net Revenue",       value: `₹${(stats.revenue||0).toLocaleString()}`,          icon: "◉", color: "var(--amber)",  sub: `${(stats.totalBets||0).toLocaleString()} total bets` },
  ] : [];

  const statusBadge = (s: string) => {
    const map: any = { pending: "badge-amber", approved: "badge-green", rejected: "badge-red" };
    return <span className={`badge ${map[s] || "badge-indigo"}`}>{s}</span>;
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Dashboard</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, color: "var(--text2)" }}>Live</span>
            <button onClick={fetchAll} className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }}>↻ Refresh</button>
          </div>
        </div>

        <div className="page-body fade-up">
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>Loading real data...</div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="stats-grid" style={{ marginBottom: 24 }}>
                {statCards.map(c => (
                  <div key={c.label} className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5 }}>{c.label}</div>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.color}18`, border: `1px solid ${c.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: c.color }}>{c.icon}</div>
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 700, color: c.color, marginBottom: 6 }}>{c.value}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Pending Actions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div className="stat-card">
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--amber)", marginBottom: 12 }}>⚠ Pending Deposits</div>
                  {recentDeposits.filter(d => d.status === "pending").length === 0 ? (
                    <div style={{ color: "var(--text2)", fontSize: 13 }}>No pending deposits ✅</div>
                  ) : recentDeposits.filter(d => d.status === "pending").map(d => (
                    <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg3)", borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--text2)" }}>{mask(d.mobile)}</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", color: "var(--green)", fontWeight: 700, fontSize: 12 }}>₹{d.amount}</span>
                    </div>
                  ))}
                  <a href="/deposits" style={{ display: "block", marginTop: 8 }}>
                    <button className="btn-ghost" style={{ width: "100%", fontSize: 12, padding: "7px" }}>View All →</button>
                  </a>
                </div>

                <div className="stat-card">
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--red)", marginBottom: 12 }}>⚠ Pending Withdrawals</div>
                  {recentWithdrawals.filter(w => w.status === "pending").length === 0 ? (
                    <div style={{ color: "var(--text2)", fontSize: 13 }}>No pending withdrawals ✅</div>
                  ) : recentWithdrawals.filter(w => w.status === "pending").map(w => (
                    <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg3)", borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--text2)" }}>{mask(w.mobile)}</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", color: "var(--red)", fontWeight: 700, fontSize: 12 }}>₹{w.amount}</span>
                    </div>
                  ))}
                  <a href="/withdrawals" style={{ display: "block", marginTop: 8 }}>
                    <button className="btn-ghost" style={{ width: "100%", fontSize: 12, padding: "7px" }}>View All →</button>
                  </a>
                </div>
              </div>

              {/* Recent Deposits Table */}
              <div className="data-card" style={{ marginBottom: 16 }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Deposits</div>
                  <a href="/deposits"><button className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>View All</button></a>
                </div>
                <table className="admin-table">
                  <thead><tr><th>User</th><th>Amount</th><th>UTR</th><th>Status</th><th>Time</th></tr></thead>
                  <tbody>
                    {recentDeposits.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontFamily: "'DM Mono',monospace" }}>{mask(d.mobile)}</td>
                        <td style={{ fontFamily: "'Space Mono',monospace", color: "var(--green)", fontWeight: 700 }}>₹{d.amount}</td>
                        <td style={{ fontSize: 11, color: "var(--cyan)", fontFamily: "'DM Mono',monospace" }}>{d.utrCode || d.utr_code}</td>
                        <td>{statusBadge(d.status)}</td>
                        <td style={{ color: "var(--text2)", fontSize: 11 }}>{d.createdAt}</td>
                      </tr>
                    ))}
                    {recentDeposits.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text2)", padding: 20 }}>No deposits yet</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* Recent Withdrawals Table */}
              <div className="data-card">
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Withdrawals</div>
                  <a href="/withdrawals"><button className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>View All</button></a>
                </div>
                <table className="admin-table">
                  <thead><tr><th>User</th><th>Amount</th><th>UPI ID</th><th>Status</th><th>Time</th></tr></thead>
                  <tbody>
                    {recentWithdrawals.map(w => (
                      <tr key={w.id}>
                        <td style={{ fontFamily: "'DM Mono',monospace" }}>{mask(w.mobile)}</td>
                        <td style={{ fontFamily: "'Space Mono',monospace", color: "var(--red)", fontWeight: 700 }}>₹{w.amount}</td>
                        <td style={{ fontSize: 11, color: "var(--cyan)", fontFamily: "'DM Mono',monospace" }}>{w.upiId || w.upi_id}</td>
                        <td>{statusBadge(w.status)}</td>
                        <td style={{ color: "var(--text2)", fontSize: 11 }}>{w.createdAt}</td>
                      </tr>
                    ))}
                    {recentWithdrawals.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text2)", padding: 20 }}>No withdrawals yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
                       }
                       
