import type { Book } from '../api/types';

export const reference = (book: string, chapter: number, verse?: number) =>
  verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

export function groupByTestament(books: Book[]) {
  return [
    { title: 'Cựu Ước', data: books.filter((b) => b.testament === 'OT') },
    { title: 'Tân Ước', data: books.filter((b) => b.testament === 'NT') },
  ].filter((s) => s.data.length > 0);
}

export function filterBooks(books: Book[], q: string) {
  const s = q.trim().toLowerCase();
  return s ? books.filter((b) => b.name.toLowerCase().includes(s)) : books;
}

export const chapterRange = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

/** Bỏ ký hiệu Markdown đơn giản để hiển thị text thuần */
export const stripMarkdown = (md: string) =>
  md.replace(/^#{1,6}\s+/gm, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').trim();

export function formatDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}
