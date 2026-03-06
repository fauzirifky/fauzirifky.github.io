# Rifky Fauzi — Academic CV Website (Vite + React + TS)

## Run
```bash
npm install
npm run dev
```

## Add images
- Profile photo: `public/photo.png`
- Product screenshots: put images in `public/products/` and reference them in `src/data/cv.ts` via `featuredImage`

## Single source of truth
All CV content lives in:
- `src/data/cv.ts`

Website pages **and** the "Download CV" PDF are generated from the same data.
