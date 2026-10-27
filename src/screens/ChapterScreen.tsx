import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import type { Note, Verse } from '../api/types';
import NoteEditor from '../components/NoteEditor';
import { Button, ErrorView, Loading, Screen } from '../components/ui';
import { useSettings } from '../context/SettingsContext';
import type { ReadStackParams } from '../navigation';
import { reference } from '../utils/format';
import { useAsync } from '../utils/useAsync';

export default function ChapterScreen({ route, navigation }: NativeStackScreenProps<ReadStackParams, 'Chapter'>) {
  const { book, chapter, highlight } = route.params;
  const { api, apiKey } = useSettings();
  const { data, error, loading, reload } = useAsync(() => api.chapter(book.id, chapter), [api, book.id, chapter]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Verse | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: reference(book.name, chapter) });
  }, [navigation, book.name, chapter]);

  useEffect(() => {
    if (!apiKey) return setNotes([]);
    api.notes({ book_id: book.id, chapter }).then(setNotes).catch(() => setNotes([]));
  }, [api, apiKey, book.id, chapter]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorView message={error ?? 'Không có dữ liệu'} onRetry={reload} />;

  const total = data.book.chapter_count;
  const go = (c: number) => navigation.replace('Chapter', { book: data.book, chapter: c });

  return (
    <Screen>
      <FlatList
        data={data.verses}
        keyExtractor={(v) => String(v.verse)}
        initialScrollIndex={highlight ? Math.max(0, Math.min(highlight - 1, data.verses.length - 1)) : undefined}
        onScrollToIndexFailed={() => {}}
        contentContainerClassName="px-5 py-4"
        renderItem={({ item }) => {
          const verseNotes = notes.filter((n) => n.verse === item.verse);
          return (
            <Pressable
              testID={`verse-${item.verse}`}
              onLongPress={() => (apiKey ? setEditing(item) : null)}
              className={`mb-1 rounded-md px-2 py-1.5 ${item.verse === highlight ? 'bg-neutral-100' : ''}`}
            >
              <Text className="text-[17px] leading-7 text-neutral-800">
                <Text className="text-xs text-neutral-400">{item.verse}  </Text>
                {item.text}
              </Text>
              {verseNotes.map((n) => (
                <Text key={n.id} className="mt-1 border-l-2 border-neutral-300 pl-3 text-sm italic text-neutral-500">
                  {n.content}
                </Text>
              ))}
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View className="mt-6 flex-row justify-between pb-8">
            <Button label="← Trước" variant="outline" disabled={chapter <= 1} onPress={() => go(chapter - 1)} />
            <Button label="Sau →" variant="outline" disabled={chapter >= total} onPress={() => go(chapter + 1)} />
          </View>
        }
        ListHeaderComponent={
          apiKey ? <Text className="mb-3 text-xs text-neutral-400">Nhấn giữ một câu để thêm ghi chú</Text> : undefined
        }
      />
      <NoteEditor
        visible={!!editing}
        title={editing ? `Ghi chú · ${reference(book.name, chapter, editing.verse)}` : ''}
        onClose={() => setEditing(null)}
        onSave={async (content) => {
          const note = await api.createNote({ book_id: book.id, chapter, verse: editing!.verse, content });
          setNotes((ns) => [note, ...ns]);
        }}
      />
    </Screen>
  );
}
