const triggerDownload = (blob: Blob, filename: string): void => {
  if (typeof document === 'undefined') {
    console.warn('[exportResults] browser only');
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const exportAsJSON = <T>(data: T, filename: string): void => {
  if (!import.meta.env.DEV) {
    console.warn('[exportAsJSON] dev only');
    return;
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  triggerDownload(blob, filename);
};

export const exportAsCSV = <T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<keyof T>,
  filename: string
): void => {
  if (!import.meta.env.DEV) {
    console.warn('[exportAsCSV] dev only');
    return;
  }

  const escape = (v: unknown): string => {
    const s = v == null ? '' : String(v);
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const header = columns.map((c) => escape(String(c))).join(',');
  const body = rows
    .map((row) => columns.map((c) => escape(row[c])).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF', header, '\n', body], {
    type: 'text/csv;charset=utf-8',
  });

  triggerDownload(blob, filename);
};
