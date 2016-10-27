import * as postcss from 'postcss';

function deduplicateProperties(nodes = []) {
  const foundProps = [];

  // Reverse the nodes array so that later-defined properties override and replace earlier ones,
  // preserving the cascade:
  return nodes
    .reverse()
    .filter((node) => {
      // Preserve comments and anything else that isn't a property declaration
      if (node.type !== 'decl') return true;
      if (foundProps.includes(node.prop)) return false;
      foundProps.push(node.prop);
      return true;
    })
    .reverse();
}

postcss.plugin('postcss-merge-dupes', () => {
  return (root) => {
    const cache = {};

    root.walkRules((rule) => {
      // Only worry about regular rules right now. We'll circle back to at-rules and their child nodes later on.
      if (rule.type !== 'rule' || rule.parent.type !== 'root') {
        return;
      }

      // If the selector doesn't exist in the cache object, simply add it and continue iterating.
      if (!cache.hasOwnProperty(rule.selector)) {
        return cache[rule.selector] = rule;
      }

      const existingRule = cache[rule.selector];

      // Create a new nodes array by concatenating the existing nodes with the new ones from the current
      // rule, then deduplicate its property declarations:
      existingRule.nodes = deduplicateProperties([ ...existingRule.nodes, ...rule.nodes ]);

      // Delete the current rule from the stylesheet.
      rule.remove();
    });
  };
});
