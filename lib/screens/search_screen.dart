import 'package:flutter/material.dart';

import '../api_client.dart';
import '../models.dart';
import '../widgets/error_view.dart';
import 'reader_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  Future<SearchResult>? _future;
  bool _semantic = true; // true: theo ý nghĩa, false: theo từ khóa

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final query = _controller.text.trim();
    if (query.length < 2) return;
    setState(() {
      _future = _semantic ? api.searchSemantic(query) : api.search(query, limit: 50);
    });
  }

  void _setMode(bool semantic) {
    setState(() {
      _semantic = semantic;
    });
    _submit(); // tìm lại ngay với chế độ mới
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: true,
          textInputAction: TextInputAction.search,
          onSubmitted: (_) => _submit(),
          decoration: InputDecoration(
            hintText: _semantic ? 'vd: verses about anxiety' : 'vd: love, "living water"',
            border: InputBorder.none,
          ),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: _submit),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: Row(
              children: [
                ChoiceChip(
                  label: const Text('Theo ý nghĩa'),
                  selected: _semantic,
                  onSelected: (_) => _setMode(true),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('Từ khóa'),
                  selected: !_semantic,
                  onSelected: (_) => _setMode(false),
                ),
              ],
            ),
          ),
        ),
      ),
      body: _future == null
          ? const Center(child: Text('Nhập từ khóa rồi nhấn Enter'))
          : FutureBuilder<SearchResult>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return ErrorView(message: '${snapshot.error}', onRetry: _submit);
                }
                return _ResultList(result: snapshot.data!);
              },
            ),
    );
  }
}

class _ResultList extends StatelessWidget {
  const _ResultList({required this.result});

  final SearchResult result;

  @override
  Widget build(BuildContext context) {
    if (result.results.isEmpty) {
      return const Center(child: Text('Không tìm thấy kết quả'));
    }

    return ListView.separated(
      itemCount: result.results.length + 1,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Text(
              result.count == result.results.length
                  ? '${result.count} kết quả'
                  : 'Hiện ${result.results.length} / ${result.count} kết quả',
              style: Theme.of(context).textTheme.labelMedium,
            ),
          );
        }
        final hit = result.results[index - 1];
        return ListTile(
          title: Text('${hit.bookName} ${hit.chapter}:${hit.verse}'),
          subtitle: Text(hit.text),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ReaderScreen(
                bookId: hit.bookId,
                chapter: hit.chapter,
                highlightVerse: hit.verse,
              ),
            ),
          ),
        );
      },
    );
  }
}
