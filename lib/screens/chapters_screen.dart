import 'package:flutter/material.dart';

import '../models.dart';
import 'reader_screen.dart';

class ChaptersScreen extends StatelessWidget {
  const ChaptersScreen({super.key, required this.book});

  final Book book;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(book.name)),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
          maxCrossAxisExtent: 72,
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
        ),
        itemCount: book.chapterCount,
        itemBuilder: (context, index) {
          final chapter = index + 1;
          return OutlinedButton(
            style: OutlinedButton.styleFrom(padding: EdgeInsets.zero),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ReaderScreen(bookId: book.id, chapter: chapter),
              ),
            ),
            child: Text('$chapter'),
          );
        },
      ),
    );
  }
}
