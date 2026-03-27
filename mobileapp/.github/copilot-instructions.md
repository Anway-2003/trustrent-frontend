# TrustRent Mobile App - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Flutter mobile application for TrustRent - a property rental social networking platform. The app connects tenants with landlords and provides features for property browsing, messaging, and profile management.

## Architecture & Patterns
- **State Management**: Provider pattern for state management
- **Navigation**: GoRouter for declarative navigation
- **API Integration**: HTTP client with proper error handling
- **Clean Architecture**: Separation of concerns with providers, services, and models

## Key Features
- Authentication (login/register with JWT)
- Property browsing and details
- Real-time messaging system
- User profile management
- Responsive UI design with Material Design

## Backend Integration
- Base URL: `https://trustrent.tommasolopiparo.com/api`
- JWT token authentication
- RESTful API endpoints for properties, messages, and user management

## Development Guidelines
- Follow Flutter best practices
- Use Provider for state management
- Implement proper error handling
- Write clean, maintainable code
- Follow Material Design principles
- Handle loading states and empty states gracefully

## File Structure
- `lib/models/` - Data models
- `lib/providers/` - State management providers
- `lib/services/` - API services
- `lib/screens/` - UI screens
- `lib/config/` - App configuration and routing
- `assets/` - Static assets (images, icons)

## Common Patterns
- Use Consumer widgets for state updates
- Implement RefreshIndicator for pull-to-refresh
- Handle authentication state in routing
- Show loading indicators during API calls
- Display error messages with retry options
