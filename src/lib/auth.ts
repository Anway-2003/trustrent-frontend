import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * 🟢 PRISMA REMOVED: आता आपण Prisma वापरत नाही आहोत, 
 * म्हणून आपण स्वतःचा User interface बनवला आहे.
 */
export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

// .env मधून व्हॅल्यूज घेतोय
const JWT_SECRET = process.env.JWT_SECRET || 'Anway1234'; 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trustrent-backend.onrender.com';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// टोकन जनरेट करताना बॅकएंडच्या फॉरमॅटशी मॅच होईल असं बघू
export const generateToken = (user: Pick<User, 'id' | 'email' | 'role'>): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): { id: string; email: string; role: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
};

// रिक्वेस्ट मधून Bearer टोकन काढण्यासाठी
export const getTokenFromRequest = (request: Request): string | null => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// सध्याचा युझर मिळवण्यासाठी
export const getCurrentUser = async (request: Request) => {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded;
};