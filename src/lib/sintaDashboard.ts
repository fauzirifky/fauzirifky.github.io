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

export type SintaLevel = "1" | "2" | "3" | "4" | "5" | "6" | "unaccredited";

export type DashboardFilters = {
  excludedLecturerIds: Set<string>;
  sintaLevels: Set<SintaLevel>;
  yearCount: number;
  includeMemberContributions: boolean;
  includeExternalLeaders: boolean;
  referenceYear?: number;
};

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
  sintaAccreditedUnique: number;
  sintaAccreditedNonUnique: number;
  researchUnique: number;
  researchNonUnique: number;
  researchFundingUnique: number;
  researchFundingNonUnique: number;
  researchLedCount: number;
  researchLedFunding: number;
  pkmUnique: number;
  pkmNonUnique: number;
  pkmFundingUnique: number;
  pkmFundingNonUnique: number;
  pkmLedCount: number;
  pkmLedFunding: number;
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
  sintaAccredited: number;
  researches: number;
  researchFunding: number;
  researchLed: number;
  researchLedFunding: number;
  pkm: number;
  pkmFunding: number;
  pkmLed: number;
  pkmLedFunding: number;
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

export function sintaLevelOf(record: SintaRecord): SintaLevel {
  const match = (record.classification ?? "").match(/\bsinta\s*([1-6])\b/i);
  return match ? (match[1] as SintaLevel) : "unaccredited";
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

function isFundingKind(kind: CollectionKey) {
  return kind === "researches" || kind === "community_services";
}

function personNamesMatch(first: string | null | undefined, second: string | null | undefined) {
  const left = normalize(first);
  const right = normalize(second);
  if (!left || !right) return false;
  return left === right || (Math.min(left.length, right.length) >= 8 && (left.includes(right) || right.includes(left)));
}

function leaderMatchesOwner(item: OwnedRecord) {
  return personNamesMatch(item.record.leader, item.ownerName);
}

function collapseFundingMembers(items: OwnedRecord[]) {
  const groups = new Map<string, OwnedRecord[]>();
  items.forEach((item) => {
    const key = uniqueKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  });
  return [...groups.values()].map((group) => group.find(leaderMatchesOwner) ?? group[0]);
}

export function getDashboardRecords(
  lecturers: LoadedLecturer[],
  filters: DashboardFilters,
  kind: CollectionKey,
) {
  const referenceYear = filters.referenceYear ?? new Date().getFullYear();
  const yearCount = Math.max(1, Math.min(20, Math.round(filters.yearCount) || 1));
  const firstYear = referenceYear - yearCount + 1;
  const includedLecturers = lecturers
    .filter((lecturer) => !filters.excludedLecturerIds.has(lecturer.index.sinta_id));
  const includedNames = includedLecturers.map((lecturer) => lecturer.profile.profile.name || lecturer.index.name);
  const candidates = includedLecturers.flatMap((lecturer) =>
      recordsFor(lecturer, kind)
        .filter((record) => {
          const year = yearOf(record);
          const insideWindow = year !== null && year >= firstYear && year <= referenceYear;
          const selectedAccreditation = kind !== "garuda" || filters.sintaLevels.has(sintaLevelOf(record));
          return insideWindow && selectedAccreditation;
        })
        .map((record): OwnedRecord => ({
          kind,
          ownerId: lecturer.index.sinta_id,
          ownerName: lecturer.profile.profile.name || lecturer.index.name,
          record,
        })),
    );

  const externalLeaderFiltered = isFundingKind(kind) && !filters.includeExternalLeaders
    ? candidates.filter((item) => includedNames.some((name) => personNamesMatch(item.record.leader, name)))
    : candidates;
  const nonUnique = isFundingKind(kind) && !filters.includeMemberContributions
    ? collapseFundingMembers(externalLeaderFiltered)
    : externalLeaderFiltered;

  return { nonUnique, unique: unique(nonUnique) };
}

function blankYear(year: number): YearSummary {
  return {
    year,
    scopusUnique: 0,
    scopusNonUnique: 0,
    scopusFirstUnique: 0,
    scopusFirstNonUnique: 0,
    sintaAccreditedUnique: 0,
    sintaAccreditedNonUnique: 0,
    researchUnique: 0,
    researchNonUnique: 0,
    researchFundingUnique: 0,
    researchFundingNonUnique: 0,
    researchLedCount: 0,
    researchLedFunding: 0,
    pkmUnique: 0,
    pkmNonUnique: 0,
    pkmFundingUnique: 0,
    pkmFundingNonUnique: 0,
    pkmLedCount: 0,
    pkmLedFunding: 0,
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
  const sintaAccredited = byKind("garuda");
  const research = byKind("researches");
  const pkm = byKind("community_services");
  const iprs = byKind("iprs");
  const books = byKind("books");

  row.scopusNonUnique = scopus.length;
  row.scopusUnique = unique(scopus).length;
  row.scopusFirstNonUnique = first.length;
  row.scopusFirstUnique = unique(first).length;
  row.sintaAccreditedNonUnique = sintaAccredited.length;
  row.sintaAccreditedUnique = unique(sintaAccredited).length;
  row.researchNonUnique = research.length;
  row.researchUnique = unique(research).length;
  row.researchFundingNonUnique = research.reduce((sum, item) => sum + moneyOf(item.record), 0);
  row.researchFundingUnique = unique(research).reduce((sum, item) => sum + moneyOf(item.record), 0);
  const researchLed = unique(research.filter(leaderMatchesOwner));
  row.researchLedCount = researchLed.length;
  row.researchLedFunding = researchLed.reduce((sum, item) => sum + moneyOf(item.record), 0);
  row.pkmNonUnique = pkm.length;
  row.pkmUnique = unique(pkm).length;
  row.pkmFundingNonUnique = pkm.reduce((sum, item) => sum + moneyOf(item.record), 0);
  row.pkmFundingUnique = unique(pkm).reduce((sum, item) => sum + moneyOf(item.record), 0);
  const pkmLed = unique(pkm.filter(leaderMatchesOwner));
  row.pkmLedCount = pkmLed.length;
  row.pkmLedFunding = pkmLed.reduce((sum, item) => sum + moneyOf(item.record), 0);
  row.iprNonUnique = iprs.length;
  row.iprUnique = unique(iprs).length;
  row.booksNonUnique = books.length;
  row.booksUnique = unique(books).length;
  return row;
}

export function buildDashboardSummary(lecturers: LoadedLecturer[], filters: DashboardFilters): DashboardSummary {
  const all = collectionKeys.flatMap((kind) => getDashboardRecords(lecturers, filters, kind).nonUnique);
  const allForLecturerRows = collectionKeys.flatMap((kind) => getDashboardRecords(
    lecturers,
    { ...filters, excludedLecturerIds: new Set<string>() },
    kind,
  ).nonUnique);
  const referenceYear = filters.referenceYear ?? new Date().getFullYear();
  const yearCount = Math.max(1, Math.min(20, Math.round(filters.yearCount) || 1));
  const years = Array.from({ length: yearCount }, (_, offset) => referenceYear - offset)
    .map((year) => summarizeYear(year, all));

  const totals = years.reduce((total, row) => {
    (Object.keys(total) as (keyof YearSummary)[]).forEach((key) => {
      if (key !== "year") total[key] += row[key];
    });
    return total;
  }, blankYear(0));

  const lecturerRows = lecturers
    .map((lecturer): LecturerSummary => {
      const owned = allForLecturerRows.filter((item) => item.ownerId === lecturer.index.sinta_id);
      const byKind = (kind: CollectionKey) => owned.filter((item) => item.kind === kind);
      const scopus = byKind("scopus");
      const garuda = byKind("garuda");
      const researches = byKind("researches");
      const pkm = byKind("community_services");
      const iprs = byKind("iprs");
      const books = byKind("books");
      const researchLed = researches.filter(leaderMatchesOwner);
      const pkmLed = pkm.filter(leaderMatchesOwner);
      return {
        id: lecturer.index.sinta_id,
        name: lecturer.profile.profile.name || lecturer.index.name,
        sintaScore: Number(lecturer.profile.profile.sinta_score_overall) || 0,
        scopus: scopus.length,
        sintaAccredited: garuda.length,
        researches: researches.length,
        researchFunding: researches.reduce((sum, item) => sum + moneyOf(item.record), 0),
        researchLed: researchLed.length,
        researchLedFunding: researchLed.reduce((sum, item) => sum + moneyOf(item.record), 0),
        pkm: pkm.length,
        pkmFunding: pkm.reduce((sum, item) => sum + moneyOf(item.record), 0),
        pkmLed: pkmLed.length,
        pkmLedFunding: pkmLed.reduce((sum, item) => sum + moneyOf(item.record), 0),
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
