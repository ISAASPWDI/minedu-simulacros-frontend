export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  role: 'TEACHER' | 'ADMIN';
  active: boolean;
  createdAt: string;
  profile?: TeacherProfile;
}

export interface TeacherProfile {
  escalaMagisterial: string;
  specialtyInterest: string;
  region: string;
  ugel: string;
  institution: string;
  bio: string;
  avatarUrl: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
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
