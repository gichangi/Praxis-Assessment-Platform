import 'dart:io';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _kDefaultUrl = 'http://10.0.2.2:54321';
const _kDefaultAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    '.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9'
    '.CRFA0NiK7stqwwVPSVM7HHTXI-Z2s1u_4Ar7k4FUMIg';

const _kUrlKey = 'server_url';
const _kAnonKeyKey = 'server_anon_key';

/// What is wrong with a server address / anon key pair entered on the login screen.
enum ServerSetupProblem { invalidUrl, missingKey, demoKey }

/// The server answered, but its gateway refused the anon key.
class ServerKeyRejected implements Exception {
  const ServerKeyRejected();

  @override
  String toString() => 'The server rejected the anon key';
}

class ServerConfig {
  static const _storage = FlutterSecureStorage();

  static Future<({String url, String anonKey})> load() async {
    final url = await _storage.read(key: _kUrlKey) ?? _kDefaultUrl;
    final key = await _storage.read(key: _kAnonKeyKey) ?? _kDefaultAnonKey;
    return (url: url, anonKey: key);
  }

  static Future<void> save({required String url, required String anonKey}) async {
    await _storage.write(key: _kUrlKey, value: url.replaceAll(RegExp(r'/+$'), ''));
    await _storage.write(key: _kAnonKeyKey, value: anonKey);
  }

  /// Catches the mistakes that make every later call fail with 401: no key, or the built-in demo
  /// key (it only fits a local test server) left in place after typing a different server address.
  static ServerSetupProblem? setupProblem({required String url, required String anonKey}) {
    if (url.isEmpty || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return ServerSetupProblem.invalidUrl;
    }
    final key = anonKey.trim();
    if (key.isEmpty) return ServerSetupProblem.missingKey;
    final trimmed = url.replaceAll(RegExp(r'/+$'), '');
    if (key == _kDefaultAnonKey && trimmed != _kDefaultUrl) return ServerSetupProblem.demoKey;
    return null;
  }

  /// GETs {url}/auth/v1/health to verify the server is reachable.
  /// Throws an [Exception] with a human-readable message on failure.
  static Future<void> testConnection(String url, {String? anonKey}) async {
    final uri = Uri.parse('$url/auth/v1/health');
    final client = HttpClient()
      ..connectionTimeout = const Duration(seconds: 8);
    try {
      final request = await client.getUrl(uri);
      final response = await request.close();
      await response.drain<void>();
      if (response.statusCode != 200) {
        throw Exception('Server returned HTTP ${response.statusCode}');
      }

      // Sign-in doesn't need the key, but sync and every data call do. Ask for something that does,
      // so a wrong key is reported here and not later as a failed sync.
      if (anonKey != null && anonKey.isNotEmpty) {
        final data = await client.getUrl(Uri.parse('$url/rest/v1/'));
        data.headers.set('apikey', anonKey);
        final dataResponse = await data.close();
        await dataResponse.drain<void>();
        if (dataResponse.statusCode == 401 || dataResponse.statusCode == 403) {
          throw const ServerKeyRejected();
        }
      }
    } on SocketException catch (e) {
      throw Exception('Cannot reach server: ${e.message}');
    } on HttpException catch (e) {
      throw Exception('Connection error: ${e.message}');
    } finally {
      client.close();
    }
  }

  static String get defaultUrl => _kDefaultUrl;
  static String get defaultAnonKey => _kDefaultAnonKey;
}
