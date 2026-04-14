// Blog functionality
class Blog {
  constructor() {
    this.posts = [];
    this.showWIP = false;
    this.searchTerm = '';
    this.selectedTags = new Set();
    this.allTags = new Map();
    this.init();
  }

  async init() {
    await this.loadPosts();
    this.handleRouting();
    this.renderBlogListing();
    this.setupWIPToggle();
  }

  async loadPosts() {
    try {
      const response = await fetch('posts/manifest.json');
      const slugs = await response.json();

      for (const slug of slugs) {
        try {
          const metaResponse = await fetch(`posts/${slug}/meta.json`);
          if (metaResponse.ok) {
            const meta = await metaResponse.json();
            this.posts.push({ slug, ...meta });
          }
        } catch (error) {
          console.error(`Error loading meta for ${slug}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading manifest:', error);
    }

    // Sort posts by date (newest first)
    this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.generateTagData();
  }

  handleRouting() {
    this.showBlogListing();
  }

  showBlogListing() {
    document.getElementById('blog-listing').style.display = 'block';
    document.getElementById('filter-controls').style.display = 'block';
    document.querySelector('.profile-sidebar').style.display = 'block';

    this.generateTagData();
    this.renderTagFilters();
    this.updateClearFiltersButton();
    this.updateFilterStatus();
    this.renderBlogListing();
  }

  navigateToPost(slug) {
    window.location.href = `posts/${slug}/`;
  }

  renderBlogListing() {
    const container = document.getElementById('posts-container');
    const wipCaution = document.getElementById('wip-caution');

    let postsToShow = this.posts.filter(post => post.publish || this.showWIP);
    const filteredPosts = this.filterPosts(postsToShow);

    if (this.showWIP) {
      wipCaution.style.display = 'block';
      wipCaution.textContent = "Caution: You are viewing work-in-progress posts. Refresh the page to return to the public view.";
    } else {
      wipCaution.style.display = 'none';
      wipCaution.textContent = '';
    }

    if (filteredPosts.length === 0) {
      const hasFilters = this.searchTerm || this.selectedTags.size > 0;
      if (hasFilters) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: #666;">
            <p style="font-size: 22px; margin-bottom: 10px;">No posts found matching your filters</p>
            <p style="font-size: 17px;">Try adjusting your search terms or removing some tag filters.</p>
          </div>
        `;
      } else {
        container.innerHTML = '<p>No blog posts found.</p>';
      }
      return;
    }

    container.innerHTML = '';
    filteredPosts.forEach((post, index) => {
      const card = document.createElement('div');
      card.className = 'post-card' + (index % 2 === 1 ? ' post-card-reverse' : '');
      card.onclick = () => this.navigateToPost(post.slug);

      if (post.thumbnail) {
        const img = document.createElement('img');
        img.className = 'post-thumb';
        img.src = `posts/${post.slug}/${post.thumbnail}`;
        card.appendChild(img);
      } else {
        const wrap = document.createElement('div');
        wrap.className = 'post-thumb-wrap';
        wrap.appendChild(this.renderPatternThumb(post));
        card.appendChild(wrap);
      }

      const info = document.createElement('div');
      info.className = 'post-info';
      info.innerHTML = `
        <h3>${post.title}</h3>
        ${post.excerpt ? `<div class="post-excerpt">${post.excerpt}</div>` : ''}
        <div class="post-meta">${post.date} • ${post.author}</div>
        ${post.tags && post.tags.length > 0 ? `
          <div class="post-tags">
            ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        ${!post.publish ? '<div class="post-wip-label">WIP</div>' : ''}
      `;
      card.appendChild(info);
      container.appendChild(card);
    });
  }

  generateTagData() {
    this.allTags.clear();
    const postsToCount = this.posts.filter(post => post.publish || this.showWIP);
    postsToCount.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          this.allTags.set(tag, (this.allTags.get(tag) || 0) + 1);
        });
      }
    });
  }

  renderTagFilters() {
    const tagContainer = document.getElementById('filter-tags');
    if (!tagContainer) return;

    const sortedTags = Array.from(this.allTags.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      });

    tagContainer.innerHTML = sortedTags.map(([tag, count]) => `
      <span class="filter-tag"
            data-tag="${tag}"
            onclick="blog.toggleTag('${tag}')">
        ${tag}
        <span class="tag-count">(${count})</span>
      </span>
    `).join('');
  }

  toggleTag(tag) {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }
    this.updateTagButtonStates();
    this.applyFilters();
  }

  updateTagButtonStates() {
    document.querySelectorAll('.filter-tag').forEach(button => {
      const tag = button.getAttribute('data-tag');
      if (this.selectedTags.has(tag)) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  applyFilters() {
    const searchInput = document.getElementById('search-input');
    this.searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    this.updateClearFiltersButton();
    this.updateFilterStatus();
    this.renderBlogListing();
  }

  updateClearFiltersButton() {
    const clearButton = document.getElementById('clear-filters');
    if (!clearButton) return;
    const hasActiveFilters = this.searchTerm || this.selectedTags.size > 0;
    clearButton.style.display = hasActiveFilters ? 'block' : 'none';
  }

  updateFilterStatus() {
    const statusElement = document.getElementById('filter-status');
    if (!statusElement) return;

    const hasActiveFilters = this.searchTerm || this.selectedTags.size > 0;

    if (!hasActiveFilters) {
      statusElement.style.display = 'none';
      return;
    }

    let statusText = 'Active filters: ';
    const filters = [];
    if (this.searchTerm) filters.push(`Search: "${this.searchTerm}"`);
    if (this.selectedTags.size > 0) filters.push(`Tags: ${Array.from(this.selectedTags).join(', ')}`);
    statusText += filters.join(' | ');
    statusElement.textContent = statusText;
    statusElement.style.display = 'block';
  }

  clearFilters() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    this.searchTerm = '';
    this.selectedTags.clear();
    this.updateTagButtonStates();
    this.updateClearFiltersButton();
    this.updateFilterStatus();
    this.renderBlogListing();
  }

  filterPosts(posts) {
    return posts.filter(post => {
      if (this.searchTerm) {
        const searchableText = [
          post.title,
          post.excerpt,
          post.author,
          ...(post.tags || [])
        ].join(' ').toLowerCase();
        if (!searchableText.includes(this.searchTerm)) return false;
      }

      if (this.selectedTags.size > 0) {
        const hasSelectedTag = Array.from(this.selectedTags).some(selectedTag =>
          post.tags && post.tags.includes(selectedTag)
        );
        if (!hasSelectedTag) return false;
      }

      return true;
    });
  }

  // Analyze text content into continuous parameters
  analyzeText(text) {
    const chars = text.toLowerCase().replace(/[^a-z]/g, '');
    const len = chars.length || 1;

    // Character frequency distribution (26 bins)
    const freq = new Array(26).fill(0);
    for (const c of chars) freq[c.charCodeAt(0) - 97]++;
    for (let i = 0; i < 26; i++) freq[i] /= len;

    // Shannon entropy of character distribution
    let entropy = 0;
    for (const f of freq) if (f > 0) entropy -= f * Math.log2(f);
    entropy /= Math.log2(26); // normalize to 0-1

    // Vowel ratio
    const vowels = (text.match(/[aeiou]/gi) || []).length;
    const vowelRatio = vowels / len;

    // Average word length
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordLen = words.reduce((s, w) => s + w.length, 0) / (words.length || 1);

    // Dominant frequency peaks (top 3 characters)
    const sorted = freq.map((f, i) => [f, i]).sort((a, b) => b[0] - a[0]);
    const peaks = sorted.slice(0, 3).map(([f, i]) => i / 25); // normalized 0-1

    // Hash for seeding
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);

    return { entropy, vowelRatio, avgWordLen, peaks, freq, hash: Math.abs(hash), len };
  }

  // Draw a mathematical pattern on a canvas derived from text analysis
  drawPattern(canvas, params) {
    const w = canvas.width = 360;
    const h = canvas.height = 240;
    const ctx = canvas.getContext('2d');

    const { entropy, vowelRatio, avgWordLen, peaks, hash, freq } = params;

    // Bold, distinct hues — spread across the wheel
    const hue1 = (peaks[0] * 360 + (hash % 60)) % 360;
    const hue2 = (hue1 + 60 + peaks[1] * 120) % 360;
    const hue3 = (hue1 + 180 + peaks[2] * 60) % 360;

    // Pick a pattern type based on content
    const patternType = hash % 5;

    // Solid colored background
    ctx.fillStyle = `hsl(${hue1}, 40%, 85%)`;
    ctx.fillRect(0, 0, w, h);

    if (patternType === 0) {
      // === CONTOUR FIELD: topographic map feel ===
      const step = 4;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const nx = x / w;
          const ny = y / h;
          const v =
            Math.sin(nx * (4 + peaks[0] * 12) + ny * (3 + peaks[1] * 8)) *
            Math.cos(ny * (5 + peaks[2] * 10) - nx * (2 + vowelRatio * 6)) +
            Math.sin((nx + ny) * (6 + entropy * 8)) * 0.5;

          const band = Math.floor(v * 8) % 2;
          if (band === 0) {
            ctx.fillStyle = `hsla(${hue2}, 50%, 65%, 0.5)`;
            ctx.fillRect(x, y, step, step);
          }
        }
      }
      // Bold contour lines
      ctx.lineWidth = 2;
      for (let level = -3; level <= 3; level++) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue3}, 55%, 45%, 0.6)`;
        for (let x = 0; x < w; x += 2) {
          const target = level * 0.3;
          for (let y = 0; y < h - 1; y++) {
            const nx = x / w, ny = y / h, ny1 = (y + 1) / h;
            const v0 = Math.sin(nx * (4 + peaks[0] * 12) + ny * (3 + peaks[1] * 8)) *
              Math.cos(ny * (5 + peaks[2] * 10) - nx * (2 + vowelRatio * 6)) +
              Math.sin((nx + ny) * (6 + entropy * 8)) * 0.5;
            const v1 = Math.sin(nx * (4 + peaks[0] * 12) + ny1 * (3 + peaks[1] * 8)) *
              Math.cos(ny1 * (5 + peaks[2] * 10) - nx * (2 + vowelRatio * 6)) +
              Math.sin((nx + ny1) * (6 + entropy * 8)) * 0.5;
            if ((v0 - target) * (v1 - target) < 0) {
              ctx.rect(x, y, 2, 2);
            }
          }
        }
        ctx.stroke();
      }

    } else if (patternType === 1) {
      // === SPIROGRAPH: overlapping parametric curves ===
      for (let c = 0; c < 4; c++) {
        const a = 2 + peaks[c % 3] * 7;
        const b = 3 + peaks[(c + 1) % 3] * 5;
        const d = 0.3 + vowelRatio * 0.5 + c * 0.1;
        const delta = c * 1.2 + entropy * 3;

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${(hue1 + c * 70) % 360}, 55%, 50%, 0.7)`;
        ctx.lineWidth = 2;
        for (let t = 0; t <= Math.PI * 12; t += 0.03) {
          const px = w / 2 + (Math.cos(a * t + delta) * (1 - d) + Math.cos(t * b) * d) * w * 0.38;
          const py = h / 2 + (Math.sin(a * t + delta) * (1 - d) + Math.sin(t * b) * d) * h * 0.38;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

    } else if (patternType === 2) {
      // === WAVE INTERFERENCE: bold moiré ===
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const f1 = 3 + peaks[0] * 15;
      const f2 = 4 + peaks[1] * 12;
      const f3 = 2 + peaks[2] * 10;
      const ang1 = entropy * Math.PI;
      const ang2 = vowelRatio * Math.PI + 1;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = x / w, ny = y / h;
          const wave1 = Math.sin((nx * Math.cos(ang1) + ny * Math.sin(ang1)) * f1 * Math.PI * 2);
          const wave2 = Math.sin((nx * Math.cos(ang2) + ny * Math.sin(ang2)) * f2 * Math.PI * 2);
          const wave3 = Math.sin(Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * f3 * Math.PI * 2);
          const v = (wave1 + wave2 + wave3) / 3;

          const idx = (y * w + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          const mix = (v + 1) / 2; // 0 to 1

          // Mix with two accent colors
          const h2r = this._hslChannel(hue2, 55, 45, 'r');
          const h2g = this._hslChannel(hue2, 55, 45, 'g');
          const h2b = this._hslChannel(hue2, 55, 45, 'b');

          data[idx] = Math.round(r * (1 - mix * 0.6) + h2r * mix * 0.6);
          data[idx + 1] = Math.round(g * (1 - mix * 0.6) + h2g * mix * 0.6);
          data[idx + 2] = Math.round(b * (1 - mix * 0.6) + h2b * mix * 0.6);
        }
      }
      ctx.putImageData(imgData, 0, 0);

    } else if (patternType === 3) {
      // === GEOMETRIC TILES: bold overlapping shapes ===
      const shapes = 8 + (hash % 8);
      for (let i = 0; i < shapes; i++) {
        const seed = hash * (i + 1);
        const cx = ((seed >> 4) & 0xFFF) / 0xFFF * w;
        const cy = ((seed >> 8) & 0xFFF) / 0xFFF * h;
        const size = 30 + freq[i % 26] * 200;
        const hue = (hue1 + i * (360 / shapes)) % 360;
        const shapeType = (seed >> 2) % 3;

        ctx.globalAlpha = 0.35;
        ctx.fillStyle = `hsl(${hue}, 50%, 60%)`;

        if (shapeType === 0) {
          // Circle
          ctx.beginPath();
          ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (shapeType === 1) {
          // Rounded rect
          const s = size * 0.8;
          ctx.beginPath();
          ctx.roundRect(cx - s / 2, cy - s / 2, s, s, s * 0.2);
          ctx.fill();
        } else {
          // Triangle
          ctx.beginPath();
          const angle = (seed % 360) * Math.PI / 180;
          for (let v = 0; v < 3; v++) {
            const a = angle + (v * Math.PI * 2) / 3;
            const px = cx + Math.cos(a) * size / 2;
            const py = cy + Math.sin(a) * size / 2;
            if (v === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        }

        // Stroke outline
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = `hsl(${hue}, 55%, 40%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

    } else {
      // === DOT MATRIX: halftone-style with varying sizes ===
      const dotSpacing = 12;
      const cols = Math.ceil(w / dotSpacing);
      const rows = Math.ceil(h / dotSpacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = c / cols;
          const ny = r / rows;

          const wave = (
            Math.sin(nx * (3 + peaks[0] * 10) + ny * (2 + peaks[1] * 8)) +
            Math.cos((nx - ny) * (4 + peaks[2] * 6)) +
            Math.sin(Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * (8 + entropy * 12))
          ) / 3;

          const size = 1 + (wave + 1) * 3.5;
          const hue = (hue1 + wave * 60 + 360) % 360;

          ctx.beginPath();
          ctx.arc(c * dotSpacing + dotSpacing / 2, r * dotSpacing + dotSpacing / 2, size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 50%, 50%, 0.7)`;
          ctx.fill();
        }
      }
    }
  }

  // Helper: get an RGB channel from HSL
  _hslChannel(h, s, l, channel) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    if (channel === 'r') return Math.round(f(0) * 255);
    if (channel === 'g') return Math.round(f(8) * 255);
    return Math.round(f(4) * 255);
  }

  renderPatternThumb(post) {
    const text = [post.title, post.excerpt || '', ...(post.tags || [])].join(' ');
    const params = this.analyzeText(text);
    const canvas = document.createElement('canvas');
    canvas.className = 'post-thumb';
    this.drawPattern(canvas, params);
    return canvas;
  }

  setupWIPToggle() {
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'W' || e.key === 'w')) {
        this.showWIP = !this.showWIP;
        this.generateTagData();
        this.renderTagFilters();
        this.updateTagButtonStates();
        this.renderBlogListing();
      }
    });
  }
}

// Initialize blog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.blog = new Blog();
});
