import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import dummyConfigJson from "../data/obe/obe-simulator-dummy.json";
import magisterFisikaConfigJson from "../data/obe/magister-fisika-itera.json";
import fisikaConfigJson from "../data/obe/fisika-itera-2025-2029.json";
import matematikaConfigJson from "../data/obe/matematika-itera-2025-2029.json";
import teknikLingkunganConfigJson from "../data/obe/teknik-lingkungan-itera-2025-2029.json";
import {
  activeEnrollments,
  courseMap,
  cpmksForStudent,
  resolveCpmkWeight,
  downloadJson,
  generateCohort,
  generateStudent,
  getCourse,
  getTrack,
  parseObeConfig,
  programMaxCreditsPerSemester,
  programMaxCreditsForSemester,
  semesterCredits,
  studentTotalCredits,
  studentWeightCoverage,
  validateConfig,
  type CourseCategory,
  type CpmkMapping,
  type ObeProgramConfig,
  type SimStudent,
} from "../lib/obeSimulator";
import "../styles/obe-simulator.css";

const BASE_PATH = "/research-products/obe-simulator";
const MAGISTER_FISIKA_PATH = `${BASE_PATH}/magister-fisika`;
const FISIKA_PATH = `${BASE_PATH}/fisika`;
const MATEMATIKA_PATH = `${BASE_PATH}/matematika`;
const TEKNIK_LINGKUNGAN_PATH = `${BASE_PATH}/teknik-lingkungan`;
const STORAGE_KEY = "obe-simulator-program-v2";
const ROOT_STORAGE_KEY = "obe-simulator-root-dummy-v1";

type PageKey = "simulator" | "program" | "settings";
type ViewMode = "student" | "all" | `track:${string}`;
type PresetKey = "magister-fisika" | "fisika" | "matematika" | "teknik-lingkungan" | null;

type GraphEdge = {
  mapping: CpmkMapping;
  count: number;
  studentIds: string[];
};

function cleanPath(pathname: string) {
  return pathname.replace(/\/index\.html$/i, "").replace(/\/+$/, "") || "/";
}

function routeContext(pathname: string) {
  const path = cleanPath(pathname);
  let preset: PresetKey = null;
  let routeBase = BASE_PATH;

  if (path === MAGISTER_FISIKA_PATH || path.startsWith(`${MAGISTER_FISIKA_PATH}/`)) {
    preset = "magister-fisika";
    routeBase = MAGISTER_FISIKA_PATH;
  } else if (path === FISIKA_PATH || path.startsWith(`${FISIKA_PATH}/`)) {
    preset = "fisika";
    routeBase = FISIKA_PATH;
  } else if (path === MATEMATIKA_PATH || path.startsWith(`${MATEMATIKA_PATH}/`)) {
    preset = "matematika";
    routeBase = MATEMATIKA_PATH;
  } else if (path === TEKNIK_LINGKUNGAN_PATH || path.startsWith(`${TEKNIK_LINGKUNGAN_PATH}/`)) {
    preset = "teknik-lingkungan";
    routeBase = TEKNIK_LINGKUNGAN_PATH;
  }

  const suffix = path.slice(routeBase.length).replace(/^\/+/, "");
  const page: PageKey = suffix === "program" ? "program" : suffix === "settings" ? "settings" : "simulator";
  return { page, preset, routeBase };
}

function pageHref(page: PageKey, routeBase: string) {
  if (page === "simulator") return routeBase;
  return `${routeBase}/${page}`;
}

function storageKeyFor(preset: PresetKey) {
  return preset ? `${STORAGE_KEY}:${preset}` : ROOT_STORAGE_KEY;
}

function bundledConfig(preset: PresetKey): ObeProgramConfig {
  if (preset === "magister-fisika") return magisterFisikaConfigJson as ObeProgramConfig;
  if (preset === "fisika") return fisikaConfigJson as ObeProgramConfig;
  if (preset === "matematika") return matematikaConfigJson as ObeProgramConfig;
  if (preset === "teknik-lingkungan") return teknikLingkunganConfigJson as ObeProgramConfig;
  return dummyConfigJson as ObeProgramConfig;
}

function readInitialConfig(preset: PresetKey): ObeProgramConfig {
  try {
    const stored = window.localStorage.getItem(storageKeyFor(preset));
    if (stored) return parseObeConfig(stored);
  } catch {
    // Use bundled configuration.
  }
  return bundledConfig(preset);
}

function initialCounts(config: ObeProgramConfig) {
  return Object.fromEntries(config.tracks.map((track) => [track.id, track.defaultStudentCount ?? 4]));
}

function categoryLabel(category: CourseCategory) {
  if (category === "required") return "Wajib";
  if (category === "required_choice") return "Wajib pilih";
  return "Pilihan";
}

function categoryClass(category: CourseCategory) {
  if (category === "required_choice") return "obeTag obeTag--choice";
  if (category === "elective") return "obeTag obeTag--elective";
  return "obeTag";
}

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: digits }).format(value);
}

function SimulatorShell({ config, page, routeBase, children }: { config: ObeProgramConfig; page: PageKey; routeBase: string; children: ReactNode }) {
  const navigation: Array<{ key: PageKey; label: string; short: string }> = [
    { key: "simulator", label: "Simulator", short: "SIM" },
    { key: "program", label: "Struktur Program", short: "STR" },
    { key: "settings", label: "JSON & Pengaturan", short: "JSON" },
  ];

  return (
    <div className="obePortal">
      <aside className="obeSidebar">
        <Link className="obeBrand" to={routeBase}>
          <span className="obeBrand__mark">OBE</span>
          <span>
            <strong>OBE Simulator</strong>
            <small>{config.program.degreeLevel} · {config.program.name}</small>
          </span>
        </Link>

        <nav className="obeNav" aria-label="OBE Simulator">
          {navigation.map((item) => (
            <NavLink key={item.key} className={`obeNav__item ${page === item.key ? "isActive" : ""}`} to={pageHref(item.key, routeBase)}>
              <span className="obeNav__icon">{item.short}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="obeSidebar__meta">
          <span>{config.program.institution}</span>
          <span>{config.program.curriculum}</span>
          <span>{config.program.totalCredits} {config.program.creditUnit ?? "SKS"} · {config.program.semesterCount} semester</span>
        </div>

        <div className="obeSidebar__bottom">
          <Link to="/research-products">Research Products</Link>
          <Link to="/">fauzirifky.github.io</Link>
        </div>
      </aside>

      <div className="obeWorkspace">
        <header className="obeTopbar">
          <div>
            <strong>{config.program.name}</strong>
            <span>{config.program.institution}</span>
          </div>
          <Link className="obeTopbar__link" to="/research-products">Research Products</Link>
        </header>

        <nav className="obeMobileNav">
          {navigation.map((item) => (
            <NavLink key={item.key} className={page === item.key ? "active" : ""} to={pageHref(item.key, routeBase)}>{item.label}</NavLink>
          ))}
        </nav>

        <main className="obeContent">{children}</main>
        <footer className="obeFooter">
          <span>OBE Simulator</span>
          <span>Konfigurasi program berbasis JSON</span>
        </footer>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="obePageHeading">
      <span className="obeEyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

function StudentStrip({ students, activeId, config, onSelect }: { students: SimStudent[]; activeId: string; config: ObeProgramConfig; onSelect: (id: string) => void }) {
  return (
    <div className="obeStudentStrip">
      {students.map((student) => {
        const track = getTrack(config, student.trackId);
        const total = studentTotalCredits(config, student);
        return (
          <button key={student.id} type="button" className={`obeStudentCard ${student.id === activeId ? "isActive" : ""}`} onClick={() => onSelect(student.id)}>
            <strong>{student.id}</strong>
            <span>{track?.label ?? student.trackId}</span>
            <small>{total} {config.program.creditUnit ?? "SKS"}</small>
          </button>
        );
      })}
    </div>
  );
}

function SemesterPackages({
  config,
  student,
  onToggleCourse,
}: {
  config: ObeProgramConfig;
  student: SimStudent;
  onToggleCourse: (courseId: string) => void;
}) {
  const track = getTrack(config, student.trackId);
  const courses = courseMap(config);
  const maxCredits = programMaxCreditsPerSemester(config);
  const semesters = Array.from({ length: config.program.semesterCount }, (_, index) => index + 1);

  return (
    <section className="obePanel">
      <div className="obePanel__heading">
        <div>
          <span className="obeEyebrow">Paket mahasiswa</span>
          <h2>{student.id} · {track?.label}</h2>
          <p>Total {studentTotalCredits(config, student)} {config.program.creditUnit ?? "SKS"}; target program {config.program.totalCredits} {config.program.creditUnit ?? "SKS"}.</p>
        </div>
        <span className={`obeTotalBadge ${studentTotalCredits(config, student) === config.program.totalCredits ? "isOk" : "isWarn"}`}>
          {studentTotalCredits(config, student)} / {config.program.totalCredits} {config.program.creditUnit ?? "SKS"}
        </span>
      </div>

      <div className="obeSemesterGrid">
        {semesters.map((semester) => {
          const items = student.enrollments.filter((item) => item.semester === semester);
          const actual = semesterCredits(config, student, semester);
          const expected = Number(track?.expectedCreditsBySemester?.[String(semester)] ?? 0);
          const maxCredits = programMaxCreditsForSemester(config, semester);
          const overMax = maxCredits != null && actual > maxCredits;
          const onTarget = !expected || actual === expected;
          return (
            <article className="obeSemesterCard" key={semester}>
              <header>
                <div>
                  <span>Semester {semester}</span>
                  <strong>{actual} {config.program.creditUnit ?? "SKS"}</strong>
                </div>
                {(expected || maxCredits) ? (
                  <small className={!overMax && onTarget ? "isOkText" : "isWarnText"}>
                    {expected ? `target ${expected}` : ""}{maxCredits ? `${expected ? " · " : ""}maks ${maxCredits}` : ""}
                  </small>
                ) : null}
              </header>
              <div className="obeSemesterCourses">
                {items.length ? items.map((item) => {
                  const course = courses.get(item.courseId);
                  if (!course) return null;
                  return (
                    <label className={`obeCourseLine ${item.included ? "" : "isExcluded"}`} key={`${semester}-${item.courseId}`}>
                      <input type="checkbox" checked={item.included} onChange={() => onToggleCourse(item.courseId)} />
                      <span className="obeCourseLine__body">
                        <strong>{course.name}</strong>
                        <small>{course.code}</small>
                      </span>
                      <span className={categoryClass(course.category)}>{categoryLabel(course.category)}</span>
                      <b>{course.credits}</b>
                    </label>
                  );
                }) : <div className="obeEmpty">Tidak ada MK pada semester ini.</div>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function GraphView({
  config,
  students,
  categoryFilters,
  exportLabel,
}: {
  config: ObeProgramConfig;
  students: SimStudent[];
  categoryFilters: Record<CourseCategory, boolean>;
  exportLabel: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; title: string; body: string } | null>(null);
  const courses = useMemo(() => courseMap(config), [config]);

  const relations = useMemo(() => {
    const grouped = new Map<string, { mapping: CpmkMapping; students: Set<string> }>();
    for (const student of students) {
      for (const mapping of cpmksForStudent(config, student)) {
        const course = courses.get(mapping.courseId);
        if (!course || !categoryFilters[course.category]) continue;
        const key = mapping.id;
        if (!grouped.has(key)) grouped.set(key, { mapping, students: new Set() });
        grouped.get(key)!.students.add(student.id);
      }
    }
    return [...grouped.values()].map((item): GraphEdge => ({
      mapping: item.mapping,
      count: item.students.size,
      studentIds: [...item.students],
    }));
  }, [categoryFilters, config, courses, students]);

  const graphTrackIds = [...new Set(students.map((student) => student.trackId))];
  const cpmkNodes = useMemo(() => {
    const grouped = new Map<string, {
      key: string;
      code: string;
      outcomeId: string;
      relations: GraphEdge[];
      students: Set<string>;
      descriptions: Set<string>;
      sources: Set<string>;
      mappingWeights: number[];
      mappingWeightSources: Set<string>;
      weight?: number;
      weightValues: number[];
      weightDerived: boolean;
    }>();

    for (const relation of relations) {
      const descriptionKey = (relation.mapping.description ?? "").trim().replace(/\s+/g, " ");
      const key = `${relation.mapping.outcomeId}::${relation.mapping.code}::${descriptionKey}`;
      if (!grouped.has(key)) {
        const resolved = resolveCpmkWeight(config, relation.mapping.outcomeId, relation.mapping.code, graphTrackIds);
        grouped.set(key, {
          key,
          code: relation.mapping.code,
          outcomeId: relation.mapping.outcomeId,
          relations: [],
          students: new Set(),
          descriptions: new Set(),
          sources: new Set(),
          mappingWeights: [],
          mappingWeightSources: new Set(),
          weight: resolved.weight,
          weightValues: resolved.values,
          weightDerived: resolved.derived,
        });
      }
      const node = grouped.get(key)!;
      node.relations.push(relation);
      for (const studentId of relation.studentIds) node.students.add(studentId);
      if (relation.mapping.description?.trim()) node.descriptions.add(relation.mapping.description.trim());
      if (relation.mapping.source?.trim()) node.sources.add(relation.mapping.source.trim());
      if (relation.mapping.weight != null) node.mappingWeights.push(relation.mapping.weight);
      if (relation.mapping.weightSource?.trim()) node.mappingWeightSources.add(relation.mapping.weightSource.trim());
    }

    return [...grouped.values()].map((node) => ({
      ...node,
      descriptions: [...node.descriptions],
      sources: [...node.sources],
      mappingWeightSources: [...node.mappingWeightSources],
      count: node.students.size,
    }));
  }, [config, graphTrackIds.join("|"), relations]);

  const outcomes = config.outcomes.filter((outcome) => cpmkNodes.some((node) => node.outcomeId === outcome.id));
  const courseIds = [...new Set(relations.map((edge) => edge.mapping.courseId))];
  const nodesByOutcome = new Map<string, typeof cpmkNodes>();
  for (const outcome of outcomes) nodesByOutcome.set(outcome.id, cpmkNodes.filter((node) => node.outcomeId === outcome.id));

  const positions = useMemo(() => {
    const cpl = new Map<string, number>();
    const cpmk = new Map<string, number>();
    let y = 62;
    for (const outcome of outcomes) {
      const list = nodesByOutcome.get(outcome.id) ?? [];
      const h = Math.max(52, list.length * 34 + 24);
      cpl.set(outcome.id, y + h / 2);
      list.forEach((node, index) => cpmk.set(node.key, y + 26 + index * 34));
      y += h + 20;
    }
    const height = Math.max(840, y + 80, 150 + courseIds.length * 38);
    const course = new Map<string, number>();
    courseIds.forEach((courseId, index) => course.set(courseId, 68 + index * ((height - 130) / Math.max(courseIds.length - 1, 1))));
    return { cpl, cpmk, course, height };
  }, [courseIds, cpmkNodes, outcomes]);

  const maxN = Math.max(1, students.length);
  const coverageRows = students.map((student) => ({ student, coverage: studentWeightCoverage(config, student) }));
  const coverageByOutcome = new Map(config.outcomes.map((outcome) => {
    const values = coverageRows.map((row) => row.coverage.get(outcome.id) ?? 0);
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const avg = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    return [outcome.id, { values, min, max, avg }];
  }));

  const color = (index: number) => `hsl(${(index * 43 + 224) % 360} 72% 48%)`;
  const outcomeColors = new Map(outcomes.map((outcome, index) => [outcome.id, color(index)]));

  function jumpToOutcome(outcomeId: string) {
    const box = scrollRef.current;
    const y = positions.cpl.get(outcomeId);
    if (!box || y == null) return;
    box.scrollTo({ top: Math.max(0, y - 120), behavior: "smooth" });
  }

  const lineStyle = (count: number) => ({
    width: students.length > 1 ? 1.2 + 6 * (count / maxN) : 1.5,
    opacity: students.length > 1 ? 0.14 + 0.75 * (count / maxN) : 0.35,
  });

  function nodeWeightInfo(node: (typeof cpmkNodes)[number]) {
    if (node.mappingWeights.length) {
      const min = Math.min(...node.mappingWeights);
      const max = Math.max(...node.mappingWeights);
      const text = Math.abs(max - min) <= 0.005 ? `${formatNumber(min, 2)}%/MK` : `${formatNumber(min, 2)}–${formatNumber(max, 2)}%/MK`;
      return { text, detail: `Bobot resmi CPMK di dalam MK: ${text}`, source: node.mappingWeightSources.join("; ") };
    }
    if (node.weightValues.length) {
      const min = Math.min(...node.weightValues);
      const max = Math.max(...node.weightValues);
      const text = node.weight != null
        ? `${node.weightDerived ? "≈" : ""}${formatNumber(node.weight, 2)}%`
        : `${node.weightDerived ? "≈" : ""}${formatNumber(min, 2)}–${formatNumber(max, 2)}%`;
      return { text, detail: node.weightDerived ? `Bobot visual turunan: ${text}` : `Bobot CPMK dari JSON: ${text}`, source: "" };
    }
    return { text: "–", detail: "Bobot CPMK belum ditetapkan pada sumber yang digunakan.", source: "" };
  }

  function showTooltip(event: { clientX: number; clientY: number }, title: string, body: string) {
    setTooltip({ x: event.clientX + 14, y: event.clientY + 14, title, body });
  }
  function moveTooltip(event: { clientX: number; clientY: number }) {
    setTooltip((current) => current ? { ...current, x: event.clientX + 14, y: event.clientY + 14 } : current);
  }

  async function downloadGraphPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const viewBox = svg.viewBox.baseVal;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(viewBox.width));
    clone.setAttribute("height", String(viewBox.height));
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `
      text{font-family:Inter,Arial,sans-serif;fill:#0d253d}
      .obeGraphGroup{fill:#fafbfe;stroke:#e7ebf1}
      .obeSvgTitle{font-size:11px;font-weight:600;fill:#334155}
      .obeGraphNode rect{fill:#fff;stroke:#d3dae4}
      .obeGraphNode text{font-size:9px;fill:#0d253d}
      .obeGraphNode .obeSvgCount{font-size:7px;fill:#64748d}
      .obeGraphNode .obeSvgCoverage{font-size:7px;fill:#475569;font-weight:600}
      .obeGraphNode .obeSvgWeight{font-weight:600;fill:#475569}
      .obeGraphEdge{fill:none;stroke-linecap:round}
    `;
    clone.insertBefore(style, clone.firstChild);
    const xml = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Gagal merender SVG untuk PNG."));
      image.src = url;
    });
    const header = 118;
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewBox.width * scale);
    canvas.height = Math.ceil((viewBox.height + header) * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) { URL.revokeObjectURL(url); return; }
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, viewBox.width, viewBox.height + header);
    ctx.fillStyle = "#533afd";
    ctx.font = "600 12px Arial, sans-serif";
    ctx.fillText("PEMETAAN OBE", 38, 28);
    ctx.fillStyle = "#0d253d";
    ctx.font = "500 26px Arial, sans-serif";
    ctx.fillText("CPL → CPMK → Mata Kuliah", 38, 58);
    ctx.font = "600 14px Arial, sans-serif";
    ctx.fillText(exportLabel, 38, 82);
    ctx.fillStyle = "#64748d";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText(`${config.program.name} · ${config.program.curriculum ?? ""}`, 38, 101);
    ctx.drawImage(image, 0, header, viewBox.width, viewBox.height);
    URL.revokeObjectURL(url);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = `${config.program.id}-${exportLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
    a.href = downloadUrl;
    a.download = `obe-mapping-${safe || "student"}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }

  return (
    <section className="obePanel">
      <div className="obeGraphToolbar">
        <div>
          <span className="obeEyebrow">Pemetaan OBE</span>
          <h2>CPL → CPMK → Mata Kuliah</h2>
          <p>
            Hover CPL atau CPMK untuk membaca redaksi lengkap. Bobot pada relasi CPMK–MK ditampilkan bila tersedia dari sumber resmi.
            {students.length > 1 ? " Ketebalan garis menunjukkan jumlah mahasiswa yang memakai relasi." : " Pemetaan untuk mahasiswa aktif."}
          </p>
        </div>
        <div className="obeGraphActions">
          <label className="obeSelectLabel">Lompat ke
            <select onChange={(event) => jumpToOutcome(event.target.value)} defaultValue="">
              <option value="" disabled>Pilih CPL</option>
              {outcomes.map((outcome) => <option key={outcome.id} value={outcome.id}>{outcome.code}</option>)}
            </select>
          </label>
          <button type="button" className="obeBtn" onClick={downloadGraphPng}>Download PNG</button>
        </div>
      </div>

      <div className="obeGraphLegend">
        {outcomes.map((outcome) => <span key={outcome.id}><i style={{ background: outcomeColors.get(outcome.id) }} />{outcome.code}</span>)}
        {relations.some((edge) => edge.mapping.weight != null) ? <span className="obeGraphLegend__note">bobot pada relasi = bobot CPMK di dalam MK dari sumber</span> : null}
        {(config.weights ?? []).length ? <span className="obeGraphLegend__note">total CPL MFI mengikuti bobot MK→CPL yang terpetakan</span> : null}
      </div>

      <div className="obeGraphScroll" ref={scrollRef}>
        <svg ref={svgRef} className="obeGraph" viewBox={`0 0 1180 ${positions.height}`} style={{ height: positions.height }}>
          <text className="obeSvgTitle" x="38" y="26">CPL</text>
          <text className="obeSvgTitle" x="305" y="26">CPMK · Bobot</text>
          <text className="obeSvgTitle" x="810" y="26">Mata Kuliah</text>

          {outcomes.map((outcome) => {
            const list = nodesByOutcome.get(outcome.id) ?? [];
            if (!list.length) return null;
            const ys = list.map((node) => positions.cpmk.get(node.key) ?? 0);
            return <rect key={`group-${outcome.id}`} className="obeGraphGroup" x="285" y={Math.min(...ys) - 23} width="215" height={Math.max(...ys) - Math.min(...ys) + 46} rx="10" />;
          })}

          {cpmkNodes.map((node) => {
            const y1 = positions.cpl.get(node.outcomeId); const y2 = positions.cpmk.get(node.key);
            if (y1 == null || y2 == null) return null;
            const style = lineStyle(node.count);
            return <path key={`cpl-cpmk-${node.key}`} className="obeGraphEdge" d={`M 188 ${y1} C 230 ${y1}, 248 ${y2}, 305 ${y2}`} stroke={outcomeColors.get(node.outcomeId) ?? "#533afd"} strokeWidth={style.width} opacity={style.opacity} />;
          })}

          {relations.map((edge) => {
            const key = `${edge.mapping.outcomeId}::${edge.mapping.code}`;
            const y2 = positions.cpmk.get(key); const y3 = positions.course.get(edge.mapping.courseId);
            if (y2 == null || y3 == null) return null;
            const style = lineStyle(edge.count);
            return <path key={`cpmk-course-${edge.mapping.id}`} className="obeGraphEdge" d={`M 500 ${y2} C 610 ${y2}, 690 ${y3}, 810 ${y3}`} stroke={outcomeColors.get(edge.mapping.outcomeId) ?? "#533afd"} strokeWidth={style.width} opacity={style.opacity}><title>{`${edge.mapping.code} → ${courses.get(edge.mapping.courseId)?.name ?? edge.mapping.courseId}${edge.mapping.weight != null ? ` · ${formatNumber(edge.mapping.weight, 2)}% dalam MK` : ""}${edge.mapping.weightSource ? ` · ${edge.mapping.weightSource}` : ""}`}</title></path>;
          })}

          {outcomes.map((outcome) => {
            const y = positions.cpl.get(outcome.id); if (y == null) return null;
            const coverage = coverageByOutcome.get(outcome.id);
            const hasGlobalWeights = (config.cpmkWeights?.length ?? 0) > 0 || (config.weights?.length ?? 0) > 0;
            const same = coverage ? Math.abs(coverage.max - coverage.min) <= 0.005 : true;
            const coverageLabel = !hasGlobalWeights || !coverage ? "" : students.length <= 1 || same ? `${formatNumber(coverage.avg, 2)}%` : `${formatNumber(coverage.min, 2)}–${formatNumber(coverage.max, 2)}%`;
            const list = nodesByOutcome.get(outcome.id) ?? [];
            const body = `${outcome.label}\n\nCPMK terpetakan:\n${list.map((node) => `${node.code} — ${node.descriptions.length ? node.descriptions.join(" / ") : "redaksi belum tersedia"}`).join("\n")}`;
            return <g className="obeGraphNode" key={outcome.id} onMouseEnter={(event) => showTooltip(event, outcome.code, body)} onMouseMove={moveTooltip} onMouseLeave={() => setTooltip(null)}>
              <rect x="38" y={y - 18} width="150" height="36" rx="8" style={{ stroke: outcomeColors.get(outcome.id), strokeWidth: 2 }} />
              <text x="49" y={y - 2}>{outcome.code}</text>
              {coverageLabel ? <text className="obeSvgCoverage" x="178" y={y + 11} textAnchor="end">{coverageLabel}</text> : null}
            </g>;
          })}

          {cpmkNodes.map((node) => {
            const y = positions.cpmk.get(node.key); if (y == null) return null;
            const info = nodeWeightInfo(node);
            const meta = [info.text, students.length > 1 ? `${node.count}/${maxN}` : ""].filter(Boolean).join(" · ");
            const body = `${node.descriptions.length ? node.descriptions.join("\n\n") : "Redaksi CPMK belum tersedia."}\n\nCPL: ${node.outcomeId}\n${info.detail}${info.source ? `\nSumber bobot: ${info.source}` : ""}${node.sources.length ? `\nSumber redaksi/pemetaan: ${node.sources.join("; ")}` : ""}`;
            return <g className="obeGraphNode" key={`cpmk-${node.key}`} onMouseEnter={(event) => showTooltip(event, node.code, body)} onMouseMove={moveTooltip} onMouseLeave={() => setTooltip(null)}>
              <rect x="305" y={y - 14} width="195" height="28" rx="8" />
              <text x="316" y={y + 4}>{node.code}</text>
              <text className="obeSvgCount obeSvgWeight" x="490" y={y + 4} textAnchor="end">{meta}</text>
            </g>;
          })}

          {courseIds.map((courseId) => {
            const course = courses.get(courseId); const y = positions.course.get(courseId);
            if (!course || y == null) return null;
            const count = students.filter((student) => activeEnrollments(student).some((item) => item.courseId === courseId)).length;
            return <g className="obeGraphNode" key={`course-${courseId}`}>
              <rect x="810" y={y - 13} width="320" height="26" rx="8" />
              <text x="821" y={y + 4}>{course.name.length > 43 ? `${course.name.slice(0, 41)}…` : course.name}</text>
              <text className="obeSvgCount" x="1120" y={y + 4} textAnchor="end">{students.length > 1 ? `${count}/${maxN}` : categoryLabel(course.category)}</text>
              <title>{course.name} · {course.code} · {course.credits} {config.program.creditUnit ?? "SKS"}</title>
            </g>;
          })}
        </svg>
      </div>
      {tooltip ? <div className="obeHoverTooltip" style={{ left: tooltip.x, top: tooltip.y }}><strong>{tooltip.title}</strong><span>{tooltip.body}</span></div> : null}
    </section>
  );
}
function SimulatorPage({ config, students, setStudents, counts, setCounts }: {
  config: ObeProgramConfig;
  students: SimStudent[];
  setStudents: React.Dispatch<React.SetStateAction<SimStudent[]>>;
  counts: Record<string, number>;
  setCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  const [activeId, setActiveId] = useState(students[0]?.id ?? "");
  const [viewMode, setViewMode] = useState<ViewMode>("student");
  const [categoryFilters, setCategoryFilters] = useState<Record<CourseCategory, boolean>>({ required: true, required_choice: true, elective: true });

  useEffect(() => {
    if (!students.some((student) => student.id === activeId)) setActiveId(students[0]?.id ?? "");
  }, [activeId, students]);

  const activeStudent = students.find((student) => student.id === activeId) ?? students[0];
  const graphStudents = useMemo(() => {
    if (viewMode === "all") return students;
    if (viewMode.startsWith("track:")) return students.filter((student) => student.trackId === viewMode.slice("track:".length));
    return activeStudent ? [activeStudent] : [];
  }, [activeStudent, students, viewMode]);

  function applyCounts() {
    const cohort = generateCohort(config, counts);
    setStudents(cohort);
    setActiveId(cohort[0]?.id ?? "");
  }

  function randomizeAll() {
    const cohort = generateCohort(config, counts);
    setStudents(cohort);
    setActiveId(cohort[0]?.id ?? "");
  }

  function randomizeActive() {
    if (!activeStudent) return;
    setStudents((current) => current.map((student) => student.id === activeStudent.id ? generateStudent(config, student.trackId, student.sequence) : student));
  }

  function toggleCourse(courseId: string) {
    if (!activeStudent) return;
    setStudents((current) => current.map((student) => {
      if (student.id !== activeStudent.id) return student;
      return {
        ...student,
        enrollments: student.enrollments.map((item) => item.courseId === courseId ? { ...item, included: !item.included } : item),
      };
    }));
  }

  const weightCoverage = activeStudent ? studentWeightCoverage(config, activeStudent) : new Map<string, number>();
  const activeTotal = activeStudent ? studentTotalCredits(config, activeStudent) : 0;
  const mappedOutcomeCount = [...weightCoverage.values()].filter((value) => value > 0.0001).length;

  return (
    <>
      <PageHeading eyebrow="Simulator" title="Paket studi dan pemetaan OBE">
        Randomisasi jalur studi, komposisi mata kuliah per semester, beban SKS, dan pemetaan CPL–CPMK–MK dari konfigurasi JSON aktif.
      </PageHeading>

      <section className="obePanel obeControlPanel">
        <div className="obeControlRow">
          <div className="obeCountControls">
            {config.tracks.map((track) => (
              <label key={track.id}>{track.shortLabel ?? track.label}
                <input type="number" min="0" max="100" value={counts[track.id] ?? 0} onChange={(event) => setCounts((current) => ({ ...current, [track.id]: Math.max(0, Number(event.target.value) || 0) }))} />
              </label>
            ))}
            <button type="button" className="obeBtn" onClick={applyCounts}>Terapkan jumlah</button>
          </div>
          <div className="obeActionRow">
            <button type="button" className="obeBtn obeBtn--primary" onClick={randomizeAll}>Acak semua</button>
            <button type="button" className="obeBtn" onClick={randomizeActive} disabled={!activeStudent}>Acak mahasiswa aktif</button>
          </div>
        </div>

        <div className="obeControlRow obeControlRow--compact">
          <label className="obeSelectLabel">Tampilan grafik
            <select value={viewMode} onChange={(event) => setViewMode(event.target.value as ViewMode)}>
              <option value="student">Mahasiswa aktif</option>
              <option value="all">Semua mahasiswa</option>
              {config.tracks.map((track) => <option key={track.id} value={`track:${track.id}`}>{track.label}</option>)}
            </select>
          </label>
          <div className="obeChecks">
            {(["required", "required_choice", "elective"] as CourseCategory[]).map((category) => (
              <label key={category}><input type="checkbox" checked={categoryFilters[category]} onChange={(event) => setCategoryFilters((current) => ({ ...current, [category]: event.target.checked }))} />{categoryLabel(category)}</label>
            ))}
          </div>
        </div>
      </section>

      <StudentStrip students={students} activeId={activeStudent?.id ?? ""} config={config} onSelect={setActiveId} />

      {activeStudent ? <SemesterPackages config={config} student={activeStudent} onToggleCourse={toggleCourse} /> : null}

      <div className="obeMetricGrid">
        <article><span>Total SKS mahasiswa aktif</span><strong className={activeTotal === config.program.totalCredits ? "isOkText" : "isWarnText"}>{activeTotal}</strong><small>target {config.program.totalCredits}</small></article>
        <article><span>MK mahasiswa aktif</span><strong>{activeStudent?.enrollments.length ?? 0}</strong><small>{activeEnrollments(activeStudent ?? { id: "", trackId: "", sequence: 0, enrollments: [] }).length} dilibatkan OBE</small></article>
        <article><span>Mahasiswa pada grafik</span><strong>{graphStudents.length}</strong><small>{viewMode === "student" ? activeStudent?.id : "agregasi"}</small></article>
        <article><span>CPL berbobot terpetakan</span><strong>{mappedOutcomeCount}</strong><small>dari {config.outcomes.length} CPL · tidak dinormalisasi</small></article>
      </div>

      {activeStudent && ((config.cpmkWeights?.length ?? 0) > 0 || (config.weights?.length ?? 0) > 0) ? (
        <section className="obePanel">
          <div className="obePanel__heading">
            <div>
              <span className="obeEyebrow">Bobot terpetakan</span>
              <h2>Total bobot CPMK terpetakan per CPL</h2>
              <p>Menjumlahkan bobot yang benar-benar mempunyai CPMK terpetakan dan evidence dari MK aktif. Nilai ditampilkan apa adanya; tidak dinormalisasi ke 100% dan bukan formula final nilai CPL.</p>
            </div>
          </div>
          <div className="obeWeightGrid">
            {config.outcomes.map((outcome) => {
              const value = weightCoverage.get(outcome.id) ?? 0;
              const full = Math.abs(value - 100) <= 0.5;
              return <div key={outcome.id} className={full ? "isOk" : "isPartial"}><span>{outcome.code}</span><strong>{formatNumber(value, 2)}%</strong></div>;
            })}
          </div>
        </section>
      ) : null}

      <GraphView
        config={config}
        students={graphStudents}
        categoryFilters={categoryFilters}
        exportLabel={graphStudents.length === 1
          ? `${graphStudents[0].id} · ${getTrack(config, graphStudents[0].trackId)?.label ?? graphStudents[0].trackId} · ${studentTotalCredits(config, graphStudents[0])} ${config.program.creditUnit ?? "SKS"}`
          : viewMode === "all"
            ? `Semua mahasiswa · ${graphStudents.length} mahasiswa`
            : viewMode.startsWith("track:")
              ? `${getTrack(config, viewMode.slice("track:".length))?.label ?? viewMode.slice("track:".length)} · ${graphStudents.length} mahasiswa`
              : `${graphStudents.length} mahasiswa`}
      />
    </>
  );
}

function ProgramPage({ config }: { config: ObeProgramConfig }) {
  const issues = useMemo(() => validateConfig(config), [config]);
  const courses = courseMap(config);

  return (
    <>
      <PageHeading eyebrow="Struktur program" title={`${config.program.name} · ${config.program.curriculum ?? "Kurikulum"}`}>
        Struktur semester, jalur studi, mata kuliah, dan pemeriksaan referensi dari JSON aktif.
      </PageHeading>

      <div className="obeMetricGrid obeMetricGrid--program">
        <article><span>Jenjang</span><strong>{config.program.degreeLevel}</strong><small>{config.program.institution}</small></article>
        <article><span>Total beban</span><strong>{config.program.totalCredits}</strong><small>{config.program.creditUnit ?? "SKS"}</small></article>
        <article><span>Semester</span><strong>{config.program.semesterCount}</strong><small>sesuai JSON</small></article>
        <article><span>Maksimum per semester</span><strong>{programMaxCreditsPerSemester(config) ?? "–"}</strong><small>{config.program.creditUnit ?? "SKS"} · default Sarjana 20</small></article>
        <article><span>Jalur</span><strong>{config.tracks.length}</strong><small>{config.tracks.map((track) => track.shortLabel ?? track.label).join(" · ")}</small></article>
      </div>

      {config.tracks.map((track) => (
        <section className="obePanel" key={track.id}>
          <div className="obePanel__heading">
            <div><span className="obeEyebrow">Jalur studi</span><h2>{track.label}</h2></div>
            <span className="obeTotalBadge">{Object.values(track.expectedCreditsBySemester ?? {}).reduce((a, b) => a + Number(b || 0), 0)} {config.program.creditUnit ?? "SKS"}</span>
          </div>
          <div className="obeStructureGrid">
            {Array.from({ length: config.program.semesterCount }, (_, index) => index + 1).map((semester) => {
              const required = track.requiredCourses.filter((item) => item.semester === semester);
              const choice = (track.choiceGroups ?? []).flatMap((group) => group.courseOptions.filter((item) => item.semester === semester).map((item) => ({ ...item, group })));
              const rules = (track.electiveRules ?? []).filter((rule) => rule.semester === semester);
              return (
                <article key={semester}>
                  <header><span>Semester {semester}</span><strong>{track.expectedCreditsBySemester?.[String(semester)] ?? "–"} {config.program.creditUnit ?? "SKS"}</strong></header>
                  <div className="obeStructureList">
                    {required.map((item) => <div key={`r-${item.courseId}`}><span>{courses.get(item.courseId)?.name ?? item.courseId}</span><b>W</b></div>)}
                    {choice.map((item) => <div key={`c-${item.courseId}`}><span>{courses.get(item.courseId)?.name ?? item.courseId}</span><b>WP</b></div>)}
                    {rules.map((rule) => <div key={`e-${rule.poolId}`}><span>MK pilihan · target {rule.targetCredits} {config.program.creditUnit ?? "SKS"}</span><b>P</b></div>)}
                  </div>
                </article>
              );
            })}
          </div>
          {(track.choiceGroups ?? []).map((group) => <p className="obeTrackNote" key={group.id}><strong>{group.label}:</strong> pilih {group.choose} dari {group.courseOptions.length}. {group.note}</p>)}
        </section>
      ))}

      <section className="obePanel">
        <div className="obePanel__heading"><div><span className="obeEyebrow">Mata kuliah</span><h2>Katalog</h2><p>{config.courses.length} mata kuliah pada JSON aktif.</p></div></div>
        <div className="obeTableWrap">
          <table className="obeTable">
            <thead><tr><th>Kode</th><th>Mata kuliah</th><th>Kategori</th><th>SKS</th><th>CPMK</th></tr></thead>
            <tbody>{config.courses.map((course) => <tr key={course.id}><td>{course.code}</td><td>{course.name}</td><td>{categoryLabel(course.category)}</td><td>{course.credits}</td><td>{config.cpmks.filter((item) => item.courseId === course.id).length}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <ValidationPanel issues={issues} />
    </>
  );
}

function ValidationPanel({ issues }: { issues: ReturnType<typeof validateConfig> }) {
  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  return (
    <section className="obePanel">
      <div className="obePanel__heading">
        <div><span className="obeEyebrow">Validasi JSON</span><h2>Pemeriksaan konfigurasi</h2><p>{errors} error · {warnings} warning · {issues.length} catatan.</p></div>
      </div>
      <div className="obeIssueList">
        {issues.length ? issues.map((issue, index) => <div key={`${issue.code}-${index}`} className={`obeIssue obeIssue--${issue.severity}`}><strong>{issue.code}</strong><span>{issue.message}</span></div>) : <div className="obeIssue obeIssue--info"><strong>OK</strong><span>Tidak ada masalah struktur yang terdeteksi.</span></div>}
      </div>
    </section>
  );
}

function SettingsPage({ config, onApply, onReset }: { config: ObeProgramConfig; onApply: (config: ObeProgramConfig) => void; onReset: () => void }) {
  const [text, setText] = useState(() => JSON.stringify(config, null, 2));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => setText(JSON.stringify(config, null, 2)), [config]);

  function applyText() {
    try {
      const parsed = parseObeConfig(text);
      onApply(parsed);
      setError("");
      setMessage(`Konfigurasi aktif: ${parsed.program.name}.`);
    } catch (reason) {
      setMessage("");
      setError(reason instanceof Error ? reason.message : "JSON tidak dapat dibaca.");
    }
  }

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const value = await file.text();
    setText(value);
    setMessage(`File dimuat: ${file.name}. Klik Terapkan JSON untuk mengaktifkan.`);
    setError("");
  }

  return (
    <>
      <PageHeading eyebrow="JSON & Pengaturan" title="Konfigurasi program studi">
        Simulator membaca semester, jalur, mata kuliah, aturan pilihan, CPL, CPMK, dan bobot dari satu JSON. Konfigurasi yang diterapkan disimpan di browser.
      </PageHeading>

      <section className="obePanel">
        <div className="obeSettingsActions">
          <button type="button" className="obeBtn obeBtn--primary" onClick={applyText}>Terapkan JSON</button>
          <button type="button" className="obeBtn" onClick={() => fileInput.current?.click()}>Load file JSON</button>
          <input ref={fileInput} className="obeHidden" type="file" accept="application/json,.json" onChange={readFile} />
          <button type="button" className="obeBtn" onClick={() => downloadJson(config)}>Download JSON aktif</button>
          <button type="button" className="obeBtn" onClick={() => { onReset(); setMessage("Konfigurasi bawaan dipulihkan."); setError(""); }}>Reset bawaan</button>
        </div>
        {message ? <div className="obeNotice obeNotice--ok">{message}</div> : null}
        {error ? <div className="obeNotice obeNotice--error">{error}</div> : null}
        <textarea className="obeJsonEditor" spellCheck={false} value={text} onChange={(event) => setText(event.target.value)} />
      </section>

      <section className="obePanel">
        <div className="obePanel__heading"><div><span className="obeEyebrow">Struktur JSON</span><h2>Field utama</h2></div></div>
        <div className="obeSchemaGrid">
          <div><code>program</code><span>Nama prodi, jenjang, jumlah semester, total SKS, dan opsional maxCreditsPerSemester.</span></div>
          <div><code>tracks</code><span>Jalur studi, MK wajib per semester, kelompok wajib pilih, dan aturan pilihan.</span></div>
          <div><code>courses</code><span>Kode, nama, SKS, dan kategori MK.</span></div>
          <div><code>outcomes</code><span>Daftar CPL program studi.</span></div>
          <div><code>cpmks</code><span>Pemetaan CPMK ke MK, CPL, jalur, redaksi, sumber, dan bobot per-MK bila tersedia.</span></div>
          <div><code>cpmkWeights</code><span>Bobot CPMK unik ke CPL. Ditampilkan langsung pada node CPMK.</span></div>
          <div><code>weights</code><span>Bobot MK ke CPL versi lama/opsional untuk kompatibilitas konfigurasi sebelumnya.</span></div>
        </div>
      </section>

      <ValidationPanel issues={validateConfig(config)} />
    </>
  );
}

export default function ObeSimulator() {
  const location = useLocation();
  const route = routeContext(location.pathname);
  const [activePreset, setActivePreset] = useState<PresetKey>(route.preset);
  const [config, setConfig] = useState<ObeProgramConfig>(() => readInitialConfig(route.preset));
  const [counts, setCounts] = useState<Record<string, number>>(() => initialCounts(config));
  const [students, setStudents] = useState<SimStudent[]>(() => generateCohort(config, initialCounts(config)));

  useEffect(() => {
    if (route.preset === activePreset) return;
    const next = readInitialConfig(route.preset);
    const nextCounts = initialCounts(next);
    setActivePreset(route.preset);
    setConfig(next);
    setCounts(nextCounts);
    setStudents(generateCohort(next, nextCounts));
  }, [activePreset, route.preset]);

  function applyConfig(next: ObeProgramConfig) {
    window.localStorage.setItem(storageKeyFor(route.preset), JSON.stringify(next));
    const nextCounts = initialCounts(next);
    setConfig(next);
    setCounts(nextCounts);
    setStudents(generateCohort(next, nextCounts));
  }

  function resetConfig() {
    window.localStorage.removeItem(storageKeyFor(route.preset));
    const next = bundledConfig(route.preset);
    const nextCounts = initialCounts(next);
    setConfig(next);
    setCounts(nextCounts);
    setStudents(generateCohort(next, nextCounts));
  }

  return (
    <SimulatorShell config={config} page={route.page} routeBase={route.routeBase}>
      {route.page === "program" ? <ProgramPage config={config} /> : null}
      {route.page === "settings" ? <SettingsPage config={config} onApply={applyConfig} onReset={resetConfig} /> : null}
      {route.page === "simulator" ? <SimulatorPage config={config} students={students} setStudents={setStudents} counts={counts} setCounts={setCounts} /> : null}
    </SimulatorShell>
  );
}
