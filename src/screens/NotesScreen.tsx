import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import type { Note } from '../api/types';
import NoteEditor from '../components/NoteEditor';
import { Empty, ErrorView, Loading, Screen } from '../components/ui';
import { useSettings } from '../context/SettingsContext';
import { formatDate } from '../utils/format';
import { useAsync } from '../utils/useAsync';

export default function NotesScreen() {
  const { api, apiKey } = useSettings();
  const books = useAsync(() => api.books(), [api]);
  const notes = useAsync(() => (apiKey ? api.notes() : Promise.resolve([] as Note[])), [api, apiKey]);
  const [editing, setEditing] = useState<Note | null>(null);

  useFocusEffect(useCallback(() => { notes.reload(); }, [notes.reload]));

  if (!apiKey) return <Empty message="Nhập API key trong Cài đặt để dùng ghi chú" />;
  if (notes.loading && !notes.data) return <Loading />;
  if (notes.error) return <ErrorView message={notes.error} onRetry={notes.reload} />;

  const bookName = (id: number) => books.data?.find((b) => b.id === id)?.name ?? `Sách ${id}`;

  const remove = (note: Note) =>
    Alert.alert('Xoá ghi chú?', undefined, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá', style: 'destructive',
        onPress: async () => {
          await api.deleteNote(note.id);
          notes.setData((ns) => ns?.filter((n) => n.id !== note.id) ?? null);
        },
      },
    ]);

  return (
    <Screen>
      <FlatList
        data={notes.data ?? []}
        keyExtractor={(n) => String(n.id)}
        ListEmptyComponent={<Empty message="Chưa có ghi chú. Nhấn giữ một câu khi đọc để thêm." />}
        renderItem={({ item }) => (
          <Pressable
            testID={`note-${item.id}`}
            onPress={() => setEditing(item)}
            onLongPress={() => remove(item)}
            className="border-b border-neutral-100 px-4 py-3.5 active:bg-neutral-50"
          >
            <View className="mb-1 flex-row justify-between">
              <Text className="text-xs font-medium text-neutral-500">{`${bookName(item.book_id)} ${item.chapter}:${item.verse}`}</Text>
              <Text className="text-xs text-neutral-400">{formatDate(item.updated_at)}</Text>
            </View>
            <Text className="text-[15px] leading-6 text-neutral-800">{item.content}</Text>
          </Pressable>
        )}
      />
      <NoteEditor
        visible={!!editing}
        title="Sửa ghi chú"
        initial={editing?.content}
        onClose={() => setEditing(null)}
        onSave={async (content) => {
          const updated = await api.updateNote(editing!.id, content);
          notes.setData((ns) => ns?.map((n) => (n.id === updated.id ? updated : n)) ?? null);
        }}
      />
    </Screen>
  );
}
