# Bible App (React Native + Expo + NativeWind)

App di động dùng các API của `bible-api` (FastAPI).

| Tab | API |
|---|---|
| Đọc | `GET /books`, `GET /books/{id}/chapters/{n}` — nhấn giữ câu để thêm ghi chú (`POST /notes`) |
| Tìm | `GET /search`, `GET /search/semantic` |
| Hỏi đáp | `POST /ask` (RAG) và `POST /agent/chat` (Trợ lý, nhớ hội thoại qua `thread_id`) |
| Ghi chú | `GET/PATCH/DELETE /notes` — chạm để sửa, nhấn giữ để xoá |
| Cài đặt | Địa chỉ server + `X-API-Key`, kiểm tra `GET /health` |

## Chạy

```bash
npm install
npx expo install --fix      # đồng bộ version thư viện với Expo SDK
npx expo start
```

Trên điện thoại thật, `localhost` là chính điện thoại → nhập IP máy chạy backend trong tab **Cài đặt**
(vd `http://192.168.1.10:8000`), hoặc đặt sẵn: `EXPO_PUBLIC_API_URL=http://192.168.1.10:8000 npx expo start`.
Backend cần chạy với `--host 0.0.0.0`.

## Test

```bash
npm test          # Jest + React Native Testing Library
npm run typecheck
```
