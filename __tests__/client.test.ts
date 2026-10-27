import { ApiError, buildUrl, extractDetail, request } from '../src/api/client';
import { mockFetch } from './helpers';

describe('buildUrl', () => {
  it('bỏ dấu / thừa và bỏ qua tham số rỗng', () => {
    expect(buildUrl('http://x/', '/search', { q: 'living water', limit: 5, offset: undefined, empty: '' }))
      .toBe('http://x/search?q=living%20water&limit=5');
  });
  it('không thêm ? khi không có query', () => {
    expect(buildUrl('http://x', '/books')).toBe('http://x/books');
  });
});

describe('extractDetail', () => {
  it('đọc detail dạng chuỗi', () => expect(extractDetail({ detail: 'Không tìm thấy sách' }, 'x')).toBe('Không tìm thấy sách'));
  it('đọc lỗi validation 422', () => expect(extractDetail({ detail: [{ msg: 'too short' }] }, 'x')).toBe('too short'));
  it('dùng fallback khi body lạ', () => expect(extractDetail(null, 'fallback')).toBe('fallback'));
});

describe('request', () => {
  const cfg = { baseUrl: 'http://x', apiKey: 'k' };

  it('gửi header X-API-Key và JSON body khi cần auth', async () => {
    const f = mockFetch(() => ({ body: { id: 1 } }));
    await request(cfg, '/notes', { method: 'POST', body: { a: 1 }, auth: true });
    const [, init] = f.mock.calls[0];
    expect(init?.headers).toMatchObject({ 'X-API-Key': 'k', 'Content-Type': 'application/json' });
    expect(init?.body).toBe('{"a":1}');
  });

  it('không gửi API key cho endpoint công khai', async () => {
    const f = mockFetch(() => ({ body: [] }));
    await request(cfg, '/books');
    expect(f.mock.calls[0][1]?.headers).not.toHaveProperty('X-API-Key');
  });

  it('báo lỗi khi cần auth mà thiếu key, không gọi mạng', async () => {
    const f = mockFetch(() => ({ body: null }));
    await expect(request({ baseUrl: 'http://x' }, '/notes', { auth: true })).rejects.toMatchObject({ status: 401 });
    expect(f).not.toHaveBeenCalled();
  });

  it('ném ApiError với detail từ server', async () => {
    mockFetch(() => ({ status: 429, body: { detail: 'Quá 10 request/phút' } }));
    const err = await request(cfg, '/ask').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 429, message: 'Quá 10 request/phút' });
  });

  it('trả undefined với 204', async () => {
    mockFetch(() => ({ status: 204 }));
    await expect(request(cfg, '/notes/1', { method: 'DELETE', auth: true })).resolves.toBeUndefined();
  });

  it('báo lỗi kết nối khi fetch thất bại', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network')) as any;
    await expect(request(cfg, '/health')).rejects.toMatchObject({ status: 0, message: 'Không kết nối được tới server' });
  });
});
