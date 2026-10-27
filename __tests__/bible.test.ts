import { createApi } from '../src/api/bible';
import { mockFetch } from './helpers';

const api = createApi({ baseUrl: 'http://x', apiKey: 'k' });
const call = (f: jest.Mock) => ({ url: f.mock.calls[0][0], init: f.mock.calls[0][1] });

describe('createApi', () => {
  it.each([
    ['books', () => api.books(), 'http://x/books', 'GET'],
    ['chapter', () => api.chapter(43, 3), 'http://x/books/43/chapters/3', 'GET'],
    ['verse', () => api.verse(43, 3, 16), 'http://x/books/43/chapters/3/verses/16', 'GET'],
    ['search', () => api.search('love'), 'http://x/search?q=love&limit=20&offset=0', 'GET'],
    ['semantic', () => api.semanticSearch('anxiety', 5), 'http://x/search/semantic?q=anxiety&limit=5', 'GET'],
    ['notes filter', () => api.notes({ book_id: 1, chapter: 2 }), 'http://x/notes?book_id=1&chapter=2', 'GET'],
    ['update note', () => api.updateNote(7, 'hi'), 'http://x/notes/7', 'PATCH'],
    ['delete note', () => api.deleteNote(7), 'http://x/notes/7', 'DELETE'],
  ])('%s gọi đúng endpoint', async (_, fn, url, method) => {
    const f = mockFetch(() => ({ body: {} }));
    await fn();
    expect(call(f).url).toBe(url);
    expect(call(f).init?.method).toBe(method);
  });

  it('ask gửi question và top_k', async () => {
    const f = mockFetch(() => ({ body: { answer: 'a' } }));
    await api.ask('What is faith?');
    expect(JSON.parse(call(f).init!.body as string)).toEqual({ question: 'What is faith?', top_k: 8 });
  });

  it('chat gửi thread_id để agent nhớ hội thoại', async () => {
    const f = mockFetch(() => ({ body: {} }));
    await api.chat('xin chào', 't-1');
    expect(call(f).url).toBe('http://x/agent/chat');
    expect(JSON.parse(call(f).init!.body as string)).toEqual({ message: 'xin chào', thread_id: 't-1' });
  });
});
