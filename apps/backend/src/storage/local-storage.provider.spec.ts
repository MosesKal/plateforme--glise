import { LocalStorageProvider } from './local-storage.provider';

describe('LocalStorageProvider', () => {
  it('rejects keys escaping MEDIA_ROOT', () => {
    const provider = new LocalStorageProvider();
    expect(() => provider.getLocalPath('../outside.mp3')).toThrow(
      'Clé de stockage hors MEDIA_ROOT',
    );
  });
});
