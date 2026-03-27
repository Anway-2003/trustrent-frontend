import 'package:go_router/go_router.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/properties/properties_screen.dart';
import '../screens/properties/property_details_screen.dart';
import '../screens/messages/messages_screen.dart';
import '../screens/messages/conversation_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/main_screen.dart';
import '../screens/splash_screen.dart';
import '../providers/auth_provider.dart';
import 'package:provider/provider.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      // Allow splash screen during initialization
      if (state.uri.toString() == '/splash') {
        return null;
      }
      
      // If not initialized yet, stay on splash
      if (!authProvider.isInitialized) {
        return '/splash';
      }
      
      final isLoggedIn = authProvider.isAuthenticated;
      
      if (!isLoggedIn && state.uri.toString() != '/login' && state.uri.toString() != '/register') {
        return '/login';
      }
      
      if (isLoggedIn && (state.uri.toString() == '/login' || state.uri.toString() == '/register')) {
        return '/';
      }
      
      return null;
    },
    routes: [
      // Splash screen
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainScreen(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/properties',
            builder: (context, state) => const PropertiesScreen(),
          ),
          GoRoute(
            path: '/property/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return PropertyDetailsScreen(propertyId: id);
            },
          ),
          GoRoute(
            path: '/messages',
            builder: (context, state) => const MessagesScreen(),
          ),
          GoRoute(
            path: '/conversation/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return ConversationScreen(conversationId: id);
            },
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
}
