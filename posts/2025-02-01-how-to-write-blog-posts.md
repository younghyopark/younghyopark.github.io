---
title: "How to Write and Add Blog Posts to the Improbable AI Blog"
date: "2025-02-01"
author: "Improbable AI Lab"
tags: ["guide", "how-to", "blogging", "meta"]
excerpt: "A step-by-step guide for adding new blog posts, with examples of images, equations, and formatting."
featured: false
publish: true
---

Welcome! This guide will show you how to create and publish new blog posts on our site. You'll learn how to use markdown, add images, write equations, and more.


## 1. Create a Markdown File

Go to the `/posts` directory and create a new file named like this:

```
YYYY-MM-DD-your-title.md
```

Example:

```
2025-02-01-how-to-write-blog-posts.md
```


## 2. Add Frontmatter

At the top of your file, add a frontmatter block:

```markdown
---
title: "Your Post Title"
date: "2025-02-01"
author: "Your Name"
tags: ["tag1", "tag2"]
excerpt: "A short summary of your post."
featured: false
---
```


## 3. Write Your Content

You can use all standard markdown features:

### Headings

```
# Heading 1
## Heading 2
### Heading 3
```

### Lists

- Bullet list item 1
- Bullet list item 2
    - Nested item

1. Numbered item 1
2. Numbered item 2

### **Bold** and *Italic*

```
**Bold text** and *italic text*
```

### Links

```
[Improbable AI Lab](https://improbable-ai.mit.edu/)
```

### Images

Place your image in the `assets/` folder, then reference it like this:

```
![Lab Logo](assets/lab_logo.png)
```

Example:

![Lab Logo](../assets/lab_logo.png)

### Blockquotes

```
> This is a blockquote.
```

> This is a blockquote.

### Code Blocks

````
```python
def hello():
    print("Hello, world!")
```
````

```python
def hello():
    print("Hello, world!")
```

### Math Equations

Inline math: `$E=mc^2$`

Block math:

```
$$
\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}
$$
```

Rendered:

$$
\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}
$$


## 4. Add Your Post to the Blog

Open `blog.html` and add your post to the `blogPosts` array:

```js
{
    file: 'posts/2025-02-01-how-to-write-blog-posts.md',
    slug: '2025-02-01-how-to-write-blog-posts'
}
```

The `slug` should match your filename (without `.md`).


## 5. Save and Create a Pull Request (PR)

**Do not push directly to the main branch.**

1. Commit your changes to a new branch.
2. Push your branch to the GitHub repository.
3. Open a Pull Request (PR) on GitHub for review.
4. Once approved, your post will be merged and published!

---

Happy blogging! 🎉 