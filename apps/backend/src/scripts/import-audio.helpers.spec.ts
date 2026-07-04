import {
  mimeTypeForExtension,
  parseImportArgs,
  titleFromFilename,
} from './import-audio.helpers';

describe('parseImportArgs', () => {
  it('parse les arguments requis avec les défauts', () => {
    expect(
      parseImportArgs(['--dir', './lib', '--speaker', 'Paulin Mambwe']),
    ).toEqual({
      dir: './lib',
      speaker: 'Paulin Mambwe',
      status: 'PUBLISHED',
      dryRun: false,
    });
  });

  it('accepte --status DRAFT et --dry-run', () => {
    const options = parseImportArgs([
      '--dir',
      './lib',
      '--speaker',
      'X',
      '--status',
      'DRAFT',
      '--dry-run',
    ]);
    expect(options.status).toBe('DRAFT');
    expect(options.dryRun).toBe(true);
  });

  it.each([
    [[], /--dir et --speaker sont requis/],
    [['--dir', './lib'], /--dir et --speaker sont requis/],
    [
      ['--dir', './lib', '--speaker', 'X', '--status', 'LIVE'],
      /--status doit être/,
    ],
    [['--dir', './lib', '--speaker', 'X', '--force'], /Argument inconnu/],
  ])('rejette %j', (argv, message) => {
    expect(() => parseImportArgs(argv)).toThrow(message);
  });
});

describe('titleFromFilename', () => {
  it.each([
    ['07 - La_puissance de la priere.mp3', 'La puissance de la priere'],
    ['01. Marcher par la foi.m4a', 'Marcher par la foi'],
    ['12) Le pardon.MP3', 'Le pardon'],
    ['La grâce suffisante.mp3', 'La grâce suffisante'],
    ['enseignement___special.mp3', 'enseignement special'],
  ])('%s → %s', (filename, expected) => {
    expect(titleFromFilename(filename)).toBe(expected);
  });

  it('retombe sur le nom brut si le nettoyage vide le titre', () => {
    expect(titleFromFilename('01.mp3')).toBe('01');
  });
});

describe('mimeTypeForExtension', () => {
  it.each([
    ['.mp3', 'audio/mpeg'],
    ['m4a', 'audio/mp4'],
    ['.FLAC', 'audio/flac'],
    ['.xyz', 'audio/mpeg'],
  ])('%s → %s', (ext, expected) => {
    expect(mimeTypeForExtension(ext)).toBe(expected);
  });
});
