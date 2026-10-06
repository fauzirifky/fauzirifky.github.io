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

## SINTA research dashboard

The internal dashboard is available at:

```text
/research-products/sinta-matematika-itera
```

By default it reads the public JSON database from
`fauzirifky/Sinta-Matematika-ITERA-Sync`. To use another compatible source,
set `VITE_SINTA_DATA_BASE_URL` to the directory containing `index.json` and
the per-lecturer JSON files before building.


## OBE Simulator

Public simulator:

```text
/research-products/obe-simulator
```

Default configuration: `src/data/obe/magister-fisika-itera.json`. A compatible JSON can be loaded from the simulator Settings page.
