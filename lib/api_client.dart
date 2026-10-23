import 'dart:convert';

import 'package:http/http.dart' as http;

import 'config.dart';
import 'models.dart';

class ApiException implements Exception {
  ApiException(this.message);

  final String message;

  @override
  String toString() => message;
}

class BibleApi {
  BibleApi({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        _baseUrl = baseUrl ?? apiBaseUrl;

  final http.Client _client;
  final String _baseUrl;

  Future<List<Book>> getBooks() async {
    final data = await _get('/books') as List<dynamic>;
    return data.map((b) => Book.fromJson(b as Map<String, dynamic>)).toList();
  }

  Future<Chapter> getChapter(int bookId, int chapter) async {
    final data = await _get('/books/$bookId/chapters/$chapter');
    return Chapter.fromJson(data as Map<String, dynamic>);
  }

  Future<SearchResult> search(String query, {int limit = 20, int offset = 0}) async {
    final data = await _get('/search', {
      'q': query,
      'limit': '$limit',
      'offset': '$offset',
    });
    return SearchResult.fromJson(data as Map<String, dynamic>);
  }

  /// Tìm theo ý nghĩa (semantic search): gõ câu hỏi tự nhiên, không cần trùng từ khóa.
  Future<SearchResult> searchSemantic(String query, {int limit = 20}) async {
    // Lần đầu server có thể đang nạp mô hình AI -> cho chờ lâu hơn
    final data = await _get(
      '/search/semantic',
      {'q': query, 'limit': '$limit'},
      const Duration(seconds: 60),
    );
    return SearchResult.fromJson(data as Map<String, dynamic>);
  }

  Future<dynamic> _get(
    String path, [
    Map<String, String>? query,
    Duration timeout = const Duration(seconds: 10),
  ]) async {
    final uri = Uri.parse('$_baseUrl$path').replace(queryParameters: query);
    final response = await _send(uri, timeout);
    if (response.statusCode != 200) {
      throw ApiException(_errorMessage(response));
    }
    // decode bằng utf8 để không lỗi ký tự đặc biệt (’, —, tiếng Việt...)
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  Future<http.Response> _send(Uri uri, Duration timeout) async {
    try {
      return await _client.get(uri).timeout(timeout);
    } catch (_) {
      throw ApiException('Không kết nối được tới server ($_baseUrl)');
    }
  }

  String _errorMessage(http.Response response) {
    try {
      final body = jsonDecode(utf8.decode(response.bodyBytes));
      if (body is Map && body['detail'] is String) return body['detail'] as String;
    } catch (_) {
      // body không phải JSON
    }
    return 'Lỗi server (${response.statusCode})';
  }
}

/// Dùng chung cho cả app (bản cơ bản, chưa cần dependency injection).
final api = BibleApi();
