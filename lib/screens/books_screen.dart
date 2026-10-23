import 'package:flutter/material.dart';

import '../api_client.dart';
import '../models.dart';
import '../widgets/error_view.dart';
import 'chapters_screen.dart';
import 'search_screen.dart';

class BooksScreen extends StatefulWidget {
  const BooksScreen({super.key});

  @override
  State<BooksScreen> createState() => _BooksScreenState();
}

class _BooksScreenState extends State<BooksScreen> {
  late Future<List<Book>> _future;

  @override
  void initState() {
    super.initState();
    _future = api.getBooks();
  }

  void _retry() {
    setState(() {
      _future = api.getBooks();
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Kinh Thánh'),
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              tooltip: 'Tìm kiếm',
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SearchScreen()),
              ),
            ),
          ],
          bottom: const TabBar(
            tabs: [Tab(text: 'Cựu Ước'), Tab(text: 'Tân Ước')],
          ),
        ),
        body: FutureBuilder<List<Book>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return ErrorView(message: '${snapshot.error}', onRetry: _retry);
            }
            final books = snapshot.data!;
            return TabBarView(
              children: [
                _BookList(books: books.where((b) => b.testament == 'OT').toList()),
                _BookList(books: books.where((b) => b.testament == 'NT').toList()),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _BookList extends StatelessWidget {
  const _BookList({required this.books});

  final List<Book> books;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      itemCount: books.length,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final book = books[index];
        return ListTile(
          title: Text(book.name),
          trailing: Text('${book.chapterCount} chương'),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => ChaptersScreen(book: book)),
          ),
        );
      },
    );
  }
}
