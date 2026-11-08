import 'package:flutter_test/flutter_test.dart';
import 'package:assessment_platform/data/services/server_config.dart';

void main() {
  final demoKey = ServerConfig.defaultAnonKey;
  final demoUrl = ServerConfig.defaultUrl;

  group('ServerConfig.setupProblem', () {
    test('accepts a real server with its own key', () {
      expect(ServerConfig.setupProblem(url: 'https://api.example.com', anonKey: 'eyJreal.key.here'), isNull);
    });

    test('rejects an address that is not http(s)', () {
      expect(ServerConfig.setupProblem(url: '', anonKey: 'k'), ServerSetupProblem.invalidUrl);
      expect(ServerConfig.setupProblem(url: 'api.example.com', anonKey: 'k'), ServerSetupProblem.invalidUrl);
    });

    test('rejects a missing key', () {
      expect(ServerConfig.setupProblem(url: 'https://api.example.com', anonKey: '  '), ServerSetupProblem.missingKey);
    });

    test('rejects the demo key on any server but the local one (it makes sync fail with 401)', () {
      expect(ServerConfig.setupProblem(url: 'https://api.example.com', anonKey: demoKey), ServerSetupProblem.demoKey);
      expect(ServerConfig.setupProblem(url: 'http://192.168.1.20:54321', anonKey: demoKey), ServerSetupProblem.demoKey);
    });

    test('the demo key is fine for the default local server', () {
      expect(ServerConfig.setupProblem(url: demoUrl, anonKey: demoKey), isNull);
      expect(ServerConfig.setupProblem(url: '$demoUrl/', anonKey: demoKey), isNull);
    });
  });
}
