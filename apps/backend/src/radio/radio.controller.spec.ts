import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { RadioController } from './radio.controller';

describe('RadioController security metadata', () => {
  it('expose uniquement la lecture publique sans authentification', () => {
    expect(
      Reflect.getMetadata(IS_PUBLIC_KEY, RadioController.prototype.findPublic),
    ).toBe(true);
    expect(
      Reflect.getMetadata(IS_PUBLIC_KEY, RadioController.prototype.findAdmin),
    ).toBeUndefined();
  });

  it('protège la lecture, la sauvegarde et le test administratifs par rôles', () => {
    const expectedRoles = [
      'Super Admin',
      'Administrateur Général',
      'Responsable Communication',
    ];

    expect(
      Reflect.getMetadata(ROLES_KEY, RadioController.prototype.findAdmin),
    ).toEqual(expectedRoles);
    expect(
      Reflect.getMetadata(ROLES_KEY, RadioController.prototype.upsert),
    ).toEqual(expectedRoles);
    expect(
      Reflect.getMetadata(ROLES_KEY, RadioController.prototype.testStream),
    ).toEqual(expectedRoles);
  });
});
