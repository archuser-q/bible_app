import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import type { SearchResult } from '../api/types';
import { Empty, ErrorView, Input, Loading, Screen, Segmented } from '../components/ui';
import { useSettings } from '../context/SettingsContext';
import { reference } from '../utils/format';

type Mode = 'text' | 'semantic';

export default function SearchScreen() {
  const { api } = useSettings();
  const navigation = useNavigation<any>();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<Mode>('text');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (q.trim().length < 2) return setError('Nhập ít nhất 2 ký tự');
    setLoading(true);
    setError(null);
    try {
      setResult(mode === 'text' ? await api.search(q.trim()) : await api.semanticSearch(q.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="gap-3 px-4 pt-3">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[{ value: 'text', label: 'Từ khoá' }, { value: 'semantic', label: 'Ngữ nghĩa' }]}
        />
        <Input
          testID="search-input"
          placeholder={mode === 'text' ? 'vd: love, "living water"' : 'vd: verses about anxiety'}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={submit}
          returnKeyType="search"
        />
      </View>
      {loading ? <Loading /> : error ? <ErrorView message={error} /> : result && (
        <FlatList
          data={result.results}
          keyExtractor={(h) => `${h.book_id}-${h.chapter}-${h.verse}`}
          ListHeaderComponent={<Text className="px-4 pt-4 text-xs text-neutral-400">{result.total} kết quả</Text>}
          ListEmptyComponent={<Empty message="Không tìm thấy câu nào" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Đọc', {
                screen: 'Chapter',
                params: { book: { id: item.book_id, name: item.book_name }, chapter: item.chapter, highlight: item.verse },
              })}
              className="border-b border-neutral-100 px-4 py-3 active:bg-neutral-50"
            >
              <Text className="mb-1 text-xs font-medium text-neutral-500">{reference(item.book_name, item.chapter, item.verse)}</Text>
              <Text className="text-[15px] leading-6 text-neutral-800">{item.text}</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
