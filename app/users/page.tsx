"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

const API = "https://wingo-backend-gtqa.onrender.com";

const MOCK_USERS = [
  { id: 1, mobile: "9876543210", balance: 1500, status: "active",  totalBets: 42, totalDeposit: 5000,  createdAt: "2025-01-10" },
  { id: 2, mobile: "9823411234", balance: 250,  status: "active",  totalBets: 12, totalDeposit: 1000,  createdAt: "2025-01-15" },
  { id: 3, mobile: "9712309876", balance: 0,    status: "banned",  totalBets: 3,  totalDeposit: 500,   createdAt: "2025-01-20" },
  { id: 4, mobile: "9654321098", balance: 8200, status: "active",  totalBets: 198,totalDeposit: 25000, createdAt: "2025-02-01" },
  { id: 5, mobile: "9543210987", balance: 100,  status: "active",  totalBets: 5,  totalDeposit: 200,   createdAt: "2025-02-10" },
  { id: 6, mobile: "9432109876", balance: 3400, status: "active",  totalBets: 87, totalDeposit: 12000, createdAt: "2025-02-18" },
  { id: 7, mobile: "9321098765", balance: 50,   status: "inactive",totalBets: 1,  totalDeposit: 100,   createdAt: "2025-03-01" },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { router.push("/"); return; }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search) return setFiltered(users);
    setFiltered(users.filter(u => u.mobile.includes(search) || String(u.id).includes(search)));
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.users) { setUsers(res.data.users); setFiltered(res.data.users); }
      else { setUsers(MOCK_USERS); setFiltered(MOCK_USERS); }
    } catch { setUsers(MOCK_USERS); setFiltered(MOCK_USERS); }
    finally { setLoading(false); }
  };

  const toggleBan = async (user: any) => {
    const action = user.status === "banned" ? "unban" : "ban";
    if (!confirm(`${action === "ban" ? "Ban" : "Unban"} user ****${user.mobile.slice(-4)}?`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`${API}/api/admin/users/${user.id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch {}
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: action === "ban" ? "banned" : "active" } : u));
  };

  const adjustBalance = async (user: any) => {
    const amt = prompt(`Adjust balance for ****${user.mobile.slice(-4)}\nCurrent: ₹${user.balance}\nEnter amount (+500 or -200):`);
    if (!amt || isNaN(Number(amt))) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`${API}/api/admin/users/${user.id}/balance`, { amount: Number(amt) }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {}
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, balance: u.balance + Number(amt) } : u));
    alert(`Balance updated!`);
  };

  const statusBadge = (s: string) => {
    const map: any = { active: "badge-green", banned: "badge-red", inactive: "badge-amber" };
    return <span className={`badge ${map[s] || "badge-indigo"}`}>{s}</span>;
  };

  const mask = (m: string) => m?.slice(0, 3) + "****" + m?.slice(-3);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Users</div>
            <div style={{ fontSize: 11, color: "var(--text2)" }}>{users.length} total registered users</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="admin-input"
              placeholder="Search by phone or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
            <button onClick={fetchUsers} className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }}>↻ Refresh</button>
          </div>
        </div>

        <div className="page-body fade-up">
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Total Users",   value: users.length,                              color: "var(--indigo2)" },
              { label: "Active",        value: users.filter(u => u.status === "active").length,  color: "var(--green)" },
              { label: "Banned",        value: users.filter(u => u.status === "banned").length, color: "var(--red)" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="data-card">
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 700 }}>
              All Users ({filtered.length})
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>Loading users...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Phone</th><th>Balance</th><th>Total Deposit</th>
                      <th>Total Bets</th><th>Joined</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontFamily: "'DM Mono',monospace", color: "var(--text2)" }}>#{u.id}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace" }}>{mask(u.mobile)}</td>
                        <td style={{ fontFamily: "'Space Mono',monospace", color: "var(--amber)", fontWeight: 700 }}>₹{u.balance?.toLocaleString()}</td>
                        <td style={{ color: "var(--green)" }}>₹{u.totalDeposit?.toLocaleString()}</td>
                        <td style={{ color: "var(--cyan)" }}>{u.totalBets}</td>
                        <td style={{ color: "var(--text2)", fontSize: 12 }}>{u.createdAt}</td>
                        <td>{statusBadge(u.status)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => adjustBalance(u)} className="btn-success">₹ Edit</button>
                            <button onClick={() => toggleBan(u)} className="btn-danger">
                              {u.status === "banned" ? "Unban" : "Ban"}
                            </button>
                          </div>
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
