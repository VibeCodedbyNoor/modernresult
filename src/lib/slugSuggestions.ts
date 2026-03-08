const FILLER_WORDS = ['public', 'high', 'higher', 'secondary', 'the', 'of', 'and', 'for'];
const SCHOOL_WORDS = ['school', 'academy', 'college', 'institute', 'institution', 'university', 'centre', 'center'];

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function generateSlugSuggestions(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return [];

  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const suggestions = new Set<string>();

  // 1. Full name
  suggestions.add(slugify(trimmed));

  // 2. First word only
  if (words.length > 1) suggestions.add(words[0]);

  // 3. All initials
  if (words.length > 1) {
    suggestions.add(words.map(w => w[0]).join(''));
  }

  // 4. Initials without filler/school words
  const significantWords = words.filter(w => !FILLER_WORDS.includes(w) && !SCHOOL_WORDS.includes(w));
  if (significantWords.length > 1) {
    suggestions.add(significantWords.map(w => w[0]).join(''));
  }

  // 5. First two words
  if (words.length >= 2) {
    suggestions.add(slugify(words.slice(0, 2).join(' ')));
  }

  // 6. First + last word
  if (words.length >= 3) {
    suggestions.add(slugify(`${words[0]} ${words[words.length - 1]}`));
  }

  // 7. First word + key non-filler word
  const keyWords = words.slice(1).filter(w => !FILLER_WORDS.includes(w));
  if (keyWords.length > 0 && keyWords[0] !== words[0]) {
    suggestions.add(slugify(`${words[0]} ${keyWords[0]}`));
  }

  // 8. Significant words only
  if (significantWords.length >= 2 && significantWords.length < words.length) {
    suggestions.add(slugify(significantWords.join(' ')));
  }

  // 9. First word + initials of rest
  if (words.length >= 2) {
    const restInitials = words.slice(1).map(w => w[0]).join('');
    suggestions.add(`${words[0]}-${restInitials}`);
  }

  // 10. Abbreviated: first two initials + remaining words
  if (words.length >= 3) {
    const prefix = words.slice(0, 2).map(w => w[0]).join('');
    const rest = words.slice(2).join('-');
    suggestions.add(`${prefix}-${rest}`);
  }

  // Remove any single-char slugs and the empty string
  const result = Array.from(suggestions).filter(s => s.length > 1);
  return result.slice(0, 10);
}
