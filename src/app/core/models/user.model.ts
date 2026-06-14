export interface User {
  id: string;
  email: string;
  role: 'TEACHER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  profile?: TeacherProfile;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  escalaMagisterial: string;
  specialtyInterest: string;
  region: string | null;
  ugel: string | null;
  institution: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthTokenData;
  status: number;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  escalaMagisterial: string;
  specialtyInterest: string;
}
