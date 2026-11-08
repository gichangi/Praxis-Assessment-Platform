/// What a reviewer decided about a submitted assessment.
enum ReviewOutcome {
  /// Accepted. Final.
  approved,

  /// Sent back to be fixed and submitted again.
  returned,

  /// Turned down. Final.
  rejected,
}

/// Who decided, when, and what they said: everything shown under an assessment that has been
/// reviewed.
class ReviewDecision {
  const ReviewDecision({
    required this.outcome,
    this.reviewerName,
    this.reviewedAt,
    this.message,
  });

  final ReviewOutcome outcome;

  /// Null when the reviewer isn't known (an older decision, or someone not in the member list).
  final String? reviewerName;
  final DateTime? reviewedAt;

  /// The reviewer's note. Null when they left none.
  final String? message;
}

/// The decision recorded on an assessment, or null while it has none (draft, or waiting for review).
ReviewDecision? reviewDecisionOf({
  required String status,
  String? reviewedBy,
  DateTime? reviewedAt,
  String? note,
  Map<String, String> memberNames = const {},
}) {
  final outcome = switch (status) {
    'approved' => ReviewOutcome.approved,
    'returned' => ReviewOutcome.returned,
    'rejected' => ReviewOutcome.rejected,
    _ => null,
  };
  if (outcome == null) return null;

  final name = reviewedBy == null ? null : memberNames[reviewedBy]?.trim();
  final message = note?.trim();
  return ReviewDecision(
    outcome: outcome,
    reviewerName: (name == null || name.isEmpty) ? null : name,
    reviewedAt: reviewedAt,
    message: (message == null || message.isEmpty) ? null : message,
  );
}
