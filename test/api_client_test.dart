import 'dart:convert';

import 'package:bible_app/api_client.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

http.Response _json(Object body, [int status = 200]) => http.Response.bytes(
      utf8.encode(jsonEncode(body)),
      status,
      headers: {'content-type': 'application/json'},
    );

void main() {
  test('getChapter parse đúng dữ liệu', () async {
    final client = MockClient((request) async {
      expect(request.url.path, '/books/43/chapters/3');
      return _json({
        'book': {'id': 43, 'name': 'John', 'testament': 'NT', 'chapter_count': 21},
        'chapter': 3,
        'verses': [
          {'verse': 16, 'text': 'For God so loved the world…'},
        ],
      });
    });

    final api = BibleApi(client: client, baseUrl: 'http://test');
    final chapter = await api.getChapter(43, 3);

    expect(chapter.book.name, 'John');
    expect(chapter.verses.single.number, 16);
  });

  test('lỗi 404 trả về ApiException với message từ server', () async {
    final client = MockClient((_) async => _json({'detail': 'Không tìm thấy sách'}, 404));
    final api = BibleApi(client: client, baseUrl: 'http://test');

    await expectLater(
      api.getChapter(99, 1),
      throwsA(isA<ApiException>().having((e) => e.message, 'message', 'Không tìm thấy sách')),
    );
  });
}
