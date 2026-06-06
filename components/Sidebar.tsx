"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard",   icon: "▦",  label: "Dashboard" },
  { href: "/users",       icon: "◈",  label: "Users" },
  { href: "/deposits",    icon: "↓",  label: "Deposits" },
  { href: "/withdraw", icon: "↑", label: "Withdrawals" ,
  { href: "/results",     icon: "◉",  label: "Game Results" },
  { href: "/aviator",     icon: "✈",  label: "Aviator" },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("adminToken");
    router.push("/");
  };

  return (
    <div className="sidebar">
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "var(--indigo2)", letterSpacing: 3, marginBottom: 4 }}>
          WINGO ROYAL
        </div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>
          Admin Console v1.0
        </div>
      </div>

      <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="live-dot" />
        <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, letterSpacing: 1 }}>SYSTEM ONLINE</span>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {navItems.map(item => {
          const active = path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 10, marginBottom: 3,
                background: active ? "rgba(99,102,241,0.12)" : "transparent",
                border: `1px solid ${active ? "rgba(99,102,241,0.35)" : "transparent"}`,
                color: active ? "var(--indigo2)" : "var(--text2)",
                fontWeight: active ? 700 : 500,
                fontSize: 14, transition: "all 0.15s", cursor: "pointer",
              }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15 }}>{item.icon}</span>
                {item.label}
                {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "var(--indigo)" }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "14px 10px", borderTop: "1px solid var(--border)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", marginBottom: 8,
          background: "var(--bg3)", borderRadius: 10, border: "1px solid var(--border)"
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--indigo), var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff"
          }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Admin</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>Super Admin</div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: "100%", padding: "9px", borderRadius: 8,
          background: "transparent", border: "1px solid rgba(248,113,113,0.25)",
          color: "var(--red)", fontSize: 12, fontWeight: 700, cursor: "pointer"
        }}>
          ↩ Logout
        </button>
      </div>
    </div>
  );
}
