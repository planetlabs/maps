import shiki from 'shiki';

const highlighterPromise = shiki.getHighlighter({
  theme: 'github-light',
});

export async function highlight(code) {
  const highlighter = await highlighterPromise;
  return highlighter.codeToHtml(code, {lang: 'js'});
}
