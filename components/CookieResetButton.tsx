"use client";

export default function CookieResetButton() {
  function handleReset() {
    localStorage.removeItem("cookie_consent");
    window.location.reload();
  }

  return (
    <button
      onClick={handleReset}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        color: "rgba(255,255,255,.85)",
        display: "block",
        margin: "6px 0",
        textAlign: "left",
      }}
    >
      Gestionar cookies
    </button>
  );
}
