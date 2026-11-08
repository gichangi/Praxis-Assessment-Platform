import 'dart:convert';

import 'package:supabase_flutter/supabase_flutter.dart';

// ─── Request ──────────────────────────────────────────────────────────────────

class SyncRequest {
  const SyncRequest({
    this.deviceId,
    required this.push,
    this.cursor,
    this.knownFormVersionIds = const [],
  });

  final String? deviceId;
  final List<Map<String, dynamic>> push;
  final String? cursor;

  /// Form versions already on the phone, so the server only sends what is missing.
  final List<String> knownFormVersionIds;

  Map<String, dynamic> toJson() => {
        if (deviceId != null) 'device_id': deviceId,
        'push': push,
        if (cursor != null) 'cursor': cursor,
        'known_form_version_ids': knownFormVersionIds,
      };
}

// ─── Response ─────────────────────────────────────────────────────────────────

class SyncRejection {
  const SyncRejection({
    required this.table,
    required this.id,
    required this.reason,
    this.status,
  });

  final String table;
  final String id;
  final String reason;

  /// For a refused submission: the workflow status the server kept ('draft' or 'returned').
  final String? status;

  bool get isConflict => reason.startsWith('conflict:');
  bool get isSubmitFailure => reason.startsWith('submit_failed:');

  /// The server's explanation for a refused submission.
  String get submitMessage => reason.substring('submit_failed:'.length);

  factory SyncRejection.fromJson(Map<String, dynamic> j) => SyncRejection(
        table: j['table'] as String,
        id: j['id'] as String,
        reason: j['reason'] as String,
        status: j['status'] as String?,
      );
}

class SyncPull {
  const SyncPull({
    required this.assessments,
    required this.responses,
    required this.formVersions,
    required this.helpArticles,
    required this.locations,
    required this.members,
    required this.forms,
    required this.assignments,
    required this.hasAssignments,
  });

  final List<Map<String, dynamic>> assessments;
  final List<Map<String, dynamic>> responses;
  final List<Map<String, dynamic>> formVersions;
  final List<Map<String, dynamic>> helpArticles;
  final List<Map<String, dynamic>> locations;
  final List<Map<String, dynamic>> members;

  /// Titles of the forms the phone can show.
  final List<Map<String, dynamic>> forms;

  /// The complete current list of (form_id, location_id) pairs this user may assess.
  final List<Map<String, dynamic>> assignments;

  /// False when talking to a server that predates assignments; its empty list must not wipe ours.
  final bool hasAssignments;

  factory SyncPull.fromJson(Map<String, dynamic> j) => SyncPull(
        assessments: _list(j['assessments']),
        responses: _list(j['responses']),
        formVersions: _list(j['form_versions']),
        helpArticles: _list(j['help_articles']),
        locations: _list(j['locations']),
        members: _list(j['members']),
        forms: _list(j['forms']),
        assignments: _list(j['assignments']),
        hasAssignments: j.containsKey('assignments'),
      );

  static List<Map<String, dynamic>> _list(dynamic v) =>
      (v as List?)?.cast<Map<String, dynamic>>() ?? [];
}

class SyncResponse {
  const SyncResponse({
    required this.pull,
    required this.cursor,
    required this.pushed,
    required this.rejected,
  });

  final SyncPull pull;
  final String cursor;
  final int pushed;
  final List<SyncRejection> rejected;

  factory SyncResponse.fromJson(Map<String, dynamic> j) => SyncResponse(
        pull: SyncPull.fromJson(j['pull'] as Map<String, dynamic>),
        cursor: j['cursor'] as String,
        pushed: j['pushed'] as int,
        rejected: (j['rejected'] as List?)
                ?.map((e) => SyncRejection.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}

// ─── Client ───────────────────────────────────────────────────────────────────

/// A sync call that failed, with the address it was sent to and what the server (or the network)
/// said. The sync log shows both, so a failure can be traced.
class SyncCallException implements Exception {
  SyncCallException(this.endpoint, this.cause);

  /// e.g. `POST https://server/functions/v1/sync`
  final String endpoint;
  final Object cause;

  /// The HTTP status the server answered with, or null when no answer arrived.
  int? get status => cause is FunctionException && (cause as FunctionException).status > 0
      ? (cause as FunctionException).status
      : null;

  /// A readable account of what went wrong, e.g. `HTTP 500: Internal error`.
  String get message {
    final c = cause;
    if (c is FunctionException && c.status > 0) {
      final reason = _reasonOf(c.details) ?? c.reasonPhrase;
      return reason == null || reason.isEmpty ? 'HTTP ${c.status}' : 'HTTP ${c.status}: $reason';
    }
    if (c is FunctionException) return 'No answer from the server: ${c.details ?? c.reasonPhrase ?? c}';
    return c.toString();
  }

  @override
  String toString() => message;

  static String? _reasonOf(dynamic details) {
    if (details == null) return null;
    if (details is Map) {
      for (final key in ['error', 'message', 'msg']) {
        final v = details[key];
        if (v is String && v.trim().isNotEmpty) return v;
      }
      return jsonEncode(details);
    }
    return details.toString();
  }
}

/// The address of the sync function for a server whose REST address is [restUrl]
/// (`https://server/rest/v1`), shown in the sync log.
String syncEndpointFor(String restUrl) =>
    'POST ${restUrl.replaceFirst(RegExp(r'/rest/v1/?$'), '')}/functions/v1/sync';

class SyncApi {
  /// [clientOf] is asked for the Supabase client on every call, so a server address changed in the
  /// login screen takes effect straight away instead of syncing to the previous server.
  SyncApi(this._clientOf);

  final SupabaseClient Function() _clientOf;

  /// What gets called, for the sync log.
  String get endpoint => syncEndpointFor(_clientOf().rest.url);

  Future<SyncResponse> call(SyncRequest request) async {
    final client = _clientOf();
    if (client.auth.currentSession == null) throw StateError('Not authenticated');
    final FunctionResponse response;
    try {
      response = await client.functions.invoke('sync', body: request.toJson());
    } catch (e) {
      throw SyncCallException(endpoint, e);
    }
    if (response.status != 200) {
      throw SyncCallException(
        endpoint,
        FunctionException(status: response.status, details: response.data),
      );
    }
    return SyncResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
