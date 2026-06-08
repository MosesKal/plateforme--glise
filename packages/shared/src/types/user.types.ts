export type UserStatus = 'active' | 'inactive' | 'suspended';

export type RoleName =
  | 'SUPER_ADMIN'
  | 'ADMIN_GENERAL'
  | 'RESPONSABLE_COMMUNICATION'
  | 'RESPONSABLE_EXTENSION'
  | 'RESPONSABLE_DEPARTEMENT'
  | 'MODERATEUR';

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: RoleName;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  role?: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends Omit<User, 'role'> {
  role: Role;
}
