import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Comparaison insensible aux accents et à la casse : les rôles ont été seedés
 * sans accents (« Administrateur General ») alors que les décorateurs @Roles
 * les écrivent avec (« Administrateur Général ») — une comparaison stricte
 * refuserait ces rôles partout.
 */
function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const roleName: string | undefined = user?.role?.name;
    if (!roleName) return false;

    const normalized = normalize(roleName);
    return requiredRoles.some((required) => normalize(required) === normalized);
  }
}
