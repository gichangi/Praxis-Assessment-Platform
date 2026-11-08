/// What an assessor sees on an assessment: where it stands on the phone and on the server.
enum AssessmentStage {
  /// Still being filled in.
  draft,

  /// Finished and submitted on the phone, waiting for a connection to upload.
  completed,

  /// Finished, and the server has it.
  synced,

  /// Sent back by a reviewer for changes.
  returned,

  /// Accepted by a reviewer.
  approved,

  /// Turned down by a reviewer. Final: it cannot be edited or submitted again.
  rejected,
}

/// [status] is the assessment's workflow status; [hasPendingChanges] is true while the
/// assessment or any of its answers has not been uploaded yet.
AssessmentStage assessmentStage({required String status, required bool hasPendingChanges}) {
  return switch (status) {
    'approved' => AssessmentStage.approved,
    'returned' => AssessmentStage.returned,
    'rejected' => AssessmentStage.rejected,
    'submitted' => hasPendingChanges ? AssessmentStage.completed : AssessmentStage.synced,
    _ => AssessmentStage.draft,
  };
}
