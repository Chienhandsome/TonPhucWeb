import Papa from "papaparse";
export function csvRecords(rows: any[]) {
  return Papa.unparse(
    rows.map((record) => {
      const row: any = { ...record, data: JSON.stringify(record.data) };
      const escaped: string[] = [];
      for (const key of Object.keys(row)) {
        if (typeof row[key] === "string" && /^[=+\-@\t\r]/.test(row[key])) {
          row[key] = "'" + row[key];
          escaped.push(key);
        }
      }
      row._cms_escaped = JSON.stringify(escaped);
      return row;
    }),
  );
}
export function parseCsvRecords(source: string) {
  const result = Papa.parse(source, { header: true, skipEmptyLines: true });
  if (result.errors.length)
    throw new Error(
      result.errors
        .map((e) => `Dòng ${Number(e.row) + 2}: ${e.message}`)
        .join("\n"),
    );
  return result.data.map((input: any) => {
    const row = { ...input };
    for (const key of JSON.parse(row._cms_escaped || "[]"))
      if (typeof row[key] === "string" && row[key].startsWith("'"))
        row[key] = row[key].slice(1);
    delete row._cms_escaped;
    return {
      ...row,
      data: JSON.parse(row.data || "{}"),
      version: Number(row.version) || undefined,
    };
  });
}
