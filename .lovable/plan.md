

## Plan: Auto-scroll Mobile Design Carousel

Add Embla Carousel's Autoplay plugin to the mobile carousel so cards scroll automatically with a delay, pausing on user interaction.

### Changes

**`src/components/landing/DesignGrid.tsx`**
- Import `Autoplay` from `embla-carousel-autoplay`
- Pass the autoplay plugin to `useEmblaCarousel` with a ~3 second delay and `stopOnInteraction: false` (so it resumes after user swipes)

```ts
// Before
const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

// After
const [emblaRef, emblaApi] = useEmblaCarousel(
  { loop: true, align: 'center' },
  [Autoplay({ delay: 3000, stopOnInteraction: false })]
);
```

**Package**: `embla-carousel-autoplay` — needs to be added (peer dependency of already-installed `embla-carousel-react`).

One file changed, ~3 lines of code.

