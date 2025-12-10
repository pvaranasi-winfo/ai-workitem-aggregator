import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'TECHNICAL_DELIVERY_MANAGER' | 'SCRUM_MASTER' | 'EMPLOYEE';

export interface UserWithRole {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  role: string;
  jobTitle: string | null;
  department: string | null;
}

export async function getUserByEmail(email: string): Promise<UserWithRole | null> {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      displayName: true,
      role: true,
      jobTitle: true,
      department: true,
    },
  });
}

export function hasRole(user: UserWithRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(user.role as UserRole);
}

export function isAdmin(user: UserWithRole): boolean {
  return user.role === 'ADMIN';
}

export function isProjectManager(user: UserWithRole): boolean {
  return user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN';
}

export function isTechnicalDeliveryManager(user: UserWithRole): boolean {
  return user.role === 'TECHNICAL_DELIVERY_MANAGER' || user.role === 'ADMIN';
}

export function isScrumMaster(user: UserWithRole): boolean {
  return user.role === 'SCRUM_MASTER' || user.role === 'ADMIN';
}

export function canCreateProject(user: UserWithRole): boolean {
  return isProjectManager(user);
}

export function canCreateWorkItem(user: UserWithRole): boolean {
  return isTechnicalDeliveryManager(user) || isScrumMaster(user);
}

export function canCreateSprint(user: UserWithRole): boolean {
  return isScrumMaster(user);
}

export function canManageUserRoles(user: UserWithRole): boolean {
  return isProjectManager(user);
}

export function canApplyLeave(user: UserWithRole): boolean {
  return true; // All users can apply for leave
}

export function canSubmitTimesheet(user: UserWithRole): boolean {
  return true; // All users can submit timesheets
}
