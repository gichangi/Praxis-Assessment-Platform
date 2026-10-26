import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

abstract final class AppTheme {
  // Design tokens
  static const Color bg = Color(0xFFF6F3EC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color text = Color(0xFF1B2A2F);
  static const Color primary = Color(0xFF1D5C63);
  static const Color logistics = Color(0xFF9C5416);
  static const Color muted = Color(0xFF6B7F84);
  static const Color divider = Color(0xFFE2DDD5);
  static const Color good = Color(0xFF2E7D49);
  static const Color goodTint = Color(0xFFE3F4EA);
  static const Color warning = Color(0xFFB5650A);
  static const Color warningTint = Color(0xFFFFF0DC);
  static const double cardRadius = 14;

  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        surface: surface,
      ).copyWith(
        primary: primary,
        onPrimary: Colors.white,
        surface: surface,
        onSurface: text,
      ),
      scaffoldBackgroundColor: bg,
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(cardRadius),
          side: const BorderSide(color: divider),
        ),
      ),
    );

    final textTheme = GoogleFonts.ibmPlexSansTextTheme(base.textTheme).copyWith(
      headlineMedium: GoogleFonts.ibmPlexSerif(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: text,
      ),
    );

    return base.copyWith(textTheme: textTheme);
  }

  // Arabic/RTL: swap to IBM Plex Sans Arabic
  static TextTheme arabicTextTheme(BuildContext context) {
    return GoogleFonts.ibmPlexSansArabicTextTheme(Theme.of(context).textTheme);
  }
}
