export function decodeHtmlEntities(str: string): string {
  const textArea = typeof document !== 'undefined' ? document.createElement('textarea') : null
  if (textArea) {
    textArea.innerHTML = str
    return textArea.value
  }
  // Fallback for server-side or minimal decoding
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}
