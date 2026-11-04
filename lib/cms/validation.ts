export function safeUrl(value: unknown) {
  if (typeof value !== "string") return "";
  return /^(https?:\/\/|\/[^/]|tel:|mailto:)/i.test(value) ? value : "";
}
export function schemaTypes(value: any): Set<string> {
  const types = new Set<string>();
  const walk = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    const t = v["@type"];
    (Array.isArray(t) ? t : [t])
      .filter((x) => typeof x === "string")
      .forEach((x) => types.add(x));
    if (v["@graph"]) walk(v["@graph"]);
  };
  walk(value);
  return types;
}
export function preferredSchema(custom: string | undefined, generated: any[]) {
  if (!custom?.trim()) return generated;
  const parsed = JSON.parse(custom);
  const types = schemaTypes(parsed);
  return [
    ...generated.filter(
      (item) => !Array.from(schemaTypes(item)).some((type) => types.has(type)),
    ),
    parsed,
  ];
}
