const ENTITY_MAP: Record<string, string> = {
  'egrave': 'è',
  'Egrave': 'È',
  'eacute': 'é',
  'Eacute': 'É',
  'ecirc': 'ê',
  'Ecirc': 'Ê',
  'agrave': 'à',
  'Agrave': 'À',
  'acirc': 'â',
  'Acirc': 'Â',
  'icirc': 'î',
  'Icirc': 'Î',
  'ocirc': 'ô',
  'Ocirc': 'Ô',
  'ucirc': 'û',
  'Ucirc': 'Û',
  'ccedil': 'ç',
  'Ccedil': 'Ç',
  'iuml': 'ï',
  'Iuml': 'Ï',
  'laquo': '«',
  'raquo': '»',
  'rsquo': "'",
  'lsquo': "'",
  'mdash': '—',
  'ndash': '–',
  'nbsp': '\u00A0',
  'amp': '&',
};

const ENTITY_RE = /&([a-zA-Z]+);/g;

export function decodeEntities(s: string): string {
  return s.replace(ENTITY_RE, (match, name) => ENTITY_MAP[name] ?? match);
}
