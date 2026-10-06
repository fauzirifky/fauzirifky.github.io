import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  buildDashboardSummary,
  formatRupiah,
  getDashboardRecords,
  isFirstAuthor,
  isSinta12,
  loadSintaData,
  moneyOf,
  SINTA_DATA_BASE_URL,
  yearOf,
  type LoadedLecturer,
  type OwnedRecord,
  type SintaIndex,
} from "../lib/sintaDashboard";

const BASE_PATH = "/research-products/sinta-matematika-itera";
const EXCLUDED_STORAGE_KEY = "sinta-dashboard-excluded-lecturers-v1";

type PageKey = "dashboard" | "publikasi" | "penelitian" | "pengabdian" | "luaran" | "dosen";

const navigation: Array<{ key: PageKey; label: string; short: string }> = [
  { key: "dashboard", label: "Dashboard", short: "DB" },
  { key: "publikasi", label: "Publikasi", short: "PB" },
  { key: "penelitian", label: "Penelitian", short: "PN" },
  { key: "pengabdian", label: "Pengabdian", short: "PK" },
  { key: "luaran", label: "Luaran", short: "LR" },
  { key: "dosen", label: "Dosen & Pengaturan", short: "DS" },
];

function readExcludedLecturers() {
  try {
    const value = JSON.parse(window.localStorage.getItem(EXCLUDED_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function pageFromPath(pathname: string): PageKey {
  const suffix = pathname.replace(/\/+$/, "").slice(BASE_PATH.length).replace(/^\/+/, "");
  return navigation.some((item) => item.key === suffix) ? (suffix as PageKey) : "dashboard";
}

function pageHref(page: PageKey) {
  return page === "dashboard" ? BASE_PATH : `${BASE_PATH}/${page}`;
}

function formatDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(date);
}

function recordTitle(item: OwnedRecord) {
  return item.record.title?.trim() || "Tanpa judul";
}

function sortRecords(items: OwnedRecord[]) {
  return [...items].sort((a, b) => {
    const yearDifference = (yearOf(b.record) ?? 0) - (yearOf(a.record) ?? 0);
    return yearDifference || recordTitle(a).localeCompare(recordTitle(b), "id-ID");
  });
}

function CountPair({ unique, nonUnique }: { unique: number; nonUnique: number }) {
  return (
    <span className="countPair" title={`Unik ${unique}; nonunik ${nonUnique}`}>
      <strong>{unique}</strong>
      <small>{nonUnique}</small>
    </span>
  );
}

function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="portalPageHeading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}

function EmptyRow({ columns }: { columns: number }) {
  return <tr><td className="emptyCell" colSpan={columns}>Belum ada data untuk filter dosen yang aktif.</td></tr>;
}

export default function SintaResearchDashboard() {
  const location = useLocation();
  const activePage = pageFromPath(location.pathname);
  const [index, setIndex] = useState<SintaIndex | null>(null);
  const [lecturers, setLecturers] = useState<LoadedLecturer[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(() => readExcludedLecturers());
  const [failed, setFailed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lecturerSearch, setLecturerSearch] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadSintaData();
      setIndex(result.index);
      setLecturers(result.lecturers);
      setFailed(result.failed);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Data JSON tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    window.localStorage.setItem(EXCLUDED_STORAGE_KEY, JSON.stringify([...excludedIds]));
  }, [excludedIds]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activePage]);

  useEffect(() => {
    const previousTitle = document.title;
    const pageLabel = navigation.find((item) => item.key === activePage)?.label ?? "Dashboard";
    document.title = `${pageLabel} | Matematika ITERA`;
    return () => {
      document.title = previousTitle;
    };
  }, [activePage]);

  const summary = useMemo(
    () => buildDashboardSummary(lecturers, excludedIds),
    [lecturers, excludedIds],
  );

  const records = useMemo(() => ({
    scopus: getDashboardRecords(lecturers, excludedIds, "scopus"),
    garuda: getDashboardRecords(lecturers, excludedIds, "garuda"),
    researches: getDashboardRecords(lecturers, excludedIds, "researches"),
    pkm: getDashboardRecords(lecturers, excludedIds, "community_services"),
    iprs: getDashboardRecords(lecturers, excludedIds, "iprs"),
    books: getDashboardRecords(lecturers, excludedIds, "books"),
  }), [lecturers, excludedIds]);

  const availableIds = new Set(lecturers.map((lecturer) => lecturer.index.sinta_id));
  const activeExcludedCount = [...excludedIds].filter((id) => availableIds.has(id)).length;
  const includedCount = Math.max(0, lecturers.length - activeExcludedCount);
  const visibleLecturers = summary.lecturerRows.filter((lecturer) =>
    lecturer.name.toLocaleLowerCase("id-ID").includes(lecturerSearch.trim().toLocaleLowerCase("id-ID")),
  );

  function toggleLecturer(id: string) {
    setExcludedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pageContent: Record<PageKey, ReactNode> = {
    dashboard: <DashboardPage summary={summary} />,
    publikasi: <PublicationPage summary={summary} scopus={records.scopus} garuda={records.garuda} />,
    penelitian: <FundingPage kind="penelitian" summary={summary} records={records.researches} />,
    pengabdian: <FundingPage kind="pengabdian" summary={summary} records={records.pkm} />,
    luaran: <OutputPage iprs={records.iprs} books={records.books} />,
    dosen: (
      <LecturerPage
        rows={visibleLecturers}
        allRows={summary.lecturerRows}
        excludedIds={excludedIds}
        search={lecturerSearch}
        onSearch={setLecturerSearch}
        onToggle={toggleLecturer}
        onReset={() => setExcludedIds(new Set())}
      />
    ),
  };

  return (
    <div className="sintaPortal">
      <aside className="portalSidebar">
        <Link className="portalBrand" to={BASE_PATH}>
          <span className="portalBrand__mark">MI</span>
          <span><strong>Matematika ITERA</strong><small>Research Intelligence</small></span>
        </Link>

        <nav className="portalNav" aria-label="Navigasi data penelitian">
          {navigation.map((item) => (
            <NavLink key={item.key} to={pageHref(item.key)} end className={({ isActive }) => isActive ? "portalNav__item isActive" : "portalNav__item"}>
              <span className="portalNav__icon">{item.short}</span>
              <span>{item.label}</span>
              {item.key === "dosen" && activeExcludedCount ? <em>{activeExcludedCount}</em> : null}
            </NavLink>
          ))}
        </nav>

        <div className="portalSidebar__bottom">
          <a href={`${SINTA_DATA_BASE_URL}/index.json`} target="_blank" rel="noreferrer">JSON sumber</a>
          <Link to="/research-products">Kembali ke Research Products</Link>
        </div>
      </aside>

      <div className="portalWorkspace">
        <header className="portalTopbar">
          <div>
            <strong>{navigation.find((item) => item.key === activePage)?.label}</strong>
            <span>{includedCount} dosen aktif · {activeExcludedCount} dikecualikan</span>
          </div>
          <button className="btn" type="button" onClick={() => void refresh()} disabled={loading}>
            {loading ? "Memuat…" : "Perbarui data"}
          </button>
        </header>

        <nav className="portalMobileNav" aria-label="Navigasi data penelitian seluler">
          {navigation.map((item) => (
            <NavLink key={item.key} to={pageHref(item.key)} end className={({ isActive }) => isActive ? "active" : ""}>{item.label}</NavLink>
          ))}
        </nav>

        <main className="portalContent">
          {error ? (
            <div className="dashboardNotice dashboardNotice--error" role="alert">
              <strong>Data belum dapat dimuat.</strong> {error}
              <button className="linkButton" type="button" onClick={() => void refresh()}>Coba lagi</button>
            </div>
          ) : null}

          {!error && loading && lecturers.length === 0 ? (
            <div className="dashboardLoading" aria-live="polite"><span className="loadingDot" /> Mengambil indeks dosen dan data profil…</div>
          ) : pageContent[activePage]}

          {index ? (
            <aside className="portalDataNote">
              <span>JSON diperbarui {formatDate(index.generated_at)}</span>
              <span>{index.authors_count} profil pada indeks</span>
              {failed.length ? <span className="metaWarning">{failed.length} profil gagal dimuat</span> : null}
            </aside>
          ) : null}
        </main>

        <footer className="portalFooter">
          <span>Matematika ITERA Research Intelligence</span>
          <span>© {new Date().getFullYear()} Rifky Fauzi</span>
        </footer>
      </div>
    </div>
  );
}

function DashboardPage({ summary }: { summary: ReturnType<typeof buildDashboardSummary> }) {
  return (
    <>
      <PageHeading eyebrow="Ringkasan institusi" title="Dashboard Kinerja Akademik">
        Gambaran terpadu publikasi, penelitian, pengabdian, anggaran, dan luaran Program Studi Matematika ITERA.
      </PageHeading>

      <div className="metricGrid portalMetricGrid">
        <article className="metricCard"><span>Scopus unik</span><strong>{summary.totals.scopusUnique}</strong><small>{summary.totals.scopusNonUnique} nonunik</small></article>
        <article className="metricCard"><span>Scopus first author</span><strong>{summary.totals.scopusFirstUnique}</strong><small>{summary.totals.scopusFirstNonUnique} nonunik</small></article>
        <article className="metricCard"><span>SINTA 1 + 2</span><strong>{summary.totals.sinta12Unique}</strong><small>{summary.totals.sinta12NonUnique} nonunik</small></article>
        <article className="metricCard"><span>Penelitian</span><strong>{summary.totals.researchUnique}</strong><small>{formatRupiah(summary.totals.researchFundingUnique, true)} anggaran unik</small></article>
        <article className="metricCard"><span>Pengabdian</span><strong>{summary.totals.pkmUnique}</strong><small>{formatRupiah(summary.totals.pkmFundingUnique, true)} anggaran unik</small></article>
        <article className="metricCard"><span>HKI + Buku</span><strong>{summary.totals.iprUnique + summary.totals.booksUnique}</strong><small>{summary.totals.iprUnique} HKI · {summary.totals.booksUnique} buku</small></article>
      </div>

      <section className="portalPanel">
        <div className="portalPanel__heading"><div><span className="microLabel">Tren tahunan</span><h2>Ringkasan per tahun</h2></div></div>
        <div className="dataTableWrap">
          <table className="dataTable yearTable">
            <thead><tr><th>Tahun</th><th>Scopus</th><th>S1 + S2</th><th>Penelitian</th><th>Anggaran penelitian</th><th>PkM</th><th>Anggaran PkM</th><th>HKI</th><th>Buku</th></tr></thead>
            <tbody>
              {summary.years.map((row) => (
                <tr key={row.year}>
                  <th>{row.year}</th>
                  <td><CountPair unique={row.scopusUnique} nonUnique={row.scopusNonUnique} /></td>
                  <td><CountPair unique={row.sinta12Unique} nonUnique={row.sinta12NonUnique} /></td>
                  <td><CountPair unique={row.researchUnique} nonUnique={row.researchNonUnique} /></td>
                  <td><span className="moneyPair"><strong>{formatRupiah(row.researchFundingUnique, true)}</strong><small>{formatRupiah(row.researchFundingNonUnique, true)}</small></span></td>
                  <td><CountPair unique={row.pkmUnique} nonUnique={row.pkmNonUnique} /></td>
                  <td><span className="moneyPair"><strong>{formatRupiah(row.pkmFundingUnique, true)}</strong><small>{formatRupiah(row.pkmFundingNonUnique, true)}</small></span></td>
                  <td><CountPair unique={row.iprUnique} nonUnique={row.iprNonUnique} /></td>
                  <td><CountPair unique={row.booksUnique} nonUnique={row.booksNonUnique} /></td>
                </tr>
              ))}
              {!summary.years.length ? <EmptyRow columns={9} /> : null}
            </tbody>
          </table>
        </div>
        <p className="tableLegend"><strong>Angka besar:</strong> unik · <strong>angka kecil:</strong> nonunik. Anggaran mengikuti pola yang sama.</p>
      </section>

      <aside className="methodNote">
        <strong>Metode ringkas.</strong> Data unik dideduplikasi memakai ID sumber, URL, kemudian judul dan tahun. Nonunik menjumlahkan kemunculan pada setiap profil dosen. Pengaturan dosen dapat diubah melalui menu Dosen & Pengaturan.
      </aside>
    </>
  );
}

function PublicationPage({ summary, scopus, garuda }: {
  summary: ReturnType<typeof buildDashboardSummary>;
  scopus: ReturnType<typeof getDashboardRecords>;
  garuda: ReturnType<typeof getDashboardRecords>;
}) {
  const sinta12Unique = sortRecords(garuda.unique.filter((item) => isSinta12(item.record)));
  const sinta12NonUnique = garuda.nonUnique.filter((item) => isSinta12(item.record));
  const scopusUnique = sortRecords(scopus.unique);
  return (
    <>
      <PageHeading eyebrow="Publikasi ilmiah" title="Scopus dan SINTA 1–2">
        Rekap publikasi terindeks per tahun beserta posisi first author yang tersedia pada data SINTA.
      </PageHeading>
      <div className="metricGrid portalMetricGrid portalMetricGrid--three">
        <article className="metricCard"><span>Scopus unik</span><strong>{scopusUnique.length}</strong><small>{scopus.nonUnique.length} nonunik</small></article>
        <article className="metricCard"><span>First author</span><strong>{scopusUnique.filter((item) => isFirstAuthor(item.record)).length}</strong><small>{scopus.nonUnique.filter((item) => isFirstAuthor(item.record)).length} nonunik</small></article>
        <article className="metricCard"><span>SINTA 1 + 2</span><strong>{sinta12Unique.length}</strong><small>{sinta12NonUnique.length} nonunik</small></article>
      </div>
      <section className="portalPanel">
        <div className="portalPanel__heading"><div><span className="microLabel">Per tahun</span><h2>Ringkasan publikasi</h2></div></div>
        <div className="dataTableWrap"><table className="dataTable"><thead><tr><th>Tahun</th><th>Scopus</th><th>First author</th><th>SINTA 1 + 2</th></tr></thead><tbody>
          {summary.years.map((row) => <tr key={row.year}><th>{row.year}</th><td><CountPair unique={row.scopusUnique} nonUnique={row.scopusNonUnique} /></td><td><CountPair unique={row.scopusFirstUnique} nonUnique={row.scopusFirstNonUnique} /></td><td><CountPair unique={row.sinta12Unique} nonUnique={row.sinta12NonUnique} /></td></tr>)}
          {!summary.years.length ? <EmptyRow columns={4} /> : null}
        </tbody></table></div>
      </section>
      <PublicationTable title="Publikasi Scopus unik" items={scopusUnique} />
      <PublicationTable title="Publikasi SINTA 1–2 unik" items={sinta12Unique} />
      <aside className="methodNote"><strong>Catatan.</strong> First author berasal dari field <code>author_order</code>. Corresponding author belum tersedia pada JSON sumber sehingga tidak disimpulkan secara otomatis.</aside>
    </>
  );
}

function PublicationTable({ title, items }: { title: string; items: OwnedRecord[] }) {
  return (
    <section className="portalPanel">
      <div className="portalPanel__heading"><div><span className="microLabel">Daftar publikasi</span><h2>{title}</h2></div><span className="panelCount">{items.length} rekaman</span></div>
      <div className="dataTableWrap"><table className="dataTable recordTable"><thead><tr><th>Tahun</th><th>Judul</th><th>Indeks</th><th>Posisi penulis</th></tr></thead><tbody>
        {items.map((item) => <tr key={`${item.kind}-${item.record.id ?? item.record.url ?? recordTitle(item)}`}><td>{yearOf(item.record) ?? "—"}</td><th>{item.record.url ? <a href={item.record.url} target="_blank" rel="noreferrer">{recordTitle(item)}</a> : recordTitle(item)}<small>{item.record.publication || item.ownerName}</small></th><td>{item.record.classification || (item.kind === "scopus" ? "Scopus" : "SINTA")}</td><td>{item.record.author_order || "—"}</td></tr>)}
        {!items.length ? <EmptyRow columns={4} /> : null}
      </tbody></table></div>
    </section>
  );
}

function FundingPage({ kind, summary, records }: {
  kind: "penelitian" | "pengabdian";
  summary: ReturnType<typeof buildDashboardSummary>;
  records: ReturnType<typeof getDashboardRecords>;
}) {
  const isResearch = kind === "penelitian";
  const items = sortRecords(records.unique);
  const uniqueFunding = items.reduce((sum, item) => sum + moneyOf(item.record), 0);
  const nonUniqueFunding = records.nonUnique.reduce((sum, item) => sum + moneyOf(item.record), 0);
  return (
    <>
      <PageHeading eyebrow={isResearch ? "Portofolio riset" : "Dampak kepada masyarakat"} title={isResearch ? "Penelitian" : "Pengabdian kepada Masyarakat"}>
        {isResearch ? "Daftar kegiatan penelitian, skema pendanaan, ketua, dan agregasi anggaran." : "Daftar kegiatan PkM, skema, ketua pelaksana, dan agregasi anggaran."}
      </PageHeading>
      <div className="metricGrid portalMetricGrid portalMetricGrid--three">
        <article className="metricCard"><span>Kegiatan unik</span><strong>{items.length}</strong><small>{records.nonUnique.length} nonunik</small></article>
        <article className="metricCard"><span>Anggaran unik</span><strong className="metricMoney">{formatRupiah(uniqueFunding, true)}</strong><small>{formatRupiah(uniqueFunding)} total</small></article>
        <article className="metricCard"><span>Anggaran nonunik</span><strong className="metricMoney">{formatRupiah(nonUniqueFunding, true)}</strong><small>{formatRupiah(nonUniqueFunding)} total</small></article>
      </div>
      <section className="portalPanel">
        <div className="portalPanel__heading"><div><span className="microLabel">Per tahun</span><h2>Jumlah dan anggaran</h2></div></div>
        <div className="dataTableWrap"><table className="dataTable"><thead><tr><th>Tahun</th><th>Jumlah</th><th>Anggaran unik</th><th>Anggaran nonunik</th></tr></thead><tbody>
          {summary.years.map((row) => <tr key={row.year}><th>{row.year}</th><td><CountPair unique={isResearch ? row.researchUnique : row.pkmUnique} nonUnique={isResearch ? row.researchNonUnique : row.pkmNonUnique} /></td><td>{formatRupiah(isResearch ? row.researchFundingUnique : row.pkmFundingUnique)}</td><td>{formatRupiah(isResearch ? row.researchFundingNonUnique : row.pkmFundingNonUnique)}</td></tr>)}
          {!summary.years.length ? <EmptyRow columns={4} /> : null}
        </tbody></table></div>
      </section>
      <section className="portalPanel">
        <div className="portalPanel__heading"><div><span className="microLabel">Daftar kegiatan unik</span><h2>{isResearch ? "Portofolio penelitian" : "Portofolio pengabdian"}</h2></div><span className="panelCount">{items.length} kegiatan</span></div>
        <div className="dataTableWrap"><table className="dataTable recordTable fundingTable"><thead><tr><th>Tahun</th><th>Judul dan skema</th><th>Ketua</th><th>Sumber</th><th>Anggaran</th></tr></thead><tbody>
          {items.map((item) => <tr key={`${item.kind}-${item.record.id ?? recordTitle(item)}`}><td>{yearOf(item.record) ?? "—"}</td><th>{recordTitle(item)}<small>{item.record.scheme || "Skema tidak tercantum"}</small></th><td>{item.record.leader || "—"}</td><td>{item.record.funding_source_type || "—"}</td><td>{formatRupiah(moneyOf(item.record))}</td></tr>)}
          {!items.length ? <EmptyRow columns={5} /> : null}
        </tbody></table></div>
      </section>
    </>
  );
}

function OutputPage({ iprs, books }: { iprs: ReturnType<typeof getDashboardRecords>; books: ReturnType<typeof getDashboardRecords> }) {
  const iprItems = sortRecords(iprs.unique);
  const bookItems = sortRecords(books.unique);
  return (
    <>
      <PageHeading eyebrow="Luaran penelitian" title="HKI dan Buku">
        Luaran akademik unik yang dihimpun dari profil dosen, dilengkapi metadata kepemilikan dan penerbitan yang tersedia.
      </PageHeading>
      <div className="metricGrid portalMetricGrid portalMetricGrid--two">
        <article className="metricCard"><span>HKI unik</span><strong>{iprItems.length}</strong><small>{iprs.nonUnique.length} nonunik</small></article>
        <article className="metricCard"><span>Buku unik</span><strong>{bookItems.length}</strong><small>{books.nonUnique.length} nonunik</small></article>
      </div>
      <section className="portalPanel"><div className="portalPanel__heading"><div><span className="microLabel">Hak kekayaan intelektual</span><h2>Daftar HKI</h2></div><span className="panelCount">{iprItems.length} rekaman</span></div><div className="dataTableWrap"><table className="dataTable recordTable"><thead><tr><th>Tahun</th><th>Judul</th><th>Jenis</th><th>Nomor permohonan</th><th>Pemegang</th></tr></thead><tbody>
        {iprItems.map((item) => <tr key={`ipr-${item.record.id ?? recordTitle(item)}`}><td>{yearOf(item.record) ?? "—"}</td><th>{recordTitle(item)}<small>{item.record.inventors || item.ownerName}</small></th><td>{item.record.ipr_type || "—"}</td><td>{item.record.application_number || "—"}</td><td>{item.record.holder || "—"}</td></tr>)}
        {!iprItems.length ? <EmptyRow columns={5} /> : null}
      </tbody></table></div></section>
      <section className="portalPanel"><div className="portalPanel__heading"><div><span className="microLabel">Publikasi buku</span><h2>Daftar buku</h2></div><span className="panelCount">{bookItems.length} rekaman</span></div><div className="dataTableWrap"><table className="dataTable recordTable"><thead><tr><th>Tahun</th><th>Judul</th><th>Kategori</th><th>Penerbit</th><th>ISBN</th></tr></thead><tbody>
        {bookItems.map((item) => <tr key={`book-${item.record.id ?? recordTitle(item)}`}><td>{yearOf(item.record) ?? "—"}</td><th>{recordTitle(item)}<small>{item.record.authors || item.ownerName}</small></th><td>{item.record.category || "—"}</td><td>{item.record.publisher || "—"}</td><td>{item.record.isbn || "—"}</td></tr>)}
        {!bookItems.length ? <EmptyRow columns={5} /> : null}
      </tbody></table></div></section>
    </>
  );
}

function LecturerPage({ rows, allRows, excludedIds, search, onSearch, onToggle, onReset }: {
  rows: ReturnType<typeof buildDashboardSummary>["lecturerRows"];
  allRows: ReturnType<typeof buildDashboardSummary>["lecturerRows"];
  excludedIds: Set<string>;
  search: string;
  onSearch: (value: string) => void;
  onToggle: (id: string) => void;
  onReset: () => void;
}) {
  return (
    <>
      <PageHeading eyebrow="Pengaturan data" title="Dosen Tetap Program Studi">
        Tentukan dosen yang disertakan dalam seluruh perhitungan portal. Daftar mengikuti perubahan <code>index.json</code> secara otomatis.
      </PageHeading>
      <section className="portalPanel">
        <div className="portalPanel__heading portalPanel__heading--actions"><div><span className="microLabel">Filter global</span><h2>Kecualikan dosen</h2><p>Centang nama untuk mengeluarkan hibah dan luarannya dari seluruh halaman.</p></div><button className="btn" type="button" onClick={onReset} disabled={!excludedIds.size}>Sertakan semua</button></div>
        <div className="lecturerChecklist">
          {allRows.map((lecturer) => <label className={excludedIds.has(lecturer.id) ? "lecturerCheck lecturerCheck--excluded" : "lecturerCheck"} key={lecturer.id}><input type="checkbox" checked={excludedIds.has(lecturer.id)} onChange={() => onToggle(lecturer.id)} /><span><strong>{lecturer.name}</strong><small>SINTA ID {lecturer.id}</small></span>{excludedIds.has(lecturer.id) ? <em>Dikecualikan</em> : null}</label>)}
        </div>
      </section>
      <section className="portalPanel">
        <div className="portalPanel__heading portalPanel__heading--actions"><div><span className="microLabel">Profil kontribusi</span><h2>Data per dosen</h2></div><label className="searchField"><span className="srOnly">Cari dosen</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Cari nama dosen…" /></label></div>
        <div className="dataTableWrap"><table className="dataTable lecturerTable"><thead><tr><th>Dosen</th><th>Skor SINTA</th><th>Scopus</th><th>S1 + S2</th><th>Penelitian</th><th>Anggaran penelitian</th><th>PkM</th><th>Anggaran PkM</th><th>Total luaran</th></tr></thead><tbody>
          {rows.map((lecturer) => <tr className={excludedIds.has(lecturer.id) ? "isExcluded" : ""} key={lecturer.id}><th><span>{lecturer.name}</span><small>{excludedIds.has(lecturer.id) ? "Dikecualikan" : `SINTA ID ${lecturer.id}`}</small></th><td>{lecturer.sintaScore}</td><td>{lecturer.scopus}</td><td>{lecturer.sinta12}</td><td>{lecturer.researches}</td><td>{formatRupiah(lecturer.researchFunding, true)}</td><td>{lecturer.pkm}</td><td>{formatRupiah(lecturer.pkmFunding, true)}</td><td>{lecturer.outputs}</td></tr>)}
          {!rows.length ? <EmptyRow columns={9} /> : null}
        </tbody></table></div>
      </section>
    </>
  );
}
