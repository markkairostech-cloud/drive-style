"use client";

export default function RouteTestButton() {
  return (
    <button
      onClick={async () => {
        const res = await fetch("/api/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // honeypot empty (human)
            company: "",

            // contact
            name: "Route Test",
            email: "route@test.com",
            phone: "000",

            // answers
            urgency: "Planning ahead",
            trigger: "First proper car",
            weekdayDrive: "Mixed roads",
            parking: "Normal effort",
            passengers: "Me +1",
            afterLongDay: "Silence and comfort",
            twoYears: "Still reliable",

            trade_space_vs_parking: "Easier parking",
            trade_performance_vs_economy: "Economy",
            trade_new_vs_spec: "Newer car",
            trade_badge_vs_reliability: "Reliability",
            trade_tech_vs_simple: "Simple & dependable",

            budgetBand: "Mid",
            newVsUsed: "Nearly new",
            niceToHaves: ["Fuel economy", "Driver assists"],
            notes: "Test submission from button",
          }),
        });

        const text = await res.text();
        alert(`Route test: ${res.status}\n${text}`);
      }}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.08)",
        color: "white",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      Send Route Finder test
    </button>
  );
}
