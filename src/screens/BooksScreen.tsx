import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';
import { ErrorView, Input, Loading, Screen } from '../components/ui';
import { useSettings } from '../context/SettingsContext';
import type { ReadStackParams } from '../navigation';
import { useAsync } from '../utils/useAsync';
import { filterBooks, groupByTestament } from '../utils/format';

export default function BooksScreen({ navigation }: NativeStackScreenProps<ReadStackParams, 'Books'>) {
  const { api } = useSettings();
  const { data, error, loading, reload } = useAsync(() => api.books(), [api]);
  const [q, setQ] = useState('');
  const sections = useMemo(() => groupByTestament(filterBooks(data ?? [], q)), [data, q]);

  return (
    <Screen>
      <View className="px-4 pb-2 pt-3">
        <Input placeholder="Tìm sách…" value={q} onChangeText={setQ} />
      </View>
      {loading ? <Loading /> : error ? <ErrorView message={error} onRetry={reload} /> : (
        <SectionList
          sections={sections}
          keyExtractor={(b) => String(b.id)}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text className="px-4 pb-1 pt-5 text-xs uppercase tracking-widest text-neutral-400">{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Chapters', { book: item })}
              className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-3.5 active:bg-neutral-50"
            >
              <Text className="text-base text-neutral-900">{item.name}</Text>
              <Text className="text-sm text-neutral-400">{item.chapter_count}</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
