import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_constants.dart';
import '../models/models.dart';
import '../utils/logger.dart';
import 'auth_storage.dart';

class ApiService {
  // Legacy support for existing code
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Auth methods - now using secure storage
  Future<String?> getToken() async {
    return await AuthStorage.getToken();
  }

  Future<void> setToken(String token) async {
    // This method is deprecated in favor of AuthStorage.saveAuthSession
    AuthLogger.warning('setToken is deprecated, use AuthStorage.saveAuthSession instead');
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<void> removeToken() async {
    await AuthStorage.clearSession();
  }

  Future<User?> getStoredUser() async {
    return await AuthStorage.getUser();
  }

  Future<void> setStoredUser(User user) async {
    await AuthStorage.updateUser(user);
  }

  // HTTP methods
  Future<http.Response> _get(String url, {Map<String, String>? headers}) async {
    try {
      ApiLogger.request('GET', url);
      final token = await getToken();
      final requestHeaders = headers ?? {};
      if (token != null) {
        requestHeaders.addAll(ApiConstants.getAuthHeaders(token));
      } else {
        requestHeaders.addAll(ApiConstants.headers);
      }
      
      ApiLogger.request('GET', url, headers: requestHeaders);

      final response = await http.get(
        Uri.parse(url),
        headers: requestHeaders,
      ).timeout(const Duration(seconds: 30));
      
      ApiLogger.response(response.statusCode, url, body: response.body);
      
      return response;
    } catch (e, stackTrace) {
      ApiLogger.error('GET Error for $url: $e', e, stackTrace);
      rethrow;
    }
  }

  Future<http.Response> _post(String url, {Map<String, dynamic>? body, Map<String, String>? headers}) async {
    try {
      final token = await getToken();
      final requestHeaders = headers ?? {};
      if (token != null) {
        requestHeaders.addAll(ApiConstants.getAuthHeaders(token));
      } else {
        requestHeaders.addAll(ApiConstants.headers);
      }

      ApiLogger.request('POST', url, headers: requestHeaders);
      if (body != null) {
        AppLogger.verbose('Request body: $body');
      }

      final response = await http.post(
        Uri.parse(url),
        headers: requestHeaders,
        body: body != null ? json.encode(body) : null,
      ).timeout(const Duration(seconds: 30));

      ApiLogger.response(response.statusCode, url, body: response.body);

      return response;
    } catch (e, stackTrace) {
      ApiLogger.error('POST Error for $url: $e', e, stackTrace);
      rethrow;
    }
  }

  // Connectivity test method
  Future<bool> testConnectivity() async {
    try {
      AppLogger.debug('Testing connectivity to ${ApiConstants.baseUrl}');
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/health'),
        headers: ApiConstants.headers,
      ).timeout(const Duration(seconds: 10));
      
      AppLogger.debug('Connectivity test status: ${response.statusCode}');
      return response.statusCode == 200 || response.statusCode == 404; // 404 is fine, means server is reachable
    } catch (e, stackTrace) {
      AppLogger.error('Connectivity test failed', e, stackTrace);
      return false;
    }
  }

  // Auth API calls
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      AuthLogger.api('Attempting login with email: $email');
      
      final response = await _post(
        ApiConstants.login,
        body: {'email': email, 'password': password},
      );

      AuthLogger.api('Login response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        AppLogger.verbose('Parsed login response: $responseData');
        
        // Extract data from the wrapper
        final data = responseData['data'];
        if (data == null) {
          throw Exception('Data is null in response');
        }
        
        if (data['token'] == null) {
          throw Exception('Token is null in response');
        }
        if (data['user'] == null) {
          throw Exception('User data is null in response');
        }
        
        AppLogger.verbose('Extracted token: ${data['token']}');
        AppLogger.verbose('Extracted user: ${data['user']}');
        
        await setToken(data['token']);
        await setStoredUser(User.fromJson(data['user']));
        return responseData; // Return the full response
      } else {
        AuthLogger.error('Login failed with status: ${response.statusCode}');
        AppLogger.debug('Error response: ${response.body}');
        throw Exception('Login failed: ${response.body}');
      }
    } catch (e, stackTrace) {
      AuthLogger.error('Login error: $e', e, stackTrace);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> register(String email, String password, String firstName, String lastName, String role) async {
    try {
      AuthLogger.api('Attempting registration with email: $email');
      
      final response = await _post(
        ApiConstants.register,
        body: {
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          'role': role,
        },
      );

      AuthLogger.api('Register response status: ${response.statusCode}');

      if (response.statusCode == 201 || response.statusCode == 200) {
        final responseData = json.decode(response.body);
        AppLogger.verbose('Parsed register response: $responseData');
        
        // Extract data from the wrapper (assuming same structure as login)
        final data = responseData['data'];
        if (data == null) {
          throw Exception('Data is null in response');
        }
        
        if (data['token'] == null) {
          throw Exception('Token is null in response');
        }
        if (data['user'] == null) {
          throw Exception('User data is null in response');
        }
        
        AppLogger.verbose('Extracted token: ${data['token']}');
        AppLogger.verbose('Extracted user: ${data['user']}');
        
        await setToken(data['token']);
        await setStoredUser(User.fromJson(data['user']));
        return responseData; // Return the full response
      } else {
        AuthLogger.error('Registration failed with status: ${response.statusCode}');
        AppLogger.debug('Error response: ${response.body}');
        throw Exception('Registration failed: ${response.body}');
      }
    } catch (e, stackTrace) {
      AuthLogger.error('Registration error: $e', e, stackTrace);
      rethrow;
    }
  }

  Future<User> getProfile() async {
    final response = await _get(ApiConstants.profile);

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      AppLogger.verbose('Creating User from JSON: $responseData');
      
      // Extract user data from the wrapper
      final userData = responseData['data'] ?? responseData;
      final user = User.fromJson(userData);
      await setStoredUser(user);
      return user;
    } else {
      throw Exception('Failed to get profile: ${response.body}');
    }
  }

  Future<void> logout() async {
    await removeToken();
  }

  // Properties API calls
  Future<List<Property>> getProperties() async {
    final response = await _get(ApiConstants.properties);

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      AppLogger.verbose('Properties response type: ${responseData.runtimeType}');
      AppLogger.verbose('Properties response: $responseData');
      
      // Handle different response formats
      if (responseData is List<dynamic>) {
        // Direct array response
        return responseData.map((json) => Property.fromJson(json)).toList();
      } else if (responseData is Map<String, dynamic>) {
        // Wrapped response
        if (responseData['success'] == true && responseData['data'] != null) {
          final data = responseData['data'];
          if (data['properties'] != null) {
            final List<dynamic> properties = data['properties'];
            return properties.map((json) => Property.fromJson(json)).toList();
          } else if (data is List<dynamic>) {
            return data.map((json) => Property.fromJson(json)).toList();
          }
        } else if (responseData['data'] != null && responseData['data'] is List<dynamic>) {
          // Simple wrapped array
          final List<dynamic> properties = responseData['data'];
          return properties.map((json) => Property.fromJson(json)).toList();
        }
      }
      
      throw Exception('Unexpected response format for properties: ${responseData.runtimeType}');
    } else {
      throw Exception('Failed to get properties: ${response.body}');
    }
  }

  Future<Property> getProperty(String id) async {
    final response = await _get('${ApiConstants.properties}/$id');

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Property.fromJson(data);
    } else {
      throw Exception('Failed to get property: ${response.body}');
    }
  }

  Future<List<Property>> getMyProperties() async {
    final response = await _get(ApiConstants.myProperties);

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Property.fromJson(json)).toList();
    } else {
      throw Exception('Failed to get my properties: ${response.body}');
    }
  }

  // Messages API calls
  Future<List<Conversation>> getConversations() async {
    final response = await _get(ApiConstants.conversations);

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      AppLogger.verbose('Conversations response type: ${responseData.runtimeType}');
      AppLogger.verbose('Conversations response: $responseData');
      
      // Handle different response formats
      if (responseData is List<dynamic>) {
        // Direct array response
        return responseData.map((json) => Conversation.fromJson(json)).toList();
      } else if (responseData is Map<String, dynamic>) {
        // Wrapped response
        if (responseData['success'] == true && responseData['data'] != null) {
          final List<dynamic> conversations = responseData['data'];
          return conversations.map((json) => Conversation.fromJson(json)).toList();
        } else if (responseData['data'] != null && responseData['data'] is List<dynamic>) {
          final List<dynamic> conversations = responseData['data'];
          return conversations.map((json) => Conversation.fromJson(json)).toList();
        }
      }
      
      throw Exception('Unexpected response format for conversations: ${responseData.runtimeType}');
    } else {
      throw Exception('Failed to get conversations: ${response.body}');
    }
  }

  Future<List<Message>> getMessages(String conversationId) async {
    final response = await _get('${ApiConstants.messages}/$conversationId');

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      AppLogger.verbose('Messages response: $responseData');
      
      // Handle wrapped response
      if (responseData is Map<String, dynamic>) {
        if (responseData['success'] == true && responseData['data'] != null) {
          final data = responseData['data'];
          if (data['messages'] != null) {
            final List<dynamic> messages = data['messages'];
            return messages.map((json) => Message.fromJson(json)).toList();
          }
        }
      }
      // If response is directly a list
      if (responseData is List<dynamic>) {
        return responseData.map((json) => Message.fromJson(json)).toList();
      }
      
      throw Exception('Unexpected response format for messages');
    } else {
      throw Exception('Failed to get messages: ${response.body}');
    }
  }

  Future<Message> sendMessage(String conversationId, String content) async {
    final response = await _post(
      '${ApiConstants.messages}/$conversationId',
      body: {'content': content},
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      final responseData = json.decode(response.body);
      AppLogger.verbose('Send message response: $responseData');
      
      // Handle wrapped response
      if (responseData is Map<String, dynamic>) {
        if (responseData['success'] == true && responseData['data'] != null) {
          return Message.fromJson(responseData['data']);
        }
        // If it's a direct message object
        return Message.fromJson(responseData);
      }
      
      throw Exception('Unexpected response format for send message');
    } else {
      throw Exception('Failed to send message: ${response.body}');
    }
  }

  // Landlords API calls
  Future<List<User>> getLandlords() async {
    final response = await _get(ApiConstants.landlords);

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => User.fromJson(json)).toList();
    } else {
      throw Exception('Failed to get landlords: ${response.body}');
    }
  }

  Future<User> getLandlord(String id) async {
    final response = await _get('${ApiConstants.landlords}/$id');

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return User.fromJson(data);
    } else {
      throw Exception('Failed to get landlord: ${response.body}');
    }
  }
}
