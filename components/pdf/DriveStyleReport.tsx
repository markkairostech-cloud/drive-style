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
    padding: 42,
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
    fontSize: 13,
    letterSpacing: 3,
    color: "#67e8f9",
    marginBottom: 42,
    textTransform: "uppercase",
  },
  coverTitle: {
    fontSize: 34,
    lineHeight: 1.12,
    marginBottom: 18,
  },
  coverSubtitle: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#cbd5e1",
    marginBottom: 12,
  },
  coverBox: {
    marginTop: 44,
    border: "1px solid #334155",
    borderRadius: 14,
    padding: 18,
  },
  coverLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#67e8f9",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  coverValue: {
    fontSize: 20,
    color: "#ffffff",
  },
  sectionTitle: {
    fontSize: 19,
    marginBottom: 14,
    color: "#0f172a",
  },
  sectionKicker: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: "#0891b2",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.65,
    marginBottom: 10,
  },
  muted: {
    color: "#64748b",
  },
  card: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: 15,
    marginBottom: 14,
  },
  highlightCard: {
    border: "1px solid #67e8f9",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f0fdfa",
  },
  modelName: {
    fontSize: 16,
    marginBottom: 8,
    color: "#0f172a",
  },
  price: {
    fontSize: 10,
    color: "#334155",
    marginTop: 8,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tag: {
    fontSize: 8,
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#ecfeff",
    color: "#155e75",
  },
  insightGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 14,
  },
  insightCard: {
    flex: 1,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#f8fafc",
  },
  insightTitle: {
    fontSize: 10,
    color: "#0f172a",
    marginBottom: 6,
  },
  insightText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#475569",
  },
  checklistItem: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 7,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    fontSize: 9,
    color: "#94a3b8",
  },
});

function formatPrice(value?: number) {
  if (typeof value !== "number") return null;
  return `R${value.toLocaleString("en-ZA")}`;
}

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

        <Text style={styles.coverTitle}>
          Your Personalised Vehicle Advisory Report
        </Text>

        <Text style={styles.coverSubtitle}>
          Prepared for {customerName || "Drive Style customer"}
        </Text>

        <Text style={styles.coverSubtitle}>Package: {tier}</Text>

        <View style={styles.coverBox}>
          <Text style={styles.coverLabel}>Drive Style Profile</Text>
          <Text style={styles.coverValue}>
            {narrative?.archetype || "Personalised Recommendation"}
          </Text>
        </View>

        <View style={styles.coverBox}>
          <Text style={styles.coverLabel}>Primary Recommendation</Text>
          <Text style={styles.coverValue}>
            {topModel?.name || "Your shortlist is included inside"}
          </Text>
        </View>

        <Text style={styles.footer}>
          Drive Style Vehicle Advisory Report
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionKicker}>Profile</Text>
        <Text style={styles.sectionTitle}>Your Drive Style Profile</Text>

        <Text style={styles.paragraph}>
          {narrative?.identitySummary || advice.intro}
        </Text>

        <Text style={styles.paragraph}>
          {narrative?.recommendationStory || advice.intro}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionKicker}>Recommendation Logic</Text>
        <Text style={styles.sectionTitle}>Why These Vehicles Were Selected</Text>

        <Text style={styles.paragraph}>{advice.intro}</Text>

        <View style={styles.insightGrid}>
          {(advice.insights || []).map((insight) => (
            <View key={insight.title} style={styles.insightCard}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Drive Style - Customer Profile
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionKicker}>Top Pick</Text>
        <Text style={styles.sectionTitle}>Primary Recommendation</Text>

        {topModel ? (
          <View style={styles.highlightCard}>
            <Text style={styles.modelName}>{topModel.name}</Text>

            <Text style={styles.paragraph}>{topModel.why}</Text>

            {formatPrice(topModel.msrp) ? (
              <Text style={styles.price}>
                Indicative price: {formatPrice(topModel.msrp)}
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
        ) : (
          <Text style={styles.paragraph}>
            Your primary recommendation is shown in your online results.
          </Text>
        )}

        <Text style={styles.sectionKicker}>Alternatives</Text>
        <Text style={styles.sectionTitle}>Shortlist Options</Text>

        {(advice.models || []).map((model, index) => (
          <View key={model.name} style={styles.card}>
            <Text style={styles.modelName}>
              {index === 0 ? "Top Recommendation" : `Option ${index + 1}`}:{" "}
              {model.name}
            </Text>

            <Text style={styles.paragraph}>{model.why}</Text>

            {formatPrice(model.msrp) ? (
              <Text style={styles.price}>
                Indicative price: {formatPrice(model.msrp)}
              </Text>
            ) : null}

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
        <Text style={styles.sectionKicker}>Ownership</Text>
        <Text style={styles.sectionTitle}>Finance Considerations</Text>

        <Text style={styles.paragraph}>
          When financing a vehicle, compare more than the monthly repayment.
          Consider the interest rate, deposit, balloon payment, contract term,
          initiation fees, monthly service fees and total cost over the full term.
        </Text>

        <Text style={styles.paragraph}>
          A lower monthly repayment can sometimes hide a more expensive deal if
          the term is longer or if a large balloon payment remains at the end.
        </Text>

        <Text style={styles.paragraph}>
          Before signing, ask the finance provider for the total repayment amount
          over the full agreement, not only the monthly instalment.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Insurance Considerations</Text>

        <Text style={styles.paragraph}>
          Insurance should be checked before committing to the vehicle. Premiums
          can vary based on vehicle value, repair cost, theft risk, driver
          profile, location, excess structure and tracking requirements.
        </Text>

        <Text style={styles.paragraph}>
          Compare at least two insurers and confirm whether the quote includes
          comprehensive cover, excesses, roadside assistance, windscreen cover and
          credit shortfall cover if financed.
        </Text>

        <Text style={styles.footer}>
          Drive Style - Finance and Insurance
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionKicker}>Plans</Text>
        <Text style={styles.sectionTitle}>Service Plans vs Maintenance Plans</Text>

        <Text style={styles.paragraph}>
          A service plan usually covers scheduled services at the manufacturer’s
          required intervals. It does not automatically mean all repairs are
          covered.
        </Text>

        <Text style={styles.paragraph}>
          A maintenance plan is broader and may include selected wear-and-tear
          items, depending on the provider and policy wording.
        </Text>

        <Text style={styles.paragraph}>
          Always confirm what is included, what is excluded, when the plan
          expires, whether it is transferable, and whether claims must be handled
          through specific dealerships or repair networks.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>New Owner Hints & Tips</Text>

        <Text style={styles.checklistItem}>
          • Confirm spare keys, service history and licence status before payment.
        </Text>

        <Text style={styles.checklistItem}>
          • Check tyre condition, accident history and whether all accessories are included.
        </Text>

        <Text style={styles.checklistItem}>
          • Keep finance, insurance, warranty and plan documents together.
        </Text>

        <Text style={styles.checklistItem}>
          • Confirm whether the warranty, service plan or maintenance plan transfers to you.
        </Text>

        <Text style={styles.checklistItem}>
          • Avoid rushing final paperwork if finance, insurance or inspection details are unclear.
        </Text>

        <Text style={styles.footer}>
          Drive Style - Ownership Preparation
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionKicker}>Final View</Text>
        <Text style={styles.sectionTitle}>Drive Style Verdict</Text>

        <Text style={styles.paragraph}>
          {advice.verdict ||
            "Your shortlist has been selected around real-world fit, ownership confidence, and long-term usability."}
        </Text>

        <Text style={styles.paragraph}>
          The best vehicle decision is not simply the most exciting option on
          paper. It is the one that still feels right after the first few months,
          once daily use, running costs, comfort and ownership responsibility
          become real.
        </Text>

        <Text style={styles.paragraph}>
          Use this report as a decision guide before committing to finance,
          insurance, dealer conversations or final purchase paperwork.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Next Step</Text>

        <Text style={styles.paragraph}>
          If you selected Gold or Platinum, a Drive Style vehicle specialist will
          use this report as the basis for your follow-up conversation.
        </Text>

        <Text style={styles.footer}>
          Drive Style - Final Recommendation
        </Text>
      </Page>
    </Document>
  );
}