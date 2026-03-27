import '../providers/auth_provider.dart';
import '../services/auth_storage.dart';
import 'logger.dart';

/// Debugging utilities for authentication issues
class AuthDebug {
  static Future<void> printAuthState(AuthProvider authProvider) async {
    AppLogger.debug('=== AUTH DEBUG STATE ===');
    AppLogger.debug('📱 isAuthenticated: ${authProvider.isAuthenticated}');
    AppLogger.debug('👤 user: ${authProvider.user?.firstName} ${authProvider.user?.lastName}');
    AppLogger.debug('🎫 token: ${authProvider.token != null ? 'Present (${authProvider.token!.length} chars)' : 'None'}');
    AppLogger.debug('⚡ isInitialized: ${authProvider.isInitialized}');
    AppLogger.debug('⏳ isLoading: ${authProvider.isLoading}');
    AppLogger.debug('❌ error: ${authProvider.error}');
    
    // Check storage state
    final session = await AuthStorage.getSession();
    AppLogger.debug('💾 stored session: ${session != null ? 'Present' : 'None'}');
    if (session != null) {
      AppLogger.debug('💾 stored user: ${session.user.firstName} ${session.user.lastName}');
      AppLogger.debug('💾 session expired: ${session.isExpired}');
      AppLogger.debug('💾 token length: ${session.token.length}');
    }
    AppLogger.debug('=== END AUTH DEBUG ===');
  }

  static Future<void> clearAndRetest(AuthProvider authProvider) async {
    AppLogger.warning('Clearing all auth data for testing...');
    await AuthStorage.emergencyClear();
    await authProvider.refreshSession();
    await printAuthState(authProvider);
  }
}
