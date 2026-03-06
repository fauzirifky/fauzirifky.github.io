import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 700, color: "#0b2d4d" },
  meta: { marginTop: 6, lineHeight: 1.35 },
  sectionTitle: { marginTop: 10, marginBottom: 4, fontSize: 12, fontWeight: 700, color: "#0b2d4d" },
  itemTitle: { fontSize: 10, fontWeight: 700 },
  muted: { color: "#475569" },
  link: { color: "#0b4ea2" },
  bullet: { flexDirection: "row", gap: 6, marginBottom: 2 },
  bulletDot: { width: 10 },
  photo: { width: 96, height: 128, objectFit: "cover", borderRadius: 6 }
});
