import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import '../config/api_constants.dart';
import '../services/api_service.dart';

class DebugScreen extends StatefulWidget {
  const DebugScreen({super.key});

  @override
  State<DebugScreen> createState() => _DebugScreenState();
}

class _DebugScreenState extends State<DebugScreen> {
  String _debugInfo = '';
  bool _isLoading = false;

  void _testConnection() async {
    setState(() {
      _isLoading = true;
      _debugInfo = 'Starting comprehensive connection test...\n\n';
    });

    try {
      // Test 1: Basic connectivity with ApiService
      final apiService = ApiService();
      setState(() {
        _debugInfo += '🔍 Testing API Service connectivity...\n';
      });
      
      final isConnected = await apiService.testConnectivity();
      setState(() {
        _debugInfo += 'API Service Test: ${isConnected ? "✅ SUCCESS" : "❌ FAILED"}\n\n';
      });

      // Test 2: DNS Resolution
      setState(() {
        _debugInfo += '🌐 Testing DNS resolution...\n';
      });
      
      try {
        final addresses = await InternetAddress.lookup('trustrent.tommasolopiparo.com');
        setState(() {
          _debugInfo += 'DNS Resolution: ✅ SUCCESS\n';
          _debugInfo += 'IP Addresses: ${addresses.map((addr) => addr.address).join(', ')}\n\n';
        });
      } catch (e) {
        setState(() {
          _debugInfo += 'DNS Resolution: ❌ FAILED - $e\n\n';
        });
      }

      // Test 3: HTTPS Connection
      setState(() {
        _debugInfo += '🔒 Testing HTTPS connection...\n';
      });
      
      final response = await http.get(
        Uri.parse('https://trustrent.tommasolopiparo.com'),
        headers: {'User-Agent': 'TrustRent Mobile App'},
      ).timeout(const Duration(seconds: 15));
      
      setState(() {
        _debugInfo += 'HTTPS Test: ✅ SUCCESS (${response.statusCode})\n';
        _debugInfo += 'Response headers: ${response.headers}\n\n';
      });

      // Test 4: API Base URL
      setState(() {
        _debugInfo += '🚀 Testing API base URL...\n';
      });
      
      final apiResponse = await http.get(
        Uri.parse(ApiConstants.baseUrl),
        headers: ApiConstants.headers,
      ).timeout(const Duration(seconds: 15));
      
      setState(() {
        _debugInfo += 'API Base URL Test: ${apiResponse.statusCode == 404 ? "✅ SUCCESS (404 expected)" : "Status: ${apiResponse.statusCode}"}\n';
        _debugInfo += 'API Response body: ${apiResponse.body.length > 100 ? "${apiResponse.body.substring(0, 100)}..." : apiResponse.body}\n\n';
      });
      
      // Test 5: Login endpoint structure
      setState(() {
        _debugInfo += '🔐 Testing login endpoint...\n';
      });
      
      final loginResponse = await http.post(
        Uri.parse(ApiConstants.login),
        headers: ApiConstants.headers,
        body: json.encode({
          'email': 'tenant@example.com',
          'password': 'password123'
        }),
      ).timeout(const Duration(seconds: 15));
      
      setState(() {
        _debugInfo += 'Login Test Response: ${loginResponse.statusCode}\n';
        _debugInfo += 'Login Response body: ${loginResponse.body}\n';
        
        // Try to parse the JSON to see the structure
        try {
          final parsed = json.decode(loginResponse.body);
          _debugInfo += 'Parsed JSON structure:\n';
          _debugInfo += 'Keys: ${parsed.keys.toList()}\n';
          if (parsed is Map) {
            parsed.forEach((key, value) {
              _debugInfo += '  $key: ${value.runtimeType} = $value\n';
            });
          }
        } catch (e) {
          _debugInfo += 'JSON parsing error: $e\n';
        }
        _debugInfo += '\n';
      });
      
      // Test with a real user if available
      setState(() {
        _debugInfo += 'Testing with potential real credentials...\n';
        _debugInfo += 'You can try logging in with your actual credentials to see the response\n\n';
      });
      
    } catch (e) {
      setState(() {
        _debugInfo += 'Error: $e\n';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _testCaching() async {
    setState(() {
      _isLoading = true;
      _debugInfo = 'Testing cache functionality...\n\n';
    });

    try {
      // Test cache status
      setState(() {
        _debugInfo += '📊 Testing cache status...\n';
      });
      
      final cacheResponse = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/dev/cache?action=stats'),
        headers: ApiConstants.headers,
      ).timeout(const Duration(seconds: 10));
      
      setState(() {
        _debugInfo += 'Cache Status: ${cacheResponse.statusCode}\n';
        _debugInfo += 'Cache Response: ${cacheResponse.body}\n\n';
      });

      // Test basic cache operations
      setState(() {
        _debugInfo += '🧪 Testing basic cache operations...\n';
      });
      
      final basicTestResponse = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/dev/cache?action=test-basic'),
        headers: ApiConstants.headers,
      ).timeout(const Duration(seconds: 10));
      
      setState(() {
        _debugInfo += 'Basic Test: ${basicTestResponse.statusCode}\n';
        final testData = json.decode(basicTestResponse.body);
        _debugInfo += 'Test Success: ${testData['success']}\n';
        _debugInfo += 'Values Match: ${testData['data']?['valuesMatch']}\n\n';
      });

      // Test rate limiting
      setState(() {
        _debugInfo += '🚦 Testing rate limiting...\n';
      });
      
      final rateLimitResponse = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/dev/cache?action=test-rate-limit'),
        headers: ApiConstants.headers,
      ).timeout(const Duration(seconds: 10));
      
      setState(() {
        _debugInfo += 'Rate Limit Test: ${rateLimitResponse.statusCode}\n';
        final rateLimitData = json.decode(rateLimitResponse.body);
        _debugInfo += 'Rate Limit Results: ${rateLimitData['data']?['results']}\n\n';
      });

      setState(() {
        _debugInfo += '✅ Cache testing completed successfully!\n';
      });

    } catch (e) {
      setState(() {
        _debugInfo += '❌ Cache testing failed: $e\n';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Debug API'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ElevatedButton(
              onPressed: _isLoading ? null : _testConnection,
              child: _isLoading 
                  ? const CircularProgressIndicator()
                  : const Text('Test API Connection'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _isLoading ? null : _testCaching,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
              ),
              child: _isLoading 
                  ? const CircularProgressIndicator()
                  : const Text('Test Cache System'),
            ),
            const SizedBox(height: 16),
            Text(
              'API Base URL: ${ApiConstants.baseUrl}',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _debugInfo.isEmpty ? 'Tap "Test API Connection" to start debugging' : _debugInfo,
                    style: const TextStyle(fontFamily: 'monospace'),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
