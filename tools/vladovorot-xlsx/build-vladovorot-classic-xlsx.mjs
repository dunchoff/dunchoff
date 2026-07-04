import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const rootDir = "C:/Users/Sanor/Documents/Main";
const sourceDir = path.join(rootDir, "pages/vladovorot-classic");
const outputDir = path.join(rootDir, "outputs");
const outputPath = path.join(outputDir, "vladovorot-classic-challenges.xlsx");
const previewPath = path.join(outputDir, "vladovorot-classic-challenges-preview.png");

await fs.mkdir(outputDir, { recursive: true });

const context = { window: {} };
const dataScript = await fs.readFile(path.join(sourceDir, "data/wheel-items.js"), "utf8");
vm.runInNewContext(dataScript, context);

const items = context.window.WHEEL_ITEMS || [];
if (!items.length) {
  throw new Error("No challenges found in wheel-items.js");
}

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Challenges");
sheet.showGridLines = false;

sheet.getRange("A1:F1").merge();
sheet.getRange("A1").values = [["Vladovorot Classic Challenges"]];
sheet.getRange("A1").format = {
  fill: "#18212F",
  font: { bold: true, color: "#FFFFFF", size: 18 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
sheet.getRange("A1").format.rowHeightPx = 42;

const typeCounts = new Map();
for (const item of items) {
  typeCounts.set(item.type, (typeCounts.get(item.type) || 0) + 1);
}

sheet.getRange("A2:F2").merge();
sheet.getRange("A2").values = [[
  `${items.length} challenges | ${[...typeCounts].map(([type, count]) => `${type}: ${count}`).join(" | ")}`,
]];
sheet.getRange("A2").format = {
  fill: "#EEF3F8",
  font: { color: "#27384C", size: 10 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
sheet.getRange("A2").format.rowHeightPx = 26;

const headers = [["#", "Назва", "Тип", "Опис", "Файл картинки", "Картинка"]];
sheet.getRange("A4:F4").values = headers;
sheet.getRange("A4:F4").format = {
  fill: "#315A7D",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "outside", style: "medium", color: "#1F3348" },
};
sheet.getRange("A4:F4").format.rowHeightPx = 30;

const rows = items.map((item, index) => [
  index + 1,
  item.name,
  item.type,
  item.desc,
  item.img,
  "",
]);

const dataRange = sheet.getRangeByIndexes(4, 0, rows.length, 6);
dataRange.values = rows;
dataRange.format = {
  fill: "#FFFFFF",
  font: { color: "#1F2937", size: 10 },
  verticalAlignment: "center",
  borders: {
    insideHorizontal: { style: "thin", color: "#D7DEE8" },
    insideVertical: { style: "thin", color: "#E8EDF3" },
    bottom: { style: "thin", color: "#D7DEE8" },
  },
};

sheet.getRangeByIndexes(4, 0, rows.length, 1).format.horizontalAlignment = "center";
sheet.getRangeByIndexes(4, 2, rows.length, 1).format.horizontalAlignment = "center";
sheet.getRangeByIndexes(4, 3, rows.length, 1).format.wrapText = true;
sheet.getRangeByIndexes(4, 4, rows.length, 1).format.horizontalAlignment = "center";

sheet.getRange("A:A").format.columnWidthPx = 42;
sheet.getRange("B:B").format.columnWidthPx = 165;
sheet.getRange("C:C").format.columnWidthPx = 105;
sheet.getRange("D:D").format.columnWidthPx = 430;
sheet.getRange("E:E").format.columnWidthPx = 95;
sheet.getRange("F:F").format.columnWidthPx = 95;

for (let row = 5; row < 5 + rows.length; row += 1) {
  sheet.getRange(`A${row}:F${row}`).format.rowHeightPx = 82;
}

sheet.freezePanes.freezeRows(4);
sheet.tables.add(`A4:F${items.length + 4}`, true, "VladovorotChallenges");

for (let index = 0; index < items.length; index += 1) {
  const imagePath = path.join(sourceDir, "images", items[index].img);
  const imageBytes = await fs.readFile(imagePath);
  const dataUrl = `data:image/png;base64,${imageBytes.toString("base64")}`;
  sheet.images.add({
    dataUrl,
    anchor: {
      from: { row: index + 4, col: 5, rowOffsetPx: 5, colOffsetPx: 12 },
      extent: { widthPx: 64, heightPx: 64 },
    },
  });
}

const preview = await workbook.render({
  sheetName: "Challenges",
  range: "A1:F14",
  scale: 1,
  format: "png",
});
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({ outputPath, previewPath, items: items.length }, null, 2));
