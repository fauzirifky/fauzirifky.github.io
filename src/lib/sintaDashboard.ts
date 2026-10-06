export const SINTA_DATA_BASE_URL =
  (import.meta.env.VITE_SINTA_DATA_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "https://raw.githubusercontent.com/fauzirifky/Sinta-Matematika-ITERA-Sync/main/data";

export type CollectionKey =
  | "scopus"
  | "garuda"
  | "researches"
  | "community_services"
  | "iprs"
  | "books";

export type SintaIndexAuthor = {
  name: string;
  sinta_id: string;
  file: string;
  status: string;
};

export type SintaIndex = {
  generated_at: string;
  authors_count: number;
  authors: SintaIndexAuthor[];
};

export type SintaRecord = {
  id?: string | null;
  title?: string | null;
  url?: string | null;
  year?: number | string | null;
  classification?: string | null;
  publication?: string | null;
  author_order?: string | null;
  creator?: string | null;
  leader?: string | null;
  scheme?: string | null;
  funding_idr?: number | string | null;
  funding_source_type?: string | null;
  personnel?: Array<{ name?: string | null; url?: string | null }> | null;
  status?: string | null;
  inventors?: string | null;
  holder?: string | null;
  application_number?: string | null;
  ipr_type?: string | null;
  category?: string | null;
  authors?: string | null;
  publisher?: string | null;
  isbn?: string | null;
  citations?: number | string | null;
};

type SintaCollection = { records?: SintaRecord[] };

export type SintaProfile = {
  generated_at?: string;
  profile: {
    name: string;
    sinta_id: string;
    sinta_score_overall?: number | null;
    sinta_score_3yr?: number | null;
  };
  collections: Partial<Record<CollectionKey, SintaCollection>>;
};

export type LoadedLecturer = {
  index: SintaIndexAuthor;
  profile: SintaProfile;
};

export type OwnedRecord = {
  kind: CollectionKey;
  ownerId: string;
  ownerName: string;
  record: SintaRecord;
};

export type YearSummary = {
  year: number;
  scopusUnique: number;
  scopusNonUnique: number;
  scopusFirstUnique: number;
  scopusFirstNonUnique: number;
  sinta12Unique: number;
  sinta12NonUnique: number;
  researchUnique: number;
  researchNonUnique: number;
  researchFundingUnique: number;
  researchFundingNonUnique: number;
  pkmUnique: number;
  pkmNonUnique: number;
  pkmFundingUnique: number;
  pkmFundingNonUnique: number;
  iprUnique: number;
  iprNonUnique: number;
  booksUnique: number;
  booksNonUnique: number;
};

export type LecturerSummary = {
  id: string;
  name: string;
  sintaScore: number;
  scopus: number;
  sinta12: number;
  researches: number;
  researchFunding: number;
  pkm: number;
  pkmFunding: number;
  outputs: number;
};

export type DashboardSummary = {
  years: YearSummary[];
  lecturerRows: LecturerSummary[];
  totals: YearSummary;
};

const collectionKeys: CollectionKey[] = [
  "scopus",
  "garuda",
  "researches",
  "community_services",
  "iprs",
  "books",
];

function safeFileUrl(file: string) {
  const clean = file.split("/").pop() ?? file;
  return `${SINTA_DATA_BASE_URL}/${encodeURIComponent(clean)}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

export async function loadSintaData() {
  const index = await fetchJson<SintaIndex>(`${SINTA_DATA_BASE_URL}/index.json`);
  const results = await Promise.allSettled(
    index.authors.map(async (author) => ({
      index: author,
      profile: await fetchJson<SintaProfile>(safeFileUrl(author.file)),
    })),
  );

  const lecturers: LoadedLecturer[] = [];
  const failed: string[] = [];
  results.forEach((result, position) => {
    if (result.status === "fulfilled") lecturers.push(result.value);
    else failed.push(index.authors[position]?.name ?? `Dosen ${position + 1}`);
  });

  return { index, lecturers, failed };
}

function recordsFor(lecturer: LoadedLecturer, kind: CollectionKey) {
  return lecturer.profile.collections[kind]?.records ?? [];
}

export function yearOf(record: SintaRecord) {
  const parsed = Number(record.year);
  return Number.isInteger(parsed) && parsed >= 1900 && parsed <= 2200 ? parsed : null;
}

export function moneyOf(record: SintaRecord) {
  const parsed = Number(record.funding_idr);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function uniqueKey(item: OwnedRecord) {
  const { record, kind } = item;
  if (record.id) return `${kind}:id:${record.id}`;
  if (record.url) return `${kind}:url:${record.url.replace(/[?#].*$/, "")}`;
  return `${kind}:title:${yearOf(record) ?? "na"}:${normalize(record.title)}`;
}

export function isFirstAuthor(record: SintaRecord) {
  return /^\s*1\s+of\s+\d+/i.test(record.author_order ?? "");
}

export function isSinta12(record: SintaRecord) {
  return /\bsinta\s*[12]\b/i.test(record.classification ?? "");
}

function unique(items: OwnedRecord[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = uniqueKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getDashboardRecords(
  lecturers: LoadedLecturer[],
  excludedIds: Set<string>,
  kind: CollectionKey,
) {
  const nonUnique = lecturers
    .filter((lecturer) => !excludedIds.has(lecturer.index.sinta_id))
    .flatMap((lecturer) =>
      recordsFor(lecturer, kind).map((record): OwnedRecord => ({
        kind,
        ownerId: lecturer.index.sinta_id,
        ownerName: lecturer.profile.profile.name || lecturer.index.name,
        record,
      })),
    );

  return { nonUnique, unique: unique(nonUnique) };
}

function blankYear(year: number): YearSummary {
  return {
    year,
    scopusUnique: 0,
    scopusNonUnique: 0,
    scopusFirstUnique: 0,
    scopusFirstNonUnique: 0,
    sinta12Unique: 0,
    sinta12NonUnique: 0,
    researchUnique: 0,
    researchNonUnique: 0,
    researchFundingUnique: 0,
    researchFundingNonUnique: 0,
    pkmUnique: 0,
    pkmNonUnique: 0,
    pkmFundingUnique: 0,
    pkmFundingNonUnique: 0,
    iprUnique: 0,
    iprNonUnique: 0,
    booksUnique: 0,
    booksNonUnique: 0,
  };
}

function summarizeYear(year: number, all: OwnedRecord[]) {
  const row = blankYear(year);
  const byKind = (kind: CollectionKey) => all.filter((item) => item.kind === kind && yearOf(item.record) === year);

  const scopus = byKind("scopus");
  const first = scopus.filter((item) => isFirstAuthor(item.record));
  const sinta12 = byKind("garuda").filter((item) => isSinta12(item.record));
  const research = byKind("researches");
  const pkm = byKind("community_services");
  const iprs = byKind("iprs");
  const books = byKind("books");

  row.scopusNonUnique = scopus.length;
  row.scopusUnique = unique(scopus).length;
  row.scopusFirstNonUnique = first.length;
  row.scopusFirstUnique = unique(first).length;
  row.sinta12NonUnique = sinta12.length;
  row.sinta12Unique = unique(sinta12).length;
  row.researchNonUnique = research.length;
  row.researchUnique = unique(research).length;
  row.researchFundingNonUnique = research.reduce((sum, item) => sum + moneyOf(item.record), 0);
  row.researchFundingUnique = unique(research).reduce((sum, item) => sum + moneyOf(item.record), 0);
  row.pkmNonUnique = pkm.length;
  row.pkmUnique = unique(pkm).length;
  row.pkmFundingNonUnique = pkm.reduce((sum, item) => sum + moneyOf(item.record), 0);
  row.pkmFundingUnique = unique(pkm).reduce((sum, item) => sum + moneyOf(item.record), 0);
  row.iprNonUnique = iprs.length;
  row.iprUnique = unique(iprs).length;
  row.booksNonUnique = books.length;
  row.booksUnique = unique(books).length;
  return row;
}

export function buildDashboardSummary(lecturers: LoadedLecturer[], excludedIds: Set<string>): DashboardSummary {
  const included = lecturers.filter((lecturer) => !excludedIds.has(lecturer.index.sinta_id));
  const all: OwnedRecord[] = included.flatMap((lecturer) =>
    collectionKeys.flatMap((kind) =>
      recordsFor(lecturer, kind).map((record) => ({
        kind,
        ownerId: lecturer.index.sinta_id,
        ownerName: lecturer.profile.profile.name || lecturer.index.name,
        record,
      })),
    ),
  );

  const years = [...new Set(all.map((item) => yearOf(item.record)).filter((year): year is number => year !== null))]
    .sort((a, b) => b - a)
    .map((year) => summarizeYear(year, all));

  const totals = years.reduce((total, row) => {
    (Object.keys(total) as (keyof YearSummary)[]).forEach((key) => {
      if (key !== "year") total[key] += row[key];
    });
    return total;
  }, blankYear(0));

  const lecturerRows = lecturers
    .map((lecturer): LecturerSummary => {
      const scopus = recordsFor(lecturer, "scopus");
      const garuda = recordsFor(lecturer, "garuda");
      const researches = recordsFor(lecturer, "researches");
      const pkm = recordsFor(lecturer, "community_services");
      const iprs = recordsFor(lecturer, "iprs");
      const books = recordsFor(lecturer, "books");
      return {
        id: lecturer.index.sinta_id,
        name: lecturer.profile.profile.name || lecturer.index.name,
        sintaScore: Number(lecturer.profile.profile.sinta_score_overall) || 0,
        scopus: scopus.length,
        sinta12: garuda.filter(isSinta12).length,
        researches: researches.length,
        researchFunding: researches.reduce((sum, record) => sum + moneyOf(record), 0),
        pkm: pkm.length,
        pkmFunding: pkm.reduce((sum, record) => sum + moneyOf(record), 0),
        outputs: scopus.length + garuda.length + iprs.length + books.length,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "id-ID"));

  return { years, lecturerRows, totals };
}

export function formatRupiah(value: number, compact = false) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}
