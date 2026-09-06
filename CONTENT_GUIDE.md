# Content maintenance guide

The Teaching section is content-driven. You normally do **not** need to edit React/TypeScript files to update a course.

## Add or edit a course

Course files live in:

```text
src/content/courses/
```

Copy `_TEMPLATE.md`, rename it, then edit the front matter and the four content sections:

1. `Deskripsi Mata Kuliah`
2. `SKS` is filled through the `credits:` field in front matter
3. `Daftar Project`
4. `Bahan Ajar`

The material table supports direct PDF and LaTeX/source links. Raw GitHub PDF URLs are recommended for one-click PDF access.

`featured: true` makes a course eligible for the six Teaching cards on the home page. `order:` controls its order.

Legacy URLs can stay unchanged because the route is based on `slug`, not the visible course title.

## Add a publication without editing code

Open the repository on GitHub:

**Actions → Add publication → Run workflow**

Fill in title, authors, venue, year, and URL. The workflow updates `src/data/publications.json`, commits the change to `main`, and starts the Pages deployment workflow.

The publication list used by the website is:

```text
src/data/publications.json
```
