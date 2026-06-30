class Gallery {
  constructor() {
    this.posts = [];
    this.localPosts = [];
    this.selectedTag = 'All';
    this.pendingFiles = [];
    this.activeFile = null;
    this.storageKey = 'younghyo-gallery-local-posts';

    this.grid = document.getElementById('gallery-grid');
    this.tags = document.getElementById('gallery-tags');
    this.photoInput = document.getElementById('photo-input');
    this.uploadTrigger = document.getElementById('upload-trigger');
    this.uploadStatus = document.getElementById('upload-status');
    this.composer = document.getElementById('composer');
    this.composerForm = document.getElementById('composer-form');
    this.composerPreview = document.getElementById('composer-preview');
    this.captionInput = document.getElementById('caption-input');
    this.locationInput = document.getElementById('location-input');
    this.tagsInput = document.getElementById('tags-input');
    this.clearFilter = document.getElementById('clear-filter');
    this.detailModal = document.getElementById('detail-modal');

    this.init();
  }

  async init() {
    this.bindEvents();
    this.localPosts = this.loadLocalPosts();
    await this.loadPosts();
    this.render();
  }

  bindEvents() {
    this.uploadTrigger.addEventListener('click', () => this.photoInput.click());
    this.photoInput.addEventListener('change', (event) => this.queueFiles(event.target.files));
    this.composerForm.addEventListener('submit', (event) => this.publishPending(event));
    document.getElementById('composer-close').addEventListener('click', () => this.closeComposer());
    document.getElementById('skip-current').addEventListener('click', () => this.skipPending());
    document.getElementById('detail-close').addEventListener('click', () => this.detailModal.close());
    this.clearFilter.addEventListener('click', () => this.setTag('All'));
  }

  async loadPosts() {
    try {
      const response = await fetch('data/gallery.json');
      if (!response.ok) throw new Error('Gallery data failed to load');
      this.posts = await response.json();
    } catch (error) {
      console.error(error);
      this.posts = [];
    }
  }

  loadLocalPosts() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Could not load local gallery posts.', error);
      return [];
    }
  }

  saveLocalPosts() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.localPosts));
      return true;
    } catch (error) {
      console.warn('Could not persist local gallery posts.', error);
      return false;
    }
  }

  queueFiles(fileList) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (!files.length) return;

    this.pendingFiles.push(...files);
    this.photoInput.value = '';
    this.openNextFile();
  }

  openNextFile() {
    this.activeFile = this.pendingFiles.shift() || null;
    if (!this.activeFile) {
      this.closeComposer();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.composerPreview.src = reader.result;
      this.composerPreview.alt = this.activeFile.name;
      this.captionInput.value = '';
      this.locationInput.value = '';
      this.tagsInput.value = '';

      if (typeof this.composer.showModal === 'function') {
        if (!this.composer.open) this.composer.showModal();
      } else {
        this.composer.setAttribute('open', '');
      }
      this.captionInput.focus();
    };
    reader.readAsDataURL(this.activeFile);
  }

  publishPending(event) {
    event.preventDefault();
    if (!this.activeFile || !this.composerPreview.src) return;

    const tags = this.tagsInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const post = {
      id: `local-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      image: this.composerPreview.src,
      alt: this.activeFile.name,
      date: new Date().toISOString().slice(0, 10),
      location: this.locationInput.value.trim() || 'Local upload',
      caption: this.captionInput.value.trim() || this.activeFile.name.replace(/\.[^.]+$/, ''),
      tags: tags.length ? tags : ['Life'],
      likes: 0,
      local: true
    };

    this.localPosts.unshift(post);
    const persisted = this.saveLocalPosts();
    this.uploadStatus.textContent = persisted ? 'Added to this browser.' : 'Added for this session.';
    this.selectedTag = 'All';
    this.render();
    this.openNextFile();
  }

  skipPending() {
    this.openNextFile();
  }

  closeComposer() {
    this.activeFile = null;
    this.pendingFiles = [];
    if (this.composer.open) this.composer.close();
    this.composerPreview.removeAttribute('src');
  }

  getAllPosts() {
    return [...this.localPosts, ...this.posts]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getFilteredPosts() {
    const posts = this.getAllPosts();
    if (this.selectedTag === 'All') return posts;
    return posts.filter((post) => (post.tags || []).includes(this.selectedTag));
  }

  getTagCounts() {
    const counts = new Map();
    this.getAllPosts().forEach((post) => {
      (post.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    return counts;
  }

  setTag(tag) {
    this.selectedTag = tag;
    this.render();
  }

  render() {
    this.renderStats();
    this.renderTags();
    this.renderGrid();
  }

  renderStats() {
    const posts = this.getAllPosts();
    document.getElementById('post-count').textContent = posts.length;
    document.getElementById('tag-count').textContent = this.getTagCounts().size;
  }

  renderTags() {
    const counts = this.getTagCounts();
    const sortedTags = Array.from(counts.entries()).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });

    const allButton = this.createTagButton('All', this.getAllPosts().length);
    this.tags.replaceChildren(allButton, ...sortedTags.map(([tag, count]) => this.createTagButton(tag, count)));
  }

  createTagButton(tag, count) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tag-button${this.selectedTag === tag ? ' active' : ''}`;
    button.textContent = `${tag} ${count}`;
    button.addEventListener('click', () => this.setTag(tag));
    return button;
  }

  renderGrid() {
    const posts = this.getFilteredPosts();
    this.clearFilter.classList.toggle('visible', this.selectedTag !== 'All');
    this.clearFilter.textContent = this.selectedTag === 'All' ? 'All photos' : `All photos`;

    if (!posts.length) {
      this.grid.innerHTML = '<div class="empty-feed">No photos found.</div>';
      return;
    }

    this.grid.replaceChildren(...posts.map((post) => this.renderTile(post)));
  }

  renderTile(post) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'grid-tile';
    tile.setAttribute('aria-label', post.caption || 'Open gallery photo');
    tile.addEventListener('click', () => this.openDetail(post));

    const img = document.createElement('img');
    img.src = post.image;
    img.alt = post.alt || post.caption || 'Gallery photo';
    img.loading = 'lazy';

    const overlay = document.createElement('span');
    overlay.className = 'grid-overlay';
    overlay.innerHTML = `<span>${this.formatLikes(post.likes || 0)} likes</span><span>${(post.tags || []).length} tags</span>`;

    tile.append(img, overlay);
    return tile;
  }

  openDetail(post) {
    document.getElementById('detail-image').src = post.image;
    document.getElementById('detail-image').alt = post.alt || post.caption || 'Gallery photo';
    document.getElementById('detail-location').textContent = post.location || 'Gallery';
    document.getElementById('detail-caption').innerHTML = `<strong>younghyo</strong>${this.escape(post.caption || '')}`;
    document.getElementById('detail-likes').textContent = `${this.formatLikes(post.likes || 0)} likes`;

    const date = document.getElementById('detail-date');
    date.dateTime = post.date || '';
    date.textContent = this.formatLongDate(post.date);

    const tags = document.getElementById('detail-tags');
    tags.replaceChildren(...(post.tags || []).map((tag) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `#${tag}`;
      button.addEventListener('click', () => {
        this.detailModal.close();
        this.setTag(tag);
      });
      return button;
    }));

    if (typeof this.detailModal.showModal === 'function') {
      this.detailModal.showModal();
    } else {
      this.detailModal.setAttribute('open', '');
    }
  }

  formatLongDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString || '';
    return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  }

  formatLikes(count) {
    if (count < 1000) return count.toString();
    return `${(count / 1000).toFixed(1)}k`;
  }

  escape(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.gallery = new Gallery();
});
