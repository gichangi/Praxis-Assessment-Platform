import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:assessment_platform/domain/form_definition.dart';
import 'package:assessment_platform/domain/scoring.dart';

void main() {
  late FormDefinition def;
  late Map<String, Answer> answers;

  setUpAll(() {
    // Load the shared parity fixtures from packages/core/test/fixtures/
    // Path is relative to the monorepo root when running flutter test from apps/mobile.
    final formJson = File('../../packages/core/test/fixtures/garowe_form.json').readAsStringSync();
    final answersJson = File('../../packages/core/test/fixtures/garowe_answers.json').readAsStringSync();

    def = FormDefinition.fromJsonString(formJson);
    final raw = jsonDecode(answersJson) as Map<String, dynamic>;
    answers = raw.map((k, v) {
      final m = v as Map<String, dynamic>;
      return MapEntry(
        k,
        Answer(
          value: (m['value'] as num?)?.toDouble(),
          notAssessed: m['not_assessed'] as bool? ?? false,
        ),
      );
    });
  });

  group('Garowe parity fixture', () {
    test('overall score is 116', () {
      final r = computeTotals(def, answers);
      expect(r.score, equals(116.0));
    });

    test('overall max is 228', () {
      final r = computeTotals(def, answers);
      expect(r.max, equals(228.0));
    });

    test('overall pct is 50.9', () {
      final r = computeTotals(def, answers);
      expect(r.pct, equals(50.9));
    });

    test('governance section: 98/192', () {
      final r = computeTotals(def, answers);
      expect(r.sections['governance']!.score, equals(98.0));
      expect(r.sections['governance']!.max, equals(192.0));
    });

    test('logistics section: 18/36', () {
      final r = computeTotals(def, answers);
      expect(r.sections['logistics']!.score, equals(18.0));
      expect(r.sections['logistics']!.max, equals(36.0));
    });

    test('one not_assessed in logistics', () {
      final r = computeTotals(def, answers);
      expect(r.sections['logistics']!.notAssessed, equals(1));
    });

    test('no missing items', () {
      final r = computeTotals(def, answers);
      expect(r.missing, isEmpty);
    });
  });

  group('Edge cases', () {
    test('all not_assessed → score 0, max 0, pct null', () {
      final allNa = <String, Answer>{};
      for (final sec in def.sections) {
        for (final it in sec.items) {
          allNa[it.key] = const Answer(notAssessed: true);
        }
      }
      final r = computeTotals(def, allNa);
      expect(r.score, equals(0.0));
      expect(r.max, equals(0.0));
      expect(r.pct, isNull);
    });
  });
}
