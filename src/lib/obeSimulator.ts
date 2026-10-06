export type CourseCategory = "required" | "required_choice" | "elective";

export type ObeCourse = {
  id: string;
  code: string;
  name: string;
  credits: number;
  category: CourseCategory;
};

export type ObeOutcome = {
  id: string;
  code: string;
  label: string;
};

export type TrackCourseRef = {
  courseId: string;
  semester: number;
};

export type ChoiceGroup = {
  id: string;
  label: string;
  choose: number;
  courseOptions: TrackCourseRef[];
  note?: string;
};

export type ElectiveRule = {
  semester: number;
  poolId: string;
  targetCredits: number;
  mode?: "exact" | "atLeast" | "exactOrAtLeast";
};

export type ObeTrack = {
  id: string;
  label: string;
  shortLabel?: string;
  defaultStudentCount?: number;
  expectedCreditsBySemester?: Record<string, number>;
  requiredCourses: TrackCourseRef[];
  choiceGroups?: ChoiceGroup[];
  electiveRules?: ElectiveRule[];
};

export type CoursePool = {
  id: string;
  label: string;
  courseIds: string[];
};

export type CpmkMapping = {
  id: string;
  code: string;
  description?: string;
  courseId: string;
  outcomeId: string;
  trackIds: string[];
};

export type ObeWeight = {
  trackId: string;
  outcomeId: string;
  courseId: string;
  weight: number;
  source?: string;
};

export type ObeCpmkWeight = {
  trackId: string;
  outcomeId: string;
  cpmkCode: string;
  weight: number;
  source?: string;
};

export type SourceNote = {
  severity?: "info" | "warning" | "error";
  code?: string;
  message: string;
};

export type ObeProgramConfig = {
  schemaVersion: string;
  program: {
    id: string;
    name: string;
    institution: string;
    faculty?: string;
    degreeLevel: string;
    curriculum?: string;
    creditUnit?: string;
    totalCredits: number;
    semesterCount: number;
    maxCreditsPerSemester?: number;
    description?: string;
  };
  outcomes: ObeOutcome[];
  courses: ObeCourse[];
  coursePools?: CoursePool[];
  tracks: ObeTrack[];
  cpmks: CpmkMapping[];
  cpmkWeights?: ObeCpmkWeight[];
  weights?: ObeWeight[];
  sourceNotes?: SourceNote[];
};

export type EnrollmentSource = "required" | "choice" | "elective";

export type SimEnrollment = {
  courseId: string;
  semester: number;
  source: EnrollmentSource;
  sourceId?: string;
  included: boolean;
};

export type SimStudent = {
  id: string;
  trackId: string;
  sequence: number;
  enrollments: SimEnrollment[];
};

export type ValidationIssue = {
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
};

export function courseMap(config: ObeProgramConfig) {
  return new Map(config.courses.map((course) => [course.id, course]));
}

export function trackMap(config: ObeProgramConfig) {
  return new Map(config.tracks.map((track) => [track.id, track]));
}

export function outcomeMap(config: ObeProgramConfig) {
  return new Map(config.outcomes.map((outcome) => [outcome.id, outcome]));
}

export function getCourse(config: ObeProgramConfig, id: string) {
  return config.courses.find((course) => course.id === id);
}

export function getTrack(config: ObeProgramConfig, id: string) {
  return config.tracks.find((track) => track.id === id);
}

export function programMaxCreditsPerSemester(config: ObeProgramConfig) {
  const explicit = Number(config.program?.maxCreditsPerSemester ?? 0);
  if (explicit > 0) return explicit;

  const level = String(config.program?.degreeLevel ?? "").trim().toLowerCase();
  if (level === "sarjana" || level === "s1" || level === "bachelor" || level === "undergraduate") return 20;

  return undefined;
}

export function cpmkWeightFor(
  config: ObeProgramConfig,
  outcomeId: string,
  cpmkCode: string,
  trackIds?: string[],
) {
  const allowed = trackIds?.length ? new Set(trackIds) : null;
  const values = (config.cpmkWeights ?? [])
    .filter((item) => item.outcomeId === outcomeId && item.cpmkCode === cpmkCode && (!allowed || allowed.has(item.trackId)))
    .map((item) => item.weight);
  if (!values.length) return undefined;
  const first = values[0];
  return values.every((value) => Math.abs(value - first) <= 0.0001) ? first : undefined;
}

export function shuffle<T>(items: T[]) {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function chooseCredits(
  config: ObeProgramConfig,
  courseIds: string[],
  targetCredits: number,
  used: Set<string>,
  mode: ElectiveRule["mode"] = "exactOrAtLeast",
  maxCredits = Number.POSITIVE_INFINITY,
) {
  const courses = shuffle(courseIds)
    .filter((id) => !used.has(id))
    .map((id) => getCourse(config, id))
    .filter((course): course is ObeCourse => Boolean(course));

  const limit = Math.min(maxCredits, Math.max(targetCredits + 12, targetCredits * 2 + 2));
  const states = new Map<number, string[]>();
  states.set(0, []);

  for (const course of courses) {
    const snapshot = [...states.entries()].sort((a, b) => b[0] - a[0]);
    for (const [sum, ids] of snapshot) {
      const next = sum + course.credits;
      if (next > limit || states.has(next)) continue;
      states.set(next, [...ids, course.id]);
    }
  }

  const totals = [...states.keys()].filter((value) => value > 0).sort((a, b) => a - b);
  if (!totals.length || targetCredits <= 0) return [];

  let chosenTotal: number | undefined;
  if (states.has(targetCredits)) {
    chosenTotal = targetCredits;
  } else if (mode !== "exact") {
    chosenTotal = totals.find((value) => value >= targetCredits);
  }

  if (chosenTotal == null) {
    chosenTotal = totals.reduce((best, value) => {
      return Math.abs(value - targetCredits) < Math.abs(best - targetCredits) ? value : best;
    }, totals[0]);
  }

  return states.get(chosenTotal) ?? [];
}

export function generateStudent(config: ObeProgramConfig, trackId: string, sequence: number): SimStudent {
  const track = getTrack(config, trackId);
  if (!track) throw new Error(`Track tidak ditemukan: ${trackId}`);

  const enrollments: SimEnrollment[] = [];
  const used = new Set<string>();

  for (const ref of track.requiredCourses ?? []) {
    if (used.has(ref.courseId)) continue;
    enrollments.push({ courseId: ref.courseId, semester: ref.semester, source: "required", included: true });
    used.add(ref.courseId);
  }

  for (const group of track.choiceGroups ?? []) {
    const options = shuffle(group.courseOptions ?? []).slice(0, Math.max(0, group.choose));
    for (const ref of options) {
      if (used.has(ref.courseId)) continue;
      enrollments.push({
        courseId: ref.courseId,
        semester: ref.semester,
        source: "choice",
        sourceId: group.id,
        included: true,
      });
      used.add(ref.courseId);
    }
  }

  const pools = new Map((config.coursePools ?? []).map((pool) => [pool.id, pool]));
  const maxPerSemester = programMaxCreditsPerSemester(config);
  for (const rule of track.electiveRules ?? []) {
    const pool = pools.get(rule.poolId);
    if (!pool) continue;

    const semesterUsed = enrollments
      .filter((item) => item.semester === rule.semester)
      .reduce((sum, item) => sum + (getCourse(config, item.courseId)?.credits ?? 0), 0);
    const available = maxPerSemester == null
      ? Number.POSITIVE_INFINITY
      : Math.max(0, maxPerSemester - semesterUsed);
    const target = Math.min(rule.targetCredits, available);
    if (target <= 0) continue;

    const ids = chooseCredits(config, pool.courseIds, target, used, rule.mode, available);
    for (const courseId of ids) {
      enrollments.push({
        courseId,
        semester: rule.semester,
        source: "elective",
        sourceId: rule.poolId,
        included: true,
      });
      used.add(courseId);
    }
  }

  enrollments.sort((a, b) => a.semester - b.semester || a.source.localeCompare(b.source));
  const prefix = (track.shortLabel ?? track.label ?? track.id).replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "MHS";

  return {
    id: `${prefix}-${String(sequence).padStart(2, "0")}`,
    trackId,
    sequence,
    enrollments,
  };
}

export function generateCohort(config: ObeProgramConfig, counts: Record<string, number>) {
  const students: SimStudent[] = [];
  for (const track of config.tracks) {
    const count = Math.max(0, Math.min(100, Math.round(counts[track.id] ?? track.defaultStudentCount ?? 4)));
    for (let i = 1; i <= count; i += 1) students.push(generateStudent(config, track.id, i));
  }
  return students;
}

export function semesterCredits(config: ObeProgramConfig, student: SimStudent, semester: number) {
  const courses = courseMap(config);
  return student.enrollments
    .filter((item) => item.semester === semester)
    .reduce((sum, item) => sum + (courses.get(item.courseId)?.credits ?? 0), 0);
}

export function studentTotalCredits(config: ObeProgramConfig, student: SimStudent) {
  const courses = courseMap(config);
  return student.enrollments.reduce((sum, item) => sum + (courses.get(item.courseId)?.credits ?? 0), 0);
}

export function activeEnrollments(student: SimStudent) {
  return student.enrollments.filter((item) => item.included);
}

export function studentWeightCoverage(config: ObeProgramConfig, student: SimStudent) {
  const output = new Map<string, number>();
  for (const outcome of config.outcomes) output.set(outcome.id, 0);

  if ((config.cpmkWeights ?? []).length) {
    const activeMappings = cpmksForStudent(config, student);
    const activeKeys = new Set(activeMappings.map((mapping) => `${mapping.outcomeId}::${mapping.code}`));
    for (const weight of config.cpmkWeights ?? []) {
      if (weight.trackId !== student.trackId) continue;
      if (!activeKeys.has(`${weight.outcomeId}::${weight.cpmkCode}`)) continue;
      output.set(weight.outcomeId, (output.get(weight.outcomeId) ?? 0) + weight.weight);
    }
    return output;
  }

  const active = new Set(activeEnrollments(student).map((item) => item.courseId));
  for (const weight of config.weights ?? []) {
    if (weight.trackId !== student.trackId || !active.has(weight.courseId)) continue;
    output.set(weight.outcomeId, (output.get(weight.outcomeId) ?? 0) + weight.weight);
  }
  return output;
}

export function cpmksForStudent(config: ObeProgramConfig, student: SimStudent) {
  const active = new Set(activeEnrollments(student).map((item) => item.courseId));
  return config.cpmks.filter((mapping) => mapping.trackIds.includes(student.trackId) && active.has(mapping.courseId));
}

function canReachExactCredits(config: ObeProgramConfig, ids: string[], target: number) {
  let reachable = new Set<number>([0]);
  for (const id of ids) {
    const credits = getCourse(config, id)?.credits;
    if (!credits) continue;
    const next = new Set(reachable);
    for (const value of reachable) if (value + credits <= target) next.add(value + credits);
    reachable = next;
  }
  return reachable.has(target);
}

export function validateConfig(config: ObeProgramConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const courses = courseMap(config);
  const tracks = trackMap(config);
  const outcomes = outcomeMap(config);
  const pools = new Map((config.coursePools ?? []).map((pool) => [pool.id, pool]));

  if (!config.program?.name) issues.push({ severity: "error", code: "PROGRAM_NAME", message: "Nama program studi belum diisi." });
  if (!(config.program?.semesterCount > 0)) issues.push({ severity: "error", code: "SEMESTER_COUNT", message: "semesterCount harus lebih dari 0." });
  if (!(config.program?.totalCredits > 0)) issues.push({ severity: "error", code: "TOTAL_CREDITS", message: "totalCredits harus lebih dari 0." });
  const maxPerSemester = programMaxCreditsPerSemester(config);

  const duplicate = (values: string[]) => values.filter((value, index) => values.indexOf(value) !== index);
  for (const id of new Set(duplicate(config.courses.map((course) => course.id)))) {
    issues.push({ severity: "error", code: "DUPLICATE_COURSE_ID", message: `ID mata kuliah ganda: ${id}.` });
  }
  for (const code of new Set(duplicate(config.courses.map((course) => course.code).filter(Boolean)))) {
    issues.push({ severity: "warning", code: "DUPLICATE_COURSE_CODE", message: `Kode mata kuliah dipakai lebih dari satu entri: ${code}.` });
  }

  for (const track of config.tracks) {
    const expected = Object.values(track.expectedCreditsBySemester ?? {}).reduce((a, b) => a + Number(b || 0), 0);
    if (expected && Math.abs(expected - config.program.totalCredits) > 0.001) {
      issues.push({
        severity: "warning",
        code: "TRACK_EXPECTED_TOTAL",
        message: `${track.label}: total SKS per semester ${expected}, berbeda dari total program ${config.program.totalCredits}.`,
      });
    }

    if (maxPerSemester != null) {
      for (const [semester, creditsValue] of Object.entries(track.expectedCreditsBySemester ?? {})) {
        const credits = Number(creditsValue || 0);
        if (credits > maxPerSemester + 0.001) {
          issues.push({
            severity: "warning",
            code: "SEMESTER_CREDIT_LIMIT",
            message: `${track.label} semester ${semester}: target ${credits} ${config.program.creditUnit ?? "SKS"} melebihi batas simulator ${maxPerSemester} ${config.program.creditUnit ?? "SKS"}.`,
          });
        }
      }

      const requiredBySemester = new Map<number, number>();
      for (const ref of track.requiredCourses ?? []) {
        requiredBySemester.set(
          ref.semester,
          (requiredBySemester.get(ref.semester) ?? 0) + (courses.get(ref.courseId)?.credits ?? 0),
        );
      }
      for (const [semester, credits] of requiredBySemester) {
        if (credits > maxPerSemester + 0.001) {
          issues.push({
            severity: "error",
            code: "REQUIRED_CREDIT_LIMIT",
            message: `${track.label} semester ${semester}: MK wajib sendiri berjumlah ${credits} ${config.program.creditUnit ?? "SKS"}, melebihi batas ${maxPerSemester}.`,
          });
        }
      }
    }

    for (const ref of track.requiredCourses ?? []) {
      if (!courses.has(ref.courseId)) issues.push({ severity: "error", code: "MISSING_REQUIRED_COURSE", message: `${track.label}: MK wajib ${ref.courseId} tidak ditemukan.` });
    }

    for (const group of track.choiceGroups ?? []) {
      if (group.choose > group.courseOptions.length) {
        issues.push({ severity: "error", code: "CHOICE_GROUP_SIZE", message: `${track.label}: ${group.label} meminta ${group.choose} dari ${group.courseOptions.length} MK.` });
      }
      for (const ref of group.courseOptions) {
        if (!courses.has(ref.courseId)) issues.push({ severity: "error", code: "MISSING_CHOICE_COURSE", message: `${track.label}: MK ${ref.courseId} pada ${group.label} tidak ditemukan.` });
      }
    }

    for (const rule of track.electiveRules ?? []) {
      const pool = pools.get(rule.poolId);
      if (!pool) {
        issues.push({ severity: "error", code: "MISSING_POOL", message: `${track.label}: pool ${rule.poolId} tidak ditemukan.` });
        continue;
      }
      if ((rule.mode === "exact" || rule.mode === "exactOrAtLeast") && !canReachExactCredits(config, pool.courseIds, rule.targetCredits)) {
        issues.push({
          severity: "warning",
          code: "UNREACHABLE_ELECTIVE_TARGET",
          message: `${track.label} semester ${rule.semester}: target ${rule.targetCredits} ${config.program.creditUnit ?? "SKS"} tidak dapat dibentuk tepat dari pool ${pool.label}.`,
        });
      }
    }
  }

  for (const mapping of config.cpmks) {
    if (!courses.has(mapping.courseId)) issues.push({ severity: "error", code: "CPMK_COURSE", message: `${mapping.code}: MK ${mapping.courseId} tidak ditemukan.` });
    if (!outcomes.has(mapping.outcomeId)) issues.push({ severity: "error", code: "CPMK_OUTCOME", message: `${mapping.code}: ${mapping.outcomeId} tidak ditemukan.` });
    for (const trackId of mapping.trackIds) if (!tracks.has(trackId)) issues.push({ severity: "error", code: "CPMK_TRACK", message: `${mapping.code}: jalur ${trackId} tidak ditemukan.` });
  }

  const cpmkWeightTotals = new Map<string, number>();
  for (const weight of config.cpmkWeights ?? []) {
    if (!tracks.has(weight.trackId) || !outcomes.has(weight.outcomeId) || !weight.cpmkCode) {
      issues.push({
        severity: "error",
        code: "CPMK_WEIGHT_REFERENCE",
        message: `Bobot CPMK ${weight.trackId}/${weight.outcomeId}/${weight.cpmkCode || "(tanpa kode)"} memiliki referensi yang tidak valid.`,
      });
      continue;
    }
    const hasCpmk = config.cpmks.some(
      (mapping) => mapping.code === weight.cpmkCode
        && mapping.outcomeId === weight.outcomeId
        && mapping.trackIds.includes(weight.trackId),
    );
    if (!hasCpmk && weight.weight > 0) {
      issues.push({
        severity: "warning",
        code: "CPMK_WEIGHT_WITHOUT_MAPPING",
        message: `${tracks.get(weight.trackId)?.label}: ${weight.cpmkCode} berbobot ${weight.weight}% ke ${weight.outcomeId}, tetapi tidak memiliki mapping CPMK–MK aktif.`,
      });
    }
    const key = `${weight.trackId}::${weight.outcomeId}`;
    cpmkWeightTotals.set(key, (cpmkWeightTotals.get(key) ?? 0) + weight.weight);
  }
  for (const [key, total] of cpmkWeightTotals) {
    if (Math.abs(total - 100) <= 0.05) continue;
    const [trackId, outcomeId] = key.split("::");
    issues.push({
      severity: "warning",
      code: "CPMK_WEIGHT_TOTAL",
      message: `${tracks.get(trackId)?.label ?? trackId}: total bobot CPMK untuk ${outcomeId} adalah ${total.toFixed(2)}%, bukan 100%.`,
    });
  }

  for (const weight of config.weights ?? []) {
    if (!tracks.has(weight.trackId) || !outcomes.has(weight.outcomeId) || !courses.has(weight.courseId)) {
      issues.push({ severity: "error", code: "WEIGHT_REFERENCE", message: `Bobot ${weight.trackId}/${weight.outcomeId}/${weight.courseId} memiliki referensi yang tidak valid.` });
      continue;
    }
    const hasCpmk = config.cpmks.some(
      (mapping) => mapping.courseId === weight.courseId && mapping.outcomeId === weight.outcomeId && mapping.trackIds.includes(weight.trackId),
    );
    if (!hasCpmk && weight.weight > 0) {
      const course = courses.get(weight.courseId);
      issues.push({
        severity: "warning",
        code: "WEIGHT_WITHOUT_CPMK",
        message: `${tracks.get(weight.trackId)?.label}: ${course?.name ?? weight.courseId} berbobot ${weight.weight}% ke ${weight.outcomeId}, tetapi tidak ada CPMK yang memetakan MK tersebut ke CPL itu.`,
      });
    }
  }

  for (const note of config.sourceNotes ?? []) {
    issues.push({ severity: note.severity ?? "info", code: note.code ?? "SOURCE_NOTE", message: note.message });
  }

  return issues;
}

export function parseObeConfig(value: string) {
  const parsed = JSON.parse(value) as ObeProgramConfig;
  if (!parsed || typeof parsed !== "object" || !parsed.program || !Array.isArray(parsed.tracks) || !Array.isArray(parsed.courses)) {
    throw new Error("JSON tidak mengikuti struktur OBE Simulator.");
  }
  return parsed;
}

export function downloadJson(config: ObeProgramConfig, filename?: string) {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename ?? `${config.program.id || "obe-program"}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
