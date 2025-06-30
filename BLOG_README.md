# Blog System Documentation

This is a modern, simple blog system built with pure HTML, CSS, and JavaScript that supports markdown posts with math equations, images, and tables.

## Features

- **Markdown Support**: Write posts in markdown format
- **Math Equations**: Supports LaTeX math rendering via MathJax
- **Table of Contents**: Automatic TOC generation with smooth scrolling
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Code Highlighting**: Syntax highlighting for code blocks
- **Image Support**: Easy image embedding
- **Tag System**: Organize posts with tags
- **Clean Design**: Matches your personal website's aesthetic

## How to Add New Blog Posts

### 1. Create a Markdown File

Create a new file in the `/posts` directory with the naming convention:
```YYYY-MM-DD-your-title.md
```

Example: `2025-02-01-how-to-write-blog-posts.md`

### 2. Add Frontmatter

At the top of your markdown file, add frontmatter:

```markdown
---
title: "Your Post Title"
date: "2025-02-01"
author: "Your Name"
tags: ["tag1", "tag2", "tag3"]
excerpt: "A short summary of your post."
featured: false
---
```

### 3. Write Your Content

Use standard markdown syntax:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- Bullet list
- Another item

1. Numbered list
2. Another item

[Link text](https://example.com)

![Image alt text](assets/your-image.png)

> This is a blockquote

```python
def hello():
    print("Hello, world!")
```

Inline math: $E=mc^2$

Block math:
$$
\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}
$$

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

### 4. Add Images

Place images in the `/assets` directory and reference them in your markdown:
```markdown
![Description](assets/your-image.png)
```

### 5. Register the Post

Open `blog.js` and add your post to the `blogPosts` array:

```javascript
const blogPosts = [
  {
    file: 'posts/2025-02-01-how-to-write-blog-posts.md',
    slug: '2025-02-01-how-to-write-blog-posts'
  },
  {
    file: 'posts/your-new-post.md',
    slug: 'your-new-post-slug'
  }
];
```

The `slug` should match your filename (without `.md`).

## File Structure

```
├── blog.html          # Main blog page
├── blog.css           # Blog-specific styles
├── blog.js            # Blog functionality
├── posts/             # Blog post markdown files
│   └── 2025-02-01-how-to-write-blog-posts.md
├── assets/            # Images and media files
│   └── placeholder.txt
└── BLOG_README.md     # This file
```

## Features in Detail

### Table of Contents

The TOC automatically generates from your post headings and appears on the right side on desktop. On mobile, it becomes a horizontal scrollable list at the top.

### Math Equations

- Inline math: `$equation$`
- Block math: `$$equation$$`
- Supports full LaTeX syntax

### Code Highlighting

Specify the language for syntax highlighting:
```markdown
```python
def example():
    return "highlighted code"
```
```

### Responsive Design

- **Desktop (>1024px)**: TOC sidebar on the right
- **Tablet (768px-1024px)**: TOC as horizontal list at top
- **Mobile (<768px)**: TOC hidden, optimized for reading

## Customization

### Styling

Edit `blog.css` to customize:
- Colors and fonts
- Layout and spacing
- TOC appearance
- Responsive breakpoints

### Functionality

Edit `blog.js` to modify:
- Post loading logic
- TOC generation
- Navigation behavior
- Math rendering options

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- MathJax for equation rendering
- Highlight.js for code syntax highlighting

## Tips

1. **Keep filenames simple**: Use hyphens, no spaces
2. **Use descriptive slugs**: They appear in URLs
3. **Optimize images**: Compress before adding to assets
4. **Test on mobile**: Ensure responsive design works
5. **Use tags wisely**: Help readers find related content

## Troubleshooting

- **Math not rendering**: Check MathJax CDN connection
- **Images not showing**: Verify path in assets folder
- **TOC not appearing**: Ensure headings are properly formatted
- **Code not highlighted**: Check language specification in code blocks 