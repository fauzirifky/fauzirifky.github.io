import { useCallback, useEffect, useMemo, useState } from "react";
import Container from "../components/layout/Container";
import {
  buildDashboardSummary,
  formatRupiah,
  loadSintaData,
  SINTA_DATA_BASE_URL,
  type LoadedLecturer,
  type SintaIndex,
} from "../lib/sintaDashboard";

const EXCLUDED_STORAGE_KEY = "sinta-dashboard-excluded-lecturers-v1";

function readExcludedLecturers() {
  try {
    const value = JSON.parse(window.localStorage.getItem(EXCLUDED_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function formatDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(date);
}

function CountPair({ unique, nonUnique }: { unique: number; nonUnique: number }) {
  return (
    <span className="countPair" title={`Unik ${unique}; nonunik ${nonUnique}`}>
      <strong>{unique}</strong>
      <small>{nonUnique}</small>
    </span>
  );
}

export default function SintaResearchDashboard() {
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

  const summary = useMemo(
    () => buildDashboardSummary(lecturers, excludedIds),
    [lecturers, excludedIds],
  );

  const visibleLecturers = useMemo(() => {
    const query = lecturerSearch.trim().toLocaleLowerCase("id-ID");
    return summary.lecturerRows.filter((lecturer) => lecturer.name.toLocaleLowerCase("id-ID").includes(query));
  }, [lecturerSearch, summary.lecturerRows]);

  const availableIds = new Set(lecturers.map((lecturer) => lecturer.index.sinta_id));
  const activeExcludedCount = [...excludedIds].filter((id) => availableIds.has(id)).length;
  const includedCount = Math.max(0, lecturers.length - activeExcludedCount);

  function toggleLecturer(id: string) {
    setExcludedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Container>
      <div className="pageHeader dashboardHeader">
        <div>
          <div className="eyebrow">Research Intelligence · JSON live data</div>
          <h1>SINTA Matematika ITERA</h1>
          <p className="muted">
            Ringkasan hibah, pengabdian, publikasi, dan luaran dosen. Data dibaca langsung dari repositori JSON dan mengikuti pembaruan otomatis berikutnya.
          </p>
        </div>
        <button className="btn btn--primary" type="button" onClick={() => void refresh()} disabled={loading}>
          {loading ? "Memuat…" : "Muat ulang data"}
        </button>
      </div>

      {error ? (
        <div className="dashboardNotice dashboardNotice--error" role="alert">
          <strong>Data belum dapat dimuat.</strong> {error}
          <button className="linkButton" type="button" onClick={() => void refresh()}>Coba lagi</button>
        </div>
      ) : null}

      {!error && loading && lecturers.length === 0 ? (
        <div className="dashboardLoading" aria-live="polite">
          <span className="loadingDot" /> Mengambil indeks dosen dan data profil…
        </div>
      ) : null}

      {index ? (
        <div className="dashboardMeta">
          <span><strong>{includedCount}</strong> dosen disertakan</span>
          <span><strong>{activeExcludedCount}</strong> dikecualikan</span>
          <span>Pembaruan JSON: {formatDate(index.generated_at)}</span>
          {failed.length ? <span className="metaWarning">{failed.length} profil gagal dimuat</span> : null}
        </div>
      ) : null}

      <section className="dashboardSection" aria-labelledby="filter-title">
        <div className="dashboardSection__heading">
          <div>
            <div className="microLabel">Filter analisis</div>
            <h2 id="filter-title">Kecualikan dosen</h2>
            <p>Centang nama untuk mengeluarkan seluruh baris profil dosen tersebut dari hitungan hibah dan luaran. Dosen baru otomatis muncul saat <code>index.json</code> berubah.</p>
          </div>
          <button className="btn" type="button" onClick={() => setExcludedIds(new Set())} disabled={activeExcludedCount === 0}>
            Sertakan semua
          </button>
        </div>

        <div className="lecturerChecklist">
          {summary.lecturerRows.map((lecturer) => (
            <label className={excludedIds.has(lecturer.id) ? "lecturerCheck lecturerCheck--excluded" : "lecturerCheck"} key={lecturer.id}>
              <input
                type="checkbox"
                checked={excludedIds.has(lecturer.id)}
                onChange={() => toggleLecturer(lecturer.id)}
              />
              <span>
                <strong>{lecturer.name}</strong>
                <small>SINTA ID {lecturer.id}</small>
              </span>
              {excludedIds.has(lecturer.id) ? <em>Dikecualikan</em> : null}
            </label>
          ))}
        </div>
      </section>

      <section className="dashboardSection" aria-labelledby="summary-title">
        <div className="dashboardSection__heading">
          <div>
            <div className="microLabel">Ringkasan aktif</div>
            <h2 id="summary-title">Kinerja penelitian & pengabdian</h2>
          </div>
        </div>

        <div className="metricGrid">
          <article className="metricCard"><span>Scopus unik</span><strong>{summary.totals.scopusUnique}</strong><small>{summary.totals.scopusNonUnique} nonunik</small></article>
          <article className="metricCard"><span>Scopus first author</span><strong>{summary.totals.scopusFirstUnique}</strong><small>{summary.totals.scopusFirstNonUnique} nonunik</small></article>
          <article className="metricCard"><span>SINTA 1 + 2</span><strong>{summary.totals.sinta12Unique}</strong><small>{summary.totals.sinta12NonUnique} nonunik</small></article>
          <article className="metricCard"><span>Hibah penelitian</span><strong>{summary.totals.researchUnique}</strong><small>{formatRupiah(summary.totals.researchFundingUnique, true)} unik</small></article>
          <article className="metricCard"><span>Pengabdian (PkM)</span><strong>{summary.totals.pkmUnique}</strong><small>{formatRupiah(summary.totals.pkmFundingUnique, true)} unik</small></article>
          <article className="metricCard"><span>Luaran lain</span><strong>{summary.totals.iprUnique + summary.totals.booksUnique}</strong><small>{summary.totals.iprUnique} HKI · {summary.totals.booksUnique} buku</small></article>
        </div>

        <div className="dataTableWrap">
          <table className="dataTable yearTable">
            <thead>
              <tr>
                <th rowSpan={2}>Tahun</th>
                <th colSpan={2}>Publikasi</th>
                <th colSpan={2}>Penelitian</th>
                <th colSpan={2}>PkM</th>
                <th colSpan={2}>Luaran lain</th>
              </tr>
              <tr>
                <th>Scopus</th>
                <th>S1 + S2</th>
                <th>Jumlah</th>
                <th>Anggaran</th>
                <th>Jumlah</th>
                <th>Anggaran</th>
                <th>HKI</th>
                <th>Buku</th>
              </tr>
            </thead>
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
              {summary.years.length === 0 ? <tr><td colSpan={9} className="emptyCell">Belum ada data untuk filter ini.</td></tr> : null}
            </tbody>
          </table>
        </div>
        <p className="tableLegend"><strong>Angka besar:</strong> unik · <strong>angka kecil:</strong> nonunik. Anggaran mengikuti pola yang sama.</p>
      </section>

      <section className="dashboardSection" aria-labelledby="lecturer-title">
        <div className="dashboardSection__heading dashboardSection__heading--search">
          <div>
            <div className="microLabel">Data dosen</div>
            <h2 id="lecturer-title">Kontribusi per dosen</h2>
          </div>
          <label className="searchField">
            <span className="srOnly">Cari dosen</span>
            <input value={lecturerSearch} onChange={(event) => setLecturerSearch(event.target.value)} placeholder="Cari nama dosen…" />
          </label>
        </div>

        <div className="dataTableWrap">
          <table className="dataTable lecturerTable">
            <thead><tr><th>Dosen</th><th>Skor SINTA</th><th>Scopus</th><th>S1 + S2</th><th>Penelitian</th><th>Anggaran penelitian</th><th>PkM</th><th>Anggaran PkM</th><th>Total luaran</th></tr></thead>
            <tbody>
              {visibleLecturers.map((lecturer) => (
                <tr className={excludedIds.has(lecturer.id) ? "isExcluded" : ""} key={lecturer.id}>
                  <th><span>{lecturer.name}</span><small>{excludedIds.has(lecturer.id) ? "Dikecualikan" : `SINTA ID ${lecturer.id}`}</small></th>
                  <td>{lecturer.sintaScore}</td>
                  <td>{lecturer.scopus}</td>
                  <td>{lecturer.sinta12}</td>
                  <td>{lecturer.researches}</td>
                  <td>{formatRupiah(lecturer.researchFunding, true)}</td>
                  <td>{lecturer.pkm}</td>
                  <td>{formatRupiah(lecturer.pkmFunding, true)}</td>
                  <td>{lecturer.outputs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="methodNote">
        <strong>Catatan metode.</strong> Data unik dideduplikasi per jenis memakai ID sumber, URL, lalu judul+tahun sebagai fallback. Nonunik menjumlahkan semua kemunculan pada profil dosen. “First author” dibaca dari <code>author_order</code>; status corresponding author belum tersedia di JSON sumber sehingga tidak ditampilkan agar tidak menyesatkan. Data publik SINTA dapat terbatas pada halaman yang berhasil dihimpun.
        <a className="link" href={`${SINTA_DATA_BASE_URL}/index.json`} target="_blank" rel="noreferrer">Buka JSON sumber →</a>
      </aside>
    </Container>
  );
}
