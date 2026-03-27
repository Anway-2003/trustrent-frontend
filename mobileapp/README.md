# trustrent_mobile

A new Flutter project.

## Getting Started

# TrustRent Mobile App

A Flutter mobile application for TrustRent - a property rental social networking platform that connects tenants with landlords.

## Features

### 🔐 Authentication
- User registration with role selection (Tenant, Landlord, Both)
- Secure login with JWT token authentication
- Persistent login sessions with automatic token refresh
- Role-based access control

### 🏠 Property Management
- Browse all available properties with images and details
- Advanced property search and filtering
- Detailed property view with amenities, location, and landlord info
- Property favorites and saved listings
- Landlord property management (for landlord users)

### 💬 Messaging System
- Real-time messaging between tenants and landlords
- Conversation management with message history
- Message status indicators (read/unread)
- Contact landlords directly from property listings

### 👤 User Profile
- Comprehensive user profile management
- Role badges and verification status
- Profile statistics (properties, messages, reviews)
- Settings and preferences

### 📱 Mobile Experience
- Responsive design for all screen sizes
- Material Design UI components
- Pull-to-refresh functionality
- Loading states and error handling
- Offline-first architecture

## Technology Stack

- **Framework**: Flutter 3.32.5
- **Language**: Dart 3.8.1
- **State Management**: Provider
- **Navigation**: GoRouter
- **HTTP Client**: Dio + HTTP
- **Local Storage**: SharedPreferences
- **UI Components**: Material Design 3

## Backend Integration

The app integrates with the TrustRent backend API:
- **Base URL**: `https://trustrent.tommasolopiparo.com/api`
- **Authentication**: JWT tokens
- **Endpoints**: Properties, Messages, Users, Landlords

## Getting Started

### Prerequisites
- Flutter SDK 3.32.5 or later
- Dart SDK 3.8.1 or later
- Android Studio / VS Code
- Android device or emulator

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mobileapp
```

2. Install dependencies
```bash
flutter pub get
```

3. Run the app
```bash
flutter run
```

### Building for Production

#### Android APK
```bash
flutter build apk --release
```

#### Android App Bundle
```bash
flutter build appbundle --release
```

#### iOS (requires macOS)
```bash
flutter build ios --release
```

## Project Structure

```
lib/
├── config/
│   ├── api_constants.dart    # API endpoints and constants
│   ├── app_router.dart       # Navigation routing
│   └── app_theme.dart        # App theme and styling
├── models/
│   └── models.dart           # Data models (User, Property, Message, etc.)
├── providers/
│   ├── auth_provider.dart    # Authentication state management
│   ├── message_provider.dart # Messaging state management
│   └── property_provider.dart # Property state management
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── register_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── messages/
│   │   ├── conversation_screen.dart
│   │   └── messages_screen.dart
│   ├── profile/
│   │   └── profile_screen.dart
│   ├── properties/
│   │   ├── properties_screen.dart
│   │   └── property_details_screen.dart
│   └── main_screen.dart      # Main app shell with navigation
├── services/
│   └── api_service.dart      # API service layer
└── main.dart                 # App entry point
```

## Key Features Implementation

### Authentication Flow
- JWT token storage in SharedPreferences
- Automatic token refresh on app start
- Route protection based on authentication state
- Role-based feature access

### State Management
- Provider pattern for reactive state updates
- Separation of concerns between UI and business logic
- Proper error handling and loading states

### Navigation
- GoRouter for declarative routing
- Deep linking support
- Authentication-based route guards
- Bottom navigation with proper state management

### API Integration
- RESTful API calls with proper error handling
- Token-based authentication
- Request/response interceptors
- Network error handling

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/user/profile` - Get user profile

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property details
- `GET /api/properties/my` - Get user's properties

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id` - Get messages
- `POST /api/messages/conversations/:id` - Send message

### Landlords
- `GET /api/landlords` - Get all landlords
- `GET /api/landlords/:id` - Get landlord details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## Development Guidelines

- Follow Flutter/Dart best practices
- Use Provider for state management
- Implement proper error handling
- Write clean, maintainable code
- Follow Material Design principles
- Handle loading and empty states gracefully

## Testing

Run tests with:
```bash
flutter test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.
