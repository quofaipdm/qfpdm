import type { Root, Element, RootContent } from 'hast';

function is(node: RootContent, tag: string): node is Element {
  return node.type === 'element' && node.tagName === tag;
}

function isWhitespaceOnly(node: RootContent): boolean {
  return node.type === 'text' && (node.value === undefined || node.value.trim() === '');
}

function isImageOnlyParagraph(node: RootContent): node is Element {
  if (!is(node, 'p') || node.children.length !== 1) return false;
  const child = node.children[0];
  if (is(child, 'img')) return true;
  if (is(child, 'a') && child.children.length === 1 && is(child.children[0], 'img')) return true;
  return false;
}

export default function rehypeImageGrid() {
  return (tree: Root) => {
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
          // we have pending whitespace from before the first image in this potential group
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
