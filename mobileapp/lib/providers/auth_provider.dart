import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/auth_storage.dart';
import '../utils/logger.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  User? _user;
  String? _token;
  bool _isLoading = false;
  bool _isInitialized = false;
  String? _error;

  User? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _user != null && _token != null;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  String? get error => _error;

  AuthProvider() {
    _initializeAuth();
  }

  /// Initialize authentication state from secure storage
  Future<void> _initializeAuth() async {
    if (_isInitialized) return;
    
    _isLoading = true;
    notifyListeners();

    try {
      AuthLogger.session('Initializing authentication from secure storage...');
      
      final session = await AuthStorage.getSession();
      if (session != null && !session.isExpired) {
        AuthLogger.session('Found stored session for user: ${session.user.firstName}');
        _user = session.user;
        _token = session.token;
        
        // Verify token is still valid with the server
        try {
          AuthLogger.api('Verifying token with server...');
          final profile = await _apiService.getProfile();
          // Update user with fresh profile data from server
          _user = profile;
          await AuthStorage.updateUser(profile);
          AuthLogger.success('Session restored and verified successfully for user: ${_user?.firstName}');
        } catch (e) {
          AuthLogger.warning('Stored token is invalid, clearing session: $e');
          await _clearSession();
          _error = 'Session expired, please login again';
        }
      } else if (session?.isExpired == true) {
        AuthLogger.warning('Stored session is expired, clearing');
        await AuthStorage.clearSession();
      } else {
        AuthLogger.session('No valid session found');
      }
    } catch (e, stackTrace) {
      AuthLogger.error('Error initializing auth: $e', e, stackTrace);
      await AuthStorage.clearSession();
      _error = 'Failed to restore session';
    } finally {
      _isLoading = false;
      _isInitialized = true;
      AuthLogger.session('Auth initialization completed. User: ${_user?.firstName}, Authenticated: $isAuthenticated');
      notifyListeners();
    }
  }

  /// Clear session and reset state
  Future<void> _clearSession() async {
    _user = null;
    _token = null;
    await AuthStorage.clearSession();
  }

  Future<bool> login(String email, String password) async {
    AuthLogger.session('Login attempt for email: $email');
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.login(email, password);
      AuthLogger.api('Login response received');
      
      // Extract user and token from the response
      final data = response['data'];
      final token = response['token'] ?? data?['token'];
      
      if (data != null && data['user'] != null && token != null) {
        _user = User.fromJson(data['user']);
        _token = token;
        
        // Calculate token expiry (default to 24 hours if not provided)
        final expiresIn = response['expiresIn'] ?? data?['expiresIn'] ?? 86400; // 24 hours
        final expiresAt = DateTime.now().add(Duration(seconds: expiresIn));
        
        // Save session securely
        await AuthStorage.saveAuthSession(
          token: token,
          user: _user!,
          expiresAt: expiresAt,
        );
        
        AuthLogger.success('Login successful for user: ${_user?.fullName}');
      } else {
        throw Exception('User data or token is null in API response');
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e, stackTrace) {
      AuthLogger.error('Login failed: $e', e, stackTrace);
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String email, String password, String firstName, String lastName, String role) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      AuthLogger.session('Registration attempt for email: $email');
      final response = await _apiService.register(email, password, firstName, lastName, role);
      AuthLogger.api('Registration response received');
      
      // Extract user and token from the response
      final data = response['data'];
      final token = response['token'] ?? data?['token'];
      
      if (data != null && data['user'] != null && token != null) {
        _user = User.fromJson(data['user']);
        _token = token;
        
        // Calculate token expiry
        final expiresIn = response['expiresIn'] ?? data?['expiresIn'] ?? 86400;
        final expiresAt = DateTime.now().add(Duration(seconds: expiresIn));
        
        // Save session securely
        await AuthStorage.saveAuthSession(
          token: token,
          user: _user!,
          expiresAt: expiresAt,
        );
        
        AuthLogger.success('Registration successful for user: ${_user?.fullName}');
      } else {
        throw Exception('User data or token is null in API response');
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e, stackTrace) {
      AuthLogger.error('Registration failed: $e', e, stackTrace);
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    AuthLogger.session('Logging out user: ${_user?.firstName}');
    _isLoading = true;
    notifyListeners();

    try {
      // Call API logout if needed (optional)
      try {
        await _apiService.logout();
      } catch (e) {
        AuthLogger.warning('API logout failed, continuing with local logout: $e');
      }
      
      // Clear local state and secure storage
      await _clearSession();
      
      AuthLogger.success('Logout successful');
    } catch (e, stackTrace) {
      AuthLogger.error('Logout error: $e', e, stackTrace);
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshProfile() async {
    if (_user == null) return;

    try {
      final updatedUser = await _apiService.getProfile();
      _user = updatedUser;
      
      // Update stored user data
      await AuthStorage.updateUser(updatedUser);
      notifyListeners();
    } catch (e, stackTrace) {
      AuthLogger.error('Error refreshing profile: $e', e, stackTrace);
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Update user profile locally and in storage
  Future<void> updateUser(User updatedUser) async {
    if (_user != null) {
      _user = updatedUser;
      await AuthStorage.updateUser(updatedUser);
      notifyListeners();
    }
  }

  /// Check if session is still valid (useful for app resume)
  Future<void> checkSession() async {
    if (!_isInitialized) {
      await _initializeAuth();
      return;
    }
    
    final isValid = await AuthStorage.isLoggedIn();
    if (!isValid && isAuthenticated) {
      AuthLogger.warning('Session is no longer valid, logging out');
      await logout();
    }
  }

  /// Force session refresh
  Future<void> refreshSession() async {
    AuthLogger.session('Force refreshing session...');
    _isInitialized = false;
    await _initializeAuth();
  }

  /// Check and fix inconsistent auth state
  Future<void> validateAuthState() async {
    if (isAuthenticated && _user == null) {
      AuthLogger.warning('Inconsistent auth state detected: token exists but no user data');
      await logout();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
