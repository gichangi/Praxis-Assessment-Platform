import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// A [ProviderScope] that starts over, with every provider rebuilt, each time [restart] changes.
///
/// Used after the server address is changed: the Supabase client is replaced, and anything that
/// kept the old one (the sync engine above all) has to be thrown away with it. Without the key,
/// Flutter would reuse the existing scope and its cached providers would keep calling the old
/// server.
class RestartableScope extends StatelessWidget {
  const RestartableScope({super.key, required this.restart, required this.child});

  final ValueListenable<int> restart;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: restart,
      builder: (_, count, _) => ProviderScope(key: ValueKey(count), child: child),
    );
  }
}
