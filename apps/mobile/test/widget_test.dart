import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:assessment_platform/app/theme.dart';

void main() {
  test('AppTheme design tokens are correct', () {
    expect(AppTheme.primary.toARGB32(), equals(const Color(0xFF1D5C63).toARGB32()));
    expect(AppTheme.logistics.toARGB32(), equals(const Color(0xFF9C5416).toARGB32()));
    expect(AppTheme.bg.toARGB32(), equals(const Color(0xFFF6F3EC).toARGB32()));
  });
}
