import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../../app/theme.dart';
import '../../domain/review_decision.dart';

/// Who approved, returned or rejected an assessment, when, and what they said.
/// [compact] is the short form for a list card: no heading for the message, and nothing at all
/// when the reviewer wrote nothing.
class ReviewDecisionCard extends StatelessWidget {
  const ReviewDecisionCard({super.key, required this.decision, this.compact = false});

  final ReviewDecision decision;
  final bool compact;

  ({IconData icon, Color ink, Color tint, Color edge, String status}) get _look {
    switch (decision.outcome) {
      case ReviewOutcome.approved:
        return (
          icon: Icons.check_circle_outline,
          ink: AppTheme.good,
          tint: AppTheme.goodTint,
          edge: AppTheme.good.withAlpha(90),
          status: 'approved',
        );
      case ReviewOutcome.returned:
        return (
          icon: Icons.reply,
          ink: const Color(0xFF7A5800),
          tint: const Color(0xFFFFF3CD),
          edge: const Color(0xFFFFD60A),
          status: 'returned',
        );
      case ReviewOutcome.rejected:
        return (
          icon: Icons.cancel_outlined,
          ink: const Color(0xFFB3261E),
          tint: const Color(0xFFF9DEDC),
          edge: const Color(0xFFB3261E).withAlpha(90),
          status: 'rejected',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final look = _look;
    final name = decision.reviewerName;
    final heading = name != null
        ? tr('assessments_decision_${look.status}_by', namedArgs: {'name': name})
        : tr('assessments_status_${look.status}');
    final at = decision.reviewedAt;
    final date = at == null
        ? null
        : DateFormat.yMMMd(Localizations.localeOf(context).toString()).format(at.toLocal());
    final message = decision.message;

    return Container(
      width: double.infinity,
      padding: EdgeInsetsDirectional.all(compact ? 10 : 14),
      decoration: BoxDecoration(
        color: look.tint,
        border: compact ? null : Border.all(color: look.edge),
        borderRadius: BorderRadius.circular(compact ? 8 : AppTheme.cardRadius),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(look.icon, color: look.ink, size: compact ? 16 : 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  date == null ? heading : '$heading · $date',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: compact ? 12 : 14,
                    color: look.ink,
                  ),
                ),
                if (message != null) ...[
                  if (!compact) ...[
                    const SizedBox(height: 8),
                    Text(
                      tr('assessments_decision_message'),
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: look.ink.withAlpha(180)),
                    ),
                  ],
                  const SizedBox(height: 3),
                  Text(
                    message,
                    maxLines: compact ? 3 : null,
                    overflow: compact ? TextOverflow.ellipsis : null,
                    style: TextStyle(fontSize: compact ? 12 : 14, color: look.ink),
                  ),
                ] else if (!compact) ...[
                  const SizedBox(height: 6),
                  Text(
                    tr('assessments_decision_no_message'),
                    style: TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: look.ink.withAlpha(200)),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
