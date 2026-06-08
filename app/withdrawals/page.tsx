"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const API = "https://wingo-backend-gtqa.onrender.com";

export default function WithdrawalsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number|null>(null);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { router.push("/"); return; }
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    if (filter === "all") setFiltered(withdrawals);
    else setFiltered(withdrawals.filter(w => w.status === filter));
  }, [filter, withdrawals]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/api/admin/withdrawals`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.withdrawals) { setWithdrawals(res.data.withdrawals); setFiltered(res.data.withdrawals); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: number, status: "approved"|"rejected") => {
    const w = withdrawals.find(x => x.id === id);
    if (!confirm(`${status === "approved" ? "✅ Approve" : "❌ Reject"} ₹${w?.amount} withdrawal to ${w?.upiId}?\n${status === "rejected" ? "Balance will be refunded!" : "Make sure payment is sent!"}`)) return;
    setUpdating(id);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(`${API}/api/admin/withdrawals/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success) {
        setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status } : w));
        alert(status === "approved" ? "✅ Withdrawal approved!" : "❌ Rejected. Balance refunded to user.");
      } else { alert(res.data?.error || "Failed"); }
    } catch { alert("Network error"); }
    finally { setUpdating(null); }
  };

  const mask = (m: string) => m ? m.slice(0,3) + "****" + m.slice(-3) : "—";
  const statusBadge = (s: string) => {
    const map: any = { pending: "badge-amber", approved: "badge-green", rejected: "badge-red" };
    return <span className={`badge ${map[s]}`}>{s}</span>;
  };

  const pendingAmt = withdrawals.filter(w=>w.status==="pending").reduce((s,w)=>s+w.amount,0);
  const paidAmt = withdrawals.filter(w=>w.status==="approved").reduce((s,w)=>s+w.amount,0);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Withdrawals</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>
              {withdrawals.filter(w=>w.status==="pending").length > 0 && (
                <span style={{ color: "var(--red)" }}>⚠ {withdrawals.filter(w=>w.status==="pending").length} pending — </span>
              )}
              Manage all withdrawal requests
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["all","pending","approved","rejected"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: filter === f ? "var(--indigo)" : "transparent",
                  color: filter === f ? "#fff" : "var(--text2)",
                  border: `1px solid ${filter === f ? "var(--indigo)" : "var(--border)"}`,
                  textTransform: "capitalize", cursor: "pointer"
                }}>
                {f} {f !== "all" && `(${withdrawals.filter(w=>w.status===f).length})`}
              </button>
            ))}
            <button onClick={fetchWithdrawals} className="btn-ghost" style={{ fontSize: 12, padding: "7px 12px" }}>↻</button>
          </div>
        </div>

        <div className="page-body fade-up">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Total",        value: withdrawals.length,                                          color: "var(--indigo2)" },
              { label: "Pending",      value: withdrawals.filter(w=>w.status==="pending").length,          color: "var(--amber)" },
              { label: "Paid Out",     value: `₹${paidAmt.toLocaleString()}`,                             color: "var(--green)" },
              { label: "Pending Amt",  value: `₹${pendingAmt.toLocaleString()}`,                          color: "var(--red)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="data-card">
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700 }}>
              Withdrawal Requests ({filtered.length})
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>Loading...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>User</th><th>Amount</th><th>UPI ID</th><th>Name</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(w => (
                      <tr key={w.id}>
                        <td style={{ fontFamily: "'DM Mono',monospace", color: "var(--text2)" }}>#{w.id}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace" }}>{mask(w.mobile)}</td>
                        <td style={{ fontFamily: "'Space Mono',monospace", color: "var(--red)", fontWeight: 700 }}>₹{w.amount?.toLocaleString()}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--cyan)" }}>{w.upiId || w.upi_id}</td>
                        <td style={{ fontSize: 13 }}>{w.upiName || w.upi_name}</td>
                        <td>{statusBadge(w.status)}</td>
                        <td style={{ color: "var(--text2)", fontSize: 12 }}>{w.createdAt}</td>
                        <td>
                          {w.status === "pending" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => updateStatus(w.id, "approved")} className="btn-success" disabled={updating===w.id}>
                                {updating===w.id ? "..." : "✓ Pay"}
                              </button>
                              <button onClick={() => updateStatus(w.id, "rejected")} className="btn-danger" disabled={updating===w.id}>
                                {updating===w.id ? "..." : "✗ Reject"}
                              </button>
                            </div>
                          ) : <span style={{ fontSize: 12, color: "var(--text2)" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text2)", padding: 30 }}>No withdrawals found</td></tr>}
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
      
