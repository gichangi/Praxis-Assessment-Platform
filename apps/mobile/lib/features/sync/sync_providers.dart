import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/database/app_database.dart';
import '../../data/repositories/assessment_repository.dart';

/// Every kept sync line, newest first.
final syncLogProvider = StreamProvider<List<LocalSyncLog>>(
  (ref) => ref.watch(dbProvider).assessmentsDao.watchSyncLog(),
);

/// The most recent sync attempt, whether it worked or not.
final lastSyncAttemptProvider = StreamProvider<LocalSyncLog?>(
  (ref) => ref.watch(dbProvider).assessmentsDao.watchLastSyncAttempt(),
);

/// The most recent sync that reached the server.
final lastSuccessfulSyncProvider = StreamProvider<LocalSyncLog?>(
  (ref) => ref.watch(dbProvider).assessmentsDao.watchLastSuccessfulSync(),
);

/// How many assessments have changes still waiting to upload.
final pendingUploadCountProvider = StreamProvider<int>(
  (ref) => ref.watch(dbProvider).assessmentsDao.watchPendingUploadCount(),
);
