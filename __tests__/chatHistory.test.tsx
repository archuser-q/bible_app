import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import AskScreen from '../src/screens/AskScreen';
import { loadChat, MAX_MESSAGES, saveChat } from '../src/utils/chatHistory';
import { mockFetch, renderWithSettings } from './helpers';

beforeEach(() => (AsyncStorage as any).clear());

const ask = async (text: string) => {
  await fireEvent.changeText(screen.getByTestId('ask-input'), text);
  await fireEvent.press(screen.getByTestId('ask-send'));
};

describe('chatHistory utils', () => {
  it('trả về rỗng khi chưa có dữ liệu hoặc dữ liệu hỏng', async () => {
    expect(await loadChat('ask')).toEqual({ messages: [] });
    await AsyncStorage.setItem('chat.ask.v1', '{not json');
    expect(await loadChat('ask')).toEqual({ messages: [] });
  });

  it('lưu và đọc lại, giới hạn số tin nhắn', async () => {
    const messages = Array.from({ length: MAX_MESSAGES + 5 }, (_, i) => ({ id: String(i), role: 'user' as const, text: `m${i}` }));
    await saveChat('agent', { messages, threadId: 't1' });
    const s = await loadChat('agent');
    expect(s.threadId).toBe('t1');
    expect(s.messages).toHaveLength(MAX_MESSAGES);
    expect(s.messages[0].text).toBe('m5');
  });
});

describe('AskScreen giữ lịch sử', () => {
  it('lịch sử còn sau khi màn hình bị unmount (chuyển tab / mở lại app)', async () => {
    mockFetch(() => ({ body: { answer: 'Hãy cầu nguyện', model: 'm', latency_ms: 100 } }));
    const first = await renderWithSettings(<AskScreen />);
    await ask('Làm sao bớt lo?');
    await screen.findByText('Hãy cầu nguyện');
    await first.unmount();

    await renderWithSettings(<AskScreen />);
    expect(await screen.findByText('Làm sao bớt lo?')).toBeTruthy();
    expect(screen.getByText('Hãy cầu nguyện')).toBeTruthy();
  });

  it('đổi chế độ không xoá lịch sử của chế độ kia', async () => {
    mockFetch((url) => ({
      body: url.endsWith('/ask')
        ? { answer: 'Trả lời RAG', model: 'm', latency_ms: 1 }
        : { thread_id: 't', reply: 'Trả lời agent', latency_ms: 1 },
    }));
    await renderWithSettings(<AskScreen />);
    await ask('Câu RAG');
    await screen.findByText('Trả lời RAG');

    await fireEvent.press(screen.getByText('Trợ lý'));
    expect(screen.queryByText('Trả lời RAG')).toBeNull();
    await ask('Câu agent');
    await screen.findByText('Trả lời agent');

    await fireEvent.press(screen.getByText('Hỏi đáp'));
    expect(screen.getByText('Trả lời RAG')).toBeTruthy();
  });

  it('nhớ thread_id của Trợ lý sau khi mở lại', async () => {
    const f = mockFetch(() => ({ body: { thread_id: 'abc', reply: 'ok', latency_ms: 1 } }));
    const first = await renderWithSettings(<AskScreen />);
    await fireEvent.press(screen.getByText('Trợ lý'));
    await ask('xin chào');
    await screen.findByText('ok');
    await first.unmount();

    await renderWithSettings(<AskScreen />);
    await fireEvent.press(screen.getByText('Trợ lý'));
    await screen.findByText('xin chào');
    await ask('tiếp tục');
    await waitFor(() => expect(f).toHaveBeenCalledTimes(2));
    expect(JSON.parse(f.mock.calls[1][1]!.body as string).thread_id).toBe('abc');
  });

  it('nút Mới xoá lịch sử và thread_id', async () => {
    const f = mockFetch(() => ({ body: { thread_id: 'abc', reply: 'ok', latency_ms: 1 } }));
    await renderWithSettings(<AskScreen />);
    await fireEvent.press(screen.getByText('Trợ lý'));
    await ask('xin chào');
    await screen.findByText('ok');

    await fireEvent.press(screen.getByTestId('chat-reset'));
    expect(screen.queryByText('xin chào')).toBeNull();
    expect((await loadChat('agent')).messages).toHaveLength(0);

    await ask('lại');
    await waitFor(() => expect(f).toHaveBeenCalledTimes(2));
    expect(JSON.parse(f.mock.calls[1][1]!.body as string).thread_id).toBeUndefined();
  });
});
