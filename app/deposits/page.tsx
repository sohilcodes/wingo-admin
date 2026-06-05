"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const API = "https://wingo-backend-gtqa.onrender.com";

const MOCK_DEPOSITS = [
  { id: 1, userId: 4, mobile: "9654321098", amount: 2000, utrCode: "UTR428819023", status: "pending",  createdAt: "2025-06-05 10:22" },
  { id: 2, userId: 2, mobile: "9823411234", amount: 500,  utrCode: "UTR118823741", status: "pending",  createdAt: "2025-06-05 09:45" },
  { id: 3, userId: 6, mobile: "9432109876", amount: 1000, utrCode: "UTR993210456", status: "approved", createdAt: "2025-06-05 09:10" },
  { id: 4, userId: 1, mobile: "9876543210", amount: 5000, utrCode: "UTR774401223", status: "approved", createdAt: "2025-06-04 18:30" },
  { id: 5, userId: 5, mobile: "9543210987", amount: 200,  utrCode: "UTR334409982", status: "rejected", createdAt: "2025-06-04 16:00" },
  { id: 6, userId: 3, mobile: "9712309876", amount: 500,  utrCode: "UTR229011234", status: "rejected", createdAt: "2025-06-04 14:20" },
  { id: 7, userId: 4, mobile: "9654321098", amount: 3000, utrCode: "UTR881239012", status: "approved", createdAt: "2025-06-03 11:00" },
];

export default function DepositsPage() {
  const router = useRouter();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { router.push("/"); return; }
    fetchDeposits();
  }, []);

  useEffect(() => {
    if (filter === "all") setFiltered(deposits);
    else setFiltered(deposits.filter(d => d.status === filter));
  }, [filter, deposits]);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/api/admin/deposits`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.deposits) { setDeposits(res.data.deposits); setFiltered(res.data.deposits); }
      else { setDeposits(MOCK_DEPOSITS); setFiltered(MOCK_DEPOSITS); }
    } catch { setDeposits(MOCK_DEPOSITS); setFiltered(MOCK_DEPOSITS); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: number, status: "approved" | "rejected") => {
    const dep = deposits.find(d => d.id === id);
    if (!confirm(`${status === "approved" ? "Approve" : "Reject"} ₹${dep?.amount} deposit?`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(`${API}/api/admin/deposits/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {}
    setDeposits(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const statusBadge = (s: string) => {
    const map: any = { pending: "badge-amber", approved: "badge-green", rejected: "badge-red" };
    return <span className={`badge ${map[s]}`}>{s}</span>;
  };

  const mask = (m: string) => m?.slice(0, 3) + "****" + m?.slice(-3);
  const totalPending = deposits.filter(d => d.status === "pending").reduce((s, d) => s + d.amount, 0);
  const totalApproved = deposits.filter(d => d.status === "approved").reduce((s, d) => s + d.amount, 0);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Deposits</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>Manage all deposit requests</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["all", "pending", "approved", "rejected"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: filter === f ? "var(--indigo)" : "transparent",
                  color: filter === f ? "#fff" : "var(--text2)",
                  border: `1px solid ${filter === f ? "var(--indigo)" : "var(--border)"}`,
                  textTransform: "capitalize", transition: "all 0.15s"
                }}>
                {f}
              </button>
            ))}
            <button onClick={fetchDeposits} className="btn-ghost" style={{ fontSize: 12, padding: "7px 12px" }}>↻</button>
          </div>
        </div>

        <div className="page-body fade-up">
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Total",    value: deposits.length,                                   color: "var(--indigo2)" },
              { label: "Pending",  value: deposits.filter(d => d.status === "pending").length, color: "var(--amber)" },
              { label: "Approved Amount", value: `₹${totalApproved.toLocaleString()}`,       color: "var(--green)" },
              { label: "Pending Amount",  value: `₹${totalPending.toLocaleString()}`,         color: "var(--red)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="data-card">
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700 }}>
              Deposit Requests ({filtered.length})
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>Loading...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>User</th><th>Amount</th><th>UTR Code</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontFamily: "'DM Mono',monospace", color: "var(--text2)" }}>#{d.id}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace" }}>{mask(d.mobile)}</td>
                        <td style={{ fontFamily: "'Space Mono',monospace", color: "var(--green)", fontWeight: 700 }}>₹{d.amount.toLocaleString()}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--cyan)" }}>{d.utrCode}</td>
                        <td>{statusBadge(d.status)}</td>
                        <td style={{ color: "var(--text2)", fontSize: 12 }}>{d.createdAt}</td>
                        <td>
                          {d.status === "pending" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => updateStatus(d.id, "approved")} className="btn-success">✓ Approve</button>
                              <button onClick={() => updateStatus(d.id, "rejected")} className="btn-danger">✗ Reject</button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "var(--text2)" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
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
    
