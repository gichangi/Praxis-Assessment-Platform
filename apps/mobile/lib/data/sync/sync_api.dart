import 'dart:convert';

import 'package:supabase_flutter/supabase_flutter.dart';

// ─── Request ──────────────────────────────────────────────────────────────────

class SyncRequest {
  const SyncRequest({
    this.deviceId,
    required this.push,
    this.cursor,
  });

  final String? deviceId;
  final List<Map<String, dynamic>> push;
  final String? cursor;

  Map<String, dynamic> toJson() => {
        if (deviceId != null) 'device_id': deviceId,
        'push': push,
        if (cursor != null) 'cursor': cursor,
      };
}

// ─── Response ─────────────────────────────────────────────────────────────────

class SyncRejection {
  const SyncRejection({required this.table, required this.id, required this.reason});

  final String table;
  final String id;
  final String reason;

  bool get isConflict => reason.startsWith('conflict:');

  factory SyncRejection.fromJson(Map<String, dynamic> j) => SyncRejection(
        table: j['table'] as String,
        id: j['id'] as String,
        reason: j['reason'] as String,
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
  });

  final List<Map<String, dynamic>> assessments;
  final List<Map<String, dynamic>> responses;
  final List<Map<String, dynamic>> formVersions;
  final List<Map<String, dynamic>> helpArticles;
  final List<Map<String, dynamic>> locations;
  final List<Map<String, dynamic>> members;

  factory SyncPull.fromJson(Map<String, dynamic> j) => SyncPull(
        assessments: _list(j['assessments']),
        responses: _list(j['responses']),
        formVersions: _list(j['form_versions']),
        helpArticles: _list(j['help_articles']),
        locations: _list(j['locations']),
        members: _list(j['members']),
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

class SyncApi {
  SyncApi(this._client);

  final SupabaseClient _client;

  Future<SyncResponse> call(SyncRequest request) async {
    if (_client.auth.currentSession == null) throw StateError('Not authenticated');
    final response = await _client.functions.invoke('sync', body: request.toJson());
    if (response.status != 200) {
      throw Exception('sync returned ${response.status}: ${jsonEncode(response.data)}');
    }
    return SyncResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
