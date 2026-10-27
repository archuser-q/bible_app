jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  const api = {
    getItem: jest.fn(async (k) => (k in store ? store[k] : null)),
    setItem: jest.fn(async (k, v) => { store[k] = v; }),
    removeItem: jest.fn(async (k) => { delete store[k]; }),
    clear: jest.fn(async () => { store = {}; }),
  };
  return { __esModule: true, default: api, ...api };
});
