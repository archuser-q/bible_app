import 'package:flutter/material.dart';

import '../api_client.dart';
import '../models.dart';
import '../widgets/error_view.dart';

class ReaderScreen extends StatefulWidget {
  const ReaderScreen({
    super.key,
    required this.bookId,
    required this.chapter,
    this.highlightVerse,
  });

  final int bookId;
  final int chapter;

  /// Câu cần tô sáng và cuộn tới (khi mở từ kết quả tìm kiếm).
  final int? highlightVerse;

  @override
  State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
  late int _chapter;
  int? _highlight;
  late Future<Chapter> _future;
  final _highlightKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    _chapter = widget.chapter;
    _highlight = widget.highlightVerse;
    _load();
  }

  void _load() {
    _future = api.getChapter(widget.bookId, _chapter);
    if (_highlight != null) {
      _future.then(
        (_) => WidgetsBinding.instance.addPostFrameCallback((_) {
          final ctx = _highlightKey.currentContext;
          if (ctx != null) {
            Scrollable.ensureVisible(
              ctx,
              alignment: 0.3,
              duration: const Duration(milliseconds: 300),
            );
          }
        }),
        onError: (_) {},
      );
    }
  }

  void _goTo(int chapter) {
    setState(() {
      _chapter = chapter;
      _highlight = null;
      _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Chapter>(
      future: _future,
      builder: (context, snapshot) {
        final data = snapshot.data;
        return Scaffold(
          appBar: AppBar(
            title: Text(data == null ? 'Chương $_chapter' : '${data.book.name} $_chapter'),
          ),
          body: _buildBody(snapshot),
          bottomNavigationBar: data == null ? null : _buildNav(data.book.chapterCount),
        );
      },
    );
  }

  Widget _buildBody(AsyncSnapshot<Chapter> snapshot) {
    if (snapshot.connectionState != ConnectionState.done) {
      return const Center(child: CircularProgressIndicator());
    }
    if (snapshot.hasError) {
      return ErrorView(
        message: '${snapshot.error}',
        onRetry: () => setState(_load),
      );
    }

    final theme = Theme.of(context);
    final verses = snapshot.data!.verses;

    return SingleChildScrollView(
      key: ValueKey(_chapter), // đổi chương thì cuộn lại từ đầu
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final verse in verses)
            Container(
              key: verse.number == _highlight ? _highlightKey : null,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: verse.number == _highlight
                  ? BoxDecoration(
                      color: theme.colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(6),
                    )
                  : null,
              child: Text.rich(
                TextSpan(
                  children: [
                    TextSpan(
                      text: '${verse.number} ',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextSpan(text: verse.text),
                  ],
                ),
                style: theme.textTheme.bodyLarge?.copyWith(height: 1.6),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildNav(int chapterCount) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            TextButton(
              onPressed: _chapter > 1 ? () => _goTo(_chapter - 1) : null,
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [Icon(Icons.chevron_left), Text('Chương trước')],
              ),
            ),
            TextButton(
              onPressed: _chapter < chapterCount ? () => _goTo(_chapter + 1) : null,
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [Text('Chương sau'), Icon(Icons.chevron_right)],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
