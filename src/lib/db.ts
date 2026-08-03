import fs from "fs/promises";
import path from "path";
import { Banco } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

async function ensureDb(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    const empty: Banco = { pacientes: [], consultas: [], atendimentos: [] };
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf-8");
  }
}

export async function lerBanco(): Promise<Banco> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as Banco;
}

export async function salvarBanco(banco: Banco): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(banco, null, 2), "utf-8");
}
