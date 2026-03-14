

## Fix: Image loading spinner not visible

### Root Cause
The `ImageWithSpinner` component positions the spinner with `absolute inset-0`, which requires the parent to have dimensions. The `<iframe>` always has `h-[60vh]` so it gives the container height immediately. But the `<img>` has no dimensions until it loads, so the container collapses to zero height and the spinner is invisible.

### Fix
**`src/pages/CASettings.tsx`** (line 37-49, `ImageWithSpinner`):
- Add `min-h-[200px] w-full` to a wrapper div so the spinner has space before the image loads.
- Once the image loads, it naturally takes over.

```tsx
const ImageWithSpinner = ({ src, alt }: { src: string; alt: string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <div className="relative min-h-[200px] w-full flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[60vh] object-contain rounded-lg"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};
```

One component change, no other files affected.

