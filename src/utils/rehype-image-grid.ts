import type { Root, Element, RootContent } from 'hast';

function is(node: RootContent, tag: string): node is Element {
  return node.type === 'element' && node.tagName === tag;
}

function isWhitespaceOnly(node: RootContent): boolean {
  return node.type === 'text' && (node.value === undefined || node.value.trim() === '');
}

function isImageOrLinkWrappingImage(node: RootContent): boolean {
  if (is(node, 'img')) return true;
  if (is(node, 'a') && node.children.length === 1 && is(node.children[0], 'img')) return true;
  return false;
}

function isImageOnlyParagraph(node: RootContent): node is Element {
  if (!is(node, 'p') || node.children.length !== 1) return false;
  return isImageOrLinkWrappingImage(node.children[0]);
}

function isMultiImageParagraph(node: RootContent): boolean {
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

export default function rehypeImageGrid() {
  return (tree: Root) => {
    // Pre-process: split <p> containing multiple images (separated only by
    // whitespace) into individual single-image <p> elements.
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

    function emitBuffer() {
      if (buffer.length >= 2) {
        out.push({
          type: 'element',
          tagName: 'div',
          properties: { className: ['prose-image-grid'] },
          children: buffer.map(p => p.children[0]),
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
