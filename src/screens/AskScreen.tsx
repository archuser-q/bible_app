import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Button, Empty, Input, Screen, Segmented } from '../components/ui';
import { useSettings } from '../context/SettingsContext';
import { stripMarkdown } from '../utils/format';

type Mode = 'ask' | 'agent';
export interface Message { id: string; role: 'user' | 'assistant' | 'error'; text: string; meta?: string }

export default function AskScreen() {
  const { api, apiKey } = useSettings();
  const [mode, setMode] = useState<Mode>('ask');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const threadId = useRef<string | undefined>(undefined);
  const nextId = useRef(0);

  const push = (m: Omit<Message, 'id'>) => setMessages((ms) => [...ms, { ...m, id: String(nextId.current++) }]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setMessages([]);
    threadId.current = undefined;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    if (mode === 'ask' && text.length < 3) return push({ role: 'error', text: 'Câu hỏi cần ít nhất 3 ký tự' });
    setInput('');
    push({ role: 'user', text });
    setBusy(true);
    try {
      if (mode === 'ask') {
        const r = await api.ask(text);
        push({ role: 'assistant', text: stripMarkdown(r.answer), meta: `${r.model} · ${(r.latency_ms / 1000).toFixed(1)}s` });
      } else {
        const r = await api.chat(text, threadId.current);
        threadId.current = r.thread_id;
        push({ role: 'assistant', text: stripMarkdown(r.reply), meta: `${(r.latency_ms / 1000).toFixed(1)}s` });
      }
    } catch (e) {
      push({ role: 'error', text: e instanceof Error ? e.message : 'Có lỗi xảy ra' });
    } finally {
      setBusy(false);
    }
  };

  if (!apiKey) return <Empty message="Nhập API key trong Cài đặt để hỏi đáp" />;

  return (
    <Screen>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View className="px-4 pt-3">
          <Segmented
            value={mode}
            onChange={switchMode}
            options={[{ value: 'ask', label: 'Hỏi đáp' }, { value: 'agent', label: 'Trợ lý' }]}
          />
        </View>
        <FlatList
          className="flex-1"
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerClassName="p-4 gap-3"
          ListEmptyComponent={
            <Empty message={mode === 'ask' ? 'Đặt câu hỏi về Kinh Thánh' : 'Trò chuyện với trợ lý — có thể nhờ tìm câu, mở đoạn, lưu ghi chú'} />
          }
          renderItem={({ item }) => (
            <View className={item.role === 'user' ? 'items-end' : 'items-start'}>
              <View
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 ${
                  item.role === 'user' ? 'bg-neutral-900' : item.role === 'error' ? 'border border-neutral-300' : 'bg-neutral-100'
                }`}
              >
                <Text className={`text-[15px] leading-6 ${item.role === 'user' ? 'text-white' : 'text-neutral-800'}`}>{item.text}</Text>
              </View>
              {item.meta && <Text className="mt-1 text-[11px] text-neutral-400">{item.meta}</Text>}
            </View>
          )}
          ListFooterComponent={busy ? <Text className="text-sm text-neutral-400">Đang trả lời…</Text> : undefined}
        />
        <View className="flex-row items-end gap-2 border-t border-neutral-100 p-3">
          <View className="flex-1">
            <Input testID="ask-input" multiline autoCapitalize="sentences" placeholder="Nhập câu hỏi…" value={input} onChangeText={setInput} maxLength={mode === 'ask' ? 500 : 1000} />
          </View>
          <Button testID="ask-send" label="Gửi" onPress={send} disabled={busy || !input.trim()} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
