export enum Role {
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

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