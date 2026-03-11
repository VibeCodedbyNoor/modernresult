

## Plan: Add YouTube Tutorial Video (mOJtmiu0ZiU) Across All Relevant Places

The YouTube ID extracted from `https://youtu.be/mOJtmiu0ZiU` is **`mOJtmiu0ZiU`**.

### Files to Update

#### 1. `src/lib/helpVideos.ts`
- Set the **overview** video's `youtubeId` to `'mOJtmiu0ZiU'` (currently empty — this is the "Complete Overview" video)
- Set **create-exam** `youtubeId` to `'mOJtmiu0ZiU'` (covered in this tutorial)
- Set **upload-results** `youtubeId` to `'mOJtmiu0ZiU'` (covered in this tutorial, replacing old ID)
- Set **change-design** `youtubeId` to `'mOJtmiu0ZiU'` (covered in this tutorial)
- Keep **buy-credits** empty (you'll make a separate video for that)
- Update English & Urdu descriptions for `overview` to add note: "Recorded on PC — the method is the same on mobile"
- Update overview description to mention it covers everything except buying credits

#### 2. `src/components/landing/VideoGuideSection.tsx`
- Update the `youtubeId` from `'rh5KMo02dTU'` to `'mOJtmiu0ZiU'`
- Update title to match the new video
- Replace the "Coming Soon" placeholder with an actual YouTube embed (iframe)
- Add a small note below: "📱 This tutorial is recorded on PC — the method is the same on mobile"

#### 3. `src/components/dashboard/GettingStartedCard.tsx`
- The overview video (`id: 'overview'`) will now have a real YouTube ID, so the "Watch Video" button will automatically work — no code changes needed here.

#### 4. `src/components/dashboard/HelpDialog.tsx` & `src/components/dashboard/HelpTab.tsx` & `src/pages/Help.tsx`
- No code changes needed — they already render all `helpVideos` with non-empty `youtubeId`, so they'll automatically pick up the new videos.

### Summary of Changes
| File | Change |
|------|--------|
| `src/lib/helpVideos.ts` | Set youtubeId for overview, create-exam, upload-results, change-design; update descriptions |
| `src/components/landing/VideoGuideSection.tsx` | New video ID, embed iframe instead of placeholder, add mobile note |

All other components (HelpDialog, HelpTab, Help page, GettingStartedCard) will automatically reflect the changes since they read from `helpVideos.ts`.

