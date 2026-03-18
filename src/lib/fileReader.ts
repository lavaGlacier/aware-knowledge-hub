/**
 * Read text content from an uploaded file.
 * Supports .txt, .csv, .md, .json, and best-effort text extraction from other types.
 */
export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      // Limit to ~50KB of content per file to keep state manageable
      resolve(text.slice(0, 50000));
    };
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}
