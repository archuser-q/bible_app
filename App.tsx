import './global.css';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from './src/context/SettingsContext';
import type { ReadStackParams } from './src/navigation';
import AskScreen from './src/screens/AskScreen';
import BooksScreen from './src/screens/BooksScreen';
import ChapterScreen from './src/screens/ChapterScreen';
import ChaptersScreen from './src/screens/ChaptersScreen';
import NotesScreen from './src/screens/NotesScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator<ReadStackParams>();
const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#ffffff', card: '#ffffff', primary: '#171717', text: '#171717', border: '#f5f5f5' },
};
const header = { headerShadowVisible: false, headerTitleStyle: { fontWeight: '600' as const } };

function ReadStack() {
  return (
    <Stack.Navigator screenOptions={{ ...header, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="Books" component={BooksScreen} options={{ title: 'Kinh Thánh' }} />
      <Stack.Screen name="Chapters" component={ChaptersScreen} options={({ route }) => ({ title: route.params.book.name })} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
    </Stack.Navigator>
  );
}

const icon = (glyph: string) => ({ color }: { color: string }) => <Text style={{ color, fontSize: 16 }}>{glyph}</Text>;

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="dark" />
          <Tab.Navigator screenOptions={{ ...header, tabBarActiveTintColor: '#171717', tabBarInactiveTintColor: '#a3a3a3' }}>
            <Tab.Screen name="Đọc" component={ReadStack} options={{ headerShown: false, tabBarIcon: icon('▤') }} />
            <Tab.Screen name="Tìm" component={SearchScreen} options={{ title: 'Tìm kiếm', tabBarIcon: icon('⌕') }} />
            <Tab.Screen name="Hỏi" component={AskScreen} options={{ title: 'Hỏi đáp', tabBarIcon: icon('?') }} />
            <Tab.Screen name="Ghi chú" component={NotesScreen} options={{ tabBarIcon: icon('✎') }} />
            <Tab.Screen name="Cài đặt" component={SettingsScreen} options={{ tabBarIcon: icon('⚙') }} />
          </Tab.Navigator>
        </NavigationContainer>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
