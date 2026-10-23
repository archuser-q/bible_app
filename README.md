# Bible App (Flutter)

Frontend cho [Bible API](../bible-api). Gồm 3 màn hình: danh sách sách (Cựu Ước / Tân Ước), đọc theo chương, tìm kiếm.

## Chạy lần đầu

```bash
cd bible_app
flutter create .        # tạo thư mục android/ios/web..., không ghi đè lib/
flutter pub get
```

Backend phải đang chạy ở `http://localhost:8000` (xem README của bible-api).

## Chạy

**Nhanh nhất – trên Chrome** (không cần emulator):

```bash
flutter run -d chrome
```

**Android emulator** (emulator gọi máy host qua `10.0.2.2`):

```bash
flutter run --dart-define=API_URL=http://10.0.2.2:8000
```

Android chặn HTTP (không có S) theo mặc định. Khi dev, mở
`android/app/src/main/AndroidManifest.xml` và thêm vào thẻ `<application>`:

```xml
android:usesCleartextTraffic="true"
```

**Điện thoại thật**: dùng IP LAN của máy chạy backend, ví dụ
`--dart-define=API_URL=http://192.168.1.10:8000`.

## Test

```bash
flutter test
```

## Cấu trúc

```
lib/
  main.dart              # MaterialApp, theme sáng/tối
  config.dart            # API_URL
  models.dart            # Book, Verse, Chapter, SearchHit, SearchResult
  api_client.dart        # gọi REST API, xử lý lỗi
  widgets/error_view.dart
  screens/
    books_screen.dart    # tab Cựu Ước / Tân Ước
    chapters_screen.dart # lưới số chương
    reader_screen.dart   # đọc chương, chuyển chương trước/sau, tô sáng câu
    search_screen.dart   # tìm kiếm, bấm kết quả → mở đúng câu
```
