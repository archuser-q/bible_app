import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatMode = 'ask' | 'agent';
export interface Message { id: string; role: 'user' | 'assistant' | 'error'; text: string; meta?: string }
export interface ChatState { messages: Message[]; threadId?: string }

export const MAX_MESSAGES = 200;
const key = (mode: ChatMode) => `chat.${mode}.v1`;

export async function loadChat(mode: ChatMode): Promise<ChatState> {
  try {
    const raw = await AsyncStorage.getItem(key(mode));
    const data = raw ? JSON.parse(raw) : null;
    return data && Array.isArray(data.messages) ? data : { messages: [] };
  } catch {
    return { messages: [] };
  }
}

export async function saveChat(mode: ChatMode, state: ChatState) {
  try {
    await AsyncStorage.setItem(key(mode), JSON.stringify({ ...state, messages: state.messages.slice(-MAX_MESSAGES) }));
  } catch {}
}

export const clearChat = (mode: ChatMode) => AsyncStorage.removeItem(key(mode)).catch(() => {});
