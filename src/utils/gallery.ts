import { getCollection } from 'astro:content';

export interface GalleryImage {
  imageUrl: string;
  alt: string;
  width?: number;
  height?: number;
}

function parseImageItem(item: unknown, defaultAlt: string): GalleryImage | null {
  if (typeof item === 'string') {
    const url = item.trim();
    if (!url) return null;
    return { imageUrl: url, alt: defaultAlt };
  }
  if (item && typeof item === 'object' && 'url' in item) {
    const obj = item as Record<string, unknown>;
    return {
      imageUrl: String(obj.url),
      alt: typeof obj.alt === 'string' ? obj.alt : defaultAlt,
      width: typeof obj.width === 'number' ? obj.width : undefined,
      height: typeof obj.height === 'number' ? obj.height : undefined,
    };
  }
  return null;
}

export function parseGalleryImages(
  images: string | unknown[] | undefined,
  defaultAlt: string,
): GalleryImage[] {
  const norm = images ?? [];
  const items: GalleryImage[] = [];
  for (const item of typeof norm === 'string' ? norm.split('\n') : norm) {
    const parsed = parseImageItem(item, defaultAlt);
    if (parsed) items.push(parsed);
  }
  return items;
}

function extractIdFromRef(ref: string): string {
  try {
    const u = new URL(ref);
    const segments = u.pathname.replace(/\/$/, '').split('/');
    return segments[segments.length - 1];
  } catch {
    return ref;
  }
}

export async function resolveGalleryRef(ref: string): Promise<GalleryImage[] | null> {
  const id = extractIdFromRef(ref);
  const all = await getCollection('galleries', ({ data }) => !data.draft);
  const gallery = all.find((g) => g.id === id);
  if (!gallery) return null;
  return parseGalleryImages(gallery.data.images, gallery.data.title);
}
