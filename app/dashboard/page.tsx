"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const API = "https://wingo-backend-gtqa.onrender.com";

const MOCK = {
  totalUsers: 1284, activeToday: 47,
  totalDeposits: 284500, pendingDeposits: 12,
  totalWithdrawals: 196200, pendingWithdrawals: 8,
  totalBets: 9430, revenue: 88300,
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(MOCK);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { router.push("/"); return; }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data) setStats(res.data);
    } catch { /* use mock */ }

    // mock recent activity
    setRecentActivity([
      { id: 1, type: "deposit",  user: "****4821", amount: 500,  status: "pending",  time: "2 min ago" },
      { id: 2, type: "withdraw", user: "****7732", amount: 1000, status: "pending",  time: "5 min ago" },
      { id: 3, type: "bet",      user: "****1190", amount: 100,  status: "win",      time: "8 min ago" },
      { id: 4, type: "deposit",  user: "****3345", amount: 2000, status: "approved", time: "12 min ago" },
      { id: 5, type: "bet",      user: "****9902", amount: 50,   status: "loss",     time: "15 min ago" },
      { id: 6, type: "withdraw", user: "****6611", amount: 750,  status: "approved", time: "20 min ago" },
    ]);
  };

  const statCards = [
    { label: "Total Users",      value: stats.totalUsers.toLocaleString(),        icon: "◈", color: "var(--indigo2)", sub: `${stats.activeToday} active today` },
    { label: "Total Deposits",   value: `₹${stats.totalDeposits.toLocaleString()}`, icon: "↓", color: "var(--green)",   sub: `${stats.pendingDeposits} pending` },
    { label: "Total Withdrawals",value: `₹${stats.totalWithdrawals.toLocaleString()}`, icon: "↑", color: "var(--red)",    sub: `${stats.pendingWithdrawals} pending` },
    { label: "Net Revenue",      value: `₹${stats.revenue.toLocaleString()}`,      icon: "◉", color: "var(--amber)",   sub: `${stats.totalBets.toLocaleString()} total bets` },
  ];

  const statusBadge = (s: string) => {
    const map: any = { pending: "badge-amber", approved: "badge-green", win: "badge-green", loss: "badge-red", rejected: "badge-red" };
    return <span className={`badge ${map[s] || "badge-indigo"}`}>{s}</span>;
  };

  const typeIcon: any = { deposit: "↓", withdraw: "↑", bet: "◉" };
  const typeColor: any = { deposit: "var(--green)", withdraw: "var(--red)", bet: "var(--cyan)" };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Dashboard</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, color: "var(--text2)" }}>Live</span>
            <button onClick={fetchStats} className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }}>↻ Refresh</button>
          </div>
        </div>

        <div className="page-body fade-up">
          {/* Stat cards */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {statCards.map(c => (
              <div key={c.label} className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5 }}>{c.label}</div>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${c.color}18`, border: `1px solid ${c.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Space Mono', monospace", fontSize: 14, color: c.color
                  }}>{c.icon}</div>
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color: c.color, marginBottom: 6 }}>
                  {c.value}
                </div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="data-card">
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Activity</div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href="/deposits"><button className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>Deposits</button></a>
                <a href="/withdrawals"><button className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>Withdrawals</button></a>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th><th>User</th><th>Amount</th><th>Status</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "'Space Mono',monospace", color: typeColor[a.type], fontSize: 16 }}>{typeIcon[a.type]}</span>
                        <span style={{ textTransform: "capitalize" }}>{a.type}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace" }}>{a.user}</td>
                    <td style={{ fontFamily: "'Space Mono', monospace", color: "var(--amber)", fontWeight: 700 }}>₹{a.amount}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td style={{ color: "var(--text2)" }}>{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick links */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
            <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--amber)" }}>⚠ Pending Actions</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg3)", borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Deposit requests</span>
                <span className="badge badge-amber">{stats.pendingDeposits}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg3)", borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Withdrawal requests</span>
                <span className="badge badge-red">{stats.pendingWithdrawals}</span>
              </div>
            </div>

            <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--cyan)" }}>◈ User Stats</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg3)", borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Registered users</span>
                <span style={{ fontFamily: "'Space Mono',monospace", color: "var(--indigo2)", fontWeight: 700 }}>{stats.totalUsers}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg3)", borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>Active today</span>
                <span style={{ fontFamily: "'Space Mono',monospace", color: "var(--green)", fontWeight: 700 }}>{stats.activeToday}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
       }
      
