// Blog functionality
class Blog {
  constructor() {
    this.posts = [];
    this.currentPost = null;
    this.tocItems = [];
    this.showWIP = false;
    this.init();
  }

  async init() {
    // Configure marked.js for markdown parsing
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {}
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });

    // Load posts and handle routing
    await this.loadPosts();
    this.handleRouting();
    this.renderBlogListing();
    this.setupWIPToggle();
  }

  async loadPosts() {
    // Define your blog posts here
    const blogPosts = [
      {
        file: 'posts/2025-02-01-how-to-write-blog-posts.md',
        slug: '2025-02-01-how-to-write-blog-posts'
      },
      {
        file: 'posts/2023-09-20-locomotion-and-dex-manip',
        slug: '2023-09-20-locomotion-and-dex-manip'
      },
      {
        file: 'posts/2025-06-30-paper-review-data-curations.md',
        slug: '2025-06-30-paper-review-data-curations'
      }
      // Add more posts here as you create them
    ];

    // Load each post
    for (const postInfo of blogPosts) {
      try {
        const response = await fetch(postInfo.file);
        if (response.ok) {
          const content = await response.text();
          const post = this.parsePost(content, postInfo.slug);
          this.posts.push(post);
        }
      } catch (error) {
        console.error(`Error loading post ${postInfo.file}:`, error);
      }
    }

    // Sort posts by date (newest first)
    this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  parsePost(content, slug) {
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      return {
        slug,
        title: 'Untitled Post',
        date: new Date().toISOString().split('T')[0],
        author: 'Unknown',
        tags: [],
        excerpt: '',
        content: content,
        html: marked.parse(content),
        publish: true
      };
    }

    const frontmatter = frontmatterMatch[1];
    const markdownContent = frontmatterMatch[2];

    // Parse frontmatter
    const metadata = {};
    frontmatter.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        metadata[key] = value;
      }
    });

    // Parse tags
    let tags = [];
    if (metadata.tags) {
      try {
        tags = JSON.parse(metadata.tags.replace(/'/g, '"'));
      } catch (e) {
        // Fallback: split by comma if JSON parsing fails
        tags = metadata.tags.split(',').map(tag => tag.trim());
      }
    }

    // Parse publish field
    let publish = true;
    if (typeof metadata.publish !== 'undefined') {
      publish = String(metadata.publish).toLowerCase() === 'true';
    }

    return {
      slug,
      title: metadata.title || 'Untitled Post',
      date: metadata.date || new Date().toISOString().split('T')[0],
      author: metadata.author || 'Unknown',
      tags: tags,
      excerpt: metadata.excerpt || '',
      featured: metadata.featured === 'true',
      content: markdownContent,
      html: marked.parse(markdownContent),
      publish: publish
    };
  }

  handleRouting() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.showPost(hash);
    } else {
      this.showBlogListing();
    }

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        this.showPost(hash);
      } else {
        this.showBlogListing();
      }
    });
  }

  showBlogListing() {
    // Show blog listing and hide single post view
    document.getElementById('blog-listing').style.display = 'block';
    document.getElementById('blog-post').style.display = 'none';

    // Configure left sidebar for listing view
    document.querySelector('.profile-sidebar').style.display = 'block';
    document.getElementById('toc-sidebar').style.display = 'none';
    document.querySelector('.compact-profile').style.display = 'none';
    
    this.renderBlogListing();
  }

  showPost(slug) {
    const post = this.posts.find(p => p.slug === slug);
    if (!post) {
      this.showBlogListing();
      return;
    }

    // Show single post view and hide blog listing
    document.getElementById('blog-listing').style.display = 'none';
    document.getElementById('blog-post').style.display = 'block';
    
    // Configure left sidebar for post view
    document.querySelector('.profile-sidebar').style.display = 'none';
    document.getElementById('toc-sidebar').style.display = 'block';
    document.querySelector('.compact-profile').style.display = 'block';

    window.location.hash = slug;
    this.renderPost(post);
  }

  renderBlogListing() {
    const container = document.getElementById('posts-container');
    const wipCaution = document.getElementById('wip-caution');
    let postsToShow = this.posts.filter(post => post.publish || this.showWIP);
    if (this.showWIP) {
      wipCaution.style.display = 'block';
      wipCaution.textContent = "Caution: You are viewing work-in-progress posts. You've been lucky enough to discover this mode! Refresh the page to return to the public view.";
    } else {
      wipCaution.style.display = 'none';
      wipCaution.textContent = '';
    }
    if (postsToShow.length === 0) {
      container.innerHTML = '<p>No blog posts found.</p>';
      return;
    }
    container.innerHTML = postsToShow.map(post => `
      <div class="post-card" onclick="blog.showPost('${post.slug}')">
        <h3>${post.title}</h3>
        ${post.excerpt ? `<div class="post-excerpt">${post.excerpt}</div>` : ''}
        <div class="post-meta">
          ${post.date} • ${post.author}
        </div>
        ${post.tags.length > 0 ? `
          <div class="post-tags">
            ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        ${!post.publish ? '<div class="post-wip-label">WIP</div>' : ''}
      </div>
    `).join('');
  }

  generateTOC(content) {
    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const tocItems = [];
    
    headings.forEach((heading, index) => {
      // Generate unique ID for the heading
      const id = `heading-${index}`;
      heading.id = id;
      
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent;
      
      tocItems.push({
        id,
        text,
        level,
        element: heading
      });
    });
    
    return tocItems;
  }

  renderTOC(tocItems) {
    const tocList = document.getElementById('toc-list');
    const tocSidebar = document.getElementById('toc-sidebar');
    
    if (tocItems.length === 0) {
      tocSidebar.classList.remove('visible');
      return;
    }
    
    tocList.innerHTML = tocItems.map(item => `
      <li>
        <a href="#${item.id}" 
           class="toc-h${item.level}" 
           data-id="${item.id}"
           onclick="blog.scrollToHeading('${item.id}'); return false;">
          ${item.text}
        </a>
      </li>
    `).join('');
    
    tocSidebar.classList.add('visible');
  }

  scrollToHeading(headingId) {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  updateActiveTOCItem() {
    const tocItems = this.tocItems;
    if (tocItems.length === 0) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    
    let activeItem = null;
    
    for (let i = tocItems.length - 1; i >= 0; i--) {
      const item = tocItems[i];
      const element = item.element;
      const rect = element.getBoundingClientRect();
      
      if (rect.top <= 100) {
        activeItem = item;
        break;
      }
    }
    
    // Update active state
    document.querySelectorAll('#toc-list a').forEach(link => {
      link.classList.remove('active');
    });
    
    if (activeItem) {
      const activeLink = document.querySelector(`#toc-list a[data-id="${activeItem.id}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  }

  renderPost(post) {
    // Update page and metadata
    document.title = `${post.title} - Younghyo Park`;
    document.getElementById('og-title').setAttribute('content', post.title);
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-date').textContent = post.date;
    document.getElementById('post-author').textContent = post.author;
    
    // Render tags
    const tagsContainer = document.getElementById('post-tags');
    if (post.tags.length > 0) {
      tagsContainer.innerHTML = post.tags.map(tag => 
        `<span class="post-tag">${tag}</span>`
      ).join('');
    } else {
      tagsContainer.innerHTML = '';
    }

    // Render content
    const contentContainer = document.getElementById('post-content');
    contentContainer.innerHTML = post.html;

    // Process images to handle relative paths
    const images = contentContainer.querySelectorAll('img');
    images.forEach(img => {
      if (img.src.startsWith('assets/')) {
        img.src = img.src; // Keep as is for now
      }
    });

    // Generate and render TOC
    this.tocItems = this.generateTOC(contentContainer);
    this.renderTOC(this.tocItems);

    // Remove existing scroll listener and add new one
    window.removeEventListener('scroll', this.scrollHandler);
    this.scrollHandler = () => this.updateActiveTOCItem();
    window.addEventListener('scroll', this.scrollHandler);

    // Re-render MathJax
    if (window.MathJax) {
      MathJax.typesetPromise([contentContainer]).catch((err) => {
        console.error('MathJax error:', err);
      });
    }

    // Highlight code blocks
    contentContainer.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });

    // Load Comments
    this.loadComments(post);
  }

  loadComments(post) {
    const container = document.getElementById('giscus-container');
    // Clear previous instance
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    // --- YOUR GISCUS CONFIGURATION ---
    script.setAttribute('data-repo', 'younghyopark/younghyopark.github.io');
    script.setAttribute('data-repo-id', 'R_kgDOIEeQxQ'); 
    script.setAttribute('data-category', 'Blog Comments');
    script.setAttribute('data-category-id', 'DIC_kwDOIEeQxc4CsRvw');
    // --- END OF CONFIGURATION ---

    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'en');

    container.appendChild(script);
  }

  setupWIPToggle() {
    // Listen for Shift+W anywhere on the page
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'W' || e.key === 'w')) {
        this.showWIP = !this.showWIP;
        this.renderBlogListing();
      }
    });
  }
}

// Initialize blog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.blog = new Blog();
}); 