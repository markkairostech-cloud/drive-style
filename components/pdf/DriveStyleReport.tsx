import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type Model = {
  name: string;
  why: string;
  msrp?: number;
  tags?: string[];
};

type DriveStyleReportProps = {
  customerName?: string;
  tier?: string;
  narrative?: {
    archetype?: string;
    identitySummary?: string;
    recommendationStory?: string;
  };
  advice: {
    intro: string;
    insights: { title: string; text: string }[];
    verdict?: string;
    models: Model[];
    closing?: string;
  };
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  cover: {
    backgroundColor: "#07111f",
    color: "#ffffff",
  },
  brand: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#67e8f9",
    marginBottom: 30,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    lineHeight: 1.15,
    marginBottom: 18,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#cbd5e1",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: "#0f172a",
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  card: {
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  modelName: {
    fontSize: 15,
    marginBottom: 8,
    color: "#0f172a",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  tag: {
    fontSize: 8,
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#ecfeff",
    color: "#155e75",
  },
  muted: {
    color: "#64748b",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#94a3b8",
  },
});

export default function DriveStyleReport({
  customerName,
  tier = "Drive Style",
  narrative,
  advice,
}: DriveStyleReportProps) {
  const topModel = advice.models?.[0];

  return (
    <Document>
      <Page size="A4" style={[styles.page, styles.cover]}>
        <Text style={styles.brand}>Drive Style</Text>

        <Text style={styles.title}>
          Your Personalised Vehicle Recommendation
        </Text>

        <Text style={styles.subtitle}>
          Prepared for {customerName || "Drive Style customer"}
        </Text>

        <Text style={styles.subtitle}>
          Package: {tier}
        </Text>

        <Text style={styles.footer}>
          Drive Style Vehicle Advisory Report
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Your Drive Style Profile</Text>

        <Text style={styles.paragraph}>
          {narrative?.archetype || "Personalised recommendation"}
        </Text>

        <Text style={styles.paragraph}>
          {narrative?.identitySummary || advice.intro}
        </Text>

        <Text style={styles.paragraph}>
          {narrative?.recommendationStory || advice.intro}
        </Text>

        <Text style={styles.sectionTitle}>Primary Recommendation</Text>

        {topModel ? (
          <View style={styles.card}>
            <Text style={styles.modelName}>{topModel.name}</Text>
            <Text style={styles.paragraph}>{topModel.why}</Text>

            {typeof topModel.msrp === "number" ? (
              <Text style={styles.paragraph}>
                Indicative price: R{topModel.msrp.toLocaleString("en-ZA")}
              </Text>
            ) : null}

            <View style={styles.tagRow}>
              {(topModel.tags || []).map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.footer}>
          Drive Style - Recommendation Summary
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Shortlist</Text>

        {(advice.models || []).map((model, index) => (
          <View key={model.name} style={styles.card}>
            <Text style={styles.modelName}>
              {index === 0 ? "Top Recommendation" : `Option ${index + 1}`}:{" "}
              {model.name}
            </Text>

            <Text style={styles.paragraph}>{model.why}</Text>

            <View style={styles.tagRow}>
              {(model.tags || []).map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footer}>
          Drive Style - Vehicle Shortlist
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Finance Considerations</Text>

        <Text style={styles.paragraph}>
          When financing a vehicle, compare more than the monthly repayment.
          Consider interest rate, balloon payments, contract length, deposit,
          insurance requirements, and total cost over the full term.
        </Text>

        <Text style={styles.paragraph}>
          A lower monthly payment can sometimes hide a more expensive deal if the
          term is longer or a large balloon payment is included.
        </Text>

        <Text style={styles.sectionTitle}>Insurance Considerations</Text>

        <Text style={styles.paragraph}>
          Insurance should be checked before committing to a vehicle. Premiums can
          differ significantly depending on the vehicle value, repair cost, theft
          risk, driver profile, location, and excess structure.
        </Text>

        <Text style={styles.sectionTitle}>Service Plans vs Maintenance Plans</Text>

        <Text style={styles.paragraph}>
          A service plan usually covers scheduled services only. A maintenance plan
          is broader and may include wear-and-tear items depending on the provider
          and policy wording.
        </Text>

        <Text style={styles.paragraph}>
          Always confirm what is included, what is excluded, when cover expires,
          and whether the plan is transferable.
        </Text>

        <Text style={styles.footer}>
          Drive Style - Ownership Guidance
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>New Owner Hints & Tips</Text>

        <Text style={styles.paragraph}>
          Before taking delivery, confirm spare keys, service history, tyre
          condition, licence status, warranty status, finance settlement where
          applicable, and whether all promised accessories are included.
        </Text>

        <Text style={styles.paragraph}>
          Keep a copy of all finance, insurance, warranty, service plan, and
          maintenance plan documents in one place.
        </Text>

        <Text style={styles.sectionTitle}>Drive Style Verdict</Text>

        <Text style={styles.paragraph}>
          {advice.verdict || "Your shortlist has been selected around real-world fit, ownership confidence, and long-term usability."}
        </Text>

        <Text style={styles.footer}>
          Drive Style - Final Recommendation
        </Text>
      </Page>
    </Document>
  );
}