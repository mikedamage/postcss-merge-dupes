import * as postcss from 'postcss';

postcss.plugin('postcss-merge-dupes', () => {
  return (root) => {
    root.walkRules;
  };
});
