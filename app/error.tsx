"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Something went wrong</h2>
      <p style={{ opacity: 0.8, marginTop: 8 }}>{error?.message}</p>
      <button
        onClick={() => reset()}
        style={{
          marginTop: 16,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        Try again
      </button>
    </div>
  );
}