import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _kDefaultUrl = 'http://10.0.2.2:54321';
const _kDefaultAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    '.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9'
    '.CRFA0NiK7stqwwVPSVM7HHTXI-Z2s1u_4Ar7k4FUMIg';

const _kUrlKey = 'server_url';
const _kAnonKeyKey = 'server_anon_key';

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

  static String get defaultUrl => _kDefaultUrl;
  static String get defaultAnonKey => _kDefaultAnonKey;
}
