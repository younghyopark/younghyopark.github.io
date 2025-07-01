# Blog Routing System

This blog now uses pathname-based URLs instead of hash-based URLs for better SEO and user experience.

## URL Structure

- **Blog listing**: `/blog` (instead of `/blog.html`)
- **Individual posts**: `/blog/post-slug` (instead of `/blog.html#post-slug`)

## How It Works

### Client-Side Routing
The JavaScript handles routing by:
1. Extracting the slug from the pathname (e.g., `/blog/my-post` → `my-post`)
2. Using `window.history.pushState()` to update the URL without page reload
3. Handling browser back/forward navigation with the `popstate` event

### Server-Side Configuration
Two configuration files handle server-side routing:

#### Apache (.htaccess)
```apache
# Redirect /blog to blog.html
RewriteRule ^blog/?$ blog.html [L]

# Handle individual blog post URLs
RewriteRule ^blog/([^/]+)/?$ blog.html [L]
```

#### Netlify (_redirects)
```
# Redirect /blog to blog.html
/blog    /blog.html   200

# Handle individual blog post URLs
/blog/*  /blog.html   200
```

## Benefits

1. **Better SEO**: Search engines can crawl individual post URLs
2. **Cleaner URLs**: No hash fragments in the URL
3. **Social sharing**: Direct links to posts work properly
4. **Browser history**: Back/forward buttons work correctly
5. **Bookmarking**: Users can bookmark specific posts

## Migration Notes

- Old hash-based URLs will still work but will redirect to the new format
- Direct access to `/blog.html` will redirect to `/blog`
- All internal links have been updated to use the new URL structure 