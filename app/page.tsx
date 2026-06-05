"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = "https://wingo-backend-gtqa.onrender.com";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!username || !password) return setError("Fill all fields");
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API}/api/admin/login`, { username, password });
      if (res.data?.success) {
        localStorage.setItem("adminToken", res.data.token);
        router.push("/dashboard");
      } else {
        setError(res.data?.error || "Invalid credentials");
      }
    } catch {
      // fallback for dev — accept admin/admin123
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("adminToken", "dev-token");
        router.push("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden"
    }}>
      {/* BG grid */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(var(--indigo) 1px, transparent 1px), linear-gradient(90deg, var(--indigo) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div className="fade-up" style={{
        width: "100%", maxWidth: 400, padding: "0 24px"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "linear-gradient(135deg, var(--indigo), var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 26
          }}>⬡</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--indigo2)", letterSpacing: 4, marginBottom: 8 }}>
            WINGO ROYAL
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Admin Console</h1>
          <p style={{ fontSize: 13, color: "var(--text2)" }}>Secure access only</p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "28px 24px"
        }}>
          {error && (
            <div style={{
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              fontSize: 13, color: "var(--red)"
            }}>⚠ {error}</div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>
              Username
            </label>
            <input
              className="admin-input" style={{ width: "100%" }}
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              className="admin-input" style={{ width: "100%" }}
              type="password" placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
            />
          </div>

          <button onClick={login} disabled={loading} className="btn-primary" style={{ width: "100%", padding: "12px" }}>
            {loading ? "Authenticating..." : "Access Dashboard →"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 20 }}>
          Unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}
