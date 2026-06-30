(function () {
  const stage = document.getElementById('stage');
  const edgeCanvas = document.getElementById('edge-canvas');
  const graphHost = document.getElementById('graph-host');
  const mapWorld = document.getElementById('map-world');
  const nodeLayer = document.getElementById('node-layer');
  const loading = document.getElementById('loading');
  const searchInput = document.getElementById('person-search');
  const searchResults = document.getElementById('search-results');
  const lineageToggle = document.getElementById('lineage-toggle');
  const lineageFullAction = document.getElementById('lineage-full-action');
  const topbar = document.querySelector('.topbar');
  const titleHeading = document.querySelector('.title-block h1');
  const titleSubtitle = document.querySelector('.title-block span');
  const searchBox = document.querySelector('.search-box');
  const viewControls = document.querySelector('.view-controls');
  const sourceStrip = document.querySelector('.source-strip');
  const ctx = edgeCanvas.getContext('2d');
  const NODE_W = 174;
  const NODE_H = 54;
  const LINEAGE_NODE_W = 360;
  const TREE_GAP_X = 430;
  const ROW_GAP_Y = 42;
  const PARENT_TO_SELECTED_GAP_Y = 86;
  const SELECTED_TO_CHILD_GAP_Y = 132;
  const TREE_MARGIN = 180;
  const VIEW_MARGIN_X = 220;
  const VIEW_MARGIN_Y = 92;
  const MAX_COMPACT_VIEW_WIDTH = 1680;
  const COMPACT_DEPTH = 3;
  const PEEK_DEPTH = 1;
  const MORPH_DURATION_MS = 1800;
  const INITIAL_PERSON_ID = 'younghyo_park';
  const HOME_URL = 'https://younghyopark.me/';
  const DEFAULT_TITLE = 'CSAIL Academic Genealogy';
  const DEFAULT_SUBTITLE = '2026-06-27 interactive HTML map';
  const EDGE_LABELS = new Map([
    ['18769->younghyo_park', 'SNU (Undergrad)'],
    ['238967->younghyo_park', 'MIT (PhD)']
  ]);
  let measureParts = null;

  const state = {
    data: null,
    nodesById: new Map(),
    slugById: new Map(),
    idBySlug: new Map(),
    nodeElements: new Map(),
    parentsById: new Map(),
    childrenById: new Map(),
    edgeByNode: new Map(),
    edgeByPair: new Map(),
    selectedId: null,
    lineageMode: 'compact',
    scale: 1,
    x: 0,
    y: 0,
    minScale: 0.025,
    maxScale: 3.2,
    isDragging: false,
    dragMoved: false,
    pointerStart: null,
    lastPointer: null,
    searchMatches: new Set(),
    highlightedNodes: new Set(),
    relatedEdgeIds: new Set(),
    lineageEdgeIds: new Set(),
    contextEdgeIds: new Set(),
    lineageEdgeDepths: new Map(),
    lineageNodeDepths: new Map(),
    focusedNodeIds: null,
    focusedBounds: null,
    activePositions: new Map(),
    canvasWidth: 0,
    canvasHeight: 0,
    resizeFrame: 0,
    nodeAnimations: new Set(),
    morphCleanup: null,
    dpr: window.devicePixelRatio || 1
  };

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function slugify(value) {
    return normalize(String(value || '').replace(/\([^)]*\)/g, ''))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function displayNameForTitle(node) {
    return String((node && node.name) || '')
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function possessiveName(name) {
    return /s$/i.test(name) ? `${name}'` : `${name}'s`;
  }

  function focusedTitle(node) {
    const name = displayNameForTitle(node);
    return name ? `${possessiveName(name)} Academic Genealogy` : DEFAULT_TITLE;
  }

  function registerPersonSlug(slug, id) {
    if (slug && !state.idBySlug.has(slug)) {
      state.idBySlug.set(slug, id);
    }
  }

  function canonicalPathname() {
    const withoutIndex = window.location.pathname.replace(/\/index\.html$/, '');
    return withoutIndex.replace(/\/$/, '') || '/';
  }

  function personPath(id) {
    const slug = state.slugById.get(id) || slugify(id);
    return `${canonicalPathname()}?${encodeURIComponent(slug)}`;
  }

  function updatePersonUrl(id, replace) {
    if (!window.history || !state.nodesById.has(id)) {
      return;
    }
    const nextPath = personPath(id);
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath === currentPath) {
      return;
    }
    const action = replace ? 'replaceState' : 'pushState';
    window.history[action]({ personId: id }, '', nextPath);
  }

  function updateBaseUrl(replace) {
    if (!window.history) {
      return;
    }
    const nextPath = canonicalPathname();
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath === currentPath) {
      return;
    }
    const action = replace ? 'replaceState' : 'pushState';
    window.history[action]({}, '', nextPath);
  }

  function requestedPersonId() {
    const rawQuery = window.location.search.replace(/^\?/, '').split('&')[0];
    if (!rawQuery) {
      return INITIAL_PERSON_ID;
    }

    let rawValue = rawQuery;
    try {
      rawValue = decodeURIComponent(rawQuery.replace(/\+/g, ' '));
    } catch (error) {
      rawValue = rawQuery;
    }

    const explicitMatch = rawValue.match(/^(?:person|id|name)=(.+)$/);
    const value = explicitMatch ? explicitMatch[1] : rawValue;
    if (state.nodesById.has(value)) {
      return value;
    }
    return state.idBySlug.get(slugify(value)) || INITIAL_PERSON_ID;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function reducedMotion() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function cancelMorphAnimation() {
    state.nodeAnimations.forEach((animation) => animation.cancel());
    state.nodeAnimations.clear();
    if (state.morphCleanup) {
      const cleanup = state.morphCleanup;
      state.morphCleanup = null;
      cleanup();
    }
    graphHost.classList.remove('is-morphing');
    state.nodeElements.forEach((element) => {
      element.classList.remove('is-morph-leaving');
      element.style.transformOrigin = '';
      element.style.willChange = '';
    });
  }

  function roleLabel(role) {
    if (role === 'current') {
      return 'Current CSAIL PI';
    }
    if (role === 'former') {
      return 'Former CSAIL / LCS / AI PI';
    }
    if (role === 'notable') {
      return 'Highlighted non-CSAIL name';
    }
    return 'Academic genealogy entry';
  }

  function currentBounds() {
    return state.focusedBounds || state.data.bounds;
  }

  function nodeBox(id) {
    return state.activePositions.get(id) || state.nodesById.get(id);
  }

  function setWorldBounds(bounds) {
    mapWorld.style.width = `${bounds.width}px`;
    mapWorld.style.height = `${bounds.height}px`;
    nodeLayer.style.width = `${bounds.width}px`;
    nodeLayer.style.height = `${bounds.height}px`;
  }

  function worldToScreen(x, y) {
    return {
      x: state.x + x * state.scale,
      y: state.y + y * state.scale
    };
  }

  function applyTransform() {
    mapWorld.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    mapWorld.style.setProperty('--inverse-scale', 1 / state.scale);
    renderEdges();
  }

  function resizeCanvas() {
    const box = stage.getBoundingClientRect();
    state.canvasWidth = box.width;
    state.canvasHeight = box.height;
    state.dpr = window.devicePixelRatio || 1;
    edgeCanvas.width = Math.round(box.width * state.dpr);
    edgeCanvas.height = Math.round(box.height * state.dpr);
    edgeCanvas.style.width = `${box.width}px`;
    edgeCanvas.style.height = `${box.height}px`;
    renderEdges();
  }

  function edgeCurve(edge) {
    const source = nodeBox(edge.source);
    const target = nodeBox(edge.target);
    const x1 = source.x + source.w / 2;
    const y1 = source.y + source.h;
    const x2 = target.x + target.w / 2;
    const y2 = target.y;
    const dy = y2 - y1;
    const bend = Math.max(70, Math.abs(dy) * 0.42) * (dy < 0 ? -1 : 1);

    return {
      p1: worldToScreen(x1, y1),
      c1: worldToScreen(x1, y1 + bend),
      c2: worldToScreen(x2, y2 - bend),
      p2: worldToScreen(x2, y2)
    };
  }

  function curveInView(curve) {
    const xs = [curve.p1.x, curve.c1.x, curve.c2.x, curve.p2.x];
    const ys = [curve.p1.y, curve.c1.y, curve.c2.y, curve.p2.y];
    const pad = 60;
    return Math.max(...xs) >= -pad &&
      Math.min(...xs) <= state.canvasWidth + pad &&
      Math.max(...ys) >= -pad &&
      Math.min(...ys) <= state.canvasHeight + pad;
  }

  function drawArrow(curve, color, size) {
    const angle = Math.atan2(curve.p2.y - curve.c2.y, curve.p2.x - curve.c2.x);
    const left = angle + Math.PI * 0.78;
    const right = angle - Math.PI * 0.78;

    ctx.beginPath();
    ctx.moveTo(curve.p2.x, curve.p2.y);
    ctx.lineTo(curve.p2.x + Math.cos(left) * size, curve.p2.y + Math.sin(left) * size);
    ctx.lineTo(curve.p2.x + Math.cos(right) * size, curve.p2.y + Math.sin(right) * size);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawEdgeLabel(edge, curve) {
    if (!state.focusedNodeIds || state.lineageMode === 'full') {
      return;
    }

    const label = EDGE_LABELS.get(`${edge.source}->${edge.target}`);
    if (!label) {
      return;
    }

    const source = nodeBox(edge.source);
    const target = nodeBox(edge.target);
    const sourceBottom = worldToScreen(source.x + source.w / 2, source.y + source.h);
    const targetTop = worldToScreen(target.x + target.w / 2, target.y);
    const point = {
      x: (sourceBottom.x + targetTop.x) / 2,
      y: (sourceBottom.y + targetTop.y) / 2
    };
    const side = source.x + source.w / 2 < target.x + target.w / 2 ? -1 : 1;
    const textSize = 12;
    const padX = 8;
    const padY = 5;
    const offsetX = side * 48;
    const offsetY = -2;

    ctx.save();
    ctx.font = `700 ${textSize}px Lato, Verdana, Helvetica, sans-serif`;
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(label).width;
    const labelWidth = textWidth + padX * 2;
    const labelHeight = textSize + padY * 2;
    const x = point.x + offsetX - labelWidth / 2;
    const y = point.y + offsetY - labelHeight / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = 'rgba(23, 114, 208, 0.52)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, labelWidth, labelHeight, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#145ca6';
    ctx.fillText(label, x + padX, y + labelHeight / 2);
    ctx.restore();
  }

  function drawEdge(edge, style) {
    const curve = edgeCurve(edge);
    if (!curveInView(curve)) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(curve.p1.x, curve.p1.y);
    ctx.bezierCurveTo(curve.c1.x, curve.c1.y, curve.c2.x, curve.c2.y, curve.p2.x, curve.p2.y);
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.stroke();

    if (style.arrow) {
      drawArrow(curve, style.color, style.arrowSize);
    }

    drawEdgeLabel(edge, curve);
  }

  function renderEdges() {
    if (!state.data) {
      return;
    }

    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);

    const filtered = state.selectedId || state.searchMatches.size > 0;
    const base = filtered
      ? { color: 'rgba(50, 46, 40, 0.025)', width: 0.65, arrow: false, arrowSize: 0 }
      : { color: 'rgba(50, 46, 40, 0.18)', width: 0.9, arrow: state.scale > 0.16, arrowSize: 4.8 };
    const related = { color: '#1772d0', width: 2.2, arrow: true, arrowSize: 7 };
    const contextEdge = { color: 'rgba(76, 110, 245, 0.13)', width: 1, arrow: false, arrowSize: 0 };

    function lineageStyle(edge) {
      const depth = state.lineageEdgeDepths.get(edge.id) || 1;
      const source = nodeBox(edge.source);
      const target = nodeBox(edge.target);
      const span = Math.abs(target.y - source.y);
      const muted = state.lineageMode === 'compact' && depth > COMPACT_DEPTH;

      if (muted) {
        return { color: 'rgba(76, 110, 245, 0.16)', width: 0.9, arrow: false, arrowSize: 0 };
      }

      if (depth === 1) {
        return { color: '#1772d0', width: 2.7, arrow: true, arrowSize: 7 };
      }
      if (depth <= 5 && span < 800) {
        return { color: 'rgba(76, 110, 245, 0.7)', width: 1.8, arrow: state.scale > 0.16, arrowSize: 6 };
      }

      const alpha = span > 1600 ? 0.13 : depth > 18 ? 0.18 : depth > 9 ? 0.26 : 0.38;
      const width = span > 1600 ? 0.85 : depth > 9 ? 1.05 : 1.25;
      return { color: `rgba(76, 110, 245, ${alpha})`, width, arrow: false, arrowSize: 0 };
    }

    if (state.focusedNodeIds) {
      state.data.edges.forEach((edge) => {
        if (state.contextEdgeIds.has(edge.id) && !state.lineageEdgeIds.has(edge.id)) {
          drawEdge(edge, contextEdge);
        }
      });
      state.data.edges.forEach((edge) => {
        if (state.lineageEdgeIds.has(edge.id)) {
          drawEdge(edge, lineageStyle(edge));
        }
      });
      return;
    }

    state.data.edges.forEach((edge) => {
      if (!state.relatedEdgeIds.has(edge.id) && !state.lineageEdgeIds.has(edge.id)) {
        drawEdge(edge, base);
      }
    });
    state.data.edges.forEach((edge) => {
      if (state.relatedEdgeIds.has(edge.id) && !state.lineageEdgeIds.has(edge.id)) {
        drawEdge(edge, related);
      }
    });
    state.data.edges.forEach((edge) => {
      if (state.lineageEdgeIds.has(edge.id)) {
        drawEdge(edge, lineageStyle(edge));
      }
    });
  }

  function visibleFrame() {
    const stageBox = stage.getBoundingClientRect();
    const pad = stageBox.width < 560 ? 12 : 18;
    let left = pad;
    let right = stageBox.width - pad;
    let top = pad;
    let bottom = stageBox.height - pad;

    if (topbar) {
      const box = topbar.getBoundingClientRect();
      if (box.width > 0 && box.height > 0) {
        top = Math.max(top, box.bottom - stageBox.top + pad);
      }
    }

    if (sourceStrip) {
      const box = sourceStrip.getBoundingClientRect();
      if (box.width > 0 && box.height > 0) {
        bottom = Math.min(bottom, box.top - stageBox.top - pad);
      }
    }

    if (right - left < 260) {
      left = pad / 2;
      right = stageBox.width - pad / 2;
    }

    if (bottom - top < 260) {
      bottom = stageBox.height - pad;
      if (bottom - top < 180) {
        top = pad;
      }
    }

    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top)
    };
  }

  function fitTransformForBounds(bounds) {
    const frame = visibleFrame();
    const boundsX = bounds.x || 0;
    const boundsY = bounds.y || 0;
    const nextScale = Math.min(frame.width / bounds.width, frame.height / bounds.height) * 0.92;
    const scale = clamp(nextScale, state.minScale, state.maxScale);
    return {
      scale,
      x: frame.x + (frame.width - bounds.width * scale) / 2 - boundsX * scale,
      y: frame.y + (frame.height - bounds.height * scale) / 2 - boundsY * scale
    };
  }

  function applyViewportTransform(transform) {
    state.scale = transform.scale;
    state.x = transform.x;
    state.y = transform.y;
    applyTransform();
  }

  function fitGraph() {
    if (!state.data) {
      return;
    }

    cancelMorphAnimation();
    applyViewportTransform(fitTransformForBounds(currentBounds()));
  }

  function centerOnPerson(id, zoomFloor) {
    const node = nodeBox(id);
    if (!node) {
      return;
    }

    const frame = visibleFrame();
    const targetScale = clamp(Math.max(state.scale, zoomFloor || 0.72), state.minScale, state.maxScale);
    cancelMorphAnimation();
    applyViewportTransform({
      scale: targetScale,
      x: frame.x + frame.width / 2 - (node.x + node.w / 2) * targetScale,
      y: frame.y + frame.height / 2 - (node.y + node.h / 2) * targetScale
    });
  }

  function zoomBy(factor, anchorX, anchorY) {
    cancelMorphAnimation();
    const stageBox = stage.getBoundingClientRect();
    const frame = visibleFrame();
    const localX = anchorX == null ? frame.x + frame.width / 2 : anchorX - stageBox.left;
    const localY = anchorY == null ? frame.y + frame.height / 2 : anchorY - stageBox.top;
    const graphX = (localX - state.x) / state.scale;
    const graphY = (localY - state.y) / state.scale;
    const nextScale = clamp(state.scale * factor, state.minScale, state.maxScale);

    state.x = localX - graphX * nextScale;
    state.y = localY - graphY * nextScale;
    state.scale = nextScale;
    applyTransform();
  }

  function createNodeElement(node) {
    const card = document.createElement('div');
    const name = document.createElement('span');
    const detail = document.createElement('span');
    const thesis = node.thesisUrl ? document.createElement('a') : document.createElement('span');

    card.className = 'person-node';
    card.tabIndex = 0;
    card.dataset.personId = node.id;
    card.dataset.role = node.role;
    card.style.left = `${node.x}px`;
    card.style.top = `${node.y}px`;
    card.style.width = `${node.w}px`;
    card.style.height = `${node.h}px`;
    card.setAttribute(
      'aria-label',
      `${node.name}${node.detail ? `, ${node.detail}` : ''}${node.thesisTitle ? `, dissertation: ${node.thesisTitle}` : ''}`
    );

    name.className = 'node-name';
    name.textContent = node.name;
    detail.className = 'node-detail';
    detail.textContent = node.detail || node.id;
    thesis.className = 'node-thesis';
    thesis.textContent = node.thesisTitle || '';
    if (node.thesisUrl) {
      thesis.href = node.thesisUrl;
      thesis.target = '_blank';
      thesis.rel = 'noreferrer';
      thesis.setAttribute('aria-label', `Open thesis PDF: ${node.thesisTitle}`);
      thesis.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      thesis.addEventListener('keydown', (event) => {
        event.stopPropagation();
      });
    }

    card.append(name, detail, thesis);
    card.addEventListener('click', () => {
      selectPerson(node.id, { center: false });
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectPerson(node.id, { center: false });
      }
    });

    return card;
  }

  function ensureMeasureParts() {
    if (measureParts) {
      return measureParts;
    }

    const button = document.createElement('button');
    const name = document.createElement('span');
    const detail = document.createElement('span');
    const thesis = document.createElement('span');

    button.type = 'button';
    button.className = 'person-node';
    button.tabIndex = -1;
    button.setAttribute('aria-hidden', 'true');
    button.style.position = 'fixed';
    button.style.left = '-10000px';
    button.style.top = '0';
    button.style.visibility = 'hidden';
    button.style.pointerEvents = 'none';
    button.style.height = 'auto';

    name.className = 'node-name';
    detail.className = 'node-detail';
    thesis.className = 'node-thesis';
    button.append(name, detail, thesis);
    document.body.appendChild(button);

    measureParts = { button, name, detail, thesis };
    return measureParts;
  }

  function measureNodeHeight(node, width, isLineageCard, showsThesis) {
    const parts = ensureMeasureParts();
    parts.button.dataset.role = node.role;
    parts.button.style.width = `${width}px`;
    parts.button.style.height = 'auto';
    parts.button.classList.toggle('is-lineage-card', isLineageCard);
    parts.button.classList.toggle('shows-thesis', showsThesis);
    parts.name.textContent = node.name;
    parts.detail.textContent = node.detail || node.id;
    parts.thesis.textContent = node.thesisTitle || '';
    return Math.ceil(parts.button.getBoundingClientRect().height);
  }

  function buildIndexes() {
    const slugCounts = new Map();

    state.data.nodes.forEach((node) => {
      const baseSlug = slugify(node.name) || slugify(node.id);
      slugCounts.set(baseSlug, (slugCounts.get(baseSlug) || 0) + 1);
    });

    state.data.nodes.forEach((node) => {
      const baseSlug = slugify(node.name) || slugify(node.id);
      const idSlug = slugify(node.id);
      const detailSlug = slugify(`${node.name} ${node.detail}`);
      const canonicalSlug = slugCounts.get(baseSlug) > 1 && idSlug && idSlug !== baseSlug
        ? `${baseSlug}-${idSlug}`
        : baseSlug;

      node.searchText = normalize(`${node.name} ${node.detail} ${node.thesisTitle || ''} ${roleLabel(node.role)} ${node.id}`);
      state.nodesById.set(node.id, node);
      state.slugById.set(node.id, canonicalSlug);
      state.parentsById.set(node.id, new Set());
      state.childrenById.set(node.id, new Set());
      state.edgeByNode.set(node.id, new Set());

      state.idBySlug.set(canonicalSlug, node.id);
      registerPersonSlug(idSlug, node.id);
      registerPersonSlug(detailSlug, node.id);
      if (slugCounts.get(baseSlug) === 1) {
        registerPersonSlug(baseSlug, node.id);
      }
    });

    state.data.edges.forEach((edge) => {
      state.parentsById.get(edge.target).add(edge.source);
      state.childrenById.get(edge.source).add(edge.target);
      state.edgeByNode.get(edge.source).add(edge);
      state.edgeByNode.get(edge.target).add(edge);
      state.edgeByPair.set(`${edge.source}->${edge.target}`, edge);
    });
  }

  function renderNodes() {
    const fragment = document.createDocumentFragment();
    state.data.nodes.forEach((node) => {
      const element = createNodeElement(node);
      state.nodeElements.set(node.id, element);
      fragment.appendChild(element);
    });
    nodeLayer.replaceChildren(fragment);
  }

  function setNodeElementBox(element, box) {
    element.style.left = `${box.x}px`;
    element.style.top = `${box.y}px`;
    element.style.width = `${box.w}px`;
    element.style.height = `${box.h}px`;
  }

  function applyNodeLayoutClasses(element, node, box, visibleIds, contextIds, forceVisible) {
    element.classList.toggle('is-hidden', !forceVisible && Boolean(visibleIds && !visibleIds.has(node.id)));
    element.classList.toggle('is-context', Boolean(contextIds && contextIds.has(node.id)));
    element.classList.toggle('is-lineage-card', Boolean(box.isLineageCard));
    element.classList.toggle('shows-thesis', Boolean(box.showsThesis));
  }

  function isVisibleInLayout(id, visibleIds) {
    return !visibleIds || visibleIds.has(id);
  }

  function visibleIdsForLayout(visibleIds) {
    if (visibleIds) {
      return new Set(visibleIds);
    }
    return new Set(state.data.nodes.map((node) => node.id));
  }

  function captureNodeRects(ids) {
    const rects = new Map();
    ids.forEach((id) => {
      const element = state.nodeElements.get(id);
      if (!element || element.classList.contains('is-hidden')) {
        return;
      }

      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        rects.set(id, rect);
      }
    });
    return rects;
  }

  function animateNodeFromRect(element, fromRect, toRect, options) {
    if (!element.animate) {
      return null;
    }

    const parentScale = state.scale || 1;
    const dx = (fromRect.left - toRect.left) / parentScale;
    const dy = (fromRect.top - toRect.top) / parentScale;
    const sx = toRect.width ? fromRect.width / toRect.width : 1;
    const sy = toRect.height ? fromRect.height / toRect.height : 1;
    const fromOpacity = options && options.entering ? 0 : 1;
    const toOpacity = options && options.leaving ? 0 : 1;
    const middleOpacity = options && options.leaving ? 0.34 : 1;

    element.style.transformOrigin = 'top left';
    element.style.willChange = 'transform, opacity';

    return element.animate(
      [
        {
          opacity: fromOpacity,
          transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
        },
        {
        offset: 0.58,
          opacity: middleOpacity,
          transform: `translate(${dx * 0.12}px, ${dy * 0.12}px) scale(${1 + (sx - 1) * 0.12}, ${1 + (sy - 1) * 0.12})`
        },
        {
          opacity: toOpacity,
          transform: 'translate(0, 0) scale(1, 1)'
        }
      ],
      {
        duration: MORPH_DURATION_MS,
        easing: 'cubic-bezier(0.22, 0.72, 0.22, 1)',
        fill: 'both'
      }
    );
  }

  function applyNodeLayout(positions, visibleIds, bounds, fitBounds, contextIds, options) {
    const targetBounds = bounds || state.data.bounds;
    const targetFitBounds = fitBounds || targetBounds;
    const targetTransform = fitTransformForBounds(targetFitBounds);
    const shouldAnimate = Boolean(options && options.animate) &&
      !reducedMotion() &&
      state.nodeElements.size > 0;
    const oldVisibleIds = state.focusedNodeIds;
    const oldLayoutIds = visibleIdsForLayout(oldVisibleIds);
    const nextLayoutIds = visibleIdsForLayout(visibleIds);
    const animatedIds = new Set([...oldLayoutIds, ...nextLayoutIds]);
    const oldRects = shouldAnimate ? captureNodeRects(animatedIds) : new Map();

    cancelMorphAnimation();

    state.focusedNodeIds = visibleIds;
    state.focusedBounds = targetFitBounds;
    setWorldBounds(targetBounds);
    state.activePositions = positions;

    state.data.nodes.forEach((node) => {
      const element = state.nodeElements.get(node.id);
      const wasVisible = isVisibleInLayout(node.id, oldVisibleIds);
      const willBeVisible = isVisibleInLayout(node.id, visibleIds);
      const shouldKeepVisible = shouldAnimate && (wasVisible || willBeVisible);
      const targetBox = positions.get(node.id) || node;

      applyNodeLayoutClasses(element, node, targetBox, visibleIds, contextIds, shouldKeepVisible);
      element.classList.toggle('is-morph-leaving', false);
      setNodeElementBox(element, targetBox);
    });

    applyViewportTransform(targetTransform);

    if (!shouldAnimate || !oldRects.size) {
      return;
    }

    const finalRects = captureNodeRects(animatedIds);
    const animations = [];
    const finalizeMorph = () => {
      state.data.nodes.forEach((node) => {
        const element = state.nodeElements.get(node.id);
        const box = positions.get(node.id) || node;
        element.classList.remove('is-morph-leaving');
        element.style.transformOrigin = '';
        element.style.willChange = '';
        applyNodeLayoutClasses(element, node, box, visibleIds, contextIds);
        setNodeElementBox(element, box);
      });
      graphHost.classList.remove('is-morphing');
    };

    graphHost.classList.add('is-morphing');
    state.morphCleanup = finalizeMorph;

    animatedIds.forEach((id) => {
      const element = state.nodeElements.get(id);
      const finalRect = finalRects.get(id);
      if (!element || !finalRect) {
        return;
      }

      const wasVisible = isVisibleInLayout(id, oldVisibleIds);
      const willBeVisible = isVisibleInLayout(id, visibleIds);
      const oldRect = oldRects.get(id) || finalRect;
      const animation = animateNodeFromRect(element, oldRect, finalRect, {
        entering: !wasVisible && willBeVisible,
        leaving: wasVisible && !willBeVisible
      });
      if (!animation) {
        return;
      }

      if (wasVisible && !willBeVisible) {
        element.classList.add('is-morph-leaving');
      }
      state.nodeAnimations.add(animation);
      animations.push(animation);
    });

    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (state.morphCleanup !== finalizeMorph) {
        return;
      }
      state.nodeAnimations.forEach((animation) => animation.cancel());
      state.nodeAnimations.clear();
      state.morphCleanup = null;
      finalizeMorph();
    });
  }

  function restoreGlobalLayout(options) {
    state.contextEdgeIds.clear();
    applyNodeLayout(new Map(), null, state.data.bounds, state.data.bounds, null, options);
    hideLineageActions();
  }

  function activateFocusedTree(startId, options) {
    const lineage = collectFocusedLineage(startId);
    const layout = buildLineageLayout(lineage);
    const visibleIds = new Set(layout.rows.flatMap((row) => row.ids));
    const positions = new Map();
    state.contextEdgeIds = new Set(layout.contextEdgeIds);

    layout.rows.forEach((row) => {
      row.items.forEach((item) => {
        const original = state.nodesById.get(item.id);
        positions.set(item.id, {
          ...original,
          x: Math.round(layout.centerX + item.slot * TREE_GAP_X - item.width / 2),
          y: Math.round(row.y),
          w: item.width,
          h: item.height,
          isLineageCard: item.isLineageCard,
          showsThesis: item.showsThesis
        });
      });
    });

    const fitBounds = state.lineageMode === 'full' ? layout.worldBounds : layout.viewBounds;
    applyNodeLayout(positions, visibleIds, layout.worldBounds, fitBounds, layout.contextIds, options);
    updateLineageActions(lineage, layout);
  }

  function branchContext(lineageIds, allLineageIds) {
    const lineageSet = new Set(lineageIds);
    const seen = new Set();
    const ids = [];
    const edgeIds = [];

    lineageIds.forEach((id) => {
      (state.parentsById.get(id) || new Set()).forEach((parentId) => {
        (state.childrenById.get(parentId) || new Set()).forEach((childId) => {
          if (lineageSet.has(childId) || allLineageIds.has(childId) || seen.has(childId)) {
            return;
          }

          const edge = state.edgeByPair.get(`${parentId}->${childId}`);
          seen.add(childId);
          ids.push(childId);
          if (edge) {
            edgeIds.push(edge.id);
          }
        });
      });
    });

    ids.sort((a, b) => {
      const left = state.nodesById.get(a);
      const right = state.nodesById.get(b);
      return (left.year || 9999) - (right.year || 9999) || left.name.localeCompare(right.name);
    });

    return { ids, edgeIds };
  }

  function directChildren(id) {
    return sortNodeIds(state.childrenById.get(id) || new Set());
  }

  function buildLineageLayout(lineage) {
    const ancestorRows = lineage.ancestors.levels.slice(1).map((ids, index) => {
      const depth = index + 1;
      return { ids, lineageIds: ids, depth, offset: -depth };
    }).reverse();
    const childIds = directChildren(lineage.startId);
    const descendantRow = childIds.length
      ? { ids: childIds, lineageIds: childIds, depth: 1, offset: 1, isDescendantRow: true }
      : null;
    const rows = [
      ...ancestorRows,
      { ids: [lineage.startId], lineageIds: [lineage.startId], depth: 0, offset: 0 },
      ...(descendantRow ? [descendantRow] : [])
    ];
    const contextIds = new Set();
    const contextEdgeIds = new Set();
    const descendantIds = new Set(childIds);
    let requiredLeft = NODE_W / 2;
    let requiredRight = NODE_W / 2;

    rows.forEach((row) => {
      const rowLineageIds = new Set(row.lineageIds);
      const context = row.isDescendantRow ? { ids: [], edgeIds: [] } : branchContext(row.lineageIds, lineage.nodeIds);
      const midpoint = Math.ceil(context.ids.length / 2);
      const left = context.ids.slice(0, midpoint);
      const right = context.ids.slice(midpoint);
      const lineageCenterOffset = (row.lineageIds.length - 1) / 2;

      row.ids = [...left, ...row.lineageIds, ...right];
      row.items = [];
      left.forEach((id, index) => {
        row.items.push({ id, slot: -(lineageCenterOffset + left.length - index) });
      });
      row.lineageIds.forEach((id, index) => {
        row.items.push({ id, slot: index - lineageCenterOffset });
      });
      right.forEach((id, index) => {
        row.items.push({ id, slot: lineageCenterOffset + 1 + index });
      });
      row.ids.forEach((id) => {
        if (!rowLineageIds.has(id)) {
          contextIds.add(id);
        }
      });
      context.edgeIds.forEach((id) => contextEdgeIds.add(id));

      row.items = row.items.map((item) => {
        const node = state.nodesById.get(item.id);
        const isContext = !rowLineageIds.has(item.id);
        const depth = row.isDescendantRow ? 1 : (lineage.nodeDepths.get(item.id) || row.depth || 0);
        const isMuted = state.lineageMode !== 'full' && depth > COMPACT_DEPTH;
        const isLineageCard = !isContext && !isMuted;
        const showsThesis = Boolean(node.thesisTitle) && isLineageCard;
        const width = isLineageCard ? LINEAGE_NODE_W : NODE_W;
        const height = isLineageCard ? measureNodeHeight(node, width, isLineageCard, showsThesis) : NODE_H;
        return { ...item, width, height, isLineageCard, showsThesis };
      });

      row.height = Math.max(NODE_H, ...row.items.map((item) => item.height));
      row.items.forEach((item) => {
        const itemCenter = item.slot * TREE_GAP_X;
        requiredLeft = Math.max(requiredLeft, Math.max(0, -itemCenter + item.width / 2));
        requiredRight = Math.max(requiredRight, Math.max(0, itemCenter + item.width / 2));
      });
    });
    childIds.forEach((childId) => {
      const edge = state.edgeByPair.get(`${lineage.startId}->${childId}`);
      if (edge) {
        contextEdgeIds.add(edge.id);
      }
    });

    const centerX = TREE_MARGIN + requiredLeft;
    const selectedRowIndex = ancestorRows.length;
    let rowY = TREE_MARGIN;

    rows.forEach((row) => {
      row.y = rowY;
      let nextGap = ROW_GAP_Y;
      if (row.offset === -1) {
        nextGap = PARENT_TO_SELECTED_GAP_Y;
      } else if (row.offset === 0 && descendantRow) {
        nextGap = SELECTED_TO_CHILD_GAP_Y;
      }
      rowY += row.height + nextGap;
    });

    const width = Math.max(900, requiredLeft + requiredRight + TREE_MARGIN * 2);
    const height = Math.max(520, rowY - ROW_GAP_Y + TREE_MARGIN);
    const focusDepth = COMPACT_DEPTH + PEEK_DEPTH;
    const focusRows = rows.filter((row) => row.offset >= -focusDepth);
    const focusLeft = Math.max(NODE_W / 2, ...focusRows.map((row) => {
      return Math.max(...row.items.map((item) => {
        return Math.max(0, -item.slot * TREE_GAP_X + item.width / 2);
      }));
    }));
    const focusRight = Math.max(NODE_W / 2, ...focusRows.map((row) => {
      return Math.max(...row.items.map((item) => {
        return Math.max(0, item.slot * TREE_GAP_X + item.width / 2);
      }));
    }));
    const rowBasedViewWidth = focusLeft + focusRight + VIEW_MARGIN_X * 2;
    const viewWidth = Math.min(width, Math.max(900, Math.min(MAX_COMPACT_VIEW_WIDTH, rowBasedViewWidth)));
    const upperRows = Math.min(ancestorRows.length, COMPACT_DEPTH);
    const topRowIndex = Math.max(0, selectedRowIndex - upperRows);
    const peekDistance = topRowIndex > 0 ? (rows[topRowIndex].y - rows[topRowIndex - 1].y) * 0.48 : 0;
    const lowerRows = descendantRow ? 1 : 0;
    const bottomRowIndex = Math.min(rows.length - 1, selectedRowIndex + lowerRows);
    const viewTop = rows[topRowIndex].y - VIEW_MARGIN_Y - peekDistance;
    const viewBottom = rows[bottomRowIndex].y + rows[bottomRowIndex].height + VIEW_MARGIN_Y;
    const viewHeight = Math.min(
      height,
      Math.max(520, viewBottom - viewTop)
    );
    const viewBounds = {
      x: clamp(centerX - viewWidth / 2, 0, Math.max(0, width - viewWidth)),
      y: clamp(viewTop, 0, Math.max(0, height - viewHeight)),
      width: Math.round(viewWidth),
      height: Math.round(viewHeight)
    };

    return {
      rows,
      contextIds,
      contextEdgeIds,
      descendantIds,
      centerX,
      worldBounds: {
        x: 0,
        y: 0,
        width: Math.round(width),
        height: Math.round(height)
      },
      viewBounds
    };
  }

  function hideLineageActions() {
    lineageFullAction.hidden = true;
  }

  function setLineageAction(button, text, x, y, ariaLabel) {
    button.textContent = text;
    button.style.left = `${Math.round(x)}px`;
    button.style.top = `${Math.round(y)}px`;
    button.setAttribute('aria-label', ariaLabel);
    button.hidden = false;
  }

  function updateLineageActions(lineage, layout) {
    hideLineageActions();
    if (state.lineageMode === 'full') {
      return;
    }

    const hiddenAncestors = lineage.ancestors.ancestorIds.size - countCompactNodes(lineage.ancestors.ancestorIds, lineage.ancestors.nodeDepths);
    const hasOverflow = hiddenAncestors > 0;

    if (hasOverflow) {
      setLineageAction(
        lineageFullAction,
        'Show full lineage',
        layout.centerX,
        layout.viewBounds.y + 46,
        'Show full lineage'
      );
    }
  }

  function clearHighlightedClasses() {
    state.highlightedNodes.forEach((id) => {
      const element = state.nodeElements.get(id);
      if (element) {
        element.classList.remove('is-selected', 'is-parent', 'is-descendant', 'is-lineage', 'is-muted-lineage');
      }
    });
    state.highlightedNodes.clear();
    state.relatedEdgeIds.clear();
    state.lineageEdgeIds.clear();
    state.lineageEdgeDepths.clear();
    state.lineageNodeDepths.clear();
  }

  function markNode(id, className) {
    const element = state.nodeElements.get(id);
    if (!element) {
      return;
    }
    element.classList.add(className);
    state.highlightedNodes.add(id);
  }

  function sortNodeIds(ids) {
    return Array.from(ids).sort((a, b) => {
      const left = state.nodesById.get(a);
      const right = state.nodesById.get(b);
      return (left.year || 9999) - (right.year || 9999) || left.name.localeCompare(right.name);
    });
  }

  function collectAncestorLineage(startId, maxDepth) {
    const ancestorIds = new Set();
    const edgeIds = new Set();
    const edgeDepths = new Map();
    const nodeDepths = new Map([[startId, 0]]);
    const levels = [[startId]];
    let frontier = [startId];
    const seen = new Set([startId]);
    let depth = 0;
    const limit = maxDepth == null ? Infinity : maxDepth;

    while (frontier.length) {
      if (depth >= limit) {
        break;
      }

      const nextLevel = new Set();
      depth += 1;

      frontier.forEach((id) => {
        (state.parentsById.get(id) || new Set()).forEach((parentId) => {
          const edge = state.edgeByPair.get(`${parentId}->${id}`);
          if (edge) {
            edgeIds.add(edge.id);
            edgeDepths.set(edge.id, Math.min(edgeDepths.get(edge.id) || depth, depth));
          }
          if (!seen.has(parentId)) {
            seen.add(parentId);
            ancestorIds.add(parentId);
            nodeDepths.set(parentId, depth);
            nextLevel.add(parentId);
          }
        });
      });

      if (!nextLevel.size) {
        break;
      }

      frontier = sortNodeIds(nextLevel);
      levels.push(frontier);
    }

    const roots = sortNodeIds(Array.from(seen).filter((id) => {
      return id !== startId && !(state.parentsById.get(id) || new Set()).size;
    }));

    return {
      levels,
      roots,
      ancestorIds,
      edgeIds,
      edgeDepths,
      nodeDepths
    };
  }

  function mergeDepthMap(target, source) {
    source.forEach((depth, id) => {
      if (!target.has(id) || depth < target.get(id)) {
        target.set(id, depth);
      }
    });
  }

  function collectFocusedLineage(startId) {
    const ancestors = collectAncestorLineage(startId);
    const nodeIds = new Set([startId]);
    const edgeIds = new Set();
    const edgeDepths = new Map();
    const nodeDepths = new Map([[startId, 0]]);

    ancestors.ancestorIds.forEach((id) => nodeIds.add(id));
    ancestors.edgeIds.forEach((id) => edgeIds.add(id));
    mergeDepthMap(edgeDepths, ancestors.edgeDepths);
    mergeDepthMap(nodeDepths, ancestors.nodeDepths);

    return {
      startId,
      ancestors,
      nodeIds,
      edgeIds,
      edgeDepths,
      nodeDepths
    };
  }

  function countCompactNodes(ids, nodeDepths) {
    let count = 0;
    ids.forEach((id) => {
      if ((nodeDepths.get(id) || Infinity) <= COMPACT_DEPTH) {
        count += 1;
      }
    });
    return count;
  }

  function refreshHighlights() {
    clearHighlightedClasses();

    if (!state.selectedId) {
      graphHost.classList.remove('has-selection');
      state.contextEdgeIds.clear();
      renderEdges();
      return;
    }

    const lineage = collectFocusedLineage(state.selectedId);
    const parents = state.parentsById.get(state.selectedId) || new Set();
    const children = state.childrenById.get(state.selectedId) || new Set();
    const compact = state.lineageMode !== 'full';

    graphHost.classList.add('has-selection');
    markNode(state.selectedId, 'is-selected');
    parents.forEach((id) => markNode(id, 'is-parent'));
    children.forEach((id) => {
      markNode(id, 'is-descendant');
      const edge = state.edgeByPair.get(`${state.selectedId}->${id}`);
      if (edge) {
        state.lineageEdgeIds.add(edge.id);
        state.lineageEdgeDepths.set(edge.id, 1);
      }
    });
    lineage.nodeIds.forEach((id) => {
      if (id !== state.selectedId && !parents.has(id)) {
        const depth = lineage.nodeDepths.get(id) || Infinity;
        markNode(id, compact && depth > COMPACT_DEPTH ? 'is-muted-lineage' : 'is-lineage');
      }
    });
    lineage.edgeIds.forEach((id) => state.lineageEdgeIds.add(id));
    lineage.edgeDepths.forEach((depth, id) => state.lineageEdgeDepths.set(id, depth));
    lineage.nodeDepths.forEach((depth, id) => state.lineageNodeDepths.set(id, depth));

    renderEdges();
  }

  function relationButton(node) {
    const button = document.createElement('button');
    const name = document.createElement('span');
    const meta = document.createElement('span');

    button.type = 'button';
    name.className = 'result-name';
    name.textContent = node.name;
    meta.className = 'result-meta';
    meta.textContent = node.detail || node.id;
    button.append(name, meta);
    button.addEventListener('click', () => selectPerson(node.id));
    return button;
  }

  function updateTopbarMode() {
    const selectedNode = state.nodesById.get(state.selectedId);
    const isFocusedTitle = Boolean(selectedNode && state.lineageMode !== 'full');

    if (topbar) {
      topbar.classList.toggle('is-focused-title', isFocusedTitle);
    }
    if (titleHeading) {
      const nextTitle = isFocusedTitle ? focusedTitle(selectedNode) : DEFAULT_TITLE;
      if (isFocusedTitle && state.selectedId === INITIAL_PERSON_ID) {
        const name = displayNameForTitle(selectedNode);
        const link = document.createElement('a');
        link.href = HOME_URL;
        link.textContent = name;
        titleHeading.replaceChildren(
          link,
          document.createTextNode(`${/s$/i.test(name) ? "'" : "'s"} Academic Genealogy`)
        );
      } else {
        titleHeading.textContent = nextTitle;
      }
    }
    if (titleSubtitle) {
      titleSubtitle.textContent = DEFAULT_SUBTITLE;
      titleSubtitle.hidden = isFocusedTitle;
    }
    if (searchBox) {
      searchBox.hidden = isFocusedTitle;
    }
    if (viewControls) {
      viewControls.hidden = isFocusedTitle;
    }
    document.title = isFocusedTitle ? focusedTitle(selectedNode) : DEFAULT_TITLE;

    if (isFocusedTitle) {
      searchResults.hidden = true;
    }
  }

  function updateSelectionControls() {
    updateTopbarMode();
    lineageToggle.hidden = !state.selectedId;
    lineageToggle.textContent = state.lineageMode === 'full' ? '3 gen' : 'Full';
    lineageToggle.setAttribute(
      'aria-label',
      state.lineageMode === 'full' ? 'Show three-generation ancestry' : 'Show full lineage'
    );
  }

  function selectPerson(id, options) {
    if (!state.nodesById.has(id)) {
      return;
    }
    state.selectedId = id;
    state.lineageMode = 'compact';
    if (!options || options.updateUrl !== false) {
      updatePersonUrl(id, options && options.replaceUrl);
    }
    updateSelectionControls();
    activateFocusedTree(id, { animate: !options || options.animate !== false });
    refreshHighlights();
    if (options && options.center) {
      centerOnPerson(id);
    }
  }

  function clearSelection(options) {
    state.selectedId = null;
    state.lineageMode = 'compact';
    if (!options || options.updateUrl !== false) {
      updateBaseUrl(options && options.replaceUrl);
    }
    updateSelectionControls();
    restoreGlobalLayout({ animate: !options || options.animate !== false });
    refreshHighlights();
  }

  function toggleLineageMode() {
    if (!state.selectedId) {
      return;
    }

    state.lineageMode = state.lineageMode === 'full' ? 'compact' : 'full';
    updateSelectionControls();
    activateFocusedTree(state.selectedId, { animate: true });
    refreshHighlights();
  }

  function clearSearchMatches() {
    state.searchMatches.forEach((id) => {
      const element = state.nodeElements.get(id);
      if (element) {
        element.classList.remove('is-search-match');
      }
    });
    state.searchMatches.clear();
    graphHost.classList.remove('has-search');
  }

  function refitViewport() {
    if (!state.data) {
      return;
    }

    resizeCanvas();
    if (state.selectedId) {
      updateSelectionControls();
      activateFocusedTree(state.selectedId, { animate: false });
      refreshHighlights();
      return;
    }
    fitGraph();
  }

  function scheduleViewportFit() {
    if (state.resizeFrame) {
      window.cancelAnimationFrame(state.resizeFrame);
    }
    state.resizeFrame = window.requestAnimationFrame(() => {
      state.resizeFrame = 0;
      refitViewport();
    });
  }

  function scoreNode(node, query) {
    const name = normalize(node.name);
    const detail = normalize(node.detail);
    if (name === query) {
      return 0;
    }
    if (name.startsWith(query)) {
      return 1;
    }
    if (name.includes(query)) {
      return 2;
    }
    if (detail.includes(query)) {
      return 3;
    }
    if (node.searchText.includes(query)) {
      return 4;
    }
    return 99;
  }

  function updateSearch() {
    const query = normalize(searchInput.value);
    clearSearchMatches();
    searchResults.replaceChildren();

    if (!query) {
      searchResults.hidden = true;
      renderEdges();
      return;
    }

    const matches = state.data.nodes
      .map((node) => ({ node, score: scoreNode(node, query) }))
      .filter((item) => item.score < 99)
      .sort((a, b) => a.score - b.score || a.node.name.localeCompare(b.node.name))
      .slice(0, 12);

    graphHost.classList.add('has-search');
    matches.forEach(({ node }, index) => {
      const element = state.nodeElements.get(node.id);
      if (element) {
        element.classList.add('is-search-match');
      }
      state.searchMatches.add(node.id);

      const button = relationButton(node);
      button.addEventListener('click', () => {
        searchResults.hidden = true;
      });
      if (index === 0) {
        button.classList.add('is-active');
      }
      searchResults.appendChild(button);
    });

    if (!matches.length) {
      const empty = document.createElement('button');
      const name = document.createElement('span');
      const meta = document.createElement('span');
      empty.type = 'button';
      empty.disabled = true;
      name.className = 'result-name';
      name.textContent = 'No matches';
      meta.className = 'result-meta';
      meta.textContent = 'Try a different query';
      empty.append(name, meta);
      searchResults.appendChild(empty);
    }

    searchResults.hidden = false;
    renderEdges();
  }

  function bindControls() {
    document.getElementById('zoom-out').addEventListener('click', () => zoomBy(0.8));
    document.getElementById('zoom-in').addEventListener('click', () => zoomBy(1.25));
    lineageToggle.addEventListener('click', toggleLineageMode);
    lineageFullAction.addEventListener('click', () => {
      if (state.selectedId && state.lineageMode !== 'full') {
        toggleLineageMode();
      }
    });
    document.getElementById('fit-graph').addEventListener('click', fitGraph);
    document.getElementById('clear-selection').addEventListener('click', () => {
      clearSelection();
      searchInput.value = '';
      updateSearch();
    });

    searchInput.addEventListener('input', updateSearch);
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const first = searchResults.querySelector('button:not([disabled])');
        if (first) {
          first.click();
          searchResults.hidden = true;
          searchInput.blur();
        }
      }
      if (event.key === 'Escape') {
        searchInput.value = '';
        updateSearch();
      }
    });

    window.addEventListener('resize', scheduleViewportFit);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleViewportFit);
    }
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(scheduleViewportFit);
      if (topbar) {
        observer.observe(topbar);
      }
      if (sourceStrip) {
        observer.observe(sourceStrip);
      }
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleViewportFit);
    }
    window.addEventListener('popstate', () => {
      selectPerson(requestedPersonId(), { updateUrl: false });
    });
  }

  function bindPanZoom() {
    stage.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('.topbar, .source-strip, .person-node, .lineage-action')) {
        return;
      }
      cancelMorphAnimation();
      state.isDragging = true;
      state.dragMoved = false;
      state.pointerStart = { x: event.clientX, y: event.clientY };
      state.lastPointer = { x: event.clientX, y: event.clientY };
      stage.classList.add('is-dragging');
      stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener('pointermove', (event) => {
      if (!state.isDragging) {
        return;
      }
      const dx = event.clientX - state.lastPointer.x;
      const dy = event.clientY - state.lastPointer.y;
      const totalDx = event.clientX - state.pointerStart.x;
      const totalDy = event.clientY - state.pointerStart.y;
      if (Math.hypot(totalDx, totalDy) > 4) {
        state.dragMoved = true;
      }
      state.x += dx;
      state.y += dy;
      state.lastPointer = { x: event.clientX, y: event.clientY };
      applyTransform();
    });

    function endDrag(event) {
      if (!state.isDragging) {
        return;
      }
      state.isDragging = false;
      stage.classList.remove('is-dragging');
      try {
        stage.releasePointerCapture(event.pointerId);
      } catch (error) {
        // The browser may already have released this pointer.
      }
      window.setTimeout(() => {
        state.dragMoved = false;
      }, 0);
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('wheel', (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0012);
      zoomBy(factor, event.clientX, event.clientY);
    }, { passive: false });
  }

  async function loadGraph() {
    try {
      const response = await fetch('csail-data.json');
      if (!response.ok) {
        throw new Error(`Could not load graph data (${response.status})`);
      }

      state.data = await response.json();
      buildIndexes();

      setWorldBounds(state.data.bounds);

      renderNodes();
      bindPanZoom();
      bindControls();
      resizeCanvas();
      const initialPersonId = requestedPersonId();
      if (state.nodesById.has(initialPersonId)) {
        selectPerson(initialPersonId, { replaceUrl: true, animate: false });
      } else {
        fitGraph();
      }
      loading.hidden = true;
    } catch (error) {
      loading.textContent = error.message;
      loading.style.color = '#c92a2a';
    }
  }

  loadGraph();
})();
