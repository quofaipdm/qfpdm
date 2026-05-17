import type { Root, Element, RootContent } from 'hast';

function is(node: RootContent, tag: string): node is Element {
  return node.type === 'element' && node.tagName === tag;
}

function isWhitespaceOnly(node: RootContent): boolean {
  return node.type === 'text' && (node.value === undefined || node.value.trim() === '');
}

function isImageOrLinkWrappingImage(node: RootContent): boolean {
  if (is(node, 'img')) return true;
  if (is(node, 'a') && (node as Element).children.length === 1 && is((node as Element).children[0], 'img')) return true;
  return false;
}

function isImageOnlyParagraph(node: RootContent): node is Element {
  if (!is(node, 'p') || node.children.length !== 1) return false;
  return isImageOrLinkWrappingImage(node.children[0]);
}

function isMultiImageParagraph(node: RootContent): node is Element {
  if (!is(node, 'p')) return false;
  let count = 0;
  for (const child of node.children) {
    if (isImageOrLinkWrappingImage(child)) {
      count++;
    } else if (!isWhitespaceOnly(child)) {
      return false;
    }
  }
  return count >= 2;
}

function isMediaQuofai(src: string): boolean {
  return src.includes('media.quofai.org');
}

function hasClass(props: Record<string, unknown> | undefined, cls: string): boolean {
  const className = props?.className;
  if (Array.isArray(className)) return className.includes(cls);
  if (typeof className === 'string') {
    return className === cls ||
      className.startsWith(cls + ' ') ||
      className.includes(' ' + cls + ' ') ||
      className.endsWith(' ' + cls);
  }
  return false;
}

function normalizeGridChild(el: Element): Element {
  // Case: <a> wrapping <img>
  if (el.tagName === 'a' && el.children.length === 1 && is(el.children[0], 'img')) {
    const href = String(el.properties?.href ?? '');

    if (hasClass(el.properties, 'gallery-card') && isMediaQuofai(href)) {
      // Autolink from rehype-image-toolkit — unwrap, keep img bare
      return el.children[0] as Element;
    }

    // User-created link — preserve as-is
    return el;
  }

  // Case: bare <img> — keep as-is (no wrapper, no data attrs)
  // The client-side wrapImagesWithLinks reads img.getAttribute('url')
  // which is set by Astro's image service with the original URL.

  return el;
}

export default function rehypeImageGrid() {
  return (tree: Root) => {
    for (let i = tree.children.length - 1; i >= 0; i--) {
      const node = tree.children[i];
      if (isMultiImageParagraph(node)) {
        const replacements: Element[] = [];
        for (const child of node.children) {
          if (isImageOrLinkWrappingImage(child)) {
            replacements.push({
              type: 'element',
              tagName: 'p',
              properties: {},
              children: [child],
            });
          }
        }
        tree.children.splice(i, 1, ...replacements);
      }
    }

    const out: RootContent[] = [];
    let buffer: Element[] = [];
    let pendingTail: RootContent[] = [];
    let gridIdCounter = 0;

    function emitBuffer() {
      if (buffer.length >= 2) {
        const children = buffer.map((p) => {
          const child = p.children[0] as Element;
          return normalizeGridChild(child);
        });

        gridIdCounter++;
        out.push({
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['prose-image-grid', 'pswp-gallery'],
            id: `pswp-prose-grid-${gridIdCounter}`,
          },
          children,
        });
      } else {
        out.push(...buffer);
      }
      buffer = [];
    }

    function emitPending() {
      out.push(...pendingTail);
      pendingTail = [];
    }

    function flushAll() {
      emitBuffer();
      emitPending();
    }

    for (const node of tree.children) {
      if (isImageOnlyParagraph(node)) {
        if (buffer.length === 0 && pendingTail.length > 0) {
          emitPending();
        }
        buffer.push(node);
        pendingTail = [];
      } else if (isWhitespaceOnly(node) && buffer.length > 0) {
        pendingTail.push(node);
      } else {
        flushAll();
        out.push(node);
      }
    }
    flushAll();
    tree.children = out;
  };
}
