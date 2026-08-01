export interface PdfPaginationConfig {
  firstPageRows: number;
  nextPageRows: number;
}

export function chunkRowsByPage<T>(
  rows: T[],
  config: PdfPaginationConfig,
): T[][] {
  if (!rows.length) return [[]];

  const firstPageRows = Math.max(1, Math.floor(config.firstPageRows));
  const nextPageRows = Math.max(1, Math.floor(config.nextPageRows));
  const chunks: T[][] = [];
  let index = 0;

  chunks.push(rows.slice(index, index + firstPageRows));
  index += firstPageRows;

  while (index < rows.length) {
    chunks.push(rows.slice(index, index + nextPageRows));
    index += nextPageRows;
  }

  return chunks;
}

