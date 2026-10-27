export type Testament = 'OT' | 'NT';

export interface Book { id: number; name: string; testament: Testament; chapter_count: number }
export interface Verse { verse: number; text: string }
export interface Chapter { book: Book; chapter: number; verses: Verse[] }

export interface SearchHit {
  book_id: number; book_name: string; chapter: number; verse: number; text: string; score?: number | null;
}
export interface SearchResult { query: string; total: number; results: SearchHit[] }

export interface Note {
  id: number; book_id: number; chapter: number; verse: number; content: string;
  created_at: string; updated_at: string;
}
export interface NoteCreate { book_id: number; chapter: number; verse: number; content: string }

export interface AskResponse {
  answer: string; model: string; latency_ms: number;
  prompt_tokens: number | null; completion_tokens: number | null;
}
export interface ChatResponse { thread_id: string; reply: string; latency_ms: number }
