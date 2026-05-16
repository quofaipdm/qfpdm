import type { Root, Element } from 'hast';

export default function rehypeHeadingLevel() {
  return (tree: Root) => {
    function visit(node: Element | Root) {
      if (node.type === 'element' && node.tagName === 'h1') {
        node.tagName = 'h2';
      }
      if ('children' in node) {
        for (const child of node.children) {
          if (child.type === 'element') {
            visit(child);
          }
        }
      }
    }
    visit(tree);
  };
}
