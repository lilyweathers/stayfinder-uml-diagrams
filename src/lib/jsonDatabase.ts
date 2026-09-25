import fs from "node:fs/promises";
import path from "node:path";

function dataFilePath(fileName: string): string {
  const dataDirectory = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.resolve(process.cwd(), "src", "data");

  return path.join(dataDirectory, fileName);
}

export async function readJsonFile<T>(fileName: string): Promise<T[]> {
  const data = await fs.readFile(dataFilePath(fileName), "utf8");
  return JSON.parse(data) as T[];
}

export async function writeJsonFile<T>(
  fileName: string,
  values: T[],
): Promise<void> {
  await fs.writeFile(
    dataFilePath(fileName),
    `${JSON.stringify(values, null, 2)}\n`,
    "utf8",
  );
}
