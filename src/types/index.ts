// Base types for the TrustRent platform

export enum UserRole {
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
  BOTH = 'BOTH'
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  STUDIO = 'STUDIO',
  ROOM = 'ROOM',
  SHARED_HOUSE = 'SHARED_HOUSE',
  VILLA = 'VILLA',
  LOFT = 'LOFT',
  OTHER = 'OTHER'
}

export enum RentalPeriod {
  SHORT_TERM = 'SHORT_TERM',
  MEDIUM_TERM = 'MEDIUM_TERM',
  LONG_TERM = 'LONG_TERM'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum ReviewType {
  LANDLORD_TO_TENANT = 'LANDLORD_TO_TENANT',
  TENANT_TO_LANDLORD = 'TENANT_TO_LANDLORD'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  bio?: string;
  verified: boolean;
  city?: string;
  region?: string;
  country?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

// User preferences for matching
export interface UserPreferences {
  id: string;
  userId: string;
  minBudget?: number;
  maxBudget?: number;
  preferredCities: string[];
  maxDistanceKm?: number;
  preferredPropertyTypes: PropertyType[];
  minRooms?: number;
  maxRooms?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  preferredRentalPeriod?: RentalPeriod;
  minRentalMonths?: number;
  maxRentalMonths?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Property interface
export interface Property {
  id: string;
  ownerId: string;
  owner?: User;
  title: string;
  description: string;
  type: PropertyType;
  address: string;
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  rooms: number;
  bathrooms: number;
  area?: number;
  floor?: number;
  hasElevator: boolean;
  hasParking: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  furnished: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  monthlyRent: number;
  deposit?: number;
  utilities?: number;
  available: boolean;
  availableFrom?: Date;
  rentalPeriod: RentalPeriod;
  minRentalMonths?: number;
  maxRentalMonths?: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Application interface
export interface Application {
  id: string;
  propertyId: string;
  property?: Property;
  applicantId: string;
  applicant?: User;
  status: ApplicationStatus;
  message?: string;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review interface
export interface Review {
  id: string;
  giverId: string;
  giver?: User;
  receiverId: string;
  receiver?: User;
  rating: number;
  comment?: string;
  type: ReviewType;
  createdAt: Date;
  updatedAt: Date;
}

// Message interface
export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  content: string;
  status: MessageStatus;
  propertyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Search and filter types
export interface PropertyFilters {
  city?: string;
  region?: string;
  propertyType?: PropertyType;
  minRent?: number;
  maxRent?: number;
  minRooms?: number;
  maxRooms?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  hasParking?: boolean;
  hasBalcony?: boolean;
  hasGarden?: boolean;
  availableFrom?: Date;
  rentalPeriod?: RentalPeriod;
}

export interface UserFilters {
  role?: UserRole;
  city?: string;
  region?: string;
  verified?: boolean;
  minRating?: number;
}

// Form types for creating/updating
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  city?: string;
  region?: string;
  country?: string;
}

export interface CreatePropertyData {
  title: string;
  description: string;
  type: PropertyType;
  address: string;
  city: string;
  region: string;
  country: string;
  rooms: number;
  bathrooms: number;
  area?: number;
  floor?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasBalcony?: boolean;
  hasGarden?: boolean;
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  monthlyRent: number;
  deposit?: number;
  utilities?: number;
  availableFrom?: Date;
  rentalPeriod: RentalPeriod;
  minRentalMonths?: number;
  maxRentalMonths?: number;
  images?: string[];
}

export interface CreateApplicationData {
  propertyId: string;
  message?: string;
}

export interface CreateReviewData {
  receiverId: string;
  rating: number;
  comment?: string;
  type: ReviewType;
}

export interface CreateMessageData {
  receiverId: string;
  content: string;
  propertyId?: string;
}
