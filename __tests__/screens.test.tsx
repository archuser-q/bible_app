import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BooksScreen from '../src/screens/BooksScreen';
import SearchScreen from '../src/screens/SearchScreen';
import AskScreen from '../src/screens/AskScreen';
import SettingsScreen from '../src/screens/SettingsScreen';
import NoteEditor from '../src/components/NoteEditor';
import { render } from '@testing-library/react-native';
import { books, mockFetch, renderWithSettings } from './helpers';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => { mockNavigate.mockReset(); (AsyncStorage as any).clear(); });

describe('BooksScreen', () => {
  const nav = { navigate: jest.fn() } as any;

  it('hiển thị sách theo Cựu/Tân Ước và mở danh sách chương', async () => {
    mockFetch(() => ({ body: books }));
    await renderWithSettings(<BooksScreen navigation={nav} route={{} as any} />);
    expect(await screen.findByText('Genesis')).toBeTruthy();
    expect(screen.getByText('Tân Ước')).toBeTruthy();
    await fireEvent.press(screen.getByText('John'));
    expect(nav.navigate).toHaveBeenCalledWith('Chapters', { book: books[2] });
  });

  it('lọc sách theo ô tìm', async () => {
    mockFetch(() => ({ body: books }));
    await renderWithSettings(<BooksScreen navigation={nav} route={{} as any} />);
    await screen.findByText('Genesis');
    await fireEvent.changeText(screen.getByPlaceholderText('Tìm sách…'), 'exo');
    expect(screen.queryByText('Genesis')).toBeNull();
    expect(screen.getByText('Exodus')).toBeTruthy();
  });

  it('hiện lỗi và cho thử lại', async () => {
    let fail = true;
    mockFetch(() => (fail ? { status: 500, body: { detail: 'DB lỗi' } } : { body: books }));
    await renderWithSettings(<BooksScreen navigation={nav} route={{} as any} />);
    expect(await screen.findByText('DB lỗi')).toBeTruthy();
    fail = false;
    await fireEvent.press(screen.getByText('Thử lại'));
    expect(await screen.findByText('Genesis')).toBeTruthy();
  });
});

describe('SearchScreen', () => {
  const hit = { book_id: 43, book_name: 'John', chapter: 4, verse: 10, text: 'living water' };

  it('tìm theo từ khoá và mở chương khi chạm kết quả', async () => {
    const f = mockFetch(() => ({ body: { query: 'water', total: 1, results: [hit] } }));
    await renderWithSettings(<SearchScreen />);
    await fireEvent.changeText(screen.getByTestId('search-input'), 'water');
    await fireEvent(screen.getByTestId('search-input'), 'submitEditing');
    expect(await screen.findByText('John 4:10')).toBeTruthy();
    expect(f.mock.calls[0][0]).toContain('/search?q=water');
    await fireEvent.press(screen.getByText('living water'));
    expect(mockNavigate).toHaveBeenCalledWith('Đọc', expect.objectContaining({
      screen: 'Chapter', params: expect.objectContaining({ chapter: 4, highlight: 10 }),
    }));
  });

  it('dùng endpoint semantic khi đổi chế độ', async () => {
    const f = mockFetch(() => ({ body: { query: 'x', total: 0, results: [] } }));
    await renderWithSettings(<SearchScreen />);
    await fireEvent.press(screen.getByText('Ngữ nghĩa'));
    await fireEvent.changeText(screen.getByTestId('search-input'), 'fear');
    await fireEvent(screen.getByTestId('search-input'), 'submitEditing');
    expect(await screen.findByText('Không tìm thấy câu nào')).toBeTruthy();
    expect(f.mock.calls[0][0]).toContain('/search/semantic');
  });

  it('chặn truy vấn quá ngắn', async () => {
    const f = mockFetch(() => ({ body: {} }));
    await renderWithSettings(<SearchScreen />);
    await fireEvent.changeText(screen.getByTestId('search-input'), 'a');
    await fireEvent(screen.getByTestId('search-input'), 'submitEditing');
    expect(screen.getByText('Nhập ít nhất 2 ký tự')).toBeTruthy();
    expect(f).not.toHaveBeenCalled();
  });
});

describe('AskScreen', () => {
  it('yêu cầu API key', async () => {
    await renderWithSettings(<AskScreen />, '');
    expect(screen.getByText('Nhập API key trong Cài đặt để hỏi đáp')).toBeTruthy();
  });

  it('hỏi RAG và hiển thị câu trả lời', async () => {
    mockFetch(() => ({ body: { answer: '## Faith\n**Trust** in God', model: 'gpt', latency_ms: 1200 } }));
    await renderWithSettings(<AskScreen />);
    await fireEvent.changeText(screen.getByTestId('ask-input'), 'What is faith?');
    await fireEvent.press(screen.getByTestId('ask-send'));
    expect(await screen.findByText('Faith\nTrust in God')).toBeTruthy();
    expect(screen.getByText('gpt · 1.2s')).toBeTruthy();
  });

  it('chế độ Trợ lý gửi lại thread_id ở tin nhắn sau', async () => {
    const f = mockFetch(() => ({ body: { thread_id: 'abc', reply: 'Chào bạn', latency_ms: 500 } }));
    await renderWithSettings(<AskScreen />);
    await fireEvent.press(screen.getByText('Trợ lý'));
    await fireEvent.changeText(screen.getByTestId('ask-input'), 'xin chào');
    await fireEvent.press(screen.getByTestId('ask-send'));
    await screen.findByText('Chào bạn');
    await fireEvent.changeText(screen.getByTestId('ask-input'), 'tiếp');
    await fireEvent.press(screen.getByTestId('ask-send'));
    await waitFor(() => expect(f).toHaveBeenCalledTimes(2));
    expect(JSON.parse(f.mock.calls[0][1]!.body as string).thread_id).toBeUndefined();
    expect(JSON.parse(f.mock.calls[1][1]!.body as string).thread_id).toBe('abc');
  });

  it('hiển thị lỗi từ server (vd rate limit)', async () => {
    mockFetch(() => ({ status: 429, body: { detail: 'Quá 10 request/phút' } }));
    await renderWithSettings(<AskScreen />);
    await fireEvent.changeText(screen.getByTestId('ask-input'), 'Câu hỏi');
    await fireEvent.press(screen.getByTestId('ask-send'));
    expect(await screen.findByText('Quá 10 request/phút')).toBeTruthy();
  });
});

describe('SettingsScreen', () => {
  it('lưu cài đặt vào AsyncStorage', async () => {
    await renderWithSettings(<SettingsScreen />, '');
    await fireEvent.changeText(screen.getByTestId('api-key'), ' my-key ');
    await fireEvent.press(screen.getByTestId('save'));
    expect(await screen.findByText('Đã lưu')).toBeTruthy();
    expect(JSON.parse((await AsyncStorage.getItem('settings.v1'))!)).toEqual({ baseUrl: 'http://api.test', apiKey: 'my-key' });
  });

  it('kiểm tra kết nối /health', async () => {
    const f = mockFetch(() => ({ body: { status: 'ok' } }));
    await renderWithSettings(<SettingsScreen />);
    await fireEvent.press(screen.getByText('Kiểm tra'));
    expect(await screen.findByText('Kết nối OK · đã lưu')).toBeTruthy();
    expect(f.mock.calls[0][0]).toBe('http://api.test/health');
  });
});

describe('NoteEditor', () => {
  it('gọi onSave với nội dung đã trim rồi đóng', async () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    await render(<NoteEditor visible title="Ghi chú" onSave={onSave} onClose={onClose} />);
    await fireEvent.changeText(screen.getByTestId('note-input'), '  Hay quá  ');
    await fireEvent.press(screen.getByTestId('note-save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledWith('Hay quá');
  });

  it('giữ modal và hiện lỗi khi lưu thất bại', async () => {
    const onClose = jest.fn();
    await render(<NoteEditor visible title="Ghi chú" onSave={() => Promise.reject(new Error('Không tìm thấy câu'))} onClose={onClose} />);
    await fireEvent.changeText(screen.getByTestId('note-input'), 'x');
    await fireEvent.press(screen.getByTestId('note-save'));
    expect(await screen.findByText('Không tìm thấy câu')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
