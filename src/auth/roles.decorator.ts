import { SetMetadata } from '@nestjs/common';

export type RoleType = 'DRIVER' | 'CUSTOMER' | 'ADMIN' | 'MODERATOR';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles); 