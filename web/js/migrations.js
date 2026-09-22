(function (root, factory) {
  const reliability = root && root.PAToolkitReliability
    ? root.PAToolkitReliability
    : (typeof require === "function" ? require("./reliability.js") : null);
  const api = factory(reliability);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PAToolkitMigrations = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (R) {
  "use strict";

  const PROJECT_SCHEMA = "pa-toolkit/project/3.1";
  const INTAKE_SCHEMA = "pa-toolkit/intake/3.1";

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function migrateIndicators(list) {
    if (!Array.isArray(list)) return [];
    return list.map(function (item) {
      const normalized = R.normalizeIndicator(item);
      if (!normalized.id && item && item.id) normalized.id = String(item.id);
      return normalized;
    });
  }

  function migrateProject(data) {
    const out = clone(data);
    out.version = 3;
    out.schema_version = PROJECT_SCHEMA;
    out.indicators = migrateIndicators(out.indicators);
    if (!Array.isArray(out.evidenceTypes)) out.evidenceTypes = [];
    if (!Array.isArray(out.selectedFileNames)) out.selectedFileNames = [];
    return out;
  }

  function migrateIntake(data) {
    const out = clone(data);
    out.schema_version = INTAKE_SCHEMA;
    out.indicators = migrateIndicators(out.indicators);
    if (!Array.isArray(out.evidenceTypes)) out.evidenceTypes = [];
    return out;
  }

  return {
    PROJECT_SCHEMA:PROJECT_SCHEMA,
    INTAKE_SCHEMA:INTAKE_SCHEMA,
    migrateProject:migrateProject,
    migrateIntake:migrateIntake
  };
});
