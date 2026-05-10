const IMAGEKIT_ENDPOINT = import.meta.env.PUBLIC_IMAGEKIT_URL_ENDPOINT;

interface Transformation {
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  quality?: number;
  crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
}

export function getImageUrl(path: string, transformation: Transformation = {}): string {
  if (!path) return '';
  // Si c'est déjà une URL ImageKit complète, ajouter les transformations en query
  const baseUrl = path.startsWith('https://ik.imagekit.io')
    ? path
    : `${IMAGEKIT_ENDPOINT}/${path}`;

  const params: string[] = [];
  if (transformation.width)   params.push(`w-${transformation.width}`);
  if (transformation.height)  params.push(`h-${transformation.height}`);
  if (transformation.format)  params.push(`f-${transformation.format}`);
  if (transformation.quality) params.push(`q-${transformation.quality}`);
  if (transformation.crop)    params.push(`c-${transformation.crop}`);

  return params.length > 0 ? `${baseUrl}?tr=${params.join(',')}` : baseUrl;
}

// Presets — utilisés dans les composants .astro
export const imagePresets = {
  // Miniature galerie : 800px de large, WebP, qualité 85
  gallery: (path: string) =>
    getImageUrl(path, { width: 800, format: 'webp', quality: 85 }),

  // Photo de couverture hero : 1200px de large
  cover: (path: string) =>
    getImageUrl(path, { width: 1200, format: 'webp', quality: 85 }),

  // Vignette card : 400×300, recadré
  thumbnail: (path: string) =>
    getImageUrl(path, { width: 400, height: 300, format: 'webp', quality: 80, crop: 'maintain_ratio' }),
};