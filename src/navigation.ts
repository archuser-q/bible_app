import type { Book } from './api/types';

export type ReadStackParams = {
  Books: undefined;
  Chapters: { book: Book };
  Chapter: { book: Pick<Book, 'id' | 'name'> & Partial<Book>; chapter: number; highlight?: number };
};
