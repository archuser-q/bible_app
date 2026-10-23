class Book {
  const Book({
    required this.id,
    required this.name,
    required this.testament,
    required this.chapterCount,
  });

  final int id;
  final String name;
  final String testament; // "OT" | "NT"
  final int chapterCount;

  factory Book.fromJson(Map<String, dynamic> json) => Book(
        id: json['id'] as int,
        name: json['name'] as String,
        testament: json['testament'] as String,
        chapterCount: json['chapter_count'] as int,
      );
}

class Verse {
  const Verse({required this.number, required this.text});

  final int number;
  final String text;

  factory Verse.fromJson(Map<String, dynamic> json) => Verse(
        number: json['verse'] as int,
        text: json['text'] as String,
      );
}

class Chapter {
  const Chapter({required this.book, required this.number, required this.verses});

  final Book book;
  final int number;
  final List<Verse> verses;

  factory Chapter.fromJson(Map<String, dynamic> json) => Chapter(
        book: Book.fromJson(json['book'] as Map<String, dynamic>),
        number: json['chapter'] as int,
        verses: (json['verses'] as List<dynamic>)
            .map((v) => Verse.fromJson(v as Map<String, dynamic>))
            .toList(),
      );
}

class SearchHit {
  const SearchHit({
    required this.bookId,
    required this.bookName,
    required this.chapter,
    required this.verse,
    required this.text,
  });

  final int bookId;
  final String bookName;
  final int chapter;
  final int verse;
  final String text;

  factory SearchHit.fromJson(Map<String, dynamic> json) => SearchHit(
        bookId: json['book_id'] as int,
        bookName: json['book_name'] as String,
        chapter: json['chapter'] as int,
        verse: json['verse'] as int,
        text: json['text'] as String,
      );
}

class SearchResult {
  const SearchResult({required this.query, required this.count, required this.results});

  final String query;
  final int count;
  final List<SearchHit> results;

  factory SearchResult.fromJson(Map<String, dynamic> json) => SearchResult(
        query: json['query'] as String,
        count: json['count'] as int,
        results: (json['results'] as List<dynamic>)
            .map((h) => SearchHit.fromJson(h as Map<String, dynamic>))
            .toList(),
      );
}
