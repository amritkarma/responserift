import fs from "fs";
import path from "path";

export function loadMockData() {
  const basePath = path.join(process.cwd(), "app", "data");

  if (!fs.existsSync(basePath)) {
    console.error("Data folder not found:", basePath);
    return {};
  }

  const files = fs.readdirSync(basePath);
  const data: Record<string, any> = {};

  files.forEach((file) => {
    if (!file.endsWith(".json")) return;

    const fileKey = file.replace(".json", "");
    const filePath = path.join(basePath, file);

    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // plain array
      if (Array.isArray(parsed)) {
        data[fileKey] = parsed;
        return;
      }

      // object → extract arrays
      if (typeof parsed === "object") {
        Object.entries(parsed).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            data[key] = value;
          }
        });

        if (!data[fileKey]) {
          data[fileKey] = parsed;
        }
      }

    } catch (error) {
      console.error(`Error parsing ${file}:`, error);
    }
  });

  return data;
}