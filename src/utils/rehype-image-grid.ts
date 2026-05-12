import type { Root, Element, RootContent } from 'hast';

function is(node: RootContent, tag: string): node is Element {
  return node.type === 'element' && node.tagName === tag;
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

    function flush() {
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

    for (const node of tree.children) {
      if (isImageOnlyParagraph(node)) {
        buffer.push(node);
      } else {
        flush();
        out.push(node);
      }
    }
    flush();
    tree.children = out;
  };
}
