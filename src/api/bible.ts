import { ClientConfig, request } from './client';
import type {
  AskResponse, Book, Chapter, ChatResponse, Note, NoteCreate, SearchResult, Verse,
} from './types';

export const createApi = (cfg: ClientConfig) => ({
  health: () => request<{ status: string }>(cfg, '/health'),
  books: () => request<Book[]>(cfg, '/books'),
  chapter: (bookId: number, chapter: number) =>
    request<Chapter>(cfg, `/books/${bookId}/chapters/${chapter}`),
  verse: (bookId: number, chapter: number, verse: number) =>
    request<Verse>(cfg, `/books/${bookId}/chapters/${chapter}/verses/${verse}`),

  search: (q: string, limit = 20, offset = 0) =>
    request<SearchResult>(cfg, '/search', { query: { q, limit, offset } }),
  semanticSearch: (q: string, limit = 10) =>
    request<SearchResult>(cfg, '/search/semantic', { query: { q, limit } }),

  notes: (filter: { book_id?: number; chapter?: number } = {}) =>
    request<Note[]>(cfg, '/notes', { query: filter, auth: true }),
  createNote: (body: NoteCreate) =>
    request<Note>(cfg, '/notes', { method: 'POST', body, auth: true }),
  updateNote: (id: number, content: string) =>
    request<Note>(cfg, `/notes/${id}`, { method: 'PATCH', body: { content }, auth: true }),
  deleteNote: (id: number) =>
    request<void>(cfg, `/notes/${id}`, { method: 'DELETE', auth: true }),

  ask: (question: string, top_k = 8) =>
    request<AskResponse>(cfg, '/ask', { method: 'POST', body: { question, top_k }, auth: true }),
  chat: (message: string, thread_id?: string) =>
    request<ChatResponse>(cfg, '/agent/chat', { method: 'POST', body: { message, thread_id }, auth: true }),
});

export type BibleApi = ReturnType<typeof createApi>;
