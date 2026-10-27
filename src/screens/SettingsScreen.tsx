import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { createApi } from '../api/bible';
import { Button, Input, Screen } from '../components/ui';
import { useSettings } from '../context/SettingsContext';

export default function SettingsScreen() {
  const settings = useSettings();
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => { setBaseUrl(settings.baseUrl); setApiKey(settings.apiKey); }, [settings.baseUrl, settings.apiKey]);

  const test = async () => {
    setStatus('Đang kiểm tra…');
    try {
      await createApi({ baseUrl }).health();
      await settings.save({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() });
      setStatus('Kết nối OK · đã lưu');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Lỗi');
    }
  };

  const save = async () => {
    await settings.save({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() });
    setStatus('Đã lưu');
  };

  return (
    <Screen>
      <View className="gap-5 p-4">
        <View className="gap-1.5">
          <Text className="text-xs uppercase tracking-widest text-neutral-400">Địa chỉ server</Text>
          <Input testID="base-url" value={baseUrl} onChangeText={setBaseUrl} keyboardType="url" placeholder="http://192.168.1.10:8000" />
        </View>
        <View className="gap-1.5">
          <Text className="text-xs uppercase tracking-widest text-neutral-400">API key</Text>
          <Input testID="api-key" value={apiKey} onChangeText={setApiKey} secureTextEntry placeholder="APP_API_KEY" />
          <Text className="text-xs text-neutral-400">Cần cho Ghi chú, Hỏi đáp và Trợ lý.</Text>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1"><Button label="Kiểm tra" variant="outline" onPress={test} /></View>
          <View className="flex-1"><Button testID="save" label="Lưu" onPress={save} /></View>
        </View>
        {status && <Text testID="status" className="text-center text-sm text-neutral-500">{status}</Text>}
      </View>
    </Screen>
  );
}
