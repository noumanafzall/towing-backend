import { Role } from '@prisma/client';

export class User {
  id: number;
  email: string;
  password: string;
  role: Role;
  fullName: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}