"use client";

import { useState } from "react";

export default function PayfastTestPage() {
  const [result, setResult] = useState<string>("");

  async function runTest() {
    setResult("Sending request...");

    try {
      const res = await fetch("/api/engagement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: "Silver",
          amount: "10.00",
          m_payment_id: "test_payment_001",
          name: "Test User",
          email: "test@example.com",
          phone: "0820000000",
          source: "manual_test",
        }),
      });

      const text = await res.text();

      setResult(
        JSON.stringify(
          {
            status: res.status,
            body: text,
          },
          null,
          2
        )
      );
    } catch (err: any) {
      setResult(err?.message || "Unknown error");
    }
  }

  return (
    <main style={{ padding: "40px", fontFamily: "monospace" }}>
      <h1>PayFast / Engagement Test</h1>

      <button
        onClick={runTest}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
        }}
      >
        Run Engagement Test
      </button>

      <pre
        style={{
          marginTop: "30px",
          background: "#111",
          color: "#0f0",
          padding: "20px",
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
        }}
      >
        {result}
      </pre>
    </main>
  );
}