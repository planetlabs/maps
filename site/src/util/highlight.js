import {getHighlighter} from 'shikiji';

const highlighterPromise = getHighlighter({
  themes: ['github-light'],
  langs: ['javascript'],
});

/**
 * @param {string} code The code to highlight.
 */
export async function highlight(code) {
  const highlighter = await highlighterPromise;
  return highlighter.codeToHtml(code, {
    lang: 'javascript',
    theme: 'github-light',
  });
}
