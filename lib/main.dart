import 'package:flutter/material.dart';

import 'screens/books_screen.dart';

void main() => runApp(const BibleApp());

class BibleApp extends StatelessWidget {
  const BibleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kinh Thánh',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorSchemeSeed: Colors.brown, useMaterial3: true),
      darkTheme: ThemeData(
        colorSchemeSeed: Colors.brown,
        brightness: Brightness.dark,
        useMaterial3: true,
      ),
      home: const BooksScreen(),
    );
  }
}
