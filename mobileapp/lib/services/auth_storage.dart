import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import '../utils/logger.dart';

/// Secure authentication storage service
/// Handles persistent login sessions with secure token storage
class AuthStorage {
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  // Secure storage keys
  static const String _tokenKey = 'auth_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userIdKey = 'user_id';
  static const String _sessionExpiryKey = 'session_expiry';
  
  // Non-sensitive user data in shared preferences
  static const String _userDataKey = 'user_data';
  static const String _isLoggedInKey = 'is_logged_in';

  /// Save authentication session
  static Future<void> saveAuthSession({
    required String token,
    required User user,
    String? refreshToken,
    DateTime? expiresAt,
  }) async {
    try {
      // Store sensitive data in secure storage
      await _secureStorage.write(key: _tokenKey, value: token);
      await _secureStorage.write(key: _userIdKey, value: user.id);
      
      if (refreshToken != null) {
        await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
      }
      
      if (expiresAt != null) {
        await _secureStorage.write(
          key: _sessionExpiryKey, 
          value: expiresAt.millisecondsSinceEpoch.toString()
        );
      }

      // Store non-sensitive user data in shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userDataKey, json.encode(user.toJson()));
      await prefs.setBool(_isLoggedInKey, true);
      
      AuthLogger.storage('Auth session saved successfully');
    } catch (e, stackTrace) {
      AuthLogger.error('Error saving auth session', e, stackTrace);
      throw Exception('Failed to save authentication session');
    }
  }

  /// Get stored authentication token
  static Future<String?> getToken() async {
    try {
      return await _secureStorage.read(key: _tokenKey);
    } catch (e, stackTrace) {
      AuthLogger.error('Error reading token', e, stackTrace);
      return null;
    }
  }

  /// Get stored refresh token
  static Future<String?> getRefreshToken() async {
    try {
      return await _secureStorage.read(key: _refreshTokenKey);
    } catch (e, stackTrace) {
      AuthLogger.error('Error reading refresh token', e, stackTrace);
      return null;
    }
  }

  /// Get stored user data
  static Future<User?> getUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString(_userDataKey);
      if (userJson != null) {
        return User.fromJson(json.decode(userJson));
      }
      return null;
    } catch (e, stackTrace) {
      AuthLogger.error('Error reading user data', e, stackTrace);
      return null;
    }
  }

  /// Check if user is logged in
  static Future<bool> isLoggedIn() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool(_isLoggedInKey) ?? false;
      
      if (!isLoggedIn) return false;
      
      // Check if token exists
      final token = await getToken();
      if (token == null) {
        await clearSession();
        return false;
      }
      
      // Check if session has expired
      final expiryString = await _secureStorage.read(key: _sessionExpiryKey);
      if (expiryString != null) {
        final expiry = DateTime.fromMillisecondsSinceEpoch(int.parse(expiryString));
        if (DateTime.now().isAfter(expiry)) {
          AuthLogger.warning('Session expired, clearing auth data');
          await clearSession();
          return false;
        }
      }
      
      return true;
    } catch (e, stackTrace) {
      AuthLogger.error('Error checking login status', e, stackTrace);
      return false;
    }
  }

  /// Get complete authentication session
  static Future<AuthSession?> getSession() async {
    try {
      if (!await isLoggedIn()) return null;
      
      final token = await getToken();
      final user = await getUser();
      final refreshToken = await getRefreshToken();
      
      if (token == null || user == null) {
        await clearSession();
        return null;
      }
      
      DateTime? expiresAt;
      final expiryString = await _secureStorage.read(key: _sessionExpiryKey);
      if (expiryString != null) {
        expiresAt = DateTime.fromMillisecondsSinceEpoch(int.parse(expiryString));
      }
      
      return AuthSession(
        token: token,
        user: user,
        refreshToken: refreshToken,
        expiresAt: expiresAt,
      );
    } catch (e, stackTrace) {
      AuthLogger.error('Error getting session', e, stackTrace);
      await clearSession();
      return null;
    }
  }

  /// Update user data (keeping tokens intact)
  static Future<void> updateUser(User user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userDataKey, json.encode(user.toJson()));
      AuthLogger.storage('User data updated successfully');
    } catch (e, stackTrace) {
      AuthLogger.error('Error updating user data', e, stackTrace);
    }
  }

  /// Clear all authentication data
  static Future<void> clearSession() async {
    try {
      // Clear secure storage
      await _secureStorage.delete(key: _tokenKey);
      await _secureStorage.delete(key: _refreshTokenKey);
      await _secureStorage.delete(key: _userIdKey);
      await _secureStorage.delete(key: _sessionExpiryKey);
      
      // Clear shared preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_userDataKey);
      await prefs.setBool(_isLoggedInKey, false);
      
      AuthLogger.storage('Auth session cleared successfully');
    } catch (e, stackTrace) {
      AuthLogger.error('Error clearing session', e, stackTrace);
    }
  }

  /// Check if biometric authentication is available and enabled
  static Future<bool> isBiometricAvailable() async {
    try {
      return await _secureStorage.containsKey(key: _tokenKey);
    } catch (e) {
      return false;
    }
  }

  /// Emergency clear all stored data (for debugging)
  static Future<void> emergencyClear() async {
    try {
      await _secureStorage.deleteAll();
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      AuthLogger.warning('Emergency clear completed');
    } catch (e, stackTrace) {
      AuthLogger.error('Emergency clear failed', e, stackTrace);
    }
  }
}

/// Authentication session model
class AuthSession {
  final String token;
  final User user;
  final String? refreshToken;
  final DateTime? expiresAt;

  AuthSession({
    required this.token,
    required this.user,
    this.refreshToken,
    this.expiresAt,
  });

  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  bool get isExpiringSoon {
    if (expiresAt == null) return false;
    final minutesUntilExpiry = expiresAt!.difference(DateTime.now()).inMinutes;
    return minutesUntilExpiry < 30; // Consider renewing if less than 30 minutes
  }
}
