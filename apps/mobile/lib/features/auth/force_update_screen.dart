import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/theme.dart';

class ForceUpdateScreen extends StatelessWidget {
  const ForceUpdateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsetsDirectional.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.system_update_alt, size: 72, color: AppTheme.primary),
              const SizedBox(height: 24),
              Text(
                tr('force_update_title'),
                style: Theme.of(context)
                    .textTheme
                    .headlineSmall
                    ?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                tr('force_update_body'),
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              FilledButton.icon(
                onPressed: _openStore,
                icon: const Icon(Icons.download),
                label: Text(tr('force_update_cta')),
                style: FilledButton.styleFrom(backgroundColor: AppTheme.primary),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _openStore() async {
    // Deep-link to Play Store; replace with App Store URL for iOS.
    final uri = Uri.parse('market://details?id=com.assessment_platform');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
