import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const fullDiff = fs.readFileSync(path.join(root, "migrations/_full_diff.sql"), "utf8");
const lines = fullDiff.split("\n");

const growthEnumStart = lines.findIndex((line) => line.includes('CREATE TYPE "DestinationStatus"'));
const firstTable = lines.findIndex((line) => line.startsWith('CREATE TABLE "'));
const growthTableStart = lines.findIndex((line) => line.includes('CREATE TABLE "destinations"'));

if (growthEnumStart < 0 || firstTable < 0 || growthTableStart < 0) {
  throw new Error("Could not locate sections in full diff");
}

const baselineLines = [
  ...lines.slice(0, growthEnumStart),
  ...lines.slice(firstTable, growthTableStart),
];

let baseline = baselineLines.join("\n");

baseline = baseline.replace(/^CREATE TABLE "/gm, 'CREATE TABLE IF NOT EXISTS "');

baseline = baseline.replace(
  /^CREATE TYPE "([^"]+)" AS ENUM \(([^)]+)\);$/gm,
  (_match, typeName, values) =>
    `DO $$ BEGIN CREATE TYPE "${typeName}" AS ENUM (${values}); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`
);

const outDir = path.join(root, "migrations/20260630000000_baseline");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "migration.sql"),
  `-- Growth CMS baseline: idempotent core schema (pre-Growth tables)\n-- Generated from prisma schema introspection\n\n${baseline}\n`
);

console.log(`Wrote baseline migration (${baselineLines.length} lines)`);
