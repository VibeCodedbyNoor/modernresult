

## Plan: Single Video + Animated WhatsApp Button + Bold "Need any help?"

### 1. VideoGuideSection — Single video
Replace the 2-video array with one entry: "How to Use OnlineResultPortal". Center it with `max-w-xl mx-auto` instead of a 2-column grid.

**File**: `src/components/landing/VideoGuideSection.tsx`

### 2. WhatsApp Button — Animation + Bold text
- Add `animate-bounce` to the button for attention
- Make "Need any help?" text bold (`font-bold`) and always visible on the home screen

**File**: `src/components/WhatsAppHelpButton.tsx`

### 3. Bold "Need any help?" on home screen
The WhatsApp button text "Need any help?" will use `font-bold` class to make it stand out more prominently.

