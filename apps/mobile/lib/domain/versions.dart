/// Orders dotted numeric versions, so "1.10.0" is newer than "1.9.0".
int compareVersions(String a, String b) {
  final pa = _parts(a);
  final pb = _parts(b);
  for (var i = 0; i < 3; i++) {
    final ai = i < pa.length ? pa[i] : 0;
    final bi = i < pb.length ? pb[i] : 0;
    if (ai != bi) return ai.compareTo(bi);
  }
  return 0;
}

List<int> _parts(String v) => v.split('.').map((s) => int.tryParse(s) ?? 0).toList();
