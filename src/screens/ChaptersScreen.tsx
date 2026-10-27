import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, Text } from 'react-native';
import { Screen } from '../components/ui';
import type { ReadStackParams } from '../navigation';
import { chapterRange } from '../utils/format';

export default function ChaptersScreen({ route, navigation }: NativeStackScreenProps<ReadStackParams, 'Chapters'>) {
  const { book } = route.params;
  return (
    <Screen>
      <FlatList
        data={chapterRange(book.chapter_count)}
        numColumns={5}
        keyExtractor={String}
        contentContainerClassName="p-3"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Chapter', { book, chapter: item })}
            className="m-1 flex-1 items-center rounded-lg border border-neutral-200 py-3 active:bg-neutral-100"
          >
            <Text className="text-base text-neutral-900">{item}</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
