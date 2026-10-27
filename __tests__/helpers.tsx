import { render } from '@testing-library/react-native';
import { ReactElement } from 'react';
import { SettingsProvider } from '../src/context/SettingsContext';

export const BASE = 'http://api.test';

export function mockFetch(handler: (url: string, init?: RequestInit) => { status?: number; body?: unknown }) {
  const fn = jest.fn(async (url: string, init?: RequestInit) => {
    const { status = 200, body } = handler(url, init);
    return { ok: status < 400, status, json: async () => body } as Response;
  });
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

export const renderWithSettings = async (ui: ReactElement, apiKey = 'secret') =>
  render(<SettingsProvider initial={{ baseUrl: BASE, apiKey }}>{ui}</SettingsProvider>);

export const books = [
  { id: 1, name: 'Genesis', testament: 'OT', chapter_count: 50 },
  { id: 2, name: 'Exodus', testament: 'OT', chapter_count: 40 },
  { id: 43, name: 'John', testament: 'NT', chapter_count: 21 },
];
