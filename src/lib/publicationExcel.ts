export type PublicationExcelRow = {
  year: number | string;
  title: string;
  publication: string;
  index: string;
  sourceAuthor: string;
  dtpsAuthors: string;
  authorPositions: string;
  url?: string | null;
};

type WorkbookSheet = {
  name: string;
  rows: PublicationExcelRow[];
};

type ZipEntry = {
  name: string;
  data: Uint8Array;
};

const encoder = new TextEncoder();

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function inlineCell(reference: string, value: string, style = 0) {
  return `<c r="${reference}" t="inlineStr"${style ? ` s="${style}"` : ""}><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
}

function numberCell(reference: string, value: number) {
  return `<c r="${reference}"><v>${value}</v></c>`;
}

function worksheetXml(rows: PublicationExcelRow[]) {
  const headers = ["Tahun", "Judul", "Jurnal/Prosiding", "Indeks", "Penulis tercatat", "Dosen Matematika ITERA", "Posisi penulis DTPS", "Tautan artikel"];
  const headerCells = headers.map((header, index) => inlineCell(`${String.fromCharCode(65 + index)}1`, header, 1)).join("");
  const body = rows.map((row, index) => {
    const excelRow = index + 2;
    const year = typeof row.year === "number" ? numberCell(`A${excelRow}`, row.year) : inlineCell(`A${excelRow}`, String(row.year));
    const link = row.url ? inlineCell(`H${excelRow}`, "Buka artikel", 2) : inlineCell(`H${excelRow}`, "—");
    return `<row r="${excelRow}">${year}${inlineCell(`B${excelRow}`, row.title)}${inlineCell(`C${excelRow}`, row.publication)}${inlineCell(`D${excelRow}`, row.index)}${inlineCell(`E${excelRow}`, row.sourceAuthor)}${inlineCell(`F${excelRow}`, row.dtpsAuthors, 3)}${inlineCell(`G${excelRow}`, row.authorPositions)}${link}</row>`;
  }).join("");
  let relationshipId = 0;
  const hyperlinks = rows.flatMap((row, index) => row.url ? [`<hyperlink ref="H${index + 2}" r:id="rId${++relationshipId}"/>`] : []).join("");
  const finalRow = Math.max(1, rows.length + 1);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols><col min="1" max="1" width="10" customWidth="1"/><col min="2" max="2" width="58" customWidth="1"/><col min="3" max="3" width="38" customWidth="1"/><col min="4" max="4" width="22" customWidth="1"/><col min="5" max="5" width="24" customWidth="1"/><col min="6" max="6" width="38" customWidth="1"/><col min="7" max="7" width="38" customWidth="1"/><col min="8" max="8" width="18" customWidth="1"/></cols>
  <sheetData><row r="1">${headerCells}</row>${body}</sheetData>
  <autoFilter ref="A1:H${finalRow}"/>
  ${hyperlinks ? `<hyperlinks>${hyperlinks}</hyperlinks>` : ""}
</worksheet>`;
}

function worksheetRelationships(rows: PublicationExcelRow[]) {
  let relationshipId = 0;
  const links = rows.flatMap((row) => row.url ? [`<Relationship Id="rId${++relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xmlEscape(row.url)}" TargetMode="External"/>`] : []).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${links}</Relationships>`;
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function setUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function setUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

function joinBytes(parts: Uint8Array[]) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
}

function createStoredZip(entries: ZipEntry[]) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  entries.forEach((entry) => {
    const name = encoder.encode(entry.name);
    const checksum = crc32(entry.data);
    const local = new Uint8Array(30);
    const localView = new DataView(local.buffer);
    setUint32(localView, 0, 0x04034b50);
    setUint16(localView, 4, 20);
    setUint16(localView, 6, 0x0800);
    setUint16(localView, 8, 0);
    setUint32(localView, 14, checksum);
    setUint32(localView, 18, entry.data.length);
    setUint32(localView, 22, entry.data.length);
    setUint16(localView, 26, name.length);
    localParts.push(local, name, entry.data);

    const central = new Uint8Array(46);
    const centralView = new DataView(central.buffer);
    setUint32(centralView, 0, 0x02014b50);
    setUint16(centralView, 4, 20);
    setUint16(centralView, 6, 20);
    setUint16(centralView, 8, 0x0800);
    setUint16(centralView, 10, 0);
    setUint32(centralView, 16, checksum);
    setUint32(centralView, 20, entry.data.length);
    setUint32(centralView, 24, entry.data.length);
    setUint16(centralView, 28, name.length);
    setUint32(centralView, 42, localOffset);
    centralParts.push(central, name);
    localOffset += local.length + name.length + entry.data.length;
  });

  const localBytes = joinBytes(localParts);
  const centralBytes = joinBytes(centralParts);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  setUint32(endView, 0, 0x06054b50);
  setUint16(endView, 8, entries.length);
  setUint16(endView, 10, entries.length);
  setUint32(endView, 12, centralBytes.length);
  setUint32(endView, 16, localBytes.length);
  return joinBytes([localBytes, centralBytes, end]);
}

function workbookFiles(sheets: WorkbookSheet[]) {
  const sheetOverrides = sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("");
  const workbookSheets = sheets.map((sheet, index) => `<sheet name="${xmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("");
  const workbookRelationships = sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("");
  const styleRelationshipId = sheets.length + 1;
  const files: ZipEntry[] = [
    { name: "[Content_Types].xml", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheetOverrides}</Types>`) },
    { name: "_rels/.rels", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`) },
    { name: "xl/workbook.xml", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheets}</sheets></workbook>`) },
    { name: "xl/_rels/workbook.xml.rels", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${workbookRelationships}<Relationship Id="rId${styleRelationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`) },
    { name: "xl/styles.xml", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="4"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font><font><u/><color rgb="FF0563C1"/><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF17224B"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`) },
  ];
  sheets.forEach((sheet, index) => {
    files.push({ name: `xl/worksheets/sheet${index + 1}.xml`, data: encoder.encode(worksheetXml(sheet.rows)) });
    files.push({ name: `xl/worksheets/_rels/sheet${index + 1}.xml.rels`, data: encoder.encode(worksheetRelationships(sheet.rows)) });
  });
  return files;
}

export function createPublicationWorkbook(sheets: WorkbookSheet[]) {
  return createStoredZip(workbookFiles(sheets));
}

export function downloadPublicationExcel(sheets: WorkbookSheet[], periodLabel: string) {
  const bytes = createPublicationWorkbook(sheets);
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `publikasi-matematika-itera-${periodLabel.replace(/[^0-9-]+/g, "-")}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
