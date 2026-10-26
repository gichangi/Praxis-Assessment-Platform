import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../app/theme.dart';
import '../../app/router.dart';
import '../../data/services/server_config.dart';
import '../../main.dart' show reinitSupabase;

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _showPassword = true;

  // Magic-link state
  final _emailMagicCtrl = TextEditingController();
  bool _magicLoading = false;
  bool _magicSent = false;
  String? _magicError;

  // Password state
  final _emailPwCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _pwLoading = false;
  bool _pwObscure = true;
  String? _pwError;
  bool _resetSent = false;

  // Server config state
  final _urlCtrl = TextEditingController();
  final _anonKeyCtrl = TextEditingController();
  bool _serverLoading = false;
  String? _serverError;

  @override
  void initState() {
    super.initState();
    final session = Supabase.instance.client.auth.currentSession;
    if (session != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) context.go(Routes.assessments);
      });
    }
    _loadServerConfig();
  }

  Future<void> _loadServerConfig() async {
    final cfg = await ServerConfig.load();
    if (!mounted) return;
    setState(() {
      _urlCtrl.text = cfg.url;
      _anonKeyCtrl.text = cfg.anonKey;
    });
  }

  @override
  void dispose() {
    _emailMagicCtrl.dispose();
    _emailPwCtrl.dispose();
    _passwordCtrl.dispose();
    _urlCtrl.dispose();
    _anonKeyCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendMagicLink() async {
    final email = _emailMagicCtrl.text.trim();
    if (email.isEmpty) return;
    setState(() { _magicLoading = true; _magicError = null; });
    try {
      await Supabase.instance.client.auth.signInWithOtp(
        email: email,
        emailRedirectTo: 'assessmentplatform://auth/callback',
      );
      if (mounted) setState(() { _magicSent = true; _magicLoading = false; });
    } on AuthException catch (e) {
      if (mounted) setState(() { _magicError = e.message; _magicLoading = false; });
    } catch (_) {
      if (mounted) setState(() { _magicError = tr('auth_sign_in_error'); _magicLoading = false; });
    }
  }

  Future<void> _signInWithPassword() async {
    final email = _emailPwCtrl.text.trim();
    final password = _passwordCtrl.text;
    if (email.isEmpty || password.isEmpty) return;
    setState(() { _pwLoading = true; _pwError = null; });
    try {
      await Supabase.instance.client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      if (mounted) context.go(Routes.assessments);
    } on AuthException catch (e) {
      if (mounted) {
        setState(() {
          _pwError = e.statusCode == '400'
              ? tr('auth_wrong_credentials')
              : e.message;
          _pwLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() { _pwError = tr('auth_sign_in_error'); _pwLoading = false; });
    }
  }

  Future<void> _applyServer() async {
    final url = _urlCtrl.text.trim();
    if (url.isEmpty || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      setState(() => _serverError = tr('auth_server_invalid_url'));
      return;
    }
    setState(() { _serverLoading = true; _serverError = null; });
    try {
      await ServerConfig.save(url: url, anonKey: _anonKeyCtrl.text.trim());
      await reinitSupabase();
      // reinitSupabase() increments appRestartSignal which rebuilds ProviderScope;
      // the LoginScreen is recreated and _loadServerConfig() will reflect the new URL.
    } catch (e) {
      if (mounted) setState(() { _serverError = tr('auth_server_error'); _serverLoading = false; });
    }
  }

  static const _devEmail = 'admin@assessment.local';
  static const _devPassword = 'Admin1234!';

  Future<void> _devSignIn() async {
    setState(() { _pwLoading = true; _pwError = null; });
    try {
      await Supabase.instance.client.auth.signInWithPassword(
        email: _devEmail,
        password: _devPassword,
      );
      if (mounted) context.go(Routes.assessments);
    } on AuthException catch (e) {
      if (mounted) setState(() { _pwError = 'Dev sign-in failed: ${e.message}'; _pwLoading = false; });
    } catch (e) {
      if (mounted) setState(() { _pwError = 'Dev sign-in failed: $e'; _pwLoading = false; });
    }
  }

  Future<void> _forgotPassword() async {
    final email = _emailPwCtrl.text.trim();
    if (email.isEmpty) {
      setState(() => _pwError = tr('auth_email'));
      return;
    }
    setState(() { _pwLoading = true; _pwError = null; });
    try {
      await Supabase.instance.client.auth.resetPasswordForEmail(
        email,
        redirectTo: 'assessmentplatform://auth/reset-password',
      );
      if (mounted) setState(() { _resetSent = true; _pwLoading = false; });
    } on AuthException catch (e) {
      if (mounted) setState(() { _pwError = e.message; _pwLoading = false; });
    } catch (_) {
      if (mounted) setState(() { _pwError = tr('auth_sign_in_error'); _pwLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsetsDirectional.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 360),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    alignment: Alignment.center,
                    child: const Text('🏛️', style: TextStyle(fontSize: 26)),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    tr('auth_app_name'),
                    style: Theme.of(context).textTheme.headlineMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    tr('auth_app_tagline'),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.muted),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Text(
                      tr('auth_server_url_label'),
                      style: Theme.of(context)
                          .textTheme
                          .labelMedium
                          ?.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _urlCtrl,
                    keyboardType: TextInputType.url,
                    textInputAction: TextInputAction.done,
                    autocorrect: false,
                    onFieldSubmitted: (_) => _applyServer(),
                    decoration: _inputDecoration(tr('auth_server_url_hint')).copyWith(
                      suffixIcon: _serverLoading
                          ? const Padding(
                              padding: EdgeInsets.all(12),
                              child: SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                            )
                          : IconButton(
                              icon: const Icon(Icons.check_circle_outline, size: 20),
                              tooltip: tr('auth_server_connect'),
                              onPressed: _applyServer,
                            ),
                    ),
                  ),
                  if (_serverError != null) ...[
                    const SizedBox(height: 6),
                    Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: Text(
                        _serverError!,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.error,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),

                  // Form
                  if (_showPassword)
                    _PasswordForm(
                      emailCtrl: _emailPwCtrl,
                      passwordCtrl: _passwordCtrl,
                      loading: _pwLoading,
                      obscure: _pwObscure,
                      error: _pwError,
                      resetSent: _resetSent,
                      onToggleObscure: () => setState(() => _pwObscure = !_pwObscure),
                      onSignIn: _signInWithPassword,
                      onForgot: _forgotPassword,
                      onBack: () => setState(() { _resetSent = false; _pwError = null; }),
                    )
                  else
                    _MagicLinkForm(
                      ctrl: _emailMagicCtrl,
                      loading: _magicLoading,
                      sent: _magicSent,
                      error: _magicError,
                      onSend: _sendMagicLink,
                      onBack: () => setState(() => _magicSent = false),
                    ),

                  const SizedBox(height: 12),

                  // Toggle auth method
                  if (!_magicSent && !_resetSent)
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => setState(() {
                          _showPassword = !_showPassword;
                          _magicError = null;
                          _pwError = null;
                        }),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.muted,
                          side: BorderSide(color: AppTheme.divider),
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: Text(
                          _showPassword ? tr('auth_use_magic_link') : tr('auth_use_password'),
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                    ),

                  // Debug-only bypass
                  if (kDebugMode) ...[
                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.bug_report_outlined, size: 16),
                        label: const Text(
                          'Dev: skip login  (admin@assessment.local)',
                          style: TextStyle(fontSize: 12),
                        ),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.grey.shade600,
                          side: BorderSide(color: Colors.grey.shade400),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: _pwLoading ? null : _devSignIn,
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),
                  Text(
                    'v1.2.0 · en / so / ar',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.muted,
                      fontSize: 11,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Magic link form ──────────────────────────────────────────────────────────

class _MagicLinkForm extends StatelessWidget {
  const _MagicLinkForm({
    required this.ctrl,
    required this.loading,
    required this.sent,
    required this.error,
    required this.onSend,
    required this.onBack,
  });

  final TextEditingController ctrl;
  final bool loading;
  final bool sent;
  final String? error;
  final VoidCallback onSend;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    if (sent) {
      return Column(
        children: [
          Icon(Icons.mark_email_read_outlined, size: 48, color: AppTheme.primary),
          const SizedBox(height: 16),
          Text(
            tr('auth_magic_link_sent'),
            style: Theme.of(context).textTheme.titleMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            ctrl.text.trim(),
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppTheme.muted, fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          TextButton(onPressed: onBack, child: Text(tr('common_back'))),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          tr('auth_email'),
          style: Theme.of(context)
              .textTheme
              .labelMedium
              ?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: ctrl,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.done,
          autofillHints: const [AutofillHints.email],
          onFieldSubmitted: (_) => onSend(),
          decoration: _inputDecoration('you@example.com'),
        ),
        if (error != null) ...[
          const SizedBox(height: 8),
          Text(
            error!,
            style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 13),
          ),
        ],
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: loading ? null : onSend,
            style: _filledStyle(),
            child: loading
                ? _spinner()
                : Text(
                    tr('auth_send_magic_link'),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                  ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'A sign-in link will be sent to your email.\nYou stay signed in between sessions.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.muted),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

// ── Password form ────────────────────────────────────────────────────────────

class _PasswordForm extends StatelessWidget {
  const _PasswordForm({
    required this.emailCtrl,
    required this.passwordCtrl,
    required this.loading,
    required this.obscure,
    required this.error,
    required this.resetSent,
    required this.onToggleObscure,
    required this.onSignIn,
    required this.onForgot,
    required this.onBack,
  });

  final TextEditingController emailCtrl;
  final TextEditingController passwordCtrl;
  final bool loading;
  final bool obscure;
  final String? error;
  final bool resetSent;
  final VoidCallback onToggleObscure;
  final VoidCallback onSignIn;
  final VoidCallback onForgot;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    if (resetSent) {
      return Column(
        children: [
          Icon(Icons.lock_reset_outlined, size: 48, color: AppTheme.primary),
          const SizedBox(height: 16),
          Text(
            tr('auth_reset_sent'),
            style: Theme.of(context).textTheme.titleMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          TextButton(onPressed: onBack, child: Text(tr('common_back'))),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          tr('auth_email'),
          style: Theme.of(context)
              .textTheme
              .labelMedium
              ?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: emailCtrl,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          autofillHints: const [AutofillHints.email],
          decoration: _inputDecoration('you@example.com'),
        ),
        const SizedBox(height: 14),
        Text(
          tr('auth_password'),
          style: Theme.of(context)
              .textTheme
              .labelMedium
              ?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: passwordCtrl,
          obscureText: obscure,
          textInputAction: TextInputAction.done,
          autofillHints: const [AutofillHints.password],
          onFieldSubmitted: (_) => onSignIn(),
          decoration: _inputDecoration(tr('auth_password_hint')).copyWith(
            suffixIcon: IconButton(
              icon: Icon(
                obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                size: 20,
              ),
              onPressed: onToggleObscure,
            ),
          ),
        ),
        if (error != null) ...[
          const SizedBox(height: 8),
          Text(
            error!,
            style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 13),
          ),
        ],
        const SizedBox(height: 6),
        Align(
          alignment: AlignmentDirectional.centerEnd,
          child: TextButton(
            onPressed: loading ? null : onForgot,
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              tr('auth_forgot_password'),
              style: const TextStyle(fontSize: 13),
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: loading ? null : onSignIn,
            style: _filledStyle(),
            child: loading
                ? _spinner()
                : Text(
                    tr('auth_sign_in'),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                  ),
          ),
        ),
      ],
    );
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

InputDecoration _inputDecoration(String hint) => InputDecoration(
      hintText: hint,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
      filled: true,
      fillColor: AppTheme.surface,
      contentPadding: const EdgeInsetsDirectional.symmetric(
        horizontal: 14,
        vertical: 12,
      ),
    );

ButtonStyle _filledStyle() => FilledButton.styleFrom(
      backgroundColor: AppTheme.primary,
      padding: const EdgeInsets.symmetric(vertical: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    );

Widget _spinner() => const SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
    );
