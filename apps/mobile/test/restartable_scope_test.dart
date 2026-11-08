import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:assessment_platform/app/restartable_scope.dart';

int _created = 0;

/// Stands in for the sync engine: built once per provider scope.
final _engineProvider = Provider<int>((ref) => ++_created);

class _Probe extends ConsumerWidget {
  const _Probe();

  @override
  Widget build(BuildContext context, WidgetRef ref) =>
      Directionality(textDirection: TextDirection.ltr, child: Text('engine ${ref.watch(_engineProvider)}'));
}

void main() {
  setUp(() => _created = 0);

  testWidgets('rebuilds every provider when the app restarts (new server address)', (tester) async {
    final restart = ValueNotifier<int>(0);
    await tester.pumpWidget(RestartableScope(restart: restart, child: const _Probe()));
    expect(find.text('engine 1'), findsOneWidget);

    // Nothing changed: the engine is kept.
    await tester.pump();
    expect(_created, 1);

    // The server was changed: a fresh engine is built, not the old one that points at the old server.
    restart.value++;
    await tester.pump();
    expect(find.text('engine 2'), findsOneWidget);
    expect(_created, 2);
  });
}
