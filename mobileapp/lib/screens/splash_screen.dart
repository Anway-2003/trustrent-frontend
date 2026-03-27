import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../utils/logger.dart';
import '../utils/auth_debug.dart';

/// Splash screen that handles app initialization
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> 
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    _animationController.forward();
    
    // Check if auth provider is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkInitialization();
    });
  }

  void _checkInitialization() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    if (authProvider.isInitialized) {
      _navigateToNextScreen();
    } else {
      // Listen for initialization completion
      authProvider.addListener(_onAuthStateChanged);
    }
  }

  void _onAuthStateChanged() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    if (authProvider.isInitialized) {
      authProvider.removeListener(_onAuthStateChanged);
      _navigateToNextScreen();
    }
  }

  void _navigateToNextScreen() {
    // Add a minimum splash screen time
    Future.delayed(const Duration(milliseconds: 2000), () async {
      if (mounted) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        
        NavLogger.route('splash', authProvider.isAuthenticated && authProvider.user != null ? 'dashboard' : 'login');
        
        // Debug auth state
        await AuthDebug.printAuthState(authProvider);
        
        if (authProvider.isAuthenticated && authProvider.user != null) {
          // User is logged in with valid data, go to dashboard
          context.go('/');
        } else {
          // User not logged in or session invalid, go to login
          context.go('/login');
        }
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E40AF), // TrustRent primary blue
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: Column(
                    children: [
                      // TrustRent Logo
                      Container(
                        width: 120,
                        height: 120,
                        child: Image.asset(
                          'assets/images/logo-no-bg.png',
                          fit: BoxFit.contain,
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // App Name
                      const Text(
                        'TrustRent',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      
                      // Tagline
                      const Text(
                        'Social Rental Network',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white70,
                          fontWeight: FontWeight.w300,
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 60),
                
                // Loading indicator
                if (authProvider.isLoading || !authProvider.isInitialized)
                  Column(
                    children: [
                      const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        authProvider.isInitialized 
                          ? 'Setting up...' 
                          : 'Restoring session...',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                
                // Error state
                if (authProvider.error != null && authProvider.isInitialized)
                  Column(
                    children: [
                      const Icon(
                        Icons.error_outline,
                        color: Colors.white70,
                        size: 24,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Session restore failed',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: () {
                          authProvider.clearError();
                          _navigateToNextScreen();
                        },
                        child: const Text(
                          'Continue',
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
