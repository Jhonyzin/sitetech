/** Módulos descontinuados: não listar e redirecionar URLs diretas (ex.: API/cache antigo). */
export const REMOVED_MODULE_IDS = new Set(["m11"]);

export function isRemovedModule(module) {
  if (!module) return false;
  const id = String(module.id || "").toLowerCase();
  const title = String(module.title || "").toLowerCase();
  const order = Number(module.order || 0);
  return (
    REMOVED_MODULE_IDS.has(id) ||
    order > 10 ||
    title.includes("jogos interativos") ||
    title.includes("módulo 11")
  );
}

export function withoutRemovedModules(list) {
  return (list || []).filter((m) => m && !isRemovedModule(m));
}

export function buildModuleIdFromTitle(title) {
  const base = String(title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base ? `mod-${base}` : "";
}
