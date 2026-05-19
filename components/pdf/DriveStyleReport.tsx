import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

type ScoreSet = {
  premiumFeel?: number;
  driverAppeal?: number;
  comfort?: number;
};

type Model = {
  name: string;
  why: string;
  msrp?: number;
  tags?: string[];
  imageUrl?: string;
  strengths?: string[];
  watchOuts?: string[];
  scores?: ScoreSet;
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

const BRAND_URL = "www.drive-style.co.za";
const SITE_URL = "https://drive-style.co.za";

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
    marginBottom: 28,
    textTransform: "uppercase",
  },
  coverTitle: {
    fontSize: 31,
    lineHeight: 1.12,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 12,
    lineHeight: 1.55,
    color: "#cbd5e1",
    marginBottom: 4,
  },
  heroCard: {
    marginTop: 24,
    border: "1px solid #334155",
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#0f172a",
  },
  heroImage: {
    width: "100%",
    height: 190,
    borderRadius: 14,
    marginBottom: 14,
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: "#111827",
    border: "1px solid #334155",
    padding: 18,
  },
  placeholderText: {
    color: "#94a3b8",
    fontSize: 10,
    lineHeight: 1.5,
  },
  coverLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#67e8f9",
    textTransform: "uppercase",
    marginBottom: 7,
  },
  coverValue: {
    fontSize: 19,
    color: "#ffffff",
    marginBottom: 8,
  },
  verdictBox: {
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#ecfeff",
  },
  verdictText: {
    fontSize: 10,
    lineHeight: 1.55,
    color: "#164e63",
  },
  scoreRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  scorePill: {
    flex: 1,
    marginRight: 8,
    borderRadius: 999,
    padding: 8,
    backgroundColor: "#0e7490",
  },
  scoreLabel: {
    fontSize: 7,
    color: "#cffafe",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  scoreValue: {
    fontSize: 13,
    color: "#ffffff",
  },
  sectionKicker: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: "#0891b2",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 21,
    marginBottom: 14,
    color: "#0f172a",
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.65,
    marginBottom: 10,
  },
  muted: {
    color: "#64748b",
  },
  dnaCard: {
    border: "1px solid #d1d5db",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f8fafc",
  },
  dnaTitle: {
    fontSize: 15,
    marginBottom: 8,
    color: "#0f172a",
  },
  insightGrid: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 14,
  },
  insightCard: {
    flex: 1,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#ffffff",
    marginRight: 8,
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
  recommendationCard: {
    border: "1px solid #67e8f9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f0fdfa",
  },
  modelName: {
    fontSize: 17,
    marginBottom: 8,
    color: "#0f172a",
  },
  altCard: {
    border: "1px solid #d1d5db",
    borderRadius: 14,
    padding: 13,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  altImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    objectFit: "cover",
  },
  price: {
    fontSize: 10,
    color: "#334155",
    marginTop: 8,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    fontSize: 8,
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#ecfeff",
    color: "#155e75",
    marginRight: 6,
    marginBottom: 6,
  },
  twoColumnRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  miniTitle: {
    fontSize: 11,
    color: "#0f172a",
    marginBottom: 7,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.55,
    marginBottom: 5,
    color: "#334155",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    fontSize: 9,
    color: "#94a3b8",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 9,
    color: "#94a3b8",
  },
});

function formatPrice(value?: number) {
  if (typeof value !== "number") return null;
  return `R${value.toLocaleString("en-ZA")}`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function imageSrc(src?: string) {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  if (src.startsWith("/")) return `${SITE_URL}${src}`;
  return `${SITE_URL}/${src}`;
}

function scoreValue(value?: number) {
  if (typeof value !== "number") return "8/10";
  return `${value}/10`;
}

function ReportFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Prepared by Drive Style</Text>
      <Text style={styles.footerText}>{BRAND_URL}</Text>
    </View>
  );
}

function ScorePill({ label, value }: { label: string; value?: number }) {
  return (
    <View style={styles.scorePill}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{scoreValue(value)}</Text>
    </View>
  );
}

function TagRow({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;

  return (
    <View style={styles.tagRow}>
      {tags.map((tag) => (
        <Text key={tag} style={styles.tag}>
          {tag}
        </Text>
      ))}
    </View>
  );
}

function BulletList({
  items,
  fallback,
}: {
  items?: string[];
  fallback: string[];
}) {
  const list = items?.length ? items : fallback;

  return (
    <>
      {list.map((item) => (
        <Text key={item} style={styles.bullet}>
          • {item}
        </Text>
      ))}
    </>
  );
}

export default function DriveStyleReport({
  customerName,
  tier = "Drive Style",
  narrative,
  advice,
}: DriveStyleReportProps) {
  const topModel = advice.models?.[0];
  const alternatives = advice.models?.slice(1, 4) || [];
  const topImage = imageSrc(topModel?.imageUrl);

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
        <Text style={styles.coverSubtitle}>Date: {formatDate()}</Text>

        <View style={styles.heroCard}>
          {topImage ? (
            <Image src={topImage} style={styles.heroImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>
                Vehicle image will appear here once an imageUrl is supplied for
                this recommendation.
              </Text>
            </View>
          )}

          <Text style={styles.coverLabel}>Top Recommendation</Text>
          <Text style={styles.coverValue}>
            {topModel?.name || "Your shortlist is included inside"}
          </Text>

          <View style={styles.verdictBox}>
            <Text style={styles.verdictText}>
              {advice.verdict ||
                "Your recommendation has been selected around real-world fit, ownership confidence, comfort, lifestyle suitability and long-term enjoyment."}
            </Text>
          </View>

          <View style={styles.scoreRow}>
            <ScorePill
              label="Premium Feel"
              value={topModel?.scores?.premiumFeel}
            />
            <ScorePill
              label="Driver Appeal"
              value={topModel?.scores?.driverAppeal}
            />
            <ScorePill label="Comfort" value={topModel?.scores?.comfort} />
          </View>
        </View>

        <ReportFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionKicker}>Your Drive DNA</Text>
        <Text style={styles.sectionTitle}>
          {narrative?.archetype || "Personalised Vehicle Profile"}
        </Text>

        <View style={styles.dnaCard}>
          <Text style={styles.dnaTitle}>What your answers suggest</Text>
          <Text style={styles.paragraph}>
            {narrative?.identitySummary ||
              advice.intro ||
              "Your answers suggest that the right vehicle needs to balance emotional appeal with practical day-to-day confidence."}
          </Text>
          <Text style={styles.paragraph}>
            {narrative?.recommendationStory ||
              "The best match is not simply the most expensive, fastest or newest option. It is the vehicle that fits your lifestyle, feels right on normal roads, supports your daily routine, and still feels special after the first few months of ownership."}
          </Text>
        </View>

        <Text style={styles.sectionKicker}>Decision Themes</Text>
        <Text style={styles.sectionTitle}>What mattered most</Text>

        <View style={styles.insightGrid}>
          {(advice.insights || []).slice(0, 3).map((insight) => (
            <View key={insight.title} style={styles.insightCard}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.paragraph}>
          Drive Style looks beyond badge appeal alone. The recommendation is
          shaped around fit, ownership confidence, comfort, running costs,
          lifestyle use, and whether the vehicle suits how you actually intend
          to use it.
        </Text>

        <ReportFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionKicker}>Primary Recommendation</Text>
        <Text style={styles.sectionTitle}>Why this recommendation fits</Text>

        {topModel ? (
          <View style={styles.recommendationCard}>
            {topImage ? (
              <Image src={topImage} style={styles.heroImage} />
            ) : null}

            <Text style={styles.modelName}>{topModel.name}</Text>
            <Text style={styles.paragraph}>{topModel.why}</Text>

            {formatPrice(topModel.msrp) ? (
              <Text style={styles.price}>
                Indicative pricing: {formatPrice(topModel.msrp)}
              </Text>
            ) : (
              <Text style={styles.price}>
                Indicative pricing: Confirm latest market pricing before
                purchase.
              </Text>
            )}

            <TagRow tags={topModel.tags} />

            <View style={styles.divider} />

            <View style={styles.twoColumnRow}>
              <View style={styles.column}>
                <Text style={styles.miniTitle}>Strengths</Text>
                <BulletList
                  items={topModel.strengths}
                  fallback={[
                    "Strong overall fit for your stated priorities.",
                    "Balanced mix of comfort, presence and usability.",
                    "Well suited to everyday ownership rather than only showroom appeal.",
                  ]}
                />
              </View>

              <View style={styles.column}>
                <Text style={styles.miniTitle}>Watch-outs</Text>
                <BulletList
                  items={topModel.watchOuts}
                  fallback={[
                    "Confirm service, warranty and maintenance-plan status.",
                    "Check insurance cost before committing.",
                    "Compare total finance cost, not only monthly repayment.",
                  ]}
                />
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.paragraph}>
            Your primary recommendation is shown in your online results.
          </Text>
        )}

        <Text style={styles.paragraph}>
          Before committing, validate the specific vehicle condition, service
          history, accident history, finance structure, warranty position and
          insurance premium.
        </Text>

        <ReportFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionKicker}>Alternative Recommendations</Text>
        <Text style={styles.sectionTitle}>Shortlist options</Text>

        {alternatives.length ? (
          alternatives.map((model, index) => {
            const src = imageSrc(model.imageUrl);

            return (
              <View key={model.name} style={styles.altCard}>
                {src ? <Image src={src} style={styles.altImage} /> : null}

                <Text style={styles.modelName}>
                  Option {index + 2}: {model.name}
                </Text>

                <Text style={styles.paragraph}>{model.why}</Text>

                {formatPrice(model.msrp) ? (
                  <Text style={styles.price}>
                    Indicative pricing: {formatPrice(model.msrp)}
                  </Text>
                ) : null}

                <TagRow tags={model.tags} />
              </View>
            );
          })
        ) : (
          <View style={styles.altCard}>
            <Text style={styles.modelName}>No alternatives supplied</Text>
            <Text style={styles.paragraph}>
              Your current recommendation data only includes one primary model.
              Add more models to the recommendation engine to populate this
              section.
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionKicker}>Final View</Text>
        <Text style={styles.sectionTitle}>Drive Style Verdict</Text>

        <Text style={styles.paragraph}>
          {advice.closing ||
            "Use this report as a decision guide before committing to finance, insurance, dealer conversations or final purchase paperwork."}
        </Text>

        <ReportFooter />
      </Page>
    </Document>
  );
}