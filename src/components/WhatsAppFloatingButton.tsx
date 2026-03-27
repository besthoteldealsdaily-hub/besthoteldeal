"use client";
import { useState, useEffect } from "react";

const WA_NUMBER = "971500000000";
const waLink = (msg: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

export default function WhatsAppFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setShowBadge(true), 8000);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* ── Popup Card ── */}
      <div
        style={{
          position: "fixed",
          bottom: "100px",
          right: "24px",
          zIndex: 9999,
          width: "300px",
          background: "linear-gradient(135deg, #030d1f 0%, #061429 100%)",
          border: "2px solid #d4a017",
          borderRadius: "24px",
          padding: "20px",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212,160,23,0.25)",
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0) translateY(40px)",
          opacity: isOpen ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transformOrigin: "bottom right",
          pointerEvents: isOpen ? "all" : "none",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* AI Sparkle Icon */}
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "rgba(212,160,23,0.15)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              ✨
            </div>
            <span style={{ color: "#d4a017", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              AI Deal Assistant
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              fontSize: "20px",
              lineHeight: 1,
              padding: "2px 6px",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <h3
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: 900,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          Claim Your{" "}
          <span style={{ color: "#d4a017" }}>Daily Deal</span>!
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "13px", margin: "0 0 18px", lineHeight: 1.6 }}>
          Assalam o Alaikum! 🕌 I&apos;ve found a special discount for your next hotel stay. Message us now to claim your exclusive rate — before it expires!
        </p>

        {/* CTA Button */}
        <a
          href={waLink("Assalam o Alaikum! I want to claim today's best hotel deal.")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            background: "#25D366",
            color: "#fff",
            fontWeight: 900,
            fontSize: "14px",
            padding: "14px",
            borderRadius: "16px",
            textDecoration: "none",
            boxSizing: "border-box",
            boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#128C7E")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#25D366")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.197.297-.768.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.15-.173.199-.297.298-.495.1-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.499-.669-.51-.173-.009-.372-.011-.571-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.569-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.117 1.531 5.845L.058 23.486a.5.5 0 0 0 .609.637l5.807-1.524A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-4.98-1.355l-.358-.213-3.447.905.919-3.352-.233-.375A9.817 9.817 0 0 1 2.182 12C2.182 6.571 6.571 2.182 12 2.182S21.818 6.571 21.818 12 17.429 21.818 12 21.818z"/>
          </svg>
          START CHAT &amp; CLAIM
        </a>

        {/* Social proof */}
        <p style={{ color: "#6b7280", fontSize: "10px", textAlign: "center", marginTop: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🔥 34 travelers claimed a deal today
        </p>
      </div>

      {/* ── Floating WhatsApp Button ── */}
      <div
        style={{
          position: "fixed",
          bottom: "28px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
      >
        {/* "Deal detected" badge — appears after 8s */}
        {showBadge && !isOpen && (
          <div
            style={{
              background: "#d4a017",
              color: "#030d1f",
              fontSize: "11px",
              fontWeight: 900,
              padding: "6px 14px",
              borderRadius: "20px",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(212,160,23,0.5)",
              animation: "wa-bounce 1s infinite",
              letterSpacing: "0.04em",
            }}
          >
            ⚡ DEAL DETECTED!
          </div>
        )}

        {/* Main green button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowBadge(false);
          }}
          aria-label="Open WhatsApp deal claim"
          style={{
            position: "relative",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: isOpen ? "#030d1f" : "#25D366",
            border: isOpen ? "2px solid #d4a017" : "2px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isOpen
              ? "0 4px 20px rgba(212,160,23,0.4)"
              : "0 4px 24px rgba(37,211,102,0.5)",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Red notification dot */}
          {showBadge && !isOpen && (
            <span
              style={{
                position: "absolute",
                top: "-3px",
                right: "-3px",
                width: "14px",
                height: "14px",
                background: "#ef4444",
                borderRadius: "50%",
                border: "2px solid white",
              }}
            />
          )}

          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#d4a017">
              <path d="M18 6L6 18M6 6l12 12" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.197.297-.768.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.15-.173.199-.297.298-.495.1-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.499-.669-.51-.173-.009-.372-.011-.571-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.569-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.117 1.531 5.845L.058 23.486a.5.5 0 0 0 .609.637l5.807-1.524A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-4.98-1.355l-.358-.213-3.447.905.919-3.352-.233-.375A9.817 9.817 0 0 1 2.182 12C2.182 6.571 6.571 2.182 12 2.182S21.818 6.571 21.818 12 17.429 21.818 12 21.818z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Bounce animation keyframe */}
      <style>{`
        @keyframes wa-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
