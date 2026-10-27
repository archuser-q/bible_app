import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Button, Empty, Input, Screen, Segmented } from '../components/ui';
import { useSettings } from '../context/SettingsContext';
import { ChatMode as Mode, ChatState, clearChat, loadChat, Message, saveChat } from '../utils/chatHistory';
import { stripMarkdown } from '../utils/format';

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function AskScreen() {
  const { api, apiKey } = useSettings();
  const [mode, setMode] = useState<Mode>('ask');
  const [input, setInput] = useState('');
  const [chats, setChats] = useState<Record<Mode, ChatState>>({ ask: { messages: [] }, agent: { messages: [] } });
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const chatsRef = useRef(chats);
  chatsRef.current = chats;

  useEffect(() => {
    Promise.all([loadChat('ask'), loadChat('agent')]).then(([ask, agent]) => {
      setChats({ ask, agent });
      setLoaded(true);
    });
  }, []);

  const update = (m: Mode, fn: (s: ChatState) => ChatState) =>
    setChats((all) => {
      const next = fn(all[m]);
      saveChat(m, next);
      return { ...all, [m]: next };
    });

  const push = (m: Mode, msg: Omit<Message, 'id'>) =>
    update(m, (s) => ({ ...s, messages: [...s.messages, { ...msg, id: newId() }] }));

  const reset = () => {
    clearChat(mode);
    setChats((all) => ({ ...all, [mode]: { messages: [] } }));
  };

  const messages = chats[mode].messages;

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const m = mode;
    if (m === 'ask' && text.length < 3) return push(m, { role: 'error', text: 'Câu hỏi cần ít nhất 3 ký tự' });
    setInput('');
    push(m, { role: 'user', text });
    setBusy(true);
    try {
      if (m === 'ask') {
        const r = await api.ask(text);
        push(m, { role: 'assistant', text: stripMarkdown(r.answer), meta: `${r.model} · ${(r.latency_ms / 1000).toFixed(1)}s` });
      } else {
        const r = await api.chat(text, chatsRef.current.agent.threadId);
        update(m, (s) => ({ ...s, threadId: r.thread_id }));
        push(m, { role: 'assistant', text: stripMarkdown(r.reply), meta: `${(r.latency_ms / 1000).toFixed(1)}s` });
      }
    } catch (e) {
      push(m, { role: 'error', text: e instanceof Error ? e.message : 'Có lỗi xảy ra' });
    } finally {
      setBusy(false);
    }
  };

  if (!apiKey) return <Empty message="Nhập API key trong Cài đặt để hỏi đáp" />;

  return (
    <Screen>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View className="flex-row items-center gap-2 px-4 pt-3">
          <View className="flex-1">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[{ value: 'ask', label: 'Hỏi đáp' }, { value: 'agent', label: 'Trợ lý' }]}
            />
          </View>
          <Button testID="chat-reset" label="Mới" variant="ghost" onPress={reset} disabled={busy || messages.length === 0} />
        </View>
        <FlatList
          ref={listRef}
          className="flex-1"
          data={messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          keyExtractor={(m) => m.id}
          contentContainerClassName="p-4 gap-3"
          ListEmptyComponent={!loaded ? undefined :
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
