# How to Create a New Blog Post

## Quick Start

```bash
cp -r posts/_template posts/my-new-post
```

Then do three things:

### 1. Edit your post

Open `posts/my-new-post/index.html` and change:
- `<title>` tag
- `og:title`, `og:description`, `og:url` meta tags
- The `.post-title` and `.post-meta` in the body
- Write your content below the `post-header` div

### 2. Edit metadata

Open `posts/my-new-post/meta.json` and fill in:
```json
{
  "title": "My New Post",
  "date": "2026-04-09",
  "author": "Younghyo Park",
  "tags": ["robotics", "review"],
  "excerpt": "One-liner for the blog listing.",
  "publish": false
}
```

Set `"publish": true` when ready to go live.

### 3. Register in manifest

Add your slug to `posts/manifest.json`:
```json
[
  "my-new-post",
  "profitable-vla",
  ...
]
```

That's it.

## What You Get for Free

By including these two lines in `<head>`:
```html
<link rel="stylesheet" href="/shared/post-base.css">
<script src="/shared/post-nav.js"></script>
```

You automatically get:
- **Sticky nav bar** with "All Posts" / "Younghyo's Blog" / "About Me"
- **Scroll-aware title** that slides into the nav bar when you scroll past it
- **Floating TOC** on the right (built from your h1/h2 headings)
- **Floating Q&A button** with per-post Giscus comments
- **Base typography** matching the tune-to-learn style (Inter font, clean headings, etc.)

## Going Custom

Since each post is its own HTML page, you can:
- Add `<style>` blocks or link your own CSS
- Use a completely different layout (drop `post-base.css` if you want)
- Add custom JS, interactive demos, iframes, whatever
- Put assets (images, videos, data) right next to `index.html`

The only thing that ties a post to the blog listing is `meta.json` + `manifest.json`.

## Assets

Put images and other files directly in your post folder:
```
posts/my-new-post/
  index.html
  meta.json
  diagram.png
  data.csv
```

Reference them with relative paths: `<img src="diagram.png">`.

## WIP Posts

Set `"publish": false` in `meta.json`. The post won't appear in the listing unless you press `Shift+W` on the blog page.
