import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { BibleApi, createApi } from '../api/bible';

export const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const KEY = 'settings.v1';

interface Settings { baseUrl: string; apiKey: string }
interface Ctx extends Settings { api: BibleApi; ready: boolean; save: (s: Settings) => Promise<void> }

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children, initial }: { children: ReactNode; initial?: Partial<Settings> }) {
  const [settings, setSettings] = useState<Settings>({ baseUrl: DEFAULT_BASE_URL, apiKey: '', ...initial });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setSettings((s) => ({ ...s, ...JSON.parse(raw) })))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...settings,
      ready,
      api: createApi(settings),
      save: async (s) => {
        setSettings(s);
        await AsyncStorage.setItem(KEY, JSON.stringify(s));
      },
    }),
    [settings, ready],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings phải nằm trong SettingsProvider');
  return ctx;
}
