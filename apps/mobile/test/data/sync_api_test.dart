import 'package:flutter_test/flutter_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:assessment_platform/data/sync/sync_api.dart';
import 'package:assessment_platform/domain/sync_log.dart';

void main() {
  test('builds the sync address from the server address', () {
    expect(syncEndpointFor('http://10.0.2.2:54321/rest/v1'), 'POST http://10.0.2.2:54321/functions/v1/sync');
    expect(syncEndpointFor('https://api.example.com/rest/v1/'), 'POST https://api.example.com/functions/v1/sync');
  });

  group('SyncCallException', () {
    const endpoint = 'POST https://s/functions/v1/sync';

    test('reports the HTTP status and the server reason', () {
      final e = SyncCallException(endpoint, const FunctionException(status: 500, details: {'error': 'Internal error'}));
      expect(e.status, 500);
      expect(e.message, 'HTTP 500: Internal error');
    });

    test('reads gateway style replies and falls back to the status alone', () {
      expect(
        SyncCallException(endpoint, const FunctionException(status: 401, details: {'message': 'Invalid JWT'})).message,
        'HTTP 401: Invalid JWT',
      );
      expect(SyncCallException(endpoint, const FunctionException(status: 404)).message, 'HTTP 404');
    });

    test('says so when no answer arrived, and counts that as offline', () {
      final e = SyncCallException(endpoint, const FunctionsFetchException(details: 'ClientException: Failed host lookup'));
      expect(e.status, isNull);
      expect(e.message, startsWith('No answer from the server'));
      expect(classifySyncError(e.cause).outcome, SyncOutcome.offline);
    });

    test('a server error is a failure, not offline', () {
      final e = SyncCallException(endpoint, const FunctionException(status: 500, details: 'boom'));
      expect(classifySyncError(e.cause).outcome, SyncOutcome.error);
    });
  });
}
