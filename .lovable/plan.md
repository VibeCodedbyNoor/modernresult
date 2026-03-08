

# Smart Slug Suggestions for School Portal URL

## What
When a school owner types their school name (e.g., "Shaheen Public High School"), auto-generate up to 10 slug suggestions displayed as clickable chips below the URL slug input. Clicking a suggestion fills the slug field. The domain shown will be `resultportal.online/results/`.

## Slug Generation Logic
From "Shaheen Public High School", generate variations like:
1. `shaheen-public-high-school` (full name)
2. `shaheen` (first word)
3. `sphs` (initials)
4. `sps` (initials without common words like "high")
5. `shaheen-public` (first two words)
6. `shaheen-high` (first + key word)
7. `shaheen-school` (first + last)
8. `shaheen-public-hs` (abbreviated)
9. `sp-high-school` (initials prefix + rest)
10. `shaheen-ps` (first word + initials of rest)

Common filler words ("public", "high", "school", "academy", "the", "of") will be handled smartly to create short, meaningful slugs.

## UI Changes in `Dashboard.tsx` (lines 347-357)
- Add a slug suggestion generator function that runs when `schoolName` changes
- Below the slug input field, render suggestion chips as small clickable badges
- Each chip shows `resultportal.online/results/{slug}`  (or just the slug portion to save space)
- Clicking a chip sets `schoolSlug` to that value
- Chips styled with `Badge` component (outline variant), wrapped in a flex container

## Availability Check (optional enhancement)
- When a suggestion is clicked, optionally check if that slug is already taken in the `schools` table
- Show a small checkmark or warning icon accordingly

## No backend changes needed
This is purely a frontend UI enhancement using string manipulation.

