import type { Root, Element } from 'hast';

const BREAKPOINTS = [640, 828, 960, 1200, 1600];
const DOMAIN = 'media.quofai.org';
const R2_RE = /^https:\/\/media\.quofai\.org\//;

function toSrcset(url: string): string {
  const path = url.replace(R2_RE, '');
  return BREAKPOINTS
    .map(w => `https://${DOMAIN}/cdn-cgi/image/width=${w},format=auto/${path} ${w}w`)
    .join(', ');
}

export default function rehypeImageSrcset() {
  return (tree: Root) => {
    function visit(node: Element | Root) {
      if (node.type === 'element' && node.tagName === 'img') {
        const src = String(node.properties?.src || '');
        if (src && R2_RE.test(src) && !node.properties?.srcset) {
          node.properties.srcset = toSrcset(src);
          node.properties.sizes = '(max-width: 640px) 100vw, 800px';
        }
      }
      if ('children' in node) {
        for (const child of node.children)
          if (child.type === 'element') visit(child);
      }
    }
    visit(tree);
  };
}
