import fs from 'fs';
import path from 'path';

/**
 * Generates valid mock PNG files for test file uploads
 */
export function createMockImages(count: number): string[] {
  const dir = path.join(process.cwd(), 'tests', 'fixtures');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
  const paths: string[] = [];

  for (let i = 1; i <= count; i++) {
    const filePath = path.join(dir, `mock_photo_${i}.png`);
    fs.writeFileSync(filePath, png);
    paths.push(filePath);
  }

  return paths;
}

/**
 * Removes temporary mock images folder
 */
export function cleanupMockImages() {
  const dir = path.join(process.cwd(), 'tests', 'fixtures');
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(dir, file));
      } catch {
        // ignore
      }
    }
    try {
      fs.rmdirSync(dir);
    } catch {
      // ignore
    }
  }
}
