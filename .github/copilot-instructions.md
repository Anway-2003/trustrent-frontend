# TrustRent - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

TrustRent is a **social networking platform** for property rentals that revolutionizes the rental market by eliminating traditional agencies and fostering direct relationships between landlords and tenants. Similar to LinkedIn but focused on rental experiences, TrustRent emphasizes **trust, transparency, and community**.

**Core Philosophy**: Building a trustworthy rental ecosystem where past experiences, payment history, property maintenance records, and social interactions create authentic profiles that benefit both landlords and tenants. **TrustRent acts as the trusted service provider**, handling all administrative tasks (paperwork, payment processing, legal compliance) while enabling direct social connections between users.

**Key Differentiators**:
- **No Traditional Agencies**: Direct landlord-tenant social relationships with TrustRent handling the administrative burden
- **Service Provider Role**: TrustRent manages payments, contracts, legal paperwork, and compliance while users maintain direct relationships
- **Social Trust Building**: Comprehensive rating and review system based on real rental experiences
- **Transparent Histories**: Payment reliability, property care, communication quality, and rental behavior tracking
- **Community-Driven**: Social features that create lasting relationships beyond single transactions
- **Authentic Profiles**: Rich social profiles showcasing rental history, references, and community involvement
- **Administrative Support**: Professional handling of boring paperwork, payment guarantees, and legal requirements

The platform enables users to:
- Create detailed social profiles as landlords, tenants, or both
- Connect directly while TrustRent handles all administrative services
- Showcase and discover rental properties with complete transparency
- Rate and review rental experiences comprehensively (payment habits, property care, communication, etc.)
- Build rental reputation and trust scores over time
- Message and communicate directly without intermediaries
- Match based on compatibility, preferences, and social trust factors
- Share experiences and build a rental community
- **Benefit from TrustRent's administrative services**: payment processing, contract management, legal compliance, dispute resolution

## Tech Stack

- **Frontend Web**: Next.js 15 with React, TypeScript, Tailwind CSS
- **Mobile App**: Flutter with Dart
- **Backend**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT (web) custom JWT (mobile)
- **UI Components**: Custom components with Tailwind CSS (web), Material Design/Cupertino (mobile)
- **State Management**: React hooks and Context API (web), Provider/Riverpod (mobile)
- **File Upload**: For property images and user avatars
- **API Communication**: REST APIs shared between web and mobile

## Architecture Guidelines

1. **Folder Structure**: 
   - Web: Use Next.js 15 App Router structure with `src/` directory
   - Mobile: Standard Flutter project structure with `lib/` directory
2. **API Routes**: Place in `src/app/api/` following RESTful conventions (shared by web and mobile)
3. **Components**: 
   - Web: Reusable components in `src/components/`
   - Mobile: Reusable widgets in `lib/widgets/`
4. **Database**: Prisma schema in `prisma/schema.prisma`
5. **Types**: 
   - Web: TypeScript types in `src/types/`
   - Mobile: Dart models in `lib/models/`
6. **Utilities**: 
   - Web: Helper functions in `src/lib/`
   - Mobile: Helper functions in `lib/utils/`
7. **Mobile Structure**: Follow clean architecture with `lib/features/` for feature-based organization

## Key Features to Implement

1. **Social User Management**: 
   - Rich profile creation with rental history and social elements
   - Verification systems for identity and rental claims
   - Social connections and referral networks

2. **Trust & Reputation System**:
   - Comprehensive bidirectional rating system (payment history, property care, communication, reliability)
   - Trust scores based on rental behavior and community engagement
   - Verification badges for payment history, references, and identity

3. **TrustRent Service Management**:
   - Automated payment processing and guarantees
   - Digital contract generation and management
   - Legal compliance and document handling
   - Deposit management and dispute resolution
   - Insurance and protection services
   - Administrative task automation

4. **Direct Property Management**: 
   - CRUD operations for rental properties without agency involvement
   - Property history and landlord transparency
   - Direct booking with TrustRent service integration
   - Rental agreement tools with legal compliance

5. **Social Features**:
   - Community forums and discussions
   - Rental experience sharing and stories
   - Tenant and landlord groups and networking
   - Referral and recommendation systems

6. **Advanced Messaging & Communication**:
   - Direct messaging between verified users
   - Group chats for property viewings
   - Integrated video calls for virtual tours
   - Communication quality tracking for reputation

7. **Smart Matching Algorithm**: 
   - Compatibility matching based on lifestyle, preferences, and social factors
   - Trust-based recommendations
   - Community-driven suggestions

8. **Rental Experience Tracking**:
   - Payment history and reliability scoring
   - Property maintenance and care records
   - Tenancy duration and stability tracking
   - Conflict resolution and mediation tools

## Code Conventions

- **Web**: Use TypeScript for all files
- **Mobile**: Use Dart with strong typing
- Follow Next.js 15 App Router patterns (web)
- Follow Flutter best practices and Material Design guidelines (mobile)
- Use Tailwind CSS for styling (web)
- Use Material Design/Cupertino widgets for styling (mobile)
- Implement responsive design mobile-first
- Use proper error handling and loading states
- Follow accessibility best practices
- Use meaningful component/widget and variable names in English
- **Mobile Specific**:
  - Use Provider or Riverpod for state management
  - Implement proper navigation with GoRouter or Navigator 2.0
  - Use dio or http package for API calls
  - Follow Flutter naming conventions (snake_case for files, camelCase for variables)

## Database Design

**Social-First Database Structure with Service Management**:
- **Users table**: Extended profiles with social elements, trust scores, verification status
- **Properties table**: Detailed information with landlord history and transparency metrics
- **Rental Experiences table**: Comprehensive rental history with multiple rating dimensions
- **Reviews/Ratings table**: Multi-faceted feedback system (payment, care, communication, overall experience)
- **Trust Metrics table**: Calculated trust scores and reputation tracking
- **Social Connections table**: User relationships, referrals, and network connections
- **Messages table**: Enhanced communication with quality tracking
- **Verification table**: Identity, payment history, and reference verification
- **Community Interactions table**: Forum posts, discussions, and social engagement
- **Rental Agreements table**: Direct contract management with TrustRent services
- **Payment Transactions table**: TrustRent-managed payment processing and history
- **Service Requests table**: Administrative tasks and service management
- **Legal Documents table**: Contract templates, compliance documents, and legal paperwork
- **Dispute Resolution table**: Conflict management and mediation tracking

**Key Social Metrics to Track**:
- Payment reliability and history (managed by TrustRent)
- Property care and maintenance responsibility
- Communication quality and responsiveness
- Rental duration stability
- Community engagement and helpfulness
- Dispute resolution and conflict handling
- Service satisfaction with TrustRent administrative support

## Security Considerations

- Implement proper authentication and authorization
- Validate all user inputs
- Sanitize data before database operations
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- **Mobile Specific**:
  - Secure API keys and sensitive data using flutter_secure_storage
  - Implement certificate pinning for API calls
  - Use biometric authentication where appropriate
  - Validate SSL certificates in network requests
