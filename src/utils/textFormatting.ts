export function toggleSelectionFormatting(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  format: 'bold' | 'italic' | 'underline'
): string {
  if (selectionStart === selectionEnd || selectionStart < 0 || selectionEnd > text.length) {
    return text;
  }

  const start = Math.min(selectionStart, selectionEnd);
  const end = Math.max(selectionStart, selectionEnd);

  const before = text.substring(0, start);
  const selectedText = text.substring(start, end);
  const after = text.substring(end);

  const tag = format === 'bold' ? 'b' : format === 'italic' ? 'i' : 'u';
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;

  // Check if selected text is already wrapped
  if (selectedText.startsWith(openTag) && selectedText.endsWith(closeTag)) {
    const unwrapped = selectedText.substring(openTag.length, selectedText.length - closeTag.length);
    return before + unwrapped + after;
  }

  return before + `${openTag}${selectedText}${closeTag}` + after;
}
