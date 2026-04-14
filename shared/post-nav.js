// Auto-injects:
//   1. A full-width sticky nav bar with scroll-aware title
//   2. A floating comment button + Giscus panel (per-post comments)
// Usage: <script src="/shared/post-nav.js"></script> in the post's <head>.
(function () {
  // Inject Inter font if not already present
  if (!document.querySelector('link[href*="Inter"]')) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(fontLink);
  }

  // Inject Font Awesome for icons
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    document.head.appendChild(faLink);
  }

  // ── Nav bar ──
  const nav = document.createElement('div');
  nav.id = 'post-nav';
  nav.innerHTML = `
    <div class="pn-inner">
      <a href="/blog.html" class="pn-back">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        All Posts
      </a>
      <div class="pn-center">
        <span class="pn-title"></span>
        <span class="pn-sep">|</span>
        <span class="pn-site">Younghyo's Blog</span>
      </div>
      <div class="pn-links">
        <a href="/">About Me</a>
      </div>
    </div>
  `;

  // ── Comment FAB + Panel ──
  const commentHTML = `
    <button class="comment-fab" aria-label="Open comments">
      <i class="fa-regular fa-comment-dots"></i><span class="comment-fab-label">Q&A</span>
    </button>
    <div class="comment-panel">
      <div class="comment-panel-header">
        Comments
        <button class="comment-panel-close" aria-label="Close comments"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="comment-panel-body" id="giscus-container"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    /* ── Nav Bar ── */
    #post-nav {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 1000;
      background: #f7f8fa;
      border-bottom: 1px solid #e0e0e0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .pn-inner {
      margin: 0 auto;
      padding: 0.55rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .pn-back {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #1a1a1a;
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
      transition: color 0.15s;
    }
    .pn-back:hover {
      color: #555;
      text-decoration: none;
    }
    .pn-back svg { flex-shrink: 0; color: #999; }
    .pn-center {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      font-size: 0.95rem;
      color: #999;
      white-space: nowrap;
      overflow: hidden;
    }
    .pn-title {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 0;
      opacity: 0;
      transition: max-width 0.4s ease, opacity 0.3s ease;
    }
    .pn-sep {
      color: #ddd;
      opacity: 0;
      transition: opacity 0.3s ease;
      flex-shrink: 0;
    }
    .pn-site {
      font-weight: 600;
      flex-shrink: 0;
    }
    #post-nav.show-title .pn-title {
      max-width: 70%;
      opacity: 1;
    }
    #post-nav.show-title .pn-sep {
      opacity: 1;
    }
    .pn-links {
      display: flex;
      gap: 0.35rem;
      flex-shrink: 0;
    }
    .pn-links a {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.2rem 0.65rem;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      color: #777;
      font-size: 0.75rem;
      font-weight: 500;
      text-decoration: none;
      transition: border-color 0.15s, color 0.15s;
    }
    .pn-links a:hover {
      border-color: #222;
      color: #222;
      text-decoration: none;
    }

    /* ── Floating Comment Button & Panel ── */
    .comment-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      height: 44px;
      border-radius: 22px;
      padding: 0 18px 0 14px;
      background: #555;
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 1rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: transform .2s, box-shadow .2s;
    }
    .comment-fab-label {
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .comment-fab:hover {
      transform: scale(1.04);
      box-shadow: 0 6px 20px rgba(0,0,0,.2);
    }
    .comment-panel {
      position: fixed;
      bottom: 88px;
      right: 24px;
      width: 420px;
      max-height: calc(100vh - 120px);
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,.18);
      z-index: 999;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      opacity: 0;
      transform: translateY(20px) scale(.95);
      pointer-events: none;
      transition: opacity .25s, transform .25s;
    }
    .comment-panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .comment-panel-header {
      padding: 14px 18px;
      border-bottom: 1px solid #eee;
      font-weight: 600;
      font-size: .95rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .comment-panel-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      color: #999;
    }
    .comment-panel-close:hover { color: #333; }
    .comment-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px 18px;
    }

    /* ── Floating TOC ── */
    .post-toc {
      position: fixed;
      top: 50%;
      right: 1.5rem;
      transform: translateY(-50%);
      z-index: 100;
      max-height: 70vh;
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 0.75rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
      padding: 0.75rem 0;
      min-width: 13rem;
      max-width: 16rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .post-toc .toc-label {
      display: block;
      padding: 0.15rem 1rem 0.55rem;
      font-size: 0.6rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #999;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      margin-bottom: 0.35rem;
    }
    .post-toc ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .post-toc li {
      margin: 0;
    }
    .post-toc a {
      display: block;
      padding: 0.35rem 1rem 0.35rem 0.85rem;
      font-size: 0.73rem;
      font-weight: 500;
      color: #999;
      text-decoration: none;
      line-height: 1.4;
      transition: color .2s, background .2s, border-color .2s;
      border-left: 2.5px solid transparent;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .post-toc a:hover {
      color: #1a1a1a;
      background: rgba(0,0,0,0.03);
      text-decoration: none;
    }
    .post-toc a.active {
      color: #1a1a1a;
      border-left-color: #1a1a1a;
      font-weight: 600;
      background: rgba(0,0,0,0.04);
    }
    .post-toc .toc-sub a {
      padding-left: 1.6rem;
      color: #bbb;
      font-size: 0.7rem;
    }
    .post-toc .toc-sub a:hover {
      color: #777;
    }
    .post-toc .toc-sub a.active {
      color: #1a1a1a;
      border-left-color: #1a1a1a;
      font-weight: 600;
    }

    @media (max-width: 480px) {
      .pn-inner { padding: 0.5rem 1rem; }
    }
    @media (max-width: 768px) {
      .comment-fab, .comment-panel { display: none !important; }
    }
    @media (max-width: 1200px) {
      .post-toc { display: none; }
    }
  `;

  function buildToc() {
    const body = document.querySelector('.post-body');
    if (!body) return;

    // Gather h1 and h2 inside .post-body, skip the .post-header title
    const headings = body.querySelectorAll('h1, h2');
    const entries = [];
    headings.forEach((h, i) => {
      if (h.classList.contains('post-title')) return;
      if (!h.id) h.id = 'section-' + i;
      entries.push({
        id: h.id,
        text: h.textContent.trim(),
        sub: h.tagName === 'H2'
      });
    });

    if (entries.length < 2) return; // Don't show TOC for very short posts

    const tocNav = document.createElement('nav');
    tocNav.className = 'post-toc';
    tocNav.innerHTML =
      '<span class="toc-label">Table of Contents</span><ul>' +
      entries.map(e =>
        '<li' + (e.sub ? ' class="toc-sub"' : '') + '>' +
        '<a href="#' + e.id + '">' + e.text + '</a></li>'
      ).join('') +
      '</ul>';
    document.body.appendChild(tocNav);

    // Smooth scroll without changing hash
    tocNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Scroll spy
    const tocLinks = tocNav.querySelectorAll('a');
    const spyIds = entries.map(e => e.id);
    const spySections = spyIds.map(id => document.getElementById(id)).filter(Boolean);

    function onScroll() {
      const scrollY = window.scrollY + 80;
      let currentId = spyIds[0];
      spySections.forEach(sec => {
        if (sec.getBoundingClientRect().top + window.scrollY <= scrollY) {
          currentId = sec.id;
        }
      });
      tocLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

  }

  function inject() {
    document.body.prepend(nav);
    document.head.appendChild(style);

    // Insert comment FAB + panel at end of body
    const commentWrapper = document.createElement('div');
    commentWrapper.innerHTML = commentHTML;
    while (commentWrapper.firstChild) {
      document.body.appendChild(commentWrapper.firstChild);
    }

    // ── Sticky title logic ──
    const postTitleEl = document.querySelector('.post-title');
    if (postTitleEl) {
      nav.querySelector('.pn-title').textContent = postTitleEl.textContent;

      const header = document.querySelector('.post-header') || postTitleEl;
      const observer = new IntersectionObserver(
        ([entry]) => {
          nav.classList.toggle('show-title', !entry.isIntersecting);
        },
        { threshold: 0, rootMargin: '-48px 0px 0px 0px' }
      );
      observer.observe(header);
    }

    // ── TOC logic ──
    buildToc();

    // ── Comment panel logic ──
    const fab = document.querySelector('.comment-fab');
    const panel = document.querySelector('.comment-panel');
    const closeBtn = document.querySelector('.comment-panel-close');
    const container = document.getElementById('giscus-container');
    let giscusLoaded = false;

    function toggleComments() {
      const isOpen = panel.classList.toggle('open');
      const toc = document.querySelector('.post-toc');
      if (toc) toc.style.display = isOpen ? 'none' : '';
      if (isOpen && !giscusLoaded) {
        giscusLoaded = true;
        const s = document.createElement('script');
        s.src = 'https://giscus.app/client.js';
        s.setAttribute('data-repo', 'younghyopark/younghyopark.github.io');
        s.setAttribute('data-repo-id', 'R_kgDOIEeQxQ');
        s.setAttribute('data-category', 'Blog Comments');
        s.setAttribute('data-category-id', 'DIC_kwDOIEeQxc4CsRvw');
        s.setAttribute('data-mapping', 'specific');
        s.setAttribute('data-term', window.location.pathname);
        s.setAttribute('data-strict', '1');
        s.setAttribute('data-reactions-enabled', '1');
        s.setAttribute('data-emit-metadata', '0');
        s.setAttribute('data-input-position', 'top');
        s.setAttribute('data-theme', 'light');
        s.setAttribute('data-lang', 'en');
        s.crossOrigin = 'anonymous';
        s.async = true;
        container.appendChild(s);
      }
    }

    fab.addEventListener('click', toggleComments);
    closeBtn.addEventListener('click', toggleComments);
  }

  if (document.body) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  } else {
    document.addEventListener('DOMContentLoaded', inject);
  }
})();
