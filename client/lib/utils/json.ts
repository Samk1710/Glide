export function extractJSONArray(text: string): string {
  // Find the first '[' and the last ']' to coerce model output into pure JSON
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) throw new Error('No JSON array found in model output');
  return text.slice(start, end + 1);
}
