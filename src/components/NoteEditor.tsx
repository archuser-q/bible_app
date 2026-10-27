import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, View } from 'react-native';
import { Button, Input } from './ui';

interface Props {
  visible: boolean;
  title: string;
  initial?: string;
  onSave: (content: string) => Promise<void> | void;
  onClose: () => void;
}

export default function NoteEditor({ visible, title, initial = '', onSave, onClose }: Props) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (visible) { setText(initial); setError(null); } }, [visible, initial]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(text.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/30">
        <View className="rounded-t-2xl bg-white p-5">
          <Text className="mb-3 text-base font-semibold text-neutral-900">{title}</Text>
          <Input
            testID="note-input"
            multiline
            autoCapitalize="sentences"
            maxLength={2000}
            placeholder="Viết ghi chú…"
            value={text}
            onChangeText={setText}
            className="min-h-[120px]"
            style={{ textAlignVertical: 'top' }}
          />
          {error && <Text className="mt-2 text-sm text-neutral-500">{error}</Text>}
          <View className="mt-4 flex-row justify-end gap-2">
            <Button label="Huỷ" variant="ghost" onPress={onClose} />
            <Button label={saving ? 'Đang lưu…' : 'Lưu'} onPress={save} disabled={!text.trim() || saving} testID="note-save" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
