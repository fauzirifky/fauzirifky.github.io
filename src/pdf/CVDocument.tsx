import { Document, Page, Text, View, Link, StyleSheet } from "@react-pdf/renderer";

type Props = { data: any };

const styles = StyleSheet.create({
  page: { flexDirection: "row", fontSize: 10, fontFamily: "Helvetica" },

  sidebar: { width: "32%", backgroundColor: "#0b2d4d", color: "#ffffff", padding: 18 },
  main: { width: "68%", padding: 18, backgroundColor: "#ffffff", color: "#111827" },

  name: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 10, opacity: 0.9, marginBottom: 10 },

  sectionH: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 8,
    opacity: 0.9,
  },

  itemTitle: { fontSize: 10, fontWeight: 700, marginBottom: 2 },
  itemMeta: { fontSize: 9, opacity: 0.9, marginBottom: 2 },

  linkDark: { color: "#9ae6ff", textDecoration: "none" },
  link: { color: "#0b4ea2", textDecoration: "none" },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    fontSize: 8.5,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  h1: { fontSize: 12, fontWeight: 700, marginBottom: 8 },
  p: { fontSize: 10, marginBottom: 6, lineHeight: 1.35 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 10 },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  bulletGlyph: { width: 10, fontSize: 10, lineHeight: 1.35 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.35 },
});

function normalizeUrl(url: string) {
  if (!url) return url;
  // react-pdf Link needs absolute-ish urls; keep mailto and https.
  if (url.startsWith("mailto:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // fallback: treat as https
  return `https://${url}`;
}

function Bullet({ children }: { children: any }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletGlyph}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function Sidebar({ data }: Props) {
  const { person, education, certifications, sidebarSkills } = data;

  return (
    <View style={styles.sidebar}>
      <Text style={styles.name}>{person.name}</Text>
      <Text style={styles.title}>{person.title}</Text>
      <Text style={styles.itemMeta}>{person.location}</Text>

      <Text style={styles.sectionH}>Links</Text>

      {/* Email */}
      {person.email ? (
        <Text style={styles.itemMeta}>
          <Link src={normalizeUrl(`mailto:${person.email}`)} style={styles.linkDark}>
            {person.email}
          </Link>
        </Text>
      ) : null}

      {/* Other links */}
      <Text style={styles.itemMeta}>
        <Link src={normalizeUrl(`https://orcid.org/${person.orcid}`)} style={styles.linkDark}>
          ORCID: {person.orcid}
        </Link>
      </Text>
      <Text style={styles.itemMeta}>
        <Link src={normalizeUrl(person.github.url)} style={styles.linkDark}>
          GitHub: {person.github.label}
        </Link>
      </Text>
      <Text style={styles.itemMeta}>
        <Link src={normalizeUrl(person.linkedin.url)} style={styles.linkDark}>
          LinkedIn: {person.linkedin.label}
        </Link>
      </Text>

            <Text style={styles.sectionH}>Education</Text>
      {[education[0], education[education.length - 1]].map((e: any) => (
        <View key={e.degree} style={{ marginBottom: 8 }}>
          <Text style={styles.itemTitle}>{e.degree}</Text>
          <Text style={styles.itemMeta}>{e.institution}</Text>
          <Text style={styles.itemMeta}>{e.year}</Text>
        </View>
      ))}

      <Text style={styles.sectionH}>Skills</Text>
      {sidebarSkills?.map((g: any) => (
        <View key={g.title} style={{ marginBottom: 10 }}>
          <Text style={styles.itemTitle}>{g.title}</Text>
          <View style={styles.chipRow}>
            {g.items.map((it: string) => (
              <Text key={it} style={styles.chip}>
                {it}
              </Text>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.sectionH}>Certifications</Text>
      {certifications.map((c: any) => (
        <View key={c.title} style={{ marginBottom: 8 }}>
          <Text style={styles.itemTitle}>{c.name}</Text>
          {/* <Text style={styles.itemMeta}>{c.issuer}</Text> */}
          <Text style={styles.itemMeta}>{c.date}</Text>
        </View>
      ))}
    </View>
  );
}

function Main({ data }: Props) {
  const { currentPosition, researchProducts, publications, grants, books, teaching, conferences } = data;

  const section = (title: string) => <Text style={styles.h1}>{title}</Text>;

  return (
    <View style={styles.main}>
      {section("Current Position")}
      <Text style={styles.p}>
        {currentPosition?.title} — {currentPosition?.department}, {currentPosition?.institution}
      </Text>

      <View style={styles.divider} />

      {section("Research Products")}
      {researchProducts?.map((p: any) => (
        <View key={p.name} style={{ marginBottom: 8 }}>
          <Text style={styles.itemTitle}>{p.name}</Text>
          <Text style={styles.p}>{p.description}</Text>
          {p.links?.map((l: any) => (
            <Text key={l.label} style={styles.itemMeta}>
              <Link src={normalizeUrl(l.url)} style={styles.link}>
                {l.label}
              </Link>
            </Text>
          ))}
        </View>
      ))}

      <View style={styles.divider} />

      {section("Publications")}
      {publications?.slice(0, 12).map((p: any) => (
        <Bullet key={p.title}>
          {p.authors}. “{p.title}.” {p.venue}{" "}
          <Link src={normalizeUrl(p.url)} style={styles.link}>
            [Link]
          </Link>
        </Bullet>
      ))}

      <View style={styles.divider} />

      {section("Grants & Funding")}
      {grants?.map((g: any) => (
        <Bullet key={g.title}>
          {g.title} — {g.role} ({g.year}), {g.amount}
        </Bullet>
      ))}

      <View style={styles.divider} />

      {section("Teaching")}
      {teaching?.map((t: any) => (
        <Bullet key={t.course}>
          {t.course} — {t.institution} {t.year ? `(${t.year})` : ""}
        </Bullet>
      ))}

      <View style={styles.divider} />

      {section("Books")}
      {books?.map((b: any) => (
        <Bullet key={b.title}>
          {b.authors}. {b.title}. {b.meta}
        </Bullet>
      ))}

      <View style={styles.divider} />

      {section("Conferences & Workshops")}
      {conferences?.map((c: any) => (
        <Bullet key={c.title}>
          {c.title} — {c.details}
        </Bullet>
      ))}
    </View>
  );
}

export default function CVDocument({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Sidebar data={data} />
        <Main data={data} />
      </Page>
    </Document>
  );
}
