import 'form_definition.dart';

/// Per-item answer stored in the local Drift database.
class Answer {
  final double? value;
  final bool notAssessed;

  const Answer({this.value, this.notAssessed = false});
}

class GroupTotals {
  final double score;
  final double max;
  final int count;

  const GroupTotals({required this.score, required this.max, required this.count});
}

class SectionTotals {
  final double score;
  final double max;
  final double? pct;
  final int answered;
  final int notAssessed;
  final Map<String, GroupTotals> groups;

  const SectionTotals({
    required this.score,
    required this.max,
    required this.pct,
    required this.answered,
    required this.notAssessed,
    required this.groups,
  });
}

class Totals {
  final double score;
  final double max;
  final double? pct;
  final List<String> missing;
  final Map<String, SectionTotals> sections;

  const Totals({
    required this.score,
    required this.max,
    required this.pct,
    required this.missing,
    required this.sections,
  });
}

const _scored = {'scale', 'single_choice', 'yes_no'};

/// Must return the same result as compute_totals() (SQL) and computeTotals() (TypeScript).
/// Garowe fixture: 37 items at 3, one at 5, one not_assessed → score=116, max=228.
Totals computeTotals(FormDefinition def, Map<String, Answer> answers) {
  final scaleMax = <String, double>{};
  for (final s in def.scales) {
    scaleMax[s.key] = s.levels.map((l) => l.value.toDouble()).reduce((a, b) => a > b ? a : b);
  }

  double allScore = 0;
  double allMax = 0;
  final missing = <String>[];
  final sections = <String, SectionTotals>{};

  for (final sec in def.sections) {
    double sScore = 0;
    double sMax = 0;
    int answered = 0;
    int na = 0;
    final groups = <String, GroupTotals>{};

    for (final it in sec.items) {
      if (!(it.includeInTotal ?? true)) continue;
      if (!_scored.contains(it.type)) continue;
      if (!_isVisible(it, answers)) continue;

      final itemMax = it.type == 'yes_no' ? 1.0 : (scaleMax[it.scale] ?? 0.0);
      final w = (it.weight ?? 1).toDouble();
      final a = answers[it.key];

      if (a != null && a.notAssessed) {
        na++;
        continue;
      }
      if (a?.value == null) {
        missing.add(it.key);
        continue;
      }

      final gKey = it.group ?? sec.key;
      final prev = groups[gKey] ?? const GroupTotals(score: 0, max: 0, count: 0);
      groups[gKey] = GroupTotals(
        score: prev.score + a!.value! * w,
        max: prev.max + itemMax * w,
        count: prev.count + 1,
      );

      answered++;
      sScore += a.value! * w;
      sMax += itemMax * w;
    }

    final sPct = sMax > 0 ? (sScore / sMax * 1000).round() / 10.0 : null;
    sections[sec.key] = SectionTotals(
      score: sScore,
      max: sMax,
      pct: sPct,
      answered: answered,
      notAssessed: na,
      groups: groups,
    );
    allScore += sScore;
    allMax += sMax;
  }

  final pct = allMax > 0 ? (allScore / allMax * 1000).round() / 10.0 : null;
  return Totals(score: allScore, max: allMax, pct: pct, missing: missing, sections: sections);
}

bool _isVisible(FormItem it, Map<String, Answer> answers) {
  final c = it.visibleIf;
  if (c == null) return true;
  final v = answers[c.item]?.value;
  switch (c.op) {
    case 'eq':  return v == c.value;
    case 'neq': return v != c.value;
    case 'gte': return v != null && v >= (c.value as num).toDouble();
    case 'lte': return v != null && v <= (c.value as num).toDouble();
    default:    return true;
  }
}
