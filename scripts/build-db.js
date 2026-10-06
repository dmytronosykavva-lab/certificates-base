import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const programsDir = path.join(__dirname, '../public/programs');
const outputDbPath = path.join(__dirname, '../public/files-index.json');

function parseFilename(filename) {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Extract year(s)
  const years = nameWithoutExt.match(/\b20\d{2}\b/g) || [];
  const uniqueYears = [...new Set(years)];
  const year = uniqueYears.length > 0 ? uniqueYears.join(' - ') : 'Не вказано';

  // Try to extract date-like patterns
  // Pattern 1: dd-mm-yyyy or dd.mm.yyyy
  const dateNumPattern = /\b\d{2}[-.]\d{2}[-.]20\d{2}\b/g;
  let dates = nameWithoutExt.match(dateNumPattern) || [];
  
  // Pattern 2: textual dates (e.g., 15 березня 2024, з лютого по квітень 2024)
  // We'll extract substrings starting with ' з ' or ' з ' and ending with 'року'
  const textDatePattern = /(?:з\s+)?(\d{1,2}\s+[а-яіїєґ]+\s+20\d{2}\s+року\s*по\s*\d{1,2}\s+[а-яіїєґ]+\s+20\d{2}\s*року)/gi;
  const matchRange = textDatePattern.exec(nameWithoutExt);
  
  let date = 'Не вказано';
  if (matchRange) {
    date = matchRange[1].trim();
  } else if (dates.length > 0) {
    date = dates.join(' - ');
  } else {
    // try to match any "з ... по ... року" roughly
    const roughDate = nameWithoutExt.match(/з\s+.*?(?:року|рок)/i);
    if (roughDate) {
      date = roughDate[0];
    }
  }
  
  // clean up title
  let title = nameWithoutExt;

  return {
    id: filename,
    fileName: filename,
    title,
    year,
    date,
    filePath: `/programs/${filename}`
  };
}

function buildDatabase() {
  console.log(`Сканування директорії: ${programsDir}`);
  const allFiles = [];

  if (!fs.existsSync(programsDir)) {
    console.error(`Директорія ${programsDir} не знайдена.`);
    return;
  }

  const files = fs.readdirSync(programsDir);
  const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));

  console.log(`Знайдено Excel-файлів: ${excelFiles.length}`);

  for (const file of excelFiles) {
    try {
      const fileData = parseFilename(file);
      allFiles.push(fileData);
    } catch (error) {
      console.error(`❌ Помилка обробки файлу ${file}:`, error.message);
    }
  }

  try {
    fs.writeFileSync(outputDbPath, JSON.stringify(allFiles, null, 2));
    console.log(`✅ Успішно! Збережено ${allFiles.length} файлів у ${outputDbPath}`);
  } catch (error) {
    console.error('❌ Помилка запису files-index.json:', error.message);
  }
}

buildDatabase();
