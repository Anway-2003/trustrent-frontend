# TrustRent - Social Platform for Property Rentals

TrustRent is a social networking platform for property rentals, similar to LinkedIn but focused on connecting landlords and tenants. The platform enables users to create profiles, list properties, rate experiences, communicate directly, and find perfect matches based on preferences.

## 🚀 Features

- **User Management**: Registration and authentication for landlords and tenants
- **Property Listings**: Create, browse, and manage rental properties
- **Rating System**: Bidirectional reviews between landlords and tenants
- **Direct Messaging**: Secure communication between users
- **Smart Matching**: Algorithm-based compatibility matching
- **Advanced Search**: Filter properties by location, price, features, and more
- **Responsive Design**: Mobile-first, modern UI built with Tailwind CSS

## 📋 Tech Stack

- **Frontend**: Next.js 15 with React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with custom auth system
- **Icons**: Lucide React
- **Deployment**: Docker ready, Vercel, Netlify, or any Node.js hosting
- **Containerization**: Docker & Docker Compose

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── properties/    # Properties CRUD
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── components/            # Reusable React components
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # Authentication helpers
│   └── prisma.ts         # Database client
├── types/                # TypeScript type definitions
└── styles/               # Global styles
prisma/
└── schema.prisma         # Database schema
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pippobaudoicon/trustrent
   cd trustrent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your database URL and JWT secret:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/trustrent"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Create and run migrations
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Store user profiles with roles (landlord/tenant/both)
- **Properties**: Property listings with detailed information
- **Applications**: Track rental applications
- **Reviews**: Bidirectional rating system
- **Messages**: Direct communication between users
- **UserPreferences**: Matching criteria and preferences

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database operations
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma db push         # Push schema changes
npx prisma generate        # Generate Prisma client
```

## 🔐 Authentication

The application uses JWT-based authentication with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- Protected routes require `Authorization: Bearer <token>` header

## 🏠 API Endpoints

### Properties
- `GET /api/properties` - List properties with filtering
- `POST /api/properties` - Create new property (requires auth)
- `GET /api/properties/[id]` - Get single property
- `PUT /api/properties/[id]` - Update property (requires auth)
- `DELETE /api/properties/[id]` - Delete property (requires auth)

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/[id]` - Get user by ID

## 🎨 UI Components

The application uses a modern design system with:

- **Responsive Grid Layouts**: Mobile-first design
- **Interactive Elements**: Hover states, animations
- **Accessibility**: ARIA labels, keyboard navigation
- **Modern Typography**: Inter font family
- **Color Scheme**: Professional blue/gray palette

## 🔄 Future Enhancements

- [ ] Real-time messaging with WebSockets
- [ ] Image upload and management
- [ ] Push notifications
- [ ] Payment integration
- [ ] Advanced matching algorithm
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Video property tours
- [ ] Calendar integration for viewings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@trustrent.com or join our community discussions.

---

**TrustRent** - Making property rentals social, secure, and simple.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
