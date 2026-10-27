import { ActivityIndicator, Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

export const Screen = ({ children }: { children: React.ReactNode }) => (
  <View className="flex-1 bg-white">{children}</View>
);

export const Loading = () => (
  <View className="flex-1 items-center justify-center py-10" testID="loading">
    <ActivityIndicator color="#171717" />
  </View>
);

export const ErrorView = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <View className="items-center px-6 py-10">
    <Text className="mb-4 text-center text-sm text-neutral-500">{message}</Text>
    {onRetry && <Button label="Thử lại" variant="outline" onPress={onRetry} />}
  </View>
);

export const Empty = ({ message }: { message: string }) => (
  <Text className="px-6 py-10 text-center text-sm text-neutral-400">{message}</Text>
);

interface ButtonProps { label: string; onPress: () => void; variant?: 'solid' | 'outline' | 'ghost'; disabled?: boolean; testID?: string }
export function Button({ label, onPress, variant = 'solid', disabled, testID }: ButtonProps) {
  const box = {
    solid: 'bg-neutral-900 border-neutral-900',
    outline: 'bg-white border-neutral-300',
    ghost: 'bg-transparent border-transparent',
  }[variant];
  const text = variant === 'solid' ? 'text-white' : 'text-neutral-900';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      className={`items-center rounded-lg border px-4 py-2.5 ${box} ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className={`text-sm font-medium ${text}`}>{label}</Text>
    </Pressable>
  );
}

export const Input = (props: TextInputProps) => (
  <TextInput
    placeholderTextColor="#a3a3a3"
    autoCapitalize="none"
    {...props}
    className={`rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-base text-neutral-900 ${props.className ?? ''}`}
  />
);

export function Segmented<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row rounded-lg bg-neutral-100 p-1">
      {options.map((o) => (
        <Pressable
          key={o.value}
          accessibilityRole="tab"
          accessibilityState={{ selected: o.value === value }}
          onPress={() => onChange(o.value)}
          className={`flex-1 items-center rounded-md py-1.5 ${o.value === value ? 'bg-white' : ''}`}
        >
          <Text className={`text-sm ${o.value === value ? 'font-medium text-neutral-900' : 'text-neutral-500'}`}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
