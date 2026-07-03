import { Global, Module } from '@nestjs/common';
import { LocalStorageProvider } from './local-storage.provider';
import { STORAGE_PROVIDER } from './storage-provider.interface';

/**
 * Module global d'accès au stockage médias.
 *
 * Le token STORAGE_PROVIDER découple les services métier de l'implémentation :
 * basculer vers R2/S3 se fera en remplaçant useClass ici (S3StorageProvider),
 * sans modifier aucun consommateur.
 */
@Global()
@Module({
  providers: [{ provide: STORAGE_PROVIDER, useClass: LocalStorageProvider }],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
