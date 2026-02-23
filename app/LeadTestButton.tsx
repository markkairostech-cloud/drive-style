"use client";

export default function LeadTestButton() {
  return (
    <button
      onClick={async () => {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            phone: "0123456789",
            budget: "300k",
            message: "Test from button",
            source: "test_button",
          }),
        });

        const text = await res.text();
        alert(`Result: ${res.status}\n${text}`);
      }}
      style={{
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid #ccc",
      }}
    >
      Send test lead
    </button>
  );
}